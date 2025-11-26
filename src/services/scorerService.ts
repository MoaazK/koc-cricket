import { supabase } from "@/lib/supabase";
import { CricketEngine } from "@/lib/cricket-engine/engine";
import { MatchState, DeliveryEvent, DeliveryType, DismissalKind, MatchConfig, Player } from "@/lib/cricket-engine/types";

// Default config for now, ideally fetched from DB match settings
const DEFAULT_CONFIG: MatchConfig = {
    playersPerSide: 11,
    maxOversPerInnings: 20,
    ballsPerOver: 6,
    noBallPenaltyRuns: 1,
    widePenaltyRuns: 1,
    enableFreeHitAfterNoBall: true
};

export const scorerService = {
    async getMatchState(matchId: string): Promise<MatchState | null> {
        // 1. Fetch Match, Teams, Players
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(*),
                away_team:teams!away_team_id(*)
            `)
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            console.error("Error fetching match:", matchError);
            return null;
        }

        // Fetch Players for both teams
        const homePlayers = match.home_team.players || [];
        const awayPlayers = match.away_team.players || [];

        // Combine all players for easy lookup
        const allPlayers: Record<string, Player> = {};
        [...homePlayers, ...awayPlayers].forEach((p: { id: string; name: string }) => {
            allPlayers[p.id] = {
                id: p.id,
                name: p.name
            };
        });

        // Prepare Teams for Engine
        const teamA = {
            id: match.home_team.id,
            name: match.home_team.name,
            playerIds: homePlayers.map((p: { id: string }) => p.id)
        };
        const teamB = {
            id: match.away_team.id,
            name: match.away_team.name,
            playerIds: awayPlayers.map((p: { id: string }) => p.id)
        };

        // 2. Initialize Engine with Match Config
        const matchConfig: MatchConfig = {
            ...DEFAULT_CONFIG,
            maxOversPerInnings: match.overs || 20,
            enableFreeHitAfterNoBall: match.enable_free_hit !== undefined ? match.enable_free_hit : true
        };

        const engine = CricketEngine.createMatch(matchConfig, teamA, teamB, Object.values(allPlayers));

        // 3. Fetch and Replay Events (Balls)
        const { data: balls } = await supabase
            .from('balls')
            .select(`
                *,
                over:overs!inner (
                    over_number,
                    innings:innings!inner (
                        innings_number,
                        match_id
                    )
                )
            `)
            .eq('over.innings.match_id', matchId)
            .order('created_at', { ascending: true });

        // 4. Start Innings if needed
        if (!balls || balls.length === 0) {
            if (match.status === 'live' || match.status === 'upcoming') {
                // Default start: Innings 1, first 2 players of home team
                if (teamA.playerIds.length >= 2) {
                    engine.startInnings(1, teamA.id, teamB.id, teamA.playerIds[0], teamA.playerIds[1]);
                }
            }
            return engine.getMatchState();
        }

        // Group balls by innings
        interface BallWithInnings {
            id: string;
            over_number: number;
            ball_number: number;
            striker_id: string;
            non_striker_id: string;
            bowler_id: string;
            runs_batter: number;
            extras_type: string | null;
            extras_runs: number;
            is_wicket: boolean;
            wicket_type: string | null;
            player_dismissed_id: string | null;
            new_batter_id?: string;
            over: {
                innings: {
                    innings_number: number;
                }
            };
        }

        const innings1Balls = (balls as unknown as BallWithInnings[]).filter(b => b.over.innings.innings_number === 1);
        const innings2Balls = (balls as unknown as BallWithInnings[]).filter(b => b.over.innings.innings_number === 2);

        if (innings1Balls.length > 0) {
            const firstBall = innings1Balls[0];
            engine.startInnings(1, teamA.id, teamB.id, firstBall.striker_id, firstBall.non_striker_id);
            // Replay events
            innings1Balls.forEach(b => {
                const event = mapDBBallToEvent({
                    ...b,
                    innings_number: b.over.innings.innings_number
                }, matchId);
                engine.recordDelivery(event);
            });
        }

        if (innings2Balls.length > 0) {
            const firstBall = innings2Balls[0];
            engine.startInnings(2, teamB.id, teamA.id, firstBall.striker_id, firstBall.non_striker_id);
            // Replay events
            innings2Balls.forEach(b => {
                const event = mapDBBallToEvent({
                    ...b,
                    innings_number: b.over.innings.innings_number
                }, matchId);
                engine.recordDelivery(event);
            });
        }

        return engine.getMatchState();
    },

    async recordBall(matchId: string, event: DeliveryEvent): Promise<void> {
        // 1. Get current state to derive over number and validate
        const currentState = await this.getMatchState(matchId);
        if (!currentState) throw new Error("Match not found");

        const engine = new CricketEngine(currentState);

        // Apply event to engine to get derived state
        engine.recordDelivery(event);
        const newState = engine.getMatchState();
        const currentInningsState = newState.innings[event.inningsNumber];

        // The event we just added is the last one
        const processedEvent = currentInningsState.events[currentInningsState.events.length - 1];
        const overNumber = processedEvent.overNumber!; // 0-based from engine

        // 2. Persist to DB

        // Get or Create Innings
        const { data: inningsData } = await supabase
            .from('innings')
            .select('id')
            .eq('match_id', matchId)
            .eq('innings_number', event.inningsNumber)
            .single();

        let inningsId = inningsData?.id;

        if (!inningsId) {
            const { data: newInnings } = await supabase
                .from('innings')
                .insert({
                    match_id: matchId,
                    innings_number: event.inningsNumber,
                    team_id: currentInningsState.battingTeamId
                })
                .select()
                .single();
            inningsId = newInnings.id;
        }

        // Get or Create Over
        // DB uses 1-based over numbers usually. Engine uses 0-based.
        // Let's store as 1-based in DB (Over 1, Over 2...)
        const dbOverNumber = overNumber + 1;

        const { data: overData } = await supabase
            .from('overs')
            .select('id')
            .eq('innings_id', inningsId)
            .eq('over_number', dbOverNumber)
            .single();

        let overId = overData?.id;
        if (!overId) {
            const { data: newOver } = await supabase
                .from('overs')
                .insert({
                    innings_id: inningsId,
                    over_number: dbOverNumber,
                    bowler_id: event.bowlerPlayerId
                })
                .select()
                .single();
            overId = newOver.id;
        }

        // Insert Ball
        await supabase.from('balls').insert({
            over_id: overId,
            ball_number: processedEvent.ballNumberInOver,
            striker_id: event.strikerPlayerId,
            non_striker_id: event.nonStrikerPlayerId,
            bowler_id: event.bowlerPlayerId,
            runs_batter: event.batsmanRuns,
            extras_type: event.deliveryType === DeliveryType.WIDE ? 'wide' : event.deliveryType === DeliveryType.NO_BALL ? 'noball' : null,
            extras_runs: event.byesRuns + event.legByesRuns + event.penaltyRunsToBattingTeam + (event.deliveryType === DeliveryType.WIDE || event.deliveryType === DeliveryType.NO_BALL ? 1 : 0),
            is_wicket: event.wicket?.isWicket || false,
            wicket_type: event.wicket?.dismissalKind?.toLowerCase(),
            player_dismissed_id: event.wicket?.dismissedPlayerId,
            new_batter_id: event.wicket?.newBatterId
        });

        // Update Innings Aggregates (for Live Score display)
        await supabase
            .from('innings')
            .update({
                total_runs: currentInningsState.totalRuns,
                wickets: currentInningsState.totalWickets,
                overs: currentInningsState.oversCompleted
            })
            .eq('id', inningsId);
    },

    async updateLastEventNewBatter(matchId: string, newBatterId: string): Promise<void> {
        // 1. Get current state to find the last event
        const currentState = await this.getMatchState(matchId);
        if (!currentState) throw new Error("Match not found");

        const currentInnings = currentState.innings[currentState.currentInningsNumber];
        if (!currentInnings || currentInnings.events.length === 0) {
            console.warn("No events to update");
            return;
        }

        // 2. Find the last ball in DB
        const { data: lastBall } = await supabase
            .from('balls')
            .select(`
                id,
                over:overs!inner (
                    innings:innings!inner (
                        match_id,
                        innings_number
                    )
                )
            `)
            .eq('over.innings.match_id', matchId)
            .eq('over.innings.innings_number', currentState.currentInningsNumber)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!lastBall) {
            console.warn("No ball found in DB to update");
            return;
        }

        // 3. Update the new_batter_id
        const { error } = await supabase
            .from('balls')
            .update({ new_batter_id: newBatterId })
            .eq('id', lastBall.id);

        if (error) {
            console.error("Error updating new batter:", error);
            throw error;
        }
    },

    async undoLastBall(matchId: string): Promise<void> {
        // 1. Get current state to find the last event
        const currentState = await this.getMatchState(matchId);
        if (!currentState) throw new Error("Match not found");

        const currentInnings = currentState.innings[currentState.currentInningsNumber];
        if (!currentInnings || currentInnings.events.length === 0) {
            console.warn("No events to undo");
            return;
        }

        // 2. Find the last ball in DB
        // We need to find the last ball inserted for this innings.
        // We can query by created_at desc.
        const { data: lastBall } = await supabase
            .from('balls')
            .select(`
                id,
                over_id,
                over:overs!inner (
                    id,
                    innings_id,
                    over_number,
                    innings:innings!inner (
                        id,
                        innings_number
                    )
                )
            `)
            .eq('over.innings.match_id', matchId)
            .eq('over.innings.innings_number', currentState.currentInningsNumber)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!lastBall) {
            console.warn("No ball found in DB to undo");
            return;
        }

        // 3. Delete the ball
        await supabase.from('balls').delete().eq('id', lastBall.id);

        // 4. Check if over is now empty
        const { count: ballsInOver } = await supabase
            .from('balls')
            .select('*', { count: 'exact', head: true })
            .eq('over_id', lastBall.over_id);

        if (ballsInOver === 0) {
            await supabase.from('overs').delete().eq('id', lastBall.over_id);
        }

        // 5. Recalculate Aggregates
        // We can re-fetch the state (which will now exclude the deleted ball) and update the innings table.
        // This is safer than trying to manually subtract.
        const updatedState = await this.getMatchState(matchId);
        if (updatedState) {
            const updatedInnings = updatedState.innings[currentState.currentInningsNumber];
            // Access innings ID safely
            const over = Array.isArray(lastBall.over) ? lastBall.over[0] : lastBall.over;
            const innings = Array.isArray(over.innings) ? over.innings[0] : over.innings;
            const inningsId = innings.id;

            await supabase
                .from('innings')
                .update({
                    total_runs: updatedInnings.totalRuns,
                    wickets: updatedInnings.totalWickets,
                    overs: updatedInnings.oversCompleted
                })
                .eq('id', inningsId);
        }
    }
};

// Helpers
function mapDBBallToEvent(dbBall: {
    id: string;
    innings_number: number;
    over_number: number;
    ball_number: number;
    striker_id: string;
    non_striker_id: string;
    bowler_id: string;
    runs_batter: number;
    extras_type: string | null;
    extras_runs: number;
    is_wicket: boolean;
    wicket_type: string | null;
    player_dismissed_id: string | null;
    new_batter_id?: string;
}, matchId: string): DeliveryEvent {
    let type = DeliveryType.LEGAL;
    if (dbBall.extras_type === 'wide') type = DeliveryType.WIDE;
    if (dbBall.extras_type === 'noball') type = DeliveryType.NO_BALL;

    const event: DeliveryEvent = {
        matchId,
        inningsNumber: dbBall.innings_number as 1 | 2,
        overNumber: dbBall.over_number,
        ballNumberInOver: dbBall.ball_number,
        deliveryType: type,
        strikerPlayerId: dbBall.striker_id,
        nonStrikerPlayerId: dbBall.non_striker_id,
        bowlerPlayerId: dbBall.bowler_id,
        batsmanRuns: dbBall.runs_batter,
        byesRuns: dbBall.extras_type === 'byes' ? dbBall.extras_runs : 0,
        legByesRuns: dbBall.extras_type === 'legbyes' ? dbBall.extras_runs : 0,
        penaltyRunsToBattingTeam: dbBall.extras_type === 'penalty_batting' ? dbBall.extras_runs : 0,
        penaltyRunsToFieldingTeam: dbBall.extras_type === 'penalty_fielding' ? dbBall.extras_runs : 0,
        runsCompletedByRunning: dbBall.runs_batter, // Approximation
        wicket: dbBall.is_wicket ? {
            isWicket: true,
            dismissalKind: dbBall.wicket_type as DismissalKind,
            dismissedPlayerId: dbBall.player_dismissed_id || undefined,
            newBatterId: dbBall.new_batter_id
        } : undefined
    };
    return event;
}

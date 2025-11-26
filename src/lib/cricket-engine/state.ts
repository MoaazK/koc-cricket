import {
    MatchConfig,
    InningsState,
    DeliveryEvent,
    InningsStatus,
    DeliveryType,
    BatterStats,
    BowlerStats,
    DismissalKind
} from "./types";

export function createInitialInningsState(
    inningsNumber: 1 | 2,
    battingTeamId: string,
    bowlingTeamId: string
): InningsState {
    return {
        inningsNumber,
        battingTeamId,
        bowlingTeamId,
        totalRuns: 0,
        totalWickets: 0,
        oversCompleted: 0,
        ballsDeliveredTotal: 0,
        ballsLegalThisOver: 0,
        extras: { total: 0, noBall: 0, wide: 0, byes: 0, legByes: 0, penalty: 0 },
        battingCard: [],
        bowlingCard: [],
        events: [],
        status: InningsStatus.NOT_STARTED,
        isFreeHitNextBall: false
    };
}

export function computeInningsState(
    initialState: InningsState,
    events: DeliveryEvent[],
    config: MatchConfig
): InningsState {
    let state = JSON.parse(JSON.stringify(initialState)); // Deep copy to ensure purity

    // Replay all events
    for (const event of events) {
        state = applyEvent(state, event, config);
    }

    return state;
}

function applyEvent(state: InningsState, event: DeliveryEvent, config: MatchConfig): InningsState {
    // 0. Calculate Over and Ball Numbers
    const legalBallsTotal = state.events.filter(e => e.deliveryType === DeliveryType.LEGAL).length;
    const currentOverIndex = Math.floor(legalBallsTotal / config.ballsPerOver);

    // Assign to event (mutating the event object before pushing is acceptable here as it's being consumed)
    event.overNumber = currentOverIndex;

    // Count balls in this over so far to determine sequence number
    // We assume previous events have overNumber set correctly
    const ballsInThisOver = state.events.filter(e => e.overNumber === currentOverIndex).length;
    event.ballNumberInOver = ballsInThisOver + 1;

    // 1. Update Event List
    state.events.push(event);
    state.status = InningsStatus.IN_PROGRESS; // Ensure status is updated

    // 2. Update Totals & Extras
    const isNoBall = event.deliveryType === DeliveryType.NO_BALL;
    const isWide = event.deliveryType === DeliveryType.WIDE;
    const isLegal = event.deliveryType === DeliveryType.LEGAL;
    const isDead = event.deliveryType === DeliveryType.DEAD_BALL;

    if (isDead) return state; // Dead ball changes nothing

    let baseExtra = 0;
    if (isNoBall) baseExtra = config.noBallPenaltyRuns;
    if (isWide) baseExtra = config.widePenaltyRuns;

    const extrasIncrement = baseExtra + event.byesRuns + event.legByesRuns + event.penaltyRunsToBattingTeam;
    const teamRunsIncrement = event.batsmanRuns + extrasIncrement;

    state.totalRuns += teamRunsIncrement;

    state.extras.total += extrasIncrement;
    if (isNoBall) state.extras.noBall += config.noBallPenaltyRuns;
    if (isWide) state.extras.wide += config.widePenaltyRuns;
    state.extras.byes += event.byesRuns;
    state.extras.legByes += event.legByesRuns;
    state.extras.penalty += event.penaltyRunsToBattingTeam;

    // 3. Update Batter Stats
    const striker = getOrCreateBatter(state, event.strikerPlayerId);
    const nonStriker = getOrCreateBatter(state, event.nonStrikerPlayerId);

    if (!isWide) { // Wides don't count as balls faced
        striker.ballsFaced += 1;
    }

    striker.runs += event.batsmanRuns;
    if (event.batsmanRuns === 4 && event.isBoundaryFour) striker.fours += 1;
    if (event.batsmanRuns === 6 && event.isBoundarySix) striker.sixes += 1;

    striker.strikeRate = (striker.runs / (striker.ballsFaced || 1)) * 100;

    // 4. Update Bowler Stats
    const bowler = getOrCreateBowler(state, event.bowlerPlayerId);

    if (isLegal) {
        state.ballsLegalThisOver += 1;
    }

    // Bowler runs conceded: batsman runs + wides + no balls (usually)
    // Byes and Leg Byes are NOT bowler's runs
    const bowlerRuns = event.batsmanRuns + baseExtra + (isWide ? event.byesRuns + event.legByesRuns : 0); // Wides usually include extra runs as wides
    // Actually, standard rule: Wides = 1 + extras. No Ball = 1 + runs off bat.
    // SRS says: "teamRunsIncrement = batsmanRuns + byesRuns + legByesRuns + penaltyRunsToBattingTeam + baseExtra"
    // We need to be careful. Let's stick to simple accumulation for now.

    bowler.runsConceded += bowlerRuns;
    if (isWide) bowler.wides += 1; // Count of wide balls
    if (isNoBall) bowler.noBalls += 1; // Count of no balls

    // 5. Wicket Handling
    if (event.wicket && event.wicket.isWicket) {
        state.totalWickets += 1;
        bowler.wickets += 1; // Credit bowler (unless run out etc, but SRS implies generic credit for now)

        const dismissedId = event.wicket.dismissedPlayerId;
        const dismissedBatter = state.battingCard.find(b => b.playerId === dismissedId);
        if (dismissedBatter) {
            dismissedBatter.inningsStatus = 'OUT';
            dismissedBatter.dismissalKind = event.wicket.dismissalKind;
        }

        // New Batter
        if (event.wicket.newBatterId) {
            getOrCreateBatter(state, event.wicket.newBatterId);
        }
    }

    // 6. Over Calculation
    if (state.ballsLegalThisOver >= config.ballsPerOver) {
        state.ballsLegalThisOver = 0;
        // Increment integer part of overs
        // We store oversCompleted as float X.Y for display, but internally we track balls
    }

    // Recalculate display overs
    const totalLegalBalls = state.events.filter(e => e.deliveryType === DeliveryType.LEGAL || (e.wicket && e.deliveryType !== DeliveryType.NO_BALL && e.deliveryType !== DeliveryType.WIDE)).length;
    // Wait, SRS says: "Legal here means not a no ball, not a wide, not a dead ball."
    // So only LEGAL type counts.

    // Re-eval total legal balls from scratch to be safe/pure
    const legalBallCount = state.events.filter(e => e.deliveryType === DeliveryType.LEGAL).length;
    const completedOvers = Math.floor(legalBallCount / config.ballsPerOver);
    const ballsInCurrentOver = legalBallCount % config.ballsPerOver;
    state.oversCompleted = parseFloat(`${completedOvers}.${ballsInCurrentOver}`);

    bowler.overs = calculateBowlerOvers(state.events, bowler.playerId, config.ballsPerOver);

    // 7. Strike Rotation (Logic is complex, handled by engine.ts determining next striker, 
    // here we just update who is currently there based on the event's *next* state if we were tracking it per ball)
    // However, InningsState needs `currentStrikerId`.
    // The SRS says "Strike rotation... handled by engine...". 
    // BUT `computeInningsState` must result in the correct `currentStrikerId` for the NEXT ball.

    // Let's implement the rotation logic here to determine who is striker/non-striker at the END of this ball.

    let nextStrikerId = event.strikerPlayerId;
    let nextNonStrikerId = event.nonStrikerPlayerId;

    // A. Run-based swap
    if (event.runsCompletedByRunning % 2 !== 0) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
    }

    // B. Wicket-based logic
    if (event.wicket && event.wicket.isWicket) {
        const dismissed = event.wicket.dismissedPlayerId;
        const newBatter = event.wicket.newBatterId;

        // Determine positions at the moment of dismissal (considering crossing)
        let currentStrikerId = event.strikerPlayerId;
        let currentNonStrikerId = event.nonStrikerPlayerId;

        if (event.wicket.batsmenCrossedBeforeDismissal && event.runsCompletedByRunning > 0) {
            [currentStrikerId, currentNonStrikerId] = [currentNonStrikerId, currentStrikerId];
        }

        // SRS 6.3.3: Place new batter at newBatterEnd if provided.
        if (event.wicket.newBatterEnd === 'STRIKER') {
            nextStrikerId = newBatter!;
            nextNonStrikerId = (dismissed === currentStrikerId) ? currentNonStrikerId : currentStrikerId;
            // Wait, if dismissed was non-striker, and we force new batter to striker, 
            // then the survivor (striker) must go to non-striker.
            // Actually, simpler:
            // If new batter is Striker, the *other* person is Non-Striker.
            // The other person is the one who wasn't dismissed.
            const survivor = (dismissed === currentStrikerId) ? currentNonStrikerId : currentStrikerId;
            nextNonStrikerId = survivor;
        } else if (event.wicket.newBatterEnd === 'NON_STRIKER') {
            nextNonStrikerId = newBatter!;
            const survivor = (dismissed === currentStrikerId) ? currentNonStrikerId : currentStrikerId;
            nextStrikerId = survivor;
        } else {
            // Default: New batter replaces the dismissed one at their position.
            if (dismissed === currentStrikerId) {
                nextStrikerId = newBatter!;
                nextNonStrikerId = currentNonStrikerId;
            } else {
                nextNonStrikerId = newBatter!;
                nextStrikerId = currentStrikerId;
            }
        }
    }

    // C. Over completion swap
    // Check if THIS ball completed the over
    // We calculated `ballsInCurrentOver` above based on TOTAL legal balls.
    // If `ballsInCurrentOver` is 0 AND we just bowled a legal ball, then over just finished.
    if (isLegal && ballsInCurrentOver === 0) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
    }

    // D. Overrides
    if (event.overrideNextStrikerId) nextStrikerId = event.overrideNextStrikerId;
    if (event.overrideNextNonStrikerId) nextNonStrikerId = event.overrideNextNonStrikerId;

    state.currentStrikerId = nextStrikerId;
    state.currentNonStrikerId = nextNonStrikerId;

    // 9. Persist Current Bowler
    // The bowler of this event becomes the current bowler until changed.
    // However, if the over is complete, the engine should technically invalidate it or wait for next event.
    // But for UI continuity, we keep it. The UI checks over completion to force change.
    state.currentBowlerId = event.bowlerPlayerId;

    // 8. Free Hit Logic
    if (config.enableFreeHitAfterNoBall && isNoBall) {
        state.isFreeHitNextBall = true;
    } else if (isLegal || isWide) { // Valid ball consumes free hit? Usually yes.
        state.isFreeHitNextBall = false;
    }

    return state;
}

function getOrCreateBatter(state: InningsState, playerId: string): BatterStats {
    let batter = state.battingCard.find(b => b.playerId === playerId);
    if (!batter) {
        batter = {
            playerId,
            runs: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            inningsStatus: 'NOT_OUT' // Default when they appear
        };
        state.battingCard.push(batter);
    }
    return batter;
}

function getOrCreateBowler(state: InningsState, playerId: string): BowlerStats {
    let bowler = state.bowlingCard.find(b => b.playerId === playerId);
    if (!bowler) {
        bowler = {
            playerId,
            overs: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            wides: 0,
            noBalls: 0,
            economyRate: 0
        };
        state.bowlingCard.push(bowler);
    }
    return bowler;
}

function calculateBowlerOvers(events: DeliveryEvent[], bowlerId: string, ballsPerOver: number): number {
    const legalBalls = events.filter(e => e.bowlerPlayerId === bowlerId && e.deliveryType === DeliveryType.LEGAL).length;
    const overs = Math.floor(legalBalls / ballsPerOver);
    const balls = legalBalls % ballsPerOver;
    return parseFloat(`${overs}.${balls}`);
}

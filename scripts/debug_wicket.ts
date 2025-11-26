
// --- TYPES ---

export const DeliveryType = {
    LEGAL: 'LEGAL',
    NO_BALL: 'NO_BALL',
    WIDE: 'WIDE',
    DEAD_BALL: 'DEAD_BALL'
} as const;
export type DeliveryType = typeof DeliveryType[keyof typeof DeliveryType];

export const DismissalKind = {
    BOWLED: 'BOWLED',
    CAUGHT: 'CAUGHT',
    LBW: 'LBW',
    RUN_OUT: 'RUN_OUT',
    STUMPED: 'STUMPED',
    HIT_WICKET: 'HIT_WICKET',
    RETIRED_HURT: 'RETIRED_HURT',
    RETIRED_OUT: 'RETIRED_OUT',
    OBSTRUCTING_FIELD: 'OBSTRUCTING_FIELD',
    HIT_BALL_TWICE: 'HIT_BALL_TWICE',
    TIMED_OUT: 'TIMED_OUT'
} as const;
export type DismissalKind = typeof DismissalKind[keyof typeof DismissalKind];

export const InningsStatus = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    ALL_OUT: 'ALL_OUT',
    TARGET_REACHED: 'TARGET_REACHED',
    OVERS_COMPLETED: 'OVERS_COMPLETED'
} as const;
export type InningsStatus = typeof InningsStatus[keyof typeof InningsStatus];

export interface MatchConfig {
    playersPerSide: number;
    maxOversPerInnings: number;
    ballsPerOver: number;
    noBallPenaltyRuns: number;
    widePenaltyRuns: number;
    enableFreeHitAfterNoBall: boolean;
}

export interface WicketInput {
    isWicket: boolean;
    dismissalKind?: DismissalKind;
    dismissedPlayerId?: string;
    fielderId?: string;
    batsmenCrossedBeforeDismissal?: boolean;
    newBatterId?: string;
    newBatterEnd?: 'STRIKER' | 'NON_STRIKER';
}

export interface DeliveryEvent {
    matchId: string;
    inningsNumber: 1 | 2;
    deliveryIndexWithinInnings?: number;
    overNumber?: number;
    ballNumberInOver?: number;
    deliveryType: DeliveryType;

    strikerPlayerId: string;
    nonStrikerPlayerId: string;
    bowlerPlayerId: string;

    batsmanRuns: number;
    byesRuns: number;
    legByesRuns: number;
    penaltyRunsToBattingTeam: number;
    penaltyRunsToFieldingTeam: number;
    runsCompletedByRunning: number;

    isBoundaryFour?: boolean;
    isBoundarySix?: boolean;

    wicket?: WicketInput;

    isFreeHitDelivery?: boolean;

    overrideNextStrikerId?: string;
    overrideNextNonStrikerId?: string;
}

export interface BatterStats {
    playerId: string;
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    dismissalKind?: DismissalKind;
    dismissalDescription?: string;
    inningsStatus: 'DID_NOT_BAT' | 'NOT_OUT' | 'OUT' | 'RETIRED_HURT' | 'RETIRED_OUT';
}

export interface BowlerStats {
    playerId: string;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    economyRate: number;
}

export interface Extras {
    total: number;
    noBall: number;
    wide: number;
    byes: number;
    legByes: number;
    penalty: number;
}

export interface InningsState {
    inningsNumber: 1 | 2;
    battingTeamId: string;
    bowlingTeamId: string;

    totalRuns: number;
    totalWickets: number;
    oversCompleted: number;

    ballsDeliveredTotal: number;
    ballsLegalThisOver: number;

    extras: Extras;

    battingCard: BatterStats[];
    bowlingCard: BowlerStats[];

    events: DeliveryEvent[];

    status: InningsStatus;

    currentStrikerId?: string;
    currentNonStrikerId?: string;
    currentBowlerId?: string;

    isFreeHitNextBall: boolean;
}

// --- STATE LOGIC ---

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
    let state = JSON.parse(JSON.stringify(initialState));

    for (const event of events) {
        state = applyEvent(state, event, config);
    }

    return state;
}

function applyEvent(state: InningsState, event: DeliveryEvent, config: MatchConfig): InningsState {
    const legalBallsTotal = state.events.filter((e: DeliveryEvent) => e.deliveryType === DeliveryType.LEGAL).length;
    const currentOverIndex = Math.floor(legalBallsTotal / config.ballsPerOver);

    event.overNumber = currentOverIndex;

    const ballsInThisOver = state.events.filter((e: DeliveryEvent) => e.overNumber === currentOverIndex).length;
    event.ballNumberInOver = ballsInThisOver + 1;

    state.events.push(event);
    state.status = InningsStatus.IN_PROGRESS;

    const isNoBall = event.deliveryType === DeliveryType.NO_BALL;
    const isWide = event.deliveryType === DeliveryType.WIDE;
    const isLegal = event.deliveryType === DeliveryType.LEGAL;
    const isDead = event.deliveryType === DeliveryType.DEAD_BALL;

    if (isDead) return state;

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

    const striker = getOrCreateBatter(state, event.strikerPlayerId);
    const nonStriker = getOrCreateBatter(state, event.nonStrikerPlayerId);

    if (!isWide) {
        striker.ballsFaced += 1;
    }

    striker.runs += event.batsmanRuns;
    if (event.batsmanRuns === 4 && event.isBoundaryFour) striker.fours += 1;
    if (event.batsmanRuns === 6 && event.isBoundarySix) striker.sixes += 1;

    striker.strikeRate = (striker.runs / (striker.ballsFaced || 1)) * 100;

    const bowler = getOrCreateBowler(state, event.bowlerPlayerId);

    if (isLegal) {
        state.ballsLegalThisOver += 1;
    }

    const bowlerRuns = event.batsmanRuns + baseExtra + (isWide ? event.byesRuns + event.legByesRuns : 0);

    bowler.runsConceded += bowlerRuns;
    if (isWide) bowler.wides += 1;
    if (isNoBall) bowler.noBalls += 1;

    if (event.wicket && event.wicket.isWicket) {
        state.totalWickets += 1;
        bowler.wickets += 1;

        const dismissedId = event.wicket.dismissedPlayerId;
        const dismissedBatter = state.battingCard.find((b: BatterStats) => b.playerId === dismissedId);
        if (dismissedBatter) {
            dismissedBatter.inningsStatus = 'OUT';
            dismissedBatter.dismissalKind = event.wicket.dismissalKind;
        }

        if (event.wicket.newBatterId) {
            getOrCreateBatter(state, event.wicket.newBatterId);
        }
    }

    if (state.ballsLegalThisOver >= config.ballsPerOver) {
        state.ballsLegalThisOver = 0;
    }

    const legalBallCount = state.events.filter((e: DeliveryEvent) => e.deliveryType === DeliveryType.LEGAL).length;
    const completedOvers = Math.floor(legalBallCount / config.ballsPerOver);
    const ballsInCurrentOver = legalBallCount % config.ballsPerOver;
    state.oversCompleted = parseFloat(`${completedOvers}.${ballsInCurrentOver}`);

    bowler.overs = calculateBowlerOvers(state.events, bowler.playerId, config.ballsPerOver);

    let nextStrikerId = event.strikerPlayerId;
    let nextNonStrikerId = event.nonStrikerPlayerId;

    if (event.runsCompletedByRunning % 2 !== 0) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
    }

    if (event.wicket && event.wicket.isWicket) {
        const dismissed = event.wicket.dismissedPlayerId;
        const newBatter = event.wicket.newBatterId;

        let currentStrikerId = event.strikerPlayerId;
        let currentNonStrikerId = event.nonStrikerPlayerId;

        if (event.wicket.batsmenCrossedBeforeDismissal && event.runsCompletedByRunning > 0) {
            [currentStrikerId, currentNonStrikerId] = [currentNonStrikerId, currentStrikerId];
        }

        if (event.wicket.newBatterEnd === 'STRIKER') {
            nextStrikerId = newBatter!;
            const survivor = (dismissed === currentStrikerId) ? currentNonStrikerId : currentStrikerId;
            nextNonStrikerId = survivor;
        } else if (event.wicket.newBatterEnd === 'NON_STRIKER') {
            nextNonStrikerId = newBatter!;
            const survivor = (dismissed === currentStrikerId) ? currentNonStrikerId : currentStrikerId;
            nextStrikerId = survivor;
        } else {
            if (dismissed === currentStrikerId) {
                nextStrikerId = newBatter!;
                nextNonStrikerId = currentNonStrikerId;
            } else {
                nextNonStrikerId = newBatter!;
                nextStrikerId = currentStrikerId;
            }
        }
    }

    if (isLegal && ballsInCurrentOver === 0) {
        [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
    }

    if (event.overrideNextStrikerId) nextStrikerId = event.overrideNextStrikerId;
    if (event.overrideNextNonStrikerId) nextNonStrikerId = event.overrideNextNonStrikerId;

    state.currentStrikerId = nextStrikerId;
    state.currentNonStrikerId = nextNonStrikerId;

    // FIX: Persist Bowler
    state.currentBowlerId = event.bowlerPlayerId;

    if (config.enableFreeHitAfterNoBall && isNoBall) {
        state.isFreeHitNextBall = true;
    } else if (isLegal || isWide) {
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
            inningsStatus: 'NOT_OUT'
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

// --- DEBUG SCRIPT ---

async function debugWicket() {
    console.log('Debugging Wicket State...');

    const config: MatchConfig = {
        ballsPerOver: 6,
        maxOversPerInnings: 20,
        widePenaltyRuns: 1,
        noBallPenaltyRuns: 1,
        enableFreeHitAfterNoBall: true,
        playersPerSide: 11
    };

    const initialState = createInitialInningsState(1, 'teamA', 'teamB');

    const events: DeliveryEvent[] = [];

    // Event 1: Ball 1 (1 run)
    events.push({
        matchId: 'm1',
        inningsNumber: 1,
        deliveryType: DeliveryType.LEGAL,
        strikerPlayerId: 'P1',
        nonStrikerPlayerId: 'P2',
        bowlerPlayerId: 'B1',
        batsmanRuns: 1,
        byesRuns: 0,
        legByesRuns: 0,
        penaltyRunsToBattingTeam: 0,
        penaltyRunsToFieldingTeam: 0,
        runsCompletedByRunning: 1,
        overNumber: 0,
        ballNumberInOver: 1
    });

    // Event 2: Ball 2 (Wicket)
    events.push({
        matchId: 'm1',
        inningsNumber: 1,
        deliveryType: DeliveryType.LEGAL,
        strikerPlayerId: 'P2',
        nonStrikerPlayerId: 'P1',
        bowlerPlayerId: 'B1',
        batsmanRuns: 0,
        byesRuns: 0,
        legByesRuns: 0,
        penaltyRunsToBattingTeam: 0,
        penaltyRunsToFieldingTeam: 0,
        runsCompletedByRunning: 0,
        wicket: {
            isWicket: true,
            dismissalKind: DismissalKind.BOWLED,
            dismissedPlayerId: 'P2',
            newBatterId: 'P3'
        },
        overNumber: 0,
        ballNumberInOver: 2
    });

    console.log('Computing state...');
    const finalState = computeInningsState(initialState, events, config);

    console.log('Current Striker:', finalState.currentStrikerId);
    console.log('Current NonStriker:', finalState.currentNonStrikerId);
    console.log('Batting Card IDs:', finalState.battingCard.map(b => b.playerId));

    const striker = finalState.battingCard.find(b => b.playerId === finalState.currentStrikerId);
    const nonStriker = finalState.battingCard.find(b => b.playerId === finalState.currentNonStrikerId);

    if (!striker) console.error('ERROR: Striker not found in batting card!');
    else console.log('Striker found:', striker.playerId);

    if (!nonStriker) console.error('ERROR: NonStriker not found in batting card!');
    else console.log('NonStriker found:', nonStriker.playerId);

    if (finalState.currentBowlerId !== 'B1') {
        console.error('ERROR: Bowler ID lost!', finalState.currentBowlerId);
    } else {
        console.log('Bowler ID persisted:', finalState.currentBowlerId);
    }
}

debugWicket();

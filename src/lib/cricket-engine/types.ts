export enum DeliveryType {
    LEGAL = 'LEGAL',
    NO_BALL = 'NO_BALL',
    WIDE = 'WIDE',
    DEAD_BALL = 'DEAD_BALL'
}

export enum DismissalKind {
    BOWLED = 'BOWLED',
    CAUGHT = 'CAUGHT',
    LBW = 'LBW',
    RUN_OUT = 'RUN_OUT',
    STUMPED = 'STUMPED',
    HIT_WICKET = 'HIT_WICKET',
    RETIRED_HURT = 'RETIRED_HURT',
    RETIRED_OUT = 'RETIRED_OUT',
    OBSTRUCTING_FIELD = 'OBSTRUCTING_FIELD',
    HIT_BALL_TWICE = 'HIT_BALL_TWICE',
    TIMED_OUT = 'TIMED_OUT'
}

export enum InningsStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ALL_OUT = 'ALL_OUT',
    TARGET_REACHED = 'TARGET_REACHED',
    OVERS_COMPLETED = 'OVERS_COMPLETED'
}

export interface MatchConfig {
    playersPerSide: number;
    maxOversPerInnings: number;
    ballsPerOver: number;
    noBallPenaltyRuns: number;
    widePenaltyRuns: number;
    enableFreeHitAfterNoBall: boolean;
}

export interface Player {
    id: string;
    name: string;
}

export interface Team {
    id: string;
    name: string;
    playerIds: string[]; // Batting order
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
    deliveryIndexWithinInnings?: number; // Assigned by engine
    overNumber?: number; // Derived
    ballNumberInOver?: number; // Derived
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
    overs: number; // e.g. 10.2
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
    oversCompleted: number; // e.g. 10.2

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

export interface MatchState {
    config: MatchConfig;
    teams: { [id: string]: Team };
    players: { [id: string]: Player };

    innings: {
        1: InningsState;
        2: InningsState;
    };

    currentInningsNumber: 1 | 2;
    target?: number;
}

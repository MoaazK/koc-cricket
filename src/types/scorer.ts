export interface Player {
    id: string;
    name: string;
    role: 'batsman' | 'bowler' | 'all-rounder' | 'keeper';
}

export interface BatsmanState {
    playerId: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isStriker: boolean;
}

export interface BowlerState {
    playerId: string;
    name: string;
    overs: number; // e.g. 1.2
    maidens: number;
    runsConceded: number;
    wickets: number;
}

export interface BallEvent {
    ballNumber: number; // 1 to 6 (or more for extras)
    runs: number;
    extrasType?: 'wide' | 'noball' | 'bye' | 'legbye' | 'penalty';
    extrasRuns?: number;
    isWicket?: boolean;
    wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket' | 'retired';
    playerDismissedId?: string;
}

export interface MatchState {
    matchId: string;
    battingTeamId: string;
    bowlingTeamId: string;
    currentInnings: 1 | 2;
    totalRuns: number;
    wickets: number;
    overs: number; // e.g. 14.2
    balls: number; // valid balls in current over (0-5)
    currentBatsmen: BatsmanState[];
    currentBowler: BowlerState;
    recentBalls: string[]; // Display strings e.g. "1", "W", "4"
    target?: number;
    status: 'upcoming' | 'live' | 'completed' | 'abandoned';
}

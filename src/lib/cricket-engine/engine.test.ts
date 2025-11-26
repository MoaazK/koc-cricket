import { describe, it, expect, beforeEach } from 'vitest';
import { CricketEngine } from './engine';
import { MatchConfig, DeliveryType, DismissalKind } from './types';

const defaultConfig: MatchConfig = {
    playersPerSide: 11,
    maxOversPerInnings: 20,
    ballsPerOver: 6,
    noBallPenaltyRuns: 1,
    widePenaltyRuns: 1,
    enableFreeHitAfterNoBall: true
};

const teamA = { id: 'teamA', name: 'Team A', playerIds: ['p1', 'p2', 'p3'] };
const teamB = { id: 'teamB', name: 'Team B', playerIds: ['p4', 'p5', 'p6'] };
const players = [
    { id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }, { id: 'p3', name: 'Player 3' },
    { id: 'p4', name: 'Player 4' }, { id: 'p5', name: 'Player 5' }, { id: 'p6', name: 'Player 6' }
];

describe('CricketEngine', () => {
    let engine: CricketEngine;

    beforeEach(() => {
        engine = CricketEngine.createMatch(defaultConfig, teamA, teamB, players);
        engine.startInnings(1, teamA.id, teamB.id, 'p1', 'p2');
    });

    it('should initialize match correctly', () => {
        const state = engine.getMatchState();
        expect(state.currentInningsNumber).toBe(1);
        expect(state.innings[1].battingCard).toHaveLength(2);
        expect(state.innings[1].currentStrikerId).toBe('p1');
        expect(state.innings[1].totalRuns).toBe(0);
    });

    it('should record a dot ball', () => {
        engine.recordDelivery({
            matchId: 'match1',
            inningsNumber: 1,
            deliveryType: DeliveryType.LEGAL,
            strikerPlayerId: 'p1',
            nonStrikerPlayerId: 'p2',
            bowlerPlayerId: 'p4',
            batsmanRuns: 0,
            byesRuns: 0,
            legByesRuns: 0,
            penaltyRunsToBattingTeam: 0,
            penaltyRunsToFieldingTeam: 0,
            runsCompletedByRunning: 0
        });

        const state = engine.getMatchState().innings[1];
        expect(state.totalRuns).toBe(0);
        expect(state.ballsLegalThisOver).toBe(1);
        expect(state.oversCompleted).toBe(0.1);
        expect(state.battingCard.find(b => b.playerId === 'p1')?.ballsFaced).toBe(1);
    });

    it('should record a single and rotate strike', () => {
        engine.recordDelivery({
            matchId: 'match1',
            inningsNumber: 1,
            deliveryType: DeliveryType.LEGAL,
            strikerPlayerId: 'p1',
            nonStrikerPlayerId: 'p2',
            bowlerPlayerId: 'p4',
            batsmanRuns: 1,
            byesRuns: 0,
            legByesRuns: 0,
            penaltyRunsToBattingTeam: 0,
            penaltyRunsToFieldingTeam: 0,
            runsCompletedByRunning: 1
        });

        const state = engine.getMatchState().innings[1];
        expect(state.totalRuns).toBe(1);
        expect(state.currentStrikerId).toBe('p2'); // Rotated
        expect(state.currentNonStrikerId).toBe('p1');
    });

    it('should handle a wide', () => {
        engine.recordDelivery({
            matchId: 'match1',
            inningsNumber: 1,
            deliveryType: DeliveryType.WIDE,
            strikerPlayerId: 'p1',
            nonStrikerPlayerId: 'p2',
            bowlerPlayerId: 'p4',
            batsmanRuns: 0,
            byesRuns: 0,
            legByesRuns: 0,
            penaltyRunsToBattingTeam: 0,
            penaltyRunsToFieldingTeam: 0,
            runsCompletedByRunning: 0
        });

        const state = engine.getMatchState().innings[1];
        expect(state.totalRuns).toBe(1); // 1 wide run
        expect(state.extras.wide).toBe(1);
        expect(state.ballsLegalThisOver).toBe(0); // Not a legal ball
        expect(state.battingCard.find(b => b.playerId === 'p1')?.ballsFaced).toBe(0); // Doesn't count as ball faced
    });

    it('should handle a wicket (Caught)', () => {
        engine.recordDelivery({
            matchId: 'match1',
            inningsNumber: 1,
            deliveryType: DeliveryType.LEGAL,
            strikerPlayerId: 'p1',
            nonStrikerPlayerId: 'p2',
            bowlerPlayerId: 'p4',
            batsmanRuns: 0,
            byesRuns: 0,
            legByesRuns: 0,
            penaltyRunsToBattingTeam: 0,
            penaltyRunsToFieldingTeam: 0,
            runsCompletedByRunning: 0,
            wicket: {
                isWicket: true,
                dismissalKind: DismissalKind.CAUGHT,
                dismissedPlayerId: 'p1',
                newBatterId: 'p3',
                newBatterEnd: 'STRIKER'
            }
        });

        const state = engine.getMatchState().innings[1];
        expect(state.totalWickets).toBe(1);
        expect(state.currentStrikerId).toBe('p3');
        expect(state.battingCard.find(b => b.playerId === 'p1')?.inningsStatus).toBe('OUT');
    });

    it('should rotate strike at end of over', () => {
        // Bowl 6 dot balls
        for (let i = 0; i < 6; i++) {
            engine.recordDelivery({
                matchId: 'match1',
                inningsNumber: 1,
                deliveryType: DeliveryType.LEGAL,
                strikerPlayerId: i === 0 ? 'p1' : engine.getMatchState().innings[1].currentStrikerId!,
                nonStrikerPlayerId: i === 0 ? 'p2' : engine.getMatchState().innings[1].currentNonStrikerId!,
                bowlerPlayerId: 'p4',
                batsmanRuns: 0,
                byesRuns: 0,
                legByesRuns: 0,
                penaltyRunsToBattingTeam: 0,
                penaltyRunsToFieldingTeam: 0,
                runsCompletedByRunning: 0
            });
        }

        const state = engine.getMatchState().innings[1];
        expect(state.oversCompleted).toBe(1);
        expect(state.currentStrikerId).toBe('p2'); // Rotated after over
    });
});

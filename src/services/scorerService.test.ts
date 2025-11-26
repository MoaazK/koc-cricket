import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scorerService } from './scorerService';
import { DeliveryType } from '@/lib/cricket-engine/types';

// Mock Supabase
const { mockSupabase, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockOrder } = vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockInsert = vi.fn();
    const mockUpdate = vi.fn();
    const mockEq = vi.fn();
    const mockSingle = vi.fn();
    const mockOrder = vi.fn();

    const mockSupabase = {
        from: vi.fn(() => ({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate
        }))
    };

    return { mockSupabase, mockSelect, mockInsert, mockUpdate, mockEq, mockSingle, mockOrder };
});

vi.mock('@/lib/supabase', () => ({
    supabase: mockSupabase
}));

describe('scorerService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset chain defaults
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle, order: mockOrder, eq: mockEq });
        mockSingle.mockResolvedValue({ data: null, error: null });

        // Update/Insert chains
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) }); // For inserts that return data

    });

    it('should fetch match state and initialize engine', async () => {
        // Mock Match Data (Call 1: Matches)
        mockSingle.mockResolvedValueOnce({
            data: {
                id: 'match1',
                home_team_id: 'teamA',
                away_team_id: 'teamB',
                home_team: { id: 'teamA', name: 'Team A' },
                away_team: { id: 'teamB', name: 'Team B' },
                status: 'live'
            },
            error: null
        });
        mockSelect.mockReturnValueOnce({ eq: mockEq }); // For matches

        // Mock Players (Home) (Call 2)
        mockSelect.mockReturnValueOnce({ eq: () => Promise.resolve({ data: [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }] }) });

        // Mock Players (Away) (Call 3)
        mockSelect.mockReturnValueOnce({ eq: () => Promise.resolve({ data: [{ id: 'p3', name: 'P3' }, { id: 'p4', name: 'P4' }] }) });

        // Mock Balls (Call 4)
        mockSelect.mockReturnValueOnce({ eq: mockEq }); // For balls
        mockOrder.mockResolvedValueOnce({ data: [] });

        const state = await scorerService.getMatchState('match1');

        expect(state).toBeDefined();
        expect(state?.teams['teamA'].name).toBe('Team A');
        expect(state?.innings[1].battingCard).toHaveLength(2); // Should have auto-started innings 1 with 2 openers
    });

    it('should record a ball and persist to supabase', async () => {
        // 1. Mock Get State (Pre-requisite for recordBall)
        // We need to return a valid state so the service can derive over number

        // Match (Call 1)
        mockSingle.mockResolvedValueOnce({
            data: {
                id: 'match1',
                home_team_id: 'teamA',
                away_team_id: 'teamB',
                home_team: { id: 'teamA', name: 'Team A' },
                away_team: { id: 'teamB', name: 'Team B' },
                status: 'live'
            },
            error: null
        });
        mockSelect.mockReturnValueOnce({ eq: mockEq });

        // Players (Call 2 & 3)
        mockSelect.mockReturnValueOnce({ eq: () => Promise.resolve({ data: [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }] }) });
        mockSelect.mockReturnValueOnce({ eq: () => Promise.resolve({ data: [{ id: 'p3', name: 'P3' }, { id: 'p4', name: 'P4' }] }) });

        // Balls (Call 4)
        mockSelect.mockReturnValueOnce({ eq: mockEq });
        mockOrder.mockResolvedValueOnce({ data: [] });

        // 2. Mock DB Lookups during recordBall
        // Innings lookup
        mockSingle.mockResolvedValueOnce({ data: { id: 'innings1' } });
        // Over lookup
        mockSingle.mockResolvedValueOnce({ data: { id: 'over1' } });

        // 3. Call recordBall
        await scorerService.recordBall('match1', {
            matchId: 'match1',
            inningsNumber: 1,
            deliveryType: DeliveryType.LEGAL,
            strikerPlayerId: 'p1',
            nonStrikerPlayerId: 'p2',
            bowlerPlayerId: 'p3',
            batsmanRuns: 1,
            byesRuns: 0,
            legByesRuns: 0,
            penaltyRunsToBattingTeam: 0,
            penaltyRunsToFieldingTeam: 0,
            runsCompletedByRunning: 1
        });

        // 4. Verify Insert
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            over_id: 'over1',
            runs_batter: 1,
            striker_id: 'p1'
        }));

        // Verify Update Innings Aggregates
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            total_runs: 1
        }));
    });
});

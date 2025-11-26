import {
    MatchConfig,
    MatchState,
    Team,
    Player,
    InningsState,
    DeliveryEvent,
    InningsStatus
} from "./types";
import { createInitialInningsState, computeInningsState } from "./state";

export class CricketEngine {
    private state: MatchState;

    constructor(state: MatchState) {
        this.state = state;
    }

    static createMatch(config: MatchConfig, teamA: Team, teamB: Team, players: Player[]): CricketEngine {
        const initialState: MatchState = {
            config,
            teams: { [teamA.id]: teamA, [teamB.id]: teamB },
            players: players.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
            innings: {
                1: createInitialInningsState(1, teamA.id, teamB.id), // Default, will be set properly in startInnings
                2: createInitialInningsState(2, teamB.id, teamA.id)
            },
            currentInningsNumber: 1
        };
        return new CricketEngine(initialState);
    }

    getMatchState(): MatchState {
        return this.state;
    }

    startInnings(
        inningsNumber: 1 | 2,
        battingTeamId: string,
        bowlingTeamId: string,
        openingStrikerId: string,
        openingNonStrikerId: string
    ): MatchState {
        const innings = createInitialInningsState(inningsNumber, battingTeamId, bowlingTeamId);
        innings.status = InningsStatus.IN_PROGRESS;
        innings.currentStrikerId = openingStrikerId;
        innings.currentNonStrikerId = openingNonStrikerId;

        // Add openers to card
        innings.battingCard.push({
            playerId: openingStrikerId,
            runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, inningsStatus: 'NOT_OUT'
        });
        innings.battingCard.push({
            playerId: openingNonStrikerId,
            runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, inningsStatus: 'NOT_OUT'
        });

        this.state.innings[inningsNumber] = innings;
        this.state.currentInningsNumber = inningsNumber;
        return this.state;
    }

    recordDelivery(event: DeliveryEvent): MatchState {
        const inningsNo = event.inningsNumber;
        const currentInnings = this.state.innings[inningsNo];

        if (currentInnings.status === InningsStatus.COMPLETED || currentInnings.status === InningsStatus.ALL_OUT) {
            throw new Error("Cannot record delivery: Innings is complete.");
        }

        // Validate Bowler Change
        // Check if this is a new over (ballsLegalThisOver == 0 and oversCompleted > 0)
        // Actually, we need to check if the PREVIOUS event finished an over.
        // Or simpler: Check the last event's bowler.
        // If the last event finished an over, the new event MUST have a different bowler.

        const lastEvent = currentInnings.events[currentInnings.events.length - 1];
        if (lastEvent) {
            // Calculate if the last event finished an over
            // We can check state.oversCompleted. If it is an integer, the over finished.
            // BUT, we need to be careful about floating point.
            // Better: Check ballsLegalThisOver of the current state.
            // If ballsLegalThisOver is 0, it means the previous over finished (or we are at start).
            // If oversCompleted > 0 and ballsLegalThisOver == 0, then we are at the start of a new over.

            if (currentInnings.ballsLegalThisOver === 0 && currentInnings.oversCompleted > 0) {
                if (event.bowlerPlayerId === lastEvent.bowlerPlayerId) {
                    throw new Error("Bowler must change after an over.");
                }
            }
        }

        // Append event
        const newEvents = [...currentInnings.events, event];

        // Recompute state
        const newInningsState = computeInningsState(
            createInitialInningsState(inningsNo, currentInnings.battingTeamId, currentInnings.bowlingTeamId),
            newEvents,
            this.state.config
        );

        // Preserve start-of-innings data (openers) if recompute doesn't handle it (it does via getOrCreateBatter, but we need to ensure correct initial striker/non-striker if 0 balls)
        // Actually, computeInningsState handles everything from events. 
        // BUT, for the very first ball, we need to know who was striker/non-striker to set them in the state if they aren't in the event (but they ARE in the event).
        // The event has strikerId and nonStrikerId.

        this.state.innings[inningsNo] = newInningsState;
        return this.state;
    }

    undoLastDelivery(inningsNumber: 1 | 2): MatchState {
        const currentInnings = this.state.innings[inningsNumber];
        if (currentInnings.events.length === 0) return this.state;

        const newEvents = currentInnings.events.slice(0, -1);

        // Recompute
        // We need to know the initial state (openers) to re-hydrate correctly if we go back to 0 balls?
        // computeInningsState starts from empty.
        // If we go back to 0 balls, the state should reflect "startInnings" state.
        // Our computeInningsState returns NOT_STARTED if 0 events.
        // We might need to manually set it to IN_PROGRESS if we are just undoing balls but not the "start".

        const newInningsState = computeInningsState(
            createInitialInningsState(inningsNumber, currentInnings.battingTeamId, currentInnings.bowlingTeamId),
            newEvents,
            this.state.config
        );

        if (newEvents.length === 0) {
            // Restore "Just Started" state
            newInningsState.status = InningsStatus.IN_PROGRESS;
            // We lose who the openers were if we don't store them separately or look at the first event that WAS there.
            // For now, let's assume the caller handles re-initializing if they undo everything.
            // OR, we can store `initialStrikerId` in InningsState.
        }

        this.state.innings[inningsNumber] = newInningsState;
        return this.state;
    }
}

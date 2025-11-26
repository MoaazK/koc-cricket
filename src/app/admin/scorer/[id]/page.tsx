"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, UserPlus, AlertCircle, Loader2, Undo2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { scorerService } from "@/services/scorerService";
import { SelectBatsmanModal } from "@/components/admin/SelectBatsmanModal";
import { SelectBowlerModal } from "@/components/admin/SelectBowlerModal";
import { SelectOpenersModal } from "@/components/admin/SelectOpenersModal";
import { DismissalModal } from "@/components/admin/DismissalModal";
import { MatchState, DeliveryType, DismissalKind } from "@/lib/cricket-engine/types";

export default function ScorerDashboard() {
  const params = useParams();
  const matchId = params.id as string;
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [showOpenersModal, setShowOpenersModal] = useState(false);
  const [showDismissalModal, setShowDismissalModal] = useState(false);

  const [selectedBowlerId, setSelectedBowlerId] = useState<string | null>(null);

  // Load Match State
  const loadMatch = useCallback(async () => {
    if (!matchId) return;
    const state = await scorerService.getMatchState(matchId);
    if (state) {
      setMatchState(state);
    } else {
      console.error("Failed to load match state");
    }
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMatch();
  }, [loadMatch]);

  // Derived State Helpers
  const currentInnings = matchState ? matchState.innings[matchState.currentInningsNumber] : null;

  // Sync selectedBowlerId with engine state if available
  useEffect(() => {
    if (currentInnings?.currentBowlerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBowlerId(currentInnings.currentBowlerId);
    }
  }, [currentInnings?.currentBowlerId]);

  const [openersSelected, setOpenersSelected] = useState(false);

  // Check for Openers
  useEffect(() => {
    // Show modal if no balls have been bowled yet AND we haven't just selected them
    if (currentInnings && currentInnings.events.length === 0 && !loading && !openersSelected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOpenersModal(true);
    }
  }, [currentInnings, loading, openersSelected]);

  const striker = currentInnings?.battingCard.find(b => b.playerId === currentInnings.currentStrikerId);
  const nonStriker = currentInnings?.battingCard.find(b => b.playerId === currentInnings.currentNonStrikerId);

  const getBatsmanName = (id?: string) => matchState?.players[id || '']?.name || 'Unknown';

  // Effective Bowler Logic
  const effectiveBowlerId = selectedBowlerId || currentInnings?.currentBowlerId;
  const currentBowler = currentInnings?.bowlingCard.find(b => b.playerId === effectiveBowlerId) || (effectiveBowlerId ? { playerId: effectiveBowlerId, name: getBatsmanName(effectiveBowlerId), wickets: 0, runsConceded: 0, overs: 0 } : null);

  // Stats
  const crr = currentInnings ? (currentInnings.totalRuns / (Math.floor(currentInnings.oversCompleted) + ((currentInnings.oversCompleted % 1) * 10 / 6) || 1)).toFixed(2) : "0.00";
  const projectedScore = currentInnings ? Math.round(parseFloat(crr) * (matchState?.config.maxOversPerInnings || 20)) : 0;

  // Over Completion Logic
  const isOverComplete = currentInnings ? currentInnings.ballsLegalThisOver === 0 && currentInnings.oversCompleted > 0 && Number.isInteger(currentInnings.oversCompleted) : false;

  // Check if a new bowler has been selected for the new over
  // If over is complete, we expect selectedBowlerId to be DIFFERENT from the last bowler (currentInnings.currentBowlerId)
  // OR if it's the same, we might want to allow it if the rules allow (but usually not).
  // For now, let's just check if a selection has been made that is "effective".
  // Actually, if isOverComplete is true, effectiveBowlerId will be the OLD bowler unless selectedBowlerId is set.
  // So we need to check if selectedBowlerId is set AND (it's different OR we allow same).
  // Let's assume we just need ANY selectedBowlerId that overrides the current one, OR if the user explicitly selected the same one (which we can't easily track without more state).
  // BUT, handleNewBowler sets selectedBowlerId.
  // So if selectedBowlerId is set, we assume the user made a choice.
  // However, we sync selectedBowlerId to currentBowlerId on load.
  // So when over ends, selectedBowlerId === currentBowlerId.
  // So we need to check if selectedBowlerId !== currentBowlerId.
  const isNewBowlerSelected = selectedBowlerId && currentInnings?.currentBowlerId && selectedBowlerId !== currentInnings.currentBowlerId;

  // Disable scoring if over is complete AND we haven't selected a new bowler yet
  const shouldDisableScoring = isOverComplete && !isNewBowlerSelected;

  // Disable Change Bowler if over has started (balls > 0) and is NOT complete
  const shouldDisableChangeBowler = currentInnings ? currentInnings.ballsLegalThisOver > 0 && !isOverComplete : false;

  // Last Bowler Logic (to prevent consecutive overs)
  // const currentOverIndex = currentInnings ? Math.floor(currentInnings.oversCompleted) : 0;
  // If over is complete, we are looking for the bowler of the JUST completed over (which is currentOverIndex - 1 if we consider currentOverIndex as the NEW over index)
  // Wait, oversCompleted is e.g. 1.0. This means 1 over done. Next ball is 1.1 (Over 2).
  // So if oversCompleted is integer, the "previous" over is oversCompleted - 1.
  // If oversCompleted is 0.3, the "current" over is 0.
  // We want to know who bowled the LAST COMPLETED over? No, we want to know who bowled the IMMEDIATELY PRECEDING over.
  // If we are in Over 2 (index 1), we want to know who bowled Over 1 (index 0).
  // If we are in Over 1 (index 0), there is no previous bowler.

  let lastBowlerId: string | undefined;
  if (currentInnings) {
    // const prevOverIndex = isOverComplete ? currentOverIndex - 1 : currentOverIndex - 1;
    // Actually, if isOverComplete (e.g. 1.0), we are about to start Over 2. The last bowler was Over 1 (index 0).
    // If we are mid-over (e.g. 0.3), we are in Over 1. There is no previous over.

    // Let's simplify: Find the last event. Its bowler is the "current" bowler.
    // If the over JUST finished, that bowler cannot bowl the next one.
    // If we are starting a new over, the "lastBowlerId" is the one who bowled the previous over.

    if (currentInnings.oversCompleted > 0) {
      // Find the last event of the previous over
      // The previous over index is Math.floor(currentInnings.oversCompleted) - 1 if isOverComplete?
      // If 1.0, floor is 1. Prev is 0. Correct.
      // If 1.1, floor is 1. Prev is 0. Correct.
      // If 0.5, floor is 0. Prev is -1. No last bowler.
      const prevOverNum = Math.floor(currentInnings.oversCompleted) - (isOverComplete ? 1 : 1);

      if (prevOverNum >= 0) {
        const lastBallOfPrevOver = currentInnings.events.findLast(e => e.overNumber === prevOverNum);
        lastBowlerId = lastBallOfPrevOver?.bowlerPlayerId;
      }
    }
  }

  // Recent Balls (Current Over Only)
  const recentBalls = currentInnings ? currentInnings.events.filter(e => e.overNumber === Math.floor(currentInnings.oversCompleted)) : [];
  // If over is complete (1.0), floor is 1. But events for Over 2 haven't started. So it returns empty. Correct.

  // Last Over Summary
  const lastOverIndex = currentInnings ? Math.floor(currentInnings.oversCompleted) - 1 : -1;
  const lastOverEvents = (currentInnings && lastOverIndex >= 0) ? currentInnings.events.filter(e => e.overNumber === lastOverIndex) : [];
  const lastOverRuns = lastOverEvents.reduce((sum, e) => sum + e.batsmanRuns + e.byesRuns + e.legByesRuns + e.penaltyRunsToBattingTeam + (e.deliveryType !== DeliveryType.LEGAL ? 1 : 0), 0);
  const lastOverWickets = lastOverEvents.filter(e => e.wicket?.isWicket).length;
  const lastOverExtras = lastOverEvents.reduce((sum, e) => sum + e.byesRuns + e.legByesRuns + e.penaltyRunsToBattingTeam + (e.deliveryType !== DeliveryType.LEGAL ? 1 : 0), 0);

  // --- Handlers ---

  // ... (handleRun, handleExtra, handleWicketClick, handleDismissalConfirmed)

  const handleReplaceBatsman = async (playerId: string) => {
    if (!matchState || !currentInnings) return;

    // Determine which batsman we are replacing
    // We need to know who was clicked. We can store "batsmanToReplaceId" in state.
    // But for now, let's assume we set it before opening modal.
    if (!batsmanToReplaceId) return;

    // Case 1: No balls bowled yet (Openers)
    if (currentInnings.events.length === 0) {
      const newInnings = { ...currentInnings };
      if (newInnings.currentStrikerId === batsmanToReplaceId) {
        newInnings.currentStrikerId = playerId;
      } else if (newInnings.currentNonStrikerId === batsmanToReplaceId) {
        newInnings.currentNonStrikerId = playerId;
      }

      // Update batting card
      const oldBatterIndex = newInnings.battingCard.findIndex(b => b.playerId === batsmanToReplaceId);
      if (oldBatterIndex !== -1) {
        newInnings.battingCard[oldBatterIndex] = { ...newInnings.battingCard[oldBatterIndex], playerId: playerId };
      } else {
        newInnings.battingCard.push({ playerId: playerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, inningsStatus: 'NOT_OUT' });
      }

      const newMatchState = { ...matchState };
      newMatchState.innings[matchState.currentInningsNumber] = newInnings;
      setMatchState(newMatchState);
      setShowBatsmanModal(false);
      setBatsmanToReplaceId(null);
      return;
    }

    // Case 2: Replacing the incoming batsman (after wicket)
    // Check if the batsmanToReplaceId is the newBatterId of the last event
    const lastEvent = currentInnings.events[currentInnings.events.length - 1];
    if (lastEvent.wicket?.isWicket && lastEvent.wicket.newBatterId === batsmanToReplaceId) {
      setLoading(true);
      await scorerService.updateLastEventNewBatter(matchId, playerId);
      await loadMatch();
      setLoading(false);
      setShowBatsmanModal(false);
      setBatsmanToReplaceId(null);
      return;
    }

    alert("Cannot replace this batsman. Only openers (before play) or the immediate incoming batsman can be changed.");
    setShowBatsmanModal(false);
    setBatsmanToReplaceId(null);
  };

  const [batsmanToReplaceId, setBatsmanToReplaceId] = useState<string | null>(null);

  const onBatsmanClick = (batsmanId: string, ballsFaced: number) => {
    if (ballsFaced === 0) {
      setBatsmanToReplaceId(batsmanId);
      setShowBatsmanModal(true);
    }
  };

  // ... (handleNewBowler, handleOpenersSelected, handleUndo)

  const handleRun = async (runs: number) => {
    if (!matchState || !currentInnings || !striker || !nonStriker || !effectiveBowlerId) {
      alert("Missing match state or active players (bowler/batsmen). Please select a bowler if none is active.");
      return;
    }

    const event = {
      matchId,
      inningsNumber: matchState.currentInningsNumber,
      deliveryType: DeliveryType.LEGAL,
      strikerPlayerId: striker.playerId,
      nonStrikerPlayerId: nonStriker.playerId,
      bowlerPlayerId: effectiveBowlerId,
      batsmanRuns: runs,
      byesRuns: 0,
      legByesRuns: 0,
      penaltyRunsToBattingTeam: 0,
      penaltyRunsToFieldingTeam: 0,
      runsCompletedByRunning: runs,
      isBoundaryFour: runs === 4,
      isBoundarySix: runs === 6
    };

    await scorerService.recordBall(matchId, event);
    await loadMatch();
  };

  const handleExtra = async (type: 'wide' | 'noball') => {
    if (!matchState || !currentInnings || !striker || !nonStriker || !effectiveBowlerId) {
      alert("Select a bowler first.");
      return;
    }

    const event = {
      matchId,
      inningsNumber: matchState.currentInningsNumber,
      deliveryType: type === 'wide' ? DeliveryType.WIDE : DeliveryType.NO_BALL,
      strikerPlayerId: striker.playerId,
      nonStrikerPlayerId: nonStriker.playerId,
      bowlerPlayerId: effectiveBowlerId,
      batsmanRuns: 0,
      byesRuns: 0,
      legByesRuns: 0,
      penaltyRunsToBattingTeam: 0,
      penaltyRunsToFieldingTeam: 0,
      runsCompletedByRunning: 0
    };

    await scorerService.recordBall(matchId, event);
    await loadMatch();
  };

  const handleWicketClick = () => {
    if (!matchState || !currentInnings || !striker || !nonStriker || !effectiveBowlerId) {
      alert("Select a bowler first.");
      return;
    }
    setShowDismissalModal(true);
  };

  const handleDismissalConfirmed = async (data: {
    dismissalKind: DismissalKind;
    dismissedPlayerId: string;
    fielderId?: string;
    newBatterId: string;
    newBatterEnd?: 'STRIKER' | 'NON_STRIKER';
  }) => {
    if (!matchState || !currentInnings || !striker || !nonStriker || !effectiveBowlerId) return;

    const event = {
      matchId,
      inningsNumber: matchState.currentInningsNumber,
      deliveryType: DeliveryType.LEGAL,
      strikerPlayerId: striker.playerId,
      nonStrikerPlayerId: nonStriker.playerId,
      bowlerPlayerId: effectiveBowlerId,
      batsmanRuns: 0,
      byesRuns: 0,
      legByesRuns: 0,
      penaltyRunsToBattingTeam: 0,
      penaltyRunsToFieldingTeam: 0,
      runsCompletedByRunning: 0,
      wicket: {
        isWicket: true,
        dismissalKind: data.dismissalKind,
        dismissedPlayerId: data.dismissedPlayerId,
        newBatterId: data.newBatterId,
        newBatterEnd: data.newBatterEnd
      }
    };

    setShowDismissalModal(false);
    await scorerService.recordBall(matchId, event);
    await loadMatch();
  };

  const handleNewBowler = (playerId: string) => {
    setSelectedBowlerId(playerId);
    setShowBowlerModal(false);
  };

  const handleOpenersSelected = async (strikerId: string, nonStrikerId: string) => {
    if (!matchState || !currentInnings) return;

    setOpenersSelected(true); // Prevent modal from reopening

    // Update local state optimistically
    const newInnings = { ...currentInnings };
    newInnings.currentStrikerId = strikerId;
    newInnings.currentNonStrikerId = nonStrikerId;

    // Add to batting card if not present
    if (!newInnings.battingCard.find(b => b.playerId === strikerId)) {
      newInnings.battingCard.push({ playerId: strikerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, inningsStatus: 'NOT_OUT' });
    }
    if (!newInnings.battingCard.find(b => b.playerId === nonStrikerId)) {
      newInnings.battingCard.push({ playerId: nonStrikerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, inningsStatus: 'NOT_OUT' });
    }

    const newMatchState = { ...matchState };
    newMatchState.innings[matchState.currentInningsNumber] = newInnings;
    setMatchState(newMatchState);

    setShowOpenersModal(false);
  };

  const handleUndo = async () => {
    if (confirm("Are you sure you want to undo the last ball?")) {
      setLoading(true);
      await scorerService.undoLastBall(matchId);
      await loadMatch();
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-koc-crimson" />
      </div>
    );
  }

  if (!matchState || !currentInnings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Match Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Could not load match data.</p>
        <Link href="/admin/scorer" className="bg-koc-crimson text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Back to Selection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/admin/scorer" className="text-gray-500 hover:text-koc-crimson">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-koc-crimson hidden md:block">
              Dashboard
            </Link>
          </div>
          <div className="text-center">
            <h1 className="font-bold text-lg text-koc-dark dark:text-white">
              {matchState.teams[currentInnings.battingTeamId]?.name} vs {matchState.teams[currentInnings.bowlingTeamId]?.name}
            </h1>
            <p className="text-xs text-gray-500">Innings {currentInnings.inningsNumber}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
              title="Undo Last Ball"
            >
              <Undo2 className="h-4 w-4 mr-1.5" /> Undo
            </button>
            <span className={cn("h-3 w-3 rounded-full mr-2", currentInnings.status === 'IN_PROGRESS' ? "bg-red-600 animate-pulse" : "bg-gray-400")} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Scoreboard */}
        <div className="bg-koc-dark text-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-5xl font-bold tracking-tighter">
                {currentInnings.totalRuns}/{currentInnings.totalWickets}
              </div>
              <div className="text-lg text-gray-300 mt-1 flex items-center space-x-4">
                <span>Overs: {currentInnings.oversCompleted} / {matchState.config.maxOversPerInnings}</span>
                <span className="text-sm bg-white/10 px-2 py-0.5 rounded">CRR: {crr}</span>
                <span className="text-sm bg-white/10 px-2 py-0.5 rounded">Proj: {projectedScore}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex space-x-1 mb-2 justify-end min-h-[32px]">
                {recentBalls.map((e, i) => {
                  let label = e.batsmanRuns.toString();
                  if (e.wicket?.isWicket) label = 'W';
                  else if (e.deliveryType === DeliveryType.WIDE) label = 'wd';
                  else if (e.deliveryType === DeliveryType.NO_BALL) label = 'nb';
                  else if (e.batsmanRuns === 4) label = '4';
                  else if (e.batsmanRuns === 6) label = '6';
                  else if (e.batsmanRuns === 0) label = '•';

                  return (
                    <span key={i} className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono font-bold",
                      e.wicket?.isWicket ? "bg-red-500 text-white" :
                        (e.batsmanRuns === 4 || e.batsmanRuns === 6) ? "bg-green-500 text-white" :
                          "bg-white/10"
                    )}>
                      {label}
                    </span>
                  );
                })}
              </div>
              {matchState.currentInningsNumber === 2 && (
                <div className="text-sm text-gray-400">Target: {matchState.target || '-'}</div>
              )}
              {lastOverIndex >= 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  Last Over: {lastOverRuns}/{lastOverWickets} ({lastOverExtras} ex)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Batsmen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[striker, nonStriker].filter(Boolean).map((batsman) => (
            <div
              key={batsman!.playerId}
              onClick={() => onBatsmanClick(batsman!.playerId, batsman!.ballsFaced)}
              className={cn(
                "bg-white dark:bg-black border rounded-xl p-4 flex justify-between items-center transition-all",
                batsman === striker ? "border-koc-crimson ring-1 ring-koc-crimson shadow-md" : "border-gray-200 dark:border-gray-800 opacity-80",
                batsman!.ballsFaced === 0 ? "cursor-pointer hover:bg-gray-50" : "cursor-default"
              )}
            >
              <div>
                <div className="flex items-center">
                  <h3 className="font-bold text-lg">{getBatsmanName(batsman!.playerId)}</h3>
                  {batsman === striker && <span className="ml-2 text-xs bg-koc-crimson text-white px-1.5 py-0.5 rounded">STR</span>}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  SR: {((batsman!.runs / (batsman!.ballsFaced || 1)) * 100).toFixed(1)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{batsman!.runs}</div>
                <div className="text-xs text-gray-500">({batsman!.ballsFaced})</div>
              </div>
            </div>
          ))}
          {(!striker || !nonStriker) && (
            <div className="p-4 text-center text-red-500 border border-red-200 rounded-xl bg-red-50">
              Missing Batsmen! Check data.
            </div>
          )}
        </div>

        {/* Bowler */}
        {currentBowler ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{getBatsmanName(currentBowler.playerId)}</h3>
              <div className="text-sm text-blue-700/70">Bowler</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono">
                {currentBowler.wickets}-{currentBowler.runsConceded}
              </div>
              <div className="text-xs text-blue-700/70">{currentBowler.overs} overs</div>
            </div>
          </div>
        ) : (
          <div
            className="p-4 text-center text-koc-crimson border border-koc-crimson border-dashed rounded-xl bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => setShowBowlerModal(true)}
          >
            <UserPlus className="h-6 w-6 mx-auto mb-2" />
            <span className="font-bold">Select Bowler</span>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[0, 1, 2, 3, 4, 6].map((run) => (
            <button
              key={run}
              onClick={() => handleRun(run)}
              disabled={shouldDisableScoring}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl py-4 text-xl font-bold shadow-sm active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {run}
            </button>
          ))}
          <button
            onClick={() => handleExtra('wide')}
            disabled={shouldDisableScoring}
            className="bg-orange-100 text-orange-800 border border-orange-200 rounded-xl py-4 font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            WD
          </button>
          <button
            onClick={() => handleExtra('noball')}
            disabled={shouldDisableScoring}
            className="bg-orange-100 text-orange-800 border border-orange-200 rounded-xl py-4 font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            NB
          </button>
          <button
            onClick={handleWicketClick}
            disabled={shouldDisableScoring}
            className="col-span-2 bg-red-600 text-white rounded-xl py-4 font-bold shadow-md active:scale-95 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            OUT
          </button>
        </div>

        {shouldDisableScoring && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-center font-bold animate-pulse">
            Over Complete! Please Select a New Bowler.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setShowBowlerModal(true)}
            disabled={shouldDisableChangeBowler}
            className={cn(
              "flex items-center justify-center rounded-lg py-3 text-sm font-medium transition-all",
              shouldDisableScoring
                ? "bg-koc-crimson text-white hover:bg-red-700 animate-bounce shadow-lg"
                : shouldDisableChangeBowler
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            )}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Change Bowler
          </button>
        </div>
      </main>

      {/* Modals */}
      <SelectBatsmanModal
        isOpen={showBatsmanModal}
        onClose={() => { setShowBatsmanModal(false); setBatsmanToReplaceId(null); }}
        onSelect={handleReplaceBatsman}
        teamId={currentInnings.battingTeamId}
        excludePlayerIds={currentInnings.battingCard.map(b => b.playerId).filter(id => id !== batsmanToReplaceId)}
      />

      <SelectBowlerModal
        isOpen={showBowlerModal}
        onClose={() => setShowBowlerModal(false)}
        onSelect={handleNewBowler}
        teamId={currentInnings.bowlingTeamId}
        currentBowlerId={effectiveBowlerId || undefined}
        lastBowlerId={lastBowlerId}
      />

      <SelectOpenersModal
        isOpen={showOpenersModal}
        onClose={() => setShowOpenersModal(false)}
        onSelect={handleOpenersSelected}
        teamId={currentInnings.battingTeamId}
        teamName={matchState.teams[currentInnings.battingTeamId]?.name}
      />

      {striker && nonStriker && showDismissalModal && (
        <DismissalModal
          isOpen={true}
          onClose={() => setShowDismissalModal(false)}
          onConfirm={handleDismissalConfirmed}
          striker={{ id: striker.playerId, name: getBatsmanName(striker.playerId) }}
          nonStriker={{ id: nonStriker.playerId, name: getBatsmanName(nonStriker.playerId) }}
          battingTeamId={currentInnings.battingTeamId}
          fieldingTeamId={currentInnings.bowlingTeamId}
          excludePlayerIds={currentInnings.battingCard.filter(b => b.inningsStatus !== 'NOT_OUT').map(b => b.playerId).concat([striker.playerId, nonStriker.playerId])}
        />
      )}
    </div>
  );
}

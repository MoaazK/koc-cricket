"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { scorerService } from "@/services/scorerService";
import { MatchState, InningsState } from "@/lib/cricket-engine/types";

export default function MatchCenterPage() {
    const params = useParams();
    const matchId = params.id as string;
    const [matchState, setMatchState] = useState<MatchState | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'innings1' | 'innings2'>('summary');

    useEffect(() => {
        async function loadMatch() {
            if (!matchId) return;
            const state = await scorerService.getMatchState(matchId);
            setMatchState(state);
            setLoading(false);
        }
        loadMatch();

        // Real-time subscription could be added here
        const interval = setInterval(loadMatch, 10000); // Poll every 10s for now
        return () => clearInterval(interval);
    }, [matchId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-koc-crimson" />
            </div>
        );
    }

    if (!matchState) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
                <Link href="/fixtures" className="text-koc-crimson hover:underline">Back to Fixtures</Link>
            </div>
        );
    }

    // const homeTeam = matchState.teams[Object.keys(matchState.teams)[0]]; // Assumption: first key is home? No, IDs are keys.
    // We need to know which is home/away. The engine state stores teams by ID.
    // But we passed them in. Let's try to infer or just use the IDs.
    // Actually, `scorerService` constructs `teams` map.
    // Let's just grab the two teams.
    const teamIds = Object.keys(matchState.teams);
    const team1 = matchState.teams[teamIds[0]];
    const team2 = matchState.teams[teamIds[1]];

    const innings1 = matchState.innings[1];
    const innings2 = matchState.innings[2];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <Link href="/fixtures" className="inline-flex items-center text-sm text-gray-500 hover:text-koc-crimson mb-4">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Fixtures
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {team1.name} <span className="text-gray-400 mx-2">vs</span> {team2.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Today</span>
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> Koç University Cricket Ground</span>
                                <span className="flex items-center"><Trophy className="h-4 w-4 mr-1" /> T20 Match</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-koc-crimson uppercase tracking-wider mb-1">
                                {matchState.innings[matchState.currentInningsNumber].status.replace('_', ' ')}
                            </div>
                            <div className="text-xl font-bold">
                                {matchState.teams[matchState.innings[matchState.currentInningsNumber].battingTeamId]?.name} Need {matchState.target ? matchState.target - matchState.innings[matchState.currentInningsNumber].totalRuns : 'Runs'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-4 flex space-x-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={cn("py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === 'summary' ? "border-koc-crimson text-koc-crimson" : "border-transparent text-gray-500 hover:text-gray-700")}
                    >
                        Match Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('innings1')}
                        className={cn("py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === 'innings1' ? "border-koc-crimson text-koc-crimson" : "border-transparent text-gray-500 hover:text-gray-700")}
                    >
                        {matchState.teams[innings1.battingTeamId]?.name} Innings
                    </button>
                    <button
                        onClick={() => setActiveTab('innings2')}
                        className={cn("py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", activeTab === 'innings2' ? "border-koc-crimson text-koc-crimson" : "border-transparent text-gray-500 hover:text-gray-700")}
                    >
                        {matchState.teams[innings2.battingTeamId]?.name} Innings
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {activeTab === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InningsSummaryCard innings={innings1} teamName={matchState.teams[innings1.battingTeamId]?.name} />
                        <InningsSummaryCard innings={innings2} teamName={matchState.teams[innings2.battingTeamId]?.name} />
                    </div>
                )}

                {activeTab === 'innings1' && (
                    <Scorecard innings={innings1} players={matchState.players} />
                )}

                {activeTab === 'innings2' && (
                    <Scorecard innings={innings2} players={matchState.players} />
                )}
            </div>
        </div>
    );
}

function InningsSummaryCard({ innings, teamName }: { innings: InningsState, teamName: string }) {
    return (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">{teamName}</h3>
            <div className="flex justify-between items-baseline mb-6">
                <div className="text-4xl font-bold tracking-tighter">
                    {innings.totalRuns}/{innings.totalWickets}
                </div>
                <div className="text-gray-500">
                    {innings.oversCompleted} Overs
                </div>
            </div>

            <div className="space-y-3">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Top Batters</div>
                {innings.battingCard.sort((a, b) => b.runs - a.runs).slice(0, 3).map(batter => (
                    <div key={batter.playerId} className="flex justify-between items-center text-sm">
                        <span>{batter.playerId}</span> {/* Need name lookup */}
                        <span className="font-bold">{batter.runs} <span className="text-gray-400 font-normal">({batter.ballsFaced})</span></span>
                    </div>
                ))}
            </div>

            <div className="space-y-3 mt-6">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Top Bowlers</div>
                {innings.bowlingCard.sort((a, b) => b.wickets - a.wickets).slice(0, 3).map(bowler => (
                    <div key={bowler.playerId} className="flex justify-between items-center text-sm">
                        <span>{bowler.playerId}</span>
                        <span className="font-bold">{bowler.wickets}-{bowler.runsConceded} <span className="text-gray-400 font-normal">({bowler.overs})</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Scorecard({ innings, players }: { innings: InningsState, players: { [id: string]: { name: string } } }) {
    return (
        <div className="space-y-8">
            {/* Batting */}
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold">Batting</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Batter</th>
                                <th className="px-6 py-3">Dismissal</th>
                                <th className="px-6 py-3 text-right">R</th>
                                <th className="px-6 py-3 text-right">B</th>
                                <th className="px-6 py-3 text-right">4s</th>
                                <th className="px-6 py-3 text-right">6s</th>
                                <th className="px-6 py-3 text-right">SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innings.battingCard.map((batter) => (
                                <tr key={batter.playerId} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {players[batter.playerId]?.name || batter.playerId}
                                        {innings.currentStrikerId === batter.playerId && <span className="ml-2 text-koc-crimson">*</span>}
                                        {innings.currentNonStrikerId === batter.playerId && <span className="ml-2 text-koc-crimson">*</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {batter.inningsStatus === 'NOT_OUT' ? 'Not Out' :
                                            batter.inningsStatus === 'DID_NOT_BAT' ? 'Did Not Bat' :
                                                `${batter.dismissalKind?.replace('_', ' ')}`}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{batter.runs}</td>
                                    <td className="px-6 py-4 text-right">{batter.ballsFaced}</td>
                                    <td className="px-6 py-4 text-right">{batter.fours}</td>
                                    <td className="px-6 py-4 text-right">{batter.sixes}</td>
                                    <td className="px-6 py-4 text-right">{batter.strikeRate.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span className="font-bold">Extras</span>
                    <span>{innings.extras.total} (w {innings.extras.wide}, nb {innings.extras.noBall}, b {innings.extras.byes}, lb {innings.extras.legByes}, p {innings.extras.penalty})</span>
                </div>
                <div className="px-6 py-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{innings.totalRuns}/{innings.totalWickets} <span className="text-sm font-normal text-gray-500">({innings.oversCompleted} Overs)</span></span>
                </div>
            </div>

            {/* Bowling */}
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-bold">Bowling</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Bowler</th>
                                <th className="px-6 py-3 text-right">O</th>
                                <th className="px-6 py-3 text-right">M</th>
                                <th className="px-6 py-3 text-right">R</th>
                                <th className="px-6 py-3 text-right">W</th>
                                <th className="px-6 py-3 text-right">Econ</th>
                                <th className="px-6 py-3 text-right">WD</th>
                                <th className="px-6 py-3 text-right">NB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {innings.bowlingCard.map((bowler) => (
                                <tr key={bowler.playerId} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {players[bowler.playerId]?.name || bowler.playerId}
                                    </td>
                                    <td className="px-6 py-4 text-right">{bowler.overs}</td>
                                    <td className="px-6 py-4 text-right">{bowler.maidens}</td>
                                    <td className="px-6 py-4 text-right">{bowler.runsConceded}</td>
                                    <td className="px-6 py-4 text-right font-bold">{bowler.wickets}</td>
                                    <td className="px-6 py-4 text-right">{bowler.economyRate.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">{bowler.wides}</td>
                                    <td className="px-6 py-4 text-right">{bowler.noBalls}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

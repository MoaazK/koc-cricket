"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMatchScore } from "@/hooks/useMatchScore";

interface MatchCardProps {
    matchId: string;
    title: string;
    opponent: string;
    date: string;
    venue: string;
    status: 'upcoming' | 'live' | 'completed' | 'abandoned';
    result?: string;
}

export function MatchCard({ matchId, opponent, date, venue, status, result }: MatchCardProps) {
    const score = useMatchScore(matchId, {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        status: status
    });

    return (
        <Link href={`/fixtures`} className="block group">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-koc-crimson/30">
                {/* Status Bar */}
                <div className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center",
                    score.status === "live" ? "bg-red-50 text-red-600" :
                        score.status === "completed" ? "bg-green-50 text-green-600" :
                            score.status === "abandoned" ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-gray-600"
                )}>
                    <span className="flex items-center">
                        {score.status === "live" && (
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        {score.status}
                    </span>
                    <span>{venue}</span>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-center flex-1">
                            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <span className="font-bold text-gray-400">KU</span>
                            </div>
                            <h3 className="font-bold text-koc-dark dark:text-white">Koç Uni</h3>
                        </div>

                        <div className="text-center px-4">
                            <div className="text-sm text-gray-500 mb-1">{format(new Date(date), "MMM d, HH:mm")}</div>
                            {score.status === "live" || score.status === "completed" ? (
                                <div className="text-3xl font-bold text-koc-dark dark:text-white tracking-tighter">
                                    {score.runs}/{score.wickets}
                                    <span className="text-sm text-gray-400 font-normal ml-1">({score.overs})</span>
                                </div>
                            ) : (
                                <div className="text-2xl font-bold text-gray-300">VS</div>
                            )}
                        </div>

                        <div className="text-center flex-1">
                            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <span className="font-bold text-gray-400">{opponent.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <h3 className="font-bold text-koc-dark dark:text-white">{opponent}</h3>
                        </div>
                    </div>

                    {result && (
                        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-medium text-koc-crimson">{result}</p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

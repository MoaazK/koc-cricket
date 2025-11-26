"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ChevronRight, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Match {
    id: string;
    title: string;
    date: string;
    status: string;
}

export default function MatchSelectionPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMatches() {
            const { data } = await supabase
                .from("matches")
                .select("*")
                .order("date", { ascending: false });

            if (data) {
                setMatches(data);
            }
            setLoading(false);
        }
        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-koc-crimson" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-koc-crimson mb-4">
                        <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-koc-dark dark:text-white mb-2">Match Selection</h1>
                            <p className="text-gray-600 dark:text-gray-400">Select a match to start scoring.</p>
                        </div>
                        <Link href="/admin/matches/create" className="bg-koc-crimson text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                            New Match
                        </Link>
                    </div>
                </header>

                <div className="space-y-4">
                    {matches.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
                            <p className="text-gray-500">No matches found. Create one in Supabase to get started.</p>
                        </div>
                    ) : (
                        matches.map((match) => (
                            <Link
                                key={match.id}
                                href={`/admin/scorer/${match.id}`}
                                className="block bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            {match.status === "live" && (
                                                <span className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wider mr-3 animate-pulse">
                                                    <Circle className="h-2 w-2 fill-current mr-1" /> Live
                                                </span>
                                            )}
                                            <span className={cn(
                                                "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                                match.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                                                    match.status === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            )}>
                                                {match.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-koc-dark dark:text-white mb-1 group-hover:text-koc-crimson transition-colors">
                                            {match.title}
                                        </h3>
                                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {format(new Date(match.date), "MMMM d, yyyy • HH:mm")}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-koc-crimson transition-colors" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

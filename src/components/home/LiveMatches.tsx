"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MatchCard } from "@/components/ui/MatchCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Match {
    id: string;
    home_team: { name: string; short_name: string };
    away_team: { name: string; short_name: string };
    date: string;
    venue: string;
    status: 'upcoming' | 'live' | 'completed';
}

export function LiveMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMatches() {
            // Fetch live matches first, then upcoming
            const { data } = await supabase
                .from("matches")
                .select(`
            *,
            home_team:teams!home_team_id(name, short_name),
            away_team:teams!away_team_id(name, short_name)
        `)
                .in('status', ['live', 'upcoming'])
                .order("date", { ascending: true })
                .limit(3);

            if (data) setMatches(data);
            setLoading(false);
        }
        fetchMatches();

        // Realtime subscription for matches and innings
        const channel = supabase
            .channel('public:live_matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
                fetchMatches();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'innings' }, () => {
                fetchMatches();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    if (loading) return null;
    if (matches.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-koc-dark dark:text-white">Live & Upcoming</h2>
                    <Link href="/fixtures" className="text-koc-crimson hover:text-red-700 font-medium flex items-center">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {matches.map((match) => (
                        <MatchCard
                            key={match.id}
                            matchId={match.id}
                            title={`${match.home_team.short_name} vs ${match.away_team.short_name}`}
                            opponent={match.away_team.name} // Fallback logic, ideally MatchCard takes home/away
                            date={match.date}
                            venue={match.venue}
                            status={match.status}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

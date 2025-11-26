import { PageHeader } from "@/components/ui/PageHeader";
import { MatchCard } from "@/components/ui/MatchCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Disable static caching for live data

async function getMatches() {
    try {
        const { data } = await supabase
            .from("matches")
            .select(`
                *,
                home_team:teams!home_team_id(name, short_name),
                away_team:teams!away_team_id(name, short_name)
            `)
            .order("date", { ascending: false });

        return data || [];
    } catch (error) {
        console.error("Error fetching matches:", error);
        return [];
    }
}

interface Match {
    id: string;
    date: string;
    venue: string;
    status: 'upcoming' | 'live' | 'completed' | 'abandoned';
    result?: string;
    home_team: { name: string; short_name: string };
    away_team: { name: string; short_name: string };
}

export default async function FixturesPage() {
    const matches = await getMatches();

    const upcomingMatches = matches.filter((m: Match) => m.status === "upcoming" || m.status === "live").reverse();
    const pastMatches = matches.filter((m: Match) => m.status === "completed" || m.status === "abandoned");

    return (
        <div>
            <PageHeader
                title="Fixtures & Results"
                description="Follow the team's journey through the season."
                backgroundImage="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop"
            />

            <section className="py-16 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Upcoming Matches */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-koc-dark dark:text-white mb-8 border-l-4 border-koc-crimson pl-4">
                            Upcoming & Live
                        </h2>
                        {upcomingMatches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingMatches.map((match: Match) => (
                                    <MatchCard
                                        key={match.id}
                                        matchId={match.id}
                                        title={`${match.home_team.short_name} vs ${match.away_team.short_name}`}
                                        date={match.date}
                                        venue={match.venue}
                                        opponent={match.away_team.name}
                                        status={match.status}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No upcoming matches scheduled.</p>
                        )}
                    </div>

                    {/* Past Matches */}
                    <div>
                        <h2 className="text-3xl font-bold text-koc-dark dark:text-white mb-8 border-l-4 border-gray-400 pl-4">
                            Recent Results
                        </h2>
                        {pastMatches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pastMatches.map((match: Match) => (
                                    <MatchCard
                                        key={match.id}
                                        matchId={match.id}
                                        title={`${match.home_team.short_name} vs ${match.away_team.short_name}`}
                                        date={match.date}
                                        venue={match.venue}
                                        opponent={match.away_team.name}
                                        status={match.status}
                                        result={match.result} // Ensure DB has result column or calculate it
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No past matches found.</p>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
}

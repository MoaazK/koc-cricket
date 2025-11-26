import { PageHeader } from "@/components/ui/PageHeader";
import { PlayerCard } from "@/components/ui/PlayerCard";

// Dummy Data
const players = [
    { name: "Ahmet Yilmaz", role: "Captain / Batsman", number: 18 },
    { name: "John Smith", role: "Vice Captain / All-Rounder", number: 7 },
    { name: "Ali Demir", role: "Bowler", number: 99 },
    { name: "Mehmet Kaya", role: "Wicket Keeper", number: 12 },
    { name: "Can Ozturk", role: "Batsman", number: 5 },
    { name: "David Brown", role: "All-Rounder", number: 33 },
];

export default function TeamPage() {
    return (
        <div>
            <PageHeader
                title="Team Roster"
                description="Meet the players representing Koç University."
                backgroundImage="https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop"
            />

            <section className="py-16 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {players.map((player, index) => (
                            <PlayerCard
                                key={index}
                                name={player.name}
                                role={player.role}
                                number={player.number}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

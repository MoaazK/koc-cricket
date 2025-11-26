"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateMatchPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        homeTeamId: "",
        awayTeamId: "",
        date: "",
        venue: "Koç University Main Ground",
        tossWinnerId: "",
        tossDecision: "bat",
        overs: 20,
        enableFreeHit: true,
    });

    useEffect(() => {
        async function fetchTeams() {
            const { data } = await supabase.from("teams").select("*").order("name");
            if (data) setTeams(data);
            setLoading(false);
        }
        fetchTeams();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const homeTeam = teams.find(t => t.id === formData.homeTeamId);
            const awayTeam = teams.find(t => t.id === formData.awayTeamId);

            if (!homeTeam || !awayTeam) throw new Error("Select teams");

            // 1. Create Match
            const { data: match, error: matchError } = await supabase.from("matches").insert({
                title: `${homeTeam.name} vs ${awayTeam.name}`,
                date: new Date(formData.date).toISOString(),
                venue: formData.venue,
                status: "upcoming", // or live immediately?
                home_team_id: formData.homeTeamId,
                away_team_id: formData.awayTeamId,
                toss_winner_id: formData.tossWinnerId,
                toss_decision: formData.tossDecision,
                current_innings_no: 1,
                overs: formData.overs,
                enable_free_hit: formData.enableFreeHit
            }).select().single();

            if (matchError) throw matchError;

            // 2. Create First Innings
            const battingTeamId = formData.tossDecision === 'bat' ? formData.tossWinnerId : (formData.tossWinnerId === formData.homeTeamId ? formData.awayTeamId : formData.homeTeamId);

            const { error: inningsError } = await supabase.from("innings").insert({
                match_id: match.id,
                team_id: battingTeamId,
                innings_number: 1,
            });

            if (inningsError) throw inningsError;

            router.push(`/admin/scorer/${match.id}`);
        } catch (error) {
            console.error("Error creating match:", error);
            alert("Failed to create match");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-black p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center mb-6">
                    <Link href="/admin/scorer" className="mr-4 text-gray-500 hover:text-black">
                        <ArrowLeft />
                    </Link>
                    <h1 className="text-2xl font-bold">Create New Match</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Home Team</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.homeTeamId}
                                onChange={e => setFormData({ ...formData, homeTeamId: e.target.value })}
                                required
                            >
                                <option value="">Select Team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Away Team</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.awayTeamId}
                                onChange={e => setFormData({ ...formData, awayTeamId: e.target.value })}
                                required
                            >
                                <option value="">Select Team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded-lg"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Venue</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg"
                            value={formData.venue}
                            onChange={e => setFormData({ ...formData, venue: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Toss Winner</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.tossWinnerId}
                                onChange={e => setFormData({ ...formData, tossWinnerId: e.target.value })}
                                required
                            >
                                <option value="">Select Team</option>
                                {teams.filter(t => t.id === formData.homeTeamId || t.id === formData.awayTeamId).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Decision</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.tossDecision}
                                onChange={e => setFormData({ ...formData, tossDecision: e.target.value })}
                                required
                            >
                                <option value="bat">Bat</option>
                                <option value="bowl">Bowl</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Overs per Innings</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                className="w-full p-2 border rounded-lg"
                                value={formData.overs}
                                onChange={e => setFormData({ ...formData, overs: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-gray-300 text-koc-crimson focus:ring-koc-crimson"
                                    checked={formData.enableFreeHit}
                                    onChange={e => setFormData({ ...formData, enableFreeHit: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Enable Free Hit after No Ball</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-koc-crimson text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Start Match"}
                    </button>
                </form>
            </div>
        </div>
    );
}

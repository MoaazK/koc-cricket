import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Player {
    id: string;
    name: string;
    role?: string;
}

interface SelectOpenersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (strikerId: string, nonStrikerId: string) => void;
    teamId: string;
    teamName: string;
}

export function SelectOpenersModal({ isOpen, onSelect, teamId, teamName }: SelectOpenersModalProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [strikerId, setStrikerId] = useState<string | null>(null);
    const [nonStrikerId, setNonStrikerId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            // setLoading(true); // Already true by default
            const { data, error } = await supabase
                .from("players")
                .select("*")
                .eq("team_id", teamId)
                .order("name");

            if (error) {
                console.error("Error fetching players:", error);
            } else {
                setPlayers(data || []);
            }
            setLoading(false);
        };

        if (isOpen && teamId) {
            fetchPlayers();
        }
    }, [isOpen, teamId]);

    const handleSubmit = () => {
        if (strikerId && nonStrikerId) {
            onSelect(strikerId, nonStrikerId);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select Openers</h2>
                        <p className="text-xs text-gray-500">for {teamName}</p>
                    </div>
                    {/* Prevent closing if strict validation is needed, but for now allow close */}
                    {/* Actually, for openers, we usually force it. But let's keep X for safety. */}
                </div>

                <div className="p-4 space-y-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading players...</div>
                    ) : (
                        <>
                            {/* Striker Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Striker (On Strike)</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-koc-crimson outline-none"
                                    value={strikerId || ""}
                                    onChange={(e) => setStrikerId(e.target.value)}
                                >
                                    <option value="">Select Striker</option>
                                    {players.filter(p => p.id !== nonStrikerId).map((player) => (
                                        <option key={player.id} value={player.id}>
                                            {player.name} {player.role ? `(${player.role})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Non-Striker Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Non-Striker</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-koc-crimson outline-none"
                                    value={nonStrikerId || ""}
                                    onChange={(e) => setNonStrikerId(e.target.value)}
                                >
                                    <option value="">Select Non-Striker</option>
                                    {players.filter(p => p.id !== strikerId).map((player) => (
                                        <option key={player.id} value={player.id}>
                                            {player.name} {player.role ? `(${player.role})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!strikerId || !nonStrikerId}
                        className="bg-koc-crimson hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <Check className="h-4 w-4 mr-2" /> Confirm Openers
                    </button>
                </div>
            </div>
        </div>
    );
}

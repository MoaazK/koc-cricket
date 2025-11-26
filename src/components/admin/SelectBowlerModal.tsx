
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X } from "lucide-react";

interface SelectBowlerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (playerId: string, name: string) => void;
    teamId: string;
    currentBowlerId?: string;
    lastBowlerId?: string;
}

interface Player {
    id: string;
    name: string;
    role: string;
    bowling_style?: string;
}

export function SelectBowlerModal({ isOpen, onClose, onSelect, teamId, currentBowlerId, lastBowlerId }: SelectBowlerModalProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && teamId) {
            // setLoading(true); // Already true by default
            const fetchPlayers = async () => {
                const { data } = await supabase
                    .from("players")
                    .select("*")
                    .eq("team_id", teamId)
                    .order("name");

                if (data) setPlayers(data);
                setLoading(false);
            };
            fetchPlayers();
        }
    }, [isOpen, teamId]);

    if (!isOpen) return null;

    const availablePlayers = players;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Select Bowler</h2>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : availablePlayers.length === 0 ? (
                        <p className="text-center text-gray-500">No available players found.</p>
                    ) : (
                        <div className="space-y-2">
                            {availablePlayers.map(player => {
                                const isLastBowler = player.id === lastBowlerId;
                                return (
                                    <button
                                        key={player.id}
                                        onClick={() => !isLastBowler && onSelect(player.id, player.name)}
                                        disabled={isLastBowler}
                                        className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${player.id === currentBowlerId
                                            ? "bg-koc-crimson/10 border border-koc-crimson text-koc-crimson"
                                            : isLastBowler
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <span className="font-medium">{player.name} {isLastBowler && "(Last Over)"}</span>
                                        <span className="text-xs text-gray-500 capitalize">{player.bowling_style || player.role}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

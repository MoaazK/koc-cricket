"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Loader2 } from "lucide-react";

interface Player {
    id: string;
    name: string;
    role: string;
    batting_style?: string;
    bowling_style?: string;
    is_captain: boolean;
    is_keeper: boolean;
}

interface PlayerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    teamId: string;
    player?: Player | null;
}

export function PlayerFormModal({ isOpen, onClose, onSave, teamId, player }: PlayerFormModalProps) {
    const [name, setName] = useState("");
    const [role, setRole] = useState("batsman");
    const [battingStyle, setBattingStyle] = useState("Right-hand bat");
    const [bowlingStyle, setBowlingStyle] = useState("");
    const [isCaptain, setIsCaptain] = useState(false);
    const [isKeeper, setIsKeeper] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (player) {
            setName(player.name);
            setRole(player.role);
            setBattingStyle(player.batting_style || "Right-hand bat");
            setBowlingStyle(player.bowling_style || "");
            setIsCaptain(player.is_captain);
            setIsKeeper(player.is_keeper);
        } else {
            setName("");
            setRole("batsman");
            setBattingStyle("Right-hand bat");
            setBowlingStyle("");
            setIsCaptain(false);
            setIsKeeper(false);
        }
    }, [player]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            name,
            role,
            batting_style: battingStyle,
            bowling_style: bowlingStyle,
            is_captain: isCaptain,
            is_keeper: isKeeper,
            team_id: teamId
        };

        try {
            if (player) {
                // Update
                const { error } = await supabase
                    .from('players')
                    .update(payload)
                    .eq('id', player.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('players')
                    .insert([payload]);
                if (error) throw error;
            }
            onSave();
            onSave();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-lg">{player ? 'Edit Player' : 'Add New Player'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-koc-crimson focus:border-transparent outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-koc-crimson focus:border-transparent outline-none"
                            >
                                <option value="batsman">Batsman</option>
                                <option value="bowler">Bowler</option>
                                <option value="all-rounder">All Rounder</option>
                                <option value="keeper">Wicket Keeper</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batting Style</label>
                            <select
                                value={battingStyle}
                                onChange={(e) => setBattingStyle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-koc-crimson focus:border-transparent outline-none"
                            >
                                <option value="Right-hand bat">Right-hand bat</option>
                                <option value="Left-hand bat">Left-hand bat</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bowling Style</label>
                        <input
                            type="text"
                            value={bowlingStyle}
                            onChange={(e) => setBowlingStyle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-koc-crimson focus:border-transparent outline-none"
                            placeholder="Right-arm fast"
                        />
                    </div>

                    <div className="flex space-x-6 pt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isCaptain}
                                onChange={(e) => setIsCaptain(e.target.checked)}
                                className="rounded text-koc-crimson focus:ring-koc-crimson"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Captain</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isKeeper}
                                onChange={(e) => setIsKeeper(e.target.checked)}
                                className="rounded text-koc-crimson focus:ring-koc-crimson"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wicket Keeper</span>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-koc-crimson hover:bg-red-700 rounded-lg transition-colors flex items-center"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {player ? 'Save Changes' : 'Add Player'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Loader2 } from "lucide-react";

interface Team {
    id: string;
    name: string;
    short_name: string;
    logo_url?: string;
    color?: string;
}

interface TeamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    team?: Team | null;
}

export function TeamFormModal({ isOpen, onClose, onSave, team }: TeamFormModalProps) {
    const [name, setName] = useState("");
    const [shortName, setShortName] = useState("");
    const [color, setColor] = useState("#b91c1c"); // Default Koc Crimson
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (team) {
            setName(team.name);
            setShortName(team.short_name);
            setColor(team.color || "#b91c1c");
        } else {
            setName("");
            setShortName("");
            setColor("#b91c1c");
        }
    }, [team]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (team) {
                // Update
                const { error } = await supabase
                    .from('teams')
                    .update({ name, short_name: shortName, color })
                    .eq('id', team.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('teams')
                    .insert([{ name, short_name: shortName, color }]);
                if (error) throw error;
            }
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-lg">{team ? 'Edit Team' : 'Add New Team'}</h3>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-koc-crimson focus:border-transparent outline-none"
                            placeholder="Koç University"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Name</label>
                            <input
                                type="text"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                required
                                maxLength={4}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-koc-crimson focus:border-transparent outline-none"
                                placeholder="KOC"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                />
                                <span className="text-sm text-gray-500">{color}</span>
                            </div>
                        </div>
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
                            {team ? 'Save Changes' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

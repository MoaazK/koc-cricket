"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Users, Edit2, ChevronRight, Loader2 } from "lucide-react";
import { TeamFormModal } from "@/components/admin/TeamFormModal";

interface Team {
    id: string;
    name: string;
    short_name: string;
    logo_url?: string;
    color?: string;
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    const fetchTeams = useCallback(async () => {
        // setLoading(true); // Already true by default
        const { data } = await supabase
            .from('teams')
            .select('*')
            .order('name');

        if (data) setTeams(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleEdit = (e: React.MouseEvent, team: Team) => {
        e.preventDefault(); // Prevent navigation
        setEditingTeam(team);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingTeam(null);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        await fetchTeams();
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
                    <p className="text-gray-500 mt-1">Manage teams and their squads</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-koc-crimson text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Team
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-koc-crimson" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/admin/teams/${team.id}`}
                            className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-koc-crimson transition-all shadow-sm hover:shadow-md block"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                        style={{ backgroundColor: team.color || '#1a1a1a' }}
                                    >
                                        {team.short_name?.[0] || team.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-koc-crimson transition-colors">
                                            {team.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{team.short_name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleEdit(e, team)}
                                    className="text-gray-400 hover:text-koc-crimson p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    View Squad
                                </span>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <TeamFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    team={editingTeam}
                />
            )}
        </div>
    );
}

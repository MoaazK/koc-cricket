"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Edit2, Loader2, User } from "lucide-react";
import { PlayerFormModal } from "@/components/admin/PlayerFormModal";

interface Team {
    id: string;
    name: string;
    short_name: string;
    color?: string;
}

interface Player {
    id: string;
    name: string;
    role: string;
    batting_style?: string;
    bowling_style?: string;
    is_captain: boolean;
    is_keeper: boolean;
}

export default function TeamDetailPage() {
    const params = useParams();
    const teamId = params.id as string;

    const [team, setTeam] = useState<Team | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    const fetchData = useCallback(async () => {
        // setLoading(true); // Already true by default
        // Fetch Team
        const { data: teamData } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();

        if (teamData) setTeam(teamData);

        // Fetch Players
        const { data: playerData } = await supabase
            .from('players')
            .select('*')
            .eq('team_id', teamId)
            .order('name');

        if (playerData) setPlayers(playerData);
        setLoading(false);
    }, [teamId, setTeam, setPlayers, setLoading]);

    useEffect(() => {
        if (teamId) fetchData();
    }, [teamId, fetchData]);

    const handleEdit = (player: Player) => {
        setEditingPlayer(player);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingPlayer(null);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        await fetchData();
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-koc-crimson" />
            </div>
        );
    }

    if (!team) return <div>Team not found</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Link href="/admin/teams" className="inline-flex items-center text-sm text-gray-500 hover:text-koc-crimson mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Teams
            </Link>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 mb-8">
                <div className="flex items-center space-x-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                        style={{ backgroundColor: team.color || '#1a1a1a' }}
                    >
                        {team.short_name?.[0] || team.name[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
                        <p className="text-gray-500 text-lg">{team.short_name}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Squad ({players.length})</h2>
                <button
                    onClick={handleCreate}
                    className="bg-koc-crimson text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Player
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium">Player</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Batting</th>
                            <th className="px-6 py-4 font-medium">Bowling</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {players.map((player) => (
                            <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                                            <User className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                                {player.name}
                                                {player.is_captain && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">C</span>}
                                                {player.is_keeper && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">WK</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 capitalize">{player.role.replace('-', ' ')}</td>
                                <td className="px-6 py-4 text-gray-500">{player.batting_style || '-'}</td>
                                <td className="px-6 py-4 text-gray-500">{player.bowling_style || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(player)}
                                        className="text-gray-400 hover:text-koc-crimson transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {players.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No players added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <PlayerFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    teamId={teamId}
                    player={editingPlayer}
                />
            )}
        </div>
    );
}

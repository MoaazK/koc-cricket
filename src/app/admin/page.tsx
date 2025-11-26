"use client";

import Link from "next/link";
import { PenTool, Plus, Users, Calendar } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome to the KU Cricket Club admin panel.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Action: Score Match */}
                <Link href="/admin/scorer" className="group bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-koc-crimson transition-all shadow-sm hover:shadow-md">
                    <div className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PenTool className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Live Scorer</h3>
                    <p className="text-sm text-gray-500">Manage live matches, update scores, and track ball-by-ball commentary.</p>
                </Link>

                {/* Quick Action: Create Match */}
                <Link href="/admin/matches/create" className="group bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-koc-crimson transition-all shadow-sm hover:shadow-md">
                    <div className="bg-green-50 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Create Match</h3>
                    <p className="text-sm text-gray-500">Schedule a new match, set up teams, venue, and toss details.</p>
                </Link>

                {/* Quick Action: Manage Teams */}
                <Link href="/admin/teams" className="group bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-koc-crimson transition-all shadow-sm hover:shadow-md">
                    <div className="bg-purple-50 dark:bg-purple-900/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Teams & Players</h3>
                    <p className="text-sm text-gray-500">Manage team rosters, add new players, and update player profiles.</p>
                </Link>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-500">
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-30 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-3 font-bold text-lg">Admin Panel</span>
                </div>
                <a href="/admin" className="text-sm font-medium text-koc-crimson hover:underline">
                    Dashboard
                </a>
            </div>

            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}

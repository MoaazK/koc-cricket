"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-koc-dark text-white">
            {/* Background Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-koc-dark z-10" />
                {/* Placeholder for Hero Image/Video */}
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop')] bg-cover bg-center" />
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        <span className="block text-white">Koç University</span>
                        <span className="block text-koc-crimson">Cricket Club</span>
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10">
                        Est. 2019. The official home of cricket at Koç University.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/fixtures"
                            className="px-8 py-4 bg-koc-crimson hover:bg-red-800 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center"
                        >
                            View Fixtures <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/about"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-bold text-lg transition-all"
                        >
                            Learn More
                        </Link>
                    </div>
                </motion.div>

                {/* Countdown Placeholder */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mt-16 bg-black/50 backdrop-blur-md rounded-xl p-6 inline-block border border-white/10"
                >
                    <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Next Match</p>
                    <div className="text-2xl font-bold">
                        Season Starts Soon
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

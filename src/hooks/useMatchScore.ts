"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MatchScore {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    status: string;
}

export function useMatchScore(matchId: string, initialScore?: MatchScore) {
    const [score, setScore] = useState<MatchScore>(initialScore || {
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        status: "upcoming"
    });

    useEffect(() => {
        if (!matchId) return;

        const fetchScore = async () => {
            // Get Match Status and Current Innings
            const { data: match } = await supabase
                .from('matches')
                .select('status, current_innings_no')
                .eq('id', matchId)
                .single();

            if (match) {
                const { data: innings } = await supabase
                    .from('innings')
                    .select('total_runs, wickets, overs')
                    .eq('match_id', matchId)
                    .eq('innings_number', match.current_innings_no)
                    .single();

                if (innings) {
                    setScore({
                        runs: innings.total_runs,
                        wickets: innings.wickets,
                        overs: Math.floor(innings.overs),
                        balls: Math.round((innings.overs % 1) * 10), // Approx conversion back if needed
                        status: match.status
                    });
                } else {
                    setScore(prev => ({ ...prev, status: match.status }));
                }
            }
        };

        fetchScore();

        // Subscribe to Innings changes (Score updates)
        const inningsChannel = supabase
            .channel(`innings-${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'innings',
                    filter: `match_id=eq.${matchId}`,
                },
                (payload) => {
                    const newInnings = payload.new as { total_runs: number; wickets: number; overs: number };
                    setScore(prev => ({
                        ...prev,
                        runs: newInnings.total_runs,
                        wickets: newInnings.wickets,
                        overs: Math.floor(newInnings.overs),
                        balls: Math.round((newInnings.overs % 1) * 10)
                    }));
                }
            )
            .subscribe();

        // Subscribe to Match changes (Status updates)
        const matchChannel = supabase
            .channel(`match-status-${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'matches',
                    filter: `id=eq.${matchId}`,
                },
                (payload) => {
                    const newMatch = payload.new as { status: string };
                    setScore(prev => ({ ...prev, status: newMatch.status }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(inningsChannel);
            supabase.removeChannel(matchChannel);
        };
    }, [matchId]);

    return score;
}

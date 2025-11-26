import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DismissalKind } from "@/lib/cricket-engine/types";

interface Player {
    id: string;
    name: string;
}

interface DismissalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        dismissalKind: DismissalKind;
        dismissedPlayerId: string;
        fielderId?: string; // For catch/runout
        newBatterId: string;
        newBatterEnd?: 'STRIKER' | 'NON_STRIKER'; // Optional override
    }) => void;
    striker: Player;
    nonStriker: Player;
    battingTeamId: string;
    fieldingTeamId: string;
    excludePlayerIds: string[]; // Already batted/out
}

export function DismissalModal({
    isOpen,
    onClose,
    onConfirm,
    striker,
    nonStriker,
    battingTeamId,
    fieldingTeamId,
    excludePlayerIds
}: DismissalModalProps) {
    const [step, setStep] = useState<1 | 2>(1); // 1: Type & Who, 2: New Batter
    const [dismissalKind, setDismissalKind] = useState<DismissalKind | null>(null);
    const [dismissedPlayerId, setDismissedPlayerId] = useState<string | null>(null);
    const [fielderId, setFielderId] = useState<string | null>(null);
    const [newBatterId, setNewBatterId] = useState<string | null>(null);

    const [fielders, setFielders] = useState<Player[]>([]);
    const [batters, setBatters] = useState<Player[]>([]);
    // const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            // setLoading(true);
            // Fetch Fielders
            const { data: fieldingData } = await supabase
                .from("players")
                .select("id, name")
                .eq("team_id", fieldingTeamId)
                .order("name");

            if (fieldingData) setFielders(fieldingData);

            // Fetch Batters (excluding those who played)
            const { data: battingData } = await supabase
                .from("players")
                .select("id, name")
                .eq("team_id", battingTeamId)
                .order("name");

            if (battingData) {
                // Filter out those in excludePlayerIds
                // Note: excludePlayerIds includes current striker/non-striker and those already out
                setBatters(battingData.filter(p => !excludePlayerIds.includes(p.id)));
            }
            // setLoading(false);
        };

        if (isOpen) {
            fetchPlayers();
        }
    }, [isOpen, battingTeamId, fieldingTeamId, striker.id, excludePlayerIds]);

    const handleNext = () => {
        if (dismissalKind && dismissedPlayerId) {
            // Validation: Catch/Runout needs fielder? Not strictly enforced but good to have.
            setStep(2);
        }
    };

    const handleConfirm = () => {
        if (dismissalKind && dismissedPlayerId && newBatterId) {
            onConfirm({
                dismissalKind,
                dismissedPlayerId,
                fielderId: fielderId || undefined,
                newBatterId
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {step === 1 ? "Dismissal Details" : "Select New Batsman"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {step === 1 && (
                        <>
                            {/* Who is Out? */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Who is Out?</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setDismissedPlayerId(striker.id)}
                                        className={cn(
                                            "p-3 rounded-xl border text-left transition-all",
                                            dismissedPlayerId === striker.id
                                                ? "border-koc-crimson bg-red-50 text-koc-crimson ring-1 ring-koc-crimson"
                                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <div className="font-bold">{striker.name}</div>
                                        <div className="text-xs opacity-70">Striker</div>
                                    </button>
                                    <button
                                        onClick={() => setDismissedPlayerId(nonStriker.id)}
                                        className={cn(
                                            "p-3 rounded-xl border text-left transition-all",
                                            dismissedPlayerId === nonStriker.id
                                                ? "border-koc-crimson bg-red-50 text-koc-crimson ring-1 ring-koc-crimson"
                                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <div className="font-bold">{nonStriker.name}</div>
                                        <div className="text-xs opacity-70">Non-Striker</div>
                                    </button>
                                </div>
                            </div>

                            {/* Dismissal Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How?</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        DismissalKind.BOWLED,
                                        DismissalKind.CAUGHT,
                                        DismissalKind.LBW,
                                        DismissalKind.RUN_OUT,
                                        DismissalKind.STUMPED,
                                        DismissalKind.HIT_WICKET
                                    ].map((kind) => (
                                        <button
                                            key={kind}
                                            onClick={() => setDismissalKind(kind)}
                                            className={cn(
                                                "p-2 rounded-lg border text-sm font-medium transition-all",
                                                dismissalKind === kind
                                                    ? "bg-gray-900 text-white dark:bg-white dark:text-black border-transparent"
                                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            {kind.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fielder Selection (Conditional) */}
                            {(dismissalKind === DismissalKind.CAUGHT || dismissalKind === DismissalKind.RUN_OUT || dismissalKind === DismissalKind.STUMPED) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fielder Involved</label>
                                    <select
                                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        value={fielderId || ""}
                                        onChange={(e) => setFielderId(e.target.value)}
                                    >
                                        <option value="">Select Fielder</option>
                                        {fielders.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Batsman</label>
                            {batters.length === 0 ? (
                                <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
                                    No more batsmen available!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                                    {batters.map(batter => (
                                        <button
                                            key={batter.id}
                                            onClick={() => setNewBatterId(batter.id)}
                                            className={cn(
                                                "p-3 rounded-lg border text-left transition-all flex justify-between items-center",
                                                newBatterId === batter.id
                                                    ? "border-koc-crimson bg-red-50 ring-1 ring-koc-crimson"
                                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            <span className="font-medium">{batter.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-600 hover:text-gray-900">
                            Back
                        </button>
                    )}
                    {step === 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!dismissalKind || !dismissedPlayerId}
                            className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirm}
                            disabled={!newBatterId}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                        >
                            Confirm Wicket
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

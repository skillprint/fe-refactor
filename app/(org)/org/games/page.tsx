"use client";
import { useState, useEffect } from "react";

import toast from "react-hot-toast";
const Gamepad2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>;
const Settings2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>;
const Sparkles = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>;
const CheckCircle2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
const Circle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>;

interface Game {
    id: string;
    title: string | null;
    target_mode: string;
    target_value: string;
    icon: string | null;
    is_active: boolean;
}

export default function OrgGamesPage() {
    const [activeTab, setActiveTab] = useState<"sandbox" | "list">("list");
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const res = await fetch("/api/org/games");
            const data = await res.json();
            if (data.success) {
                setGames(data.games);
            }
        } catch {
            toast.error("Failed to load games catalog.");
        } finally {
            setLoading(false);
        }
    };

    const toggleGameActive = async (gameId: string, currentActive: boolean) => {
        // Optimistic update
        setGames(games.map((g: Game) => g.id === gameId ? { ...g, is_active: !currentActive } : g));

        try {
            const res = await fetch("/api/org/games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ generated_game_id: gameId, is_active: !currentActive }),
            });
            const data = await res.json();

            if (!data.success) {
                // Revert on error
                setGames(games);
                toast.error("Failed to update status");
            }
        } catch {
            setGames(games);
            toast.error("Network error");
        }
    };

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col h-full">
            <header className="space-y-4">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm flex items-center gap-3">
                        <Gamepad2 className="w-10 h-10 text-orange-500" />
                        Games
                    </h1>
                    <p className="text-base font-medium text-neutral-400 mt-2">
                        Manage your organization's curated catalog of games or generate new ones.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl w-max">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "list"
                            ? "bg-neutral-800 text-white shadow-sm"
                            : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                            }`}
                    >
                        <Settings2 className="w-4 h-4" />
                        Games List
                    </button>
                    <button
                        onClick={() => setActiveTab("sandbox")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "sandbox"
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-neutral-500 hover:text-orange-400 hover:bg-orange-500/10"
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Sandbox
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-0 relative">
                {/* Games List View */}
                {activeTab === "list" && (
                    <div className="h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="text-neutral-500">Loading catalog...</div>
                        ) : games.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl border border-neutral-800 border-dashed text-neutral-500 bg-neutral-900/20">
                                No games available in the global catalog. Try generating one in Sandbox.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {games.map((game: Game) => (
                                    <div key={game.id} className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm hover:bg-neutral-800/40 transition-all duration-300 group">
                                        <div className="flex gap-4 items-start">
                                            {game.icon ? (
                                                <div className="w-12 h-12 rounded-xl bg-neutral-800 overflow-hidden shrink-0">
                                                    <img src={game.icon} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-neutral-800 shrink-0 flex items-center justify-center">
                                                    <Gamepad2 className="w-6 h-6 text-neutral-500" />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <h3 className="font-bold text-white text-lg leading-tight mb-1 truncate" title={game.title || 'Untitled Game'}>
                                                    {game.title || 'Untitled Game'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="px-2 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-300">
                                                        {game.target_mode}
                                                    </span>
                                                    <span className="text-neutral-500 truncate" title={game.target_value}>
                                                        {game.target_value}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleGameActive(game.id, game.is_active)}
                                            className={`mt-4 w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${game.is_active
                                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 group-hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-transparent"
                                                }`}
                                        >
                                            {game.is_active ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                            {game.is_active ? "Active in Catalog" : "Activate Game"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sandbox Iframe Wrapper */}
                {activeTab === "sandbox" && (
                    <div className="absolute inset-0 rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <iframe
                            src="/sandbox"
                            className="w-full h-full border-0"
                            title="Game Sandbox"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

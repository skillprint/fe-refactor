"use client";
import { useState, useEffect } from "react";

import toast from "react-hot-toast";
const Gamepad2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>;
const Settings2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>;
const Sparkles = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>;
const CheckCircle2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
const Circle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>;
const PlayIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const Trash2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>;
const EditIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

import BuckyballLoading from '@/app/components/BuckyballLoading';
import Link from 'next/link';
import TopNav from '@/app/components/TopNav';

interface Game {
    id: string;
    title: string | null;
    target_mode: string;
    target_value: string;
    icon: string | null;
    is_active: boolean;
    associated_skill: string[] | null;
    associated_mood: string[] | null;
    file_url: string;
}

// Standardized tags aligned with the rest of the application
const AVAILABLE_SKILLS = ['memory', 'logic', 'speed', 'pattern recognition', 'coordination'];
const AVAILABLE_MOODS = ['relax', 'focus', 'collaborate', 'creative'];

export default function OrgGamesPage() {
    const [activeTab, setActiveTab] = useState<"sandbox" | "list">("list");
    const [playingGame, setPlayingGame] = useState<Game | null>(null);
    const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
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

    const updateGameAssociation = async (gameId: string, field: 'associated_skill' | 'associated_mood', value: string[] | null) => {
        // Optimistic update is handled by onChange/onBlur directly setting state.
        // This function is for API call and error handling.
        try {
            const res = await fetch("/api/org/games", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ generated_game_id: gameId, [field]: value }),
            });
            const data = await res.json();

            if (!data.success) {
                // Fetch again on error to revert correctly
                fetchGames();
                toast.error("Failed to update association");
            } else {
                toast.success("Updated successfully");
            }
        } catch {
            fetchGames();
            toast.error("Network error");
        }
    };

    const confirmDelete = async () => {
        if (!gameToDelete) return;

        try {
            const res = await fetch("/api/org/games", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: gameToDelete.id })
            });
            const data = await res.json();

            if (data.success) {
                setGames(games.filter(g => g.id !== gameToDelete.id));
                toast.success("Game deleted successfully");
            } else {
                toast.error(data.error || "Failed to delete game");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setGameToDelete(null);
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

                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => toggleGameActive(game.id, game.is_active)}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${game.is_active
                                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-transparent"
                                                    }`}
                                            >
                                                {game.is_active ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                {game.is_active ? "Active" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => setPlayingGame(game)}
                                                className="py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40"
                                            >
                                                <PlayIcon className="w-4 h-4" />
                                                Play
                                            </button>
                                            <Link
                                                href={`/sandbox?editId=${game.id}`}
                                                className="py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center transition-all duration-300 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40"
                                                title="Edit Game"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setGameToDelete(game)}
                                                className="py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center transition-all duration-300 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40"
                                                title="Delete Game"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {game.is_active && (
                                            <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                                                <div className="flex gap-4 mb-4">
                                                    <div className="flex-1 relative">
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                                                            Associated Skills
                                                        </label>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(game.associated_skill || []).map(skill => (
                                                                <span key={skill} className="px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-md flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800">
                                                                    {skill}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newSkills = (game.associated_skill || []).filter(s => s !== skill);
                                                                            const finalVal = newSkills.length > 0 ? newSkills : null;
                                                                            setGames(games.map(g => g.id === game.id ? { ...g, associated_skill: finalVal } : g));
                                                                            updateGameAssociation(game.id, 'associated_skill', finalVal);
                                                                        }}
                                                                        className="hover:text-red-500 text-indigo-400 dark:hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            list="skills-list"
                                                            placeholder="Add skill (press Enter)..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = (e.currentTarget.value || '').toLowerCase().trim();
                                                                    if (val && !AVAILABLE_SKILLS.includes(val)) {
                                                                        toast.error(`Invalid skill. Must be one of: ${AVAILABLE_SKILLS.join(', ')}`);
                                                                    } else if (val) {
                                                                        const current = game.associated_skill || [];
                                                                        if (!current.includes(val)) {
                                                                            const finalVal = [...current, val];
                                                                            setGames(games.map(g => g.id === game.id ? { ...g, associated_skill: finalVal } : g));
                                                                            updateGameAssociation(game.id, 'associated_skill', finalVal);
                                                                        }
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }
                                                            }}
                                                            onBlur={(e) => { e.target.value = ''; }}
                                                            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                                                        />
                                                        <datalist id="skills-list">
                                                            {AVAILABLE_SKILLS.map(skill => (
                                                                <option key={skill} value={skill} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                                                            Associated Moods
                                                        </label>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(game.associated_mood || []).map(mood => (
                                                                <span key={mood} className="px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-md flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                                                                    {mood}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newMoods = (game.associated_mood || []).filter(m => m !== mood);
                                                                            const finalVal = newMoods.length > 0 ? newMoods : null;
                                                                            setGames(games.map(g => g.id === game.id ? { ...g, associated_mood: finalVal } : g));
                                                                            updateGameAssociation(game.id, 'associated_mood', finalVal);
                                                                        }}
                                                                        className="hover:text-red-500 text-emerald-400 dark:hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            list="moods-list"
                                                            placeholder="Add mood (press Enter)..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = (e.currentTarget.value || '').toLowerCase().trim();
                                                                    if (val && !AVAILABLE_MOODS.includes(val)) {
                                                                        toast.error(`Invalid mood. Must be one of: ${AVAILABLE_MOODS.join(', ')}`);
                                                                    } else if (val) {
                                                                        const current = game.associated_mood || [];
                                                                        if (!current.includes(val)) {
                                                                            const finalVal = [...current, val];
                                                                            setGames(games.map(g => g.id === game.id ? { ...g, associated_mood: finalVal } : g));
                                                                            updateGameAssociation(game.id, 'associated_mood', finalVal);
                                                                        }
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }
                                                            }}
                                                            onBlur={(e) => { e.target.value = ''; }}
                                                            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:font-normal placeholder:text-gray-400"
                                                        />
                                                        <datalist id="moods-list">
                                                            {AVAILABLE_MOODS.map(mood => (
                                                                <option key={mood} value={mood} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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

            {/* Game Preview Modal */}
            {playingGame && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-5xl h-[85vh] bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900/50">
                            <div className="flex items-center gap-3">
                                <Gamepad2 className="w-5 h-5 text-orange-500" />
                                <h3 className="font-bold text-white text-lg">{playingGame.title || 'Game Preview'}</h3>
                            </div>
                            <button
                                onClick={() => setPlayingGame(null)}
                                className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-2 rounded-xl transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-black relative">
                            <iframe
                                src={playingGame.file_url}
                                className="absolute inset-0 w-full h-full border-0"
                                title={playingGame.title || "Game Preview"}
                                sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {gameToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-2xl flex flex-col gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Delete Game?</h3>
                            <p className="text-neutral-400 text-sm">
                                Are you sure you want to delete <span className="text-white font-medium">{gameToDelete.title || 'this game'}</span>? This action cannot be undone and will remove the game from your catalog.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 w-full">
                            <button
                                onClick={() => setGameToDelete(null)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

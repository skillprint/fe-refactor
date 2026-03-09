"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useChallenges, Challenge } from "@/app/hooks/useChallenges";

const BookOpen = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const Plus = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;

export default function ChallengesPage() {
    const { challenges, loading, fetchChallenges, deleteChallenge } = useChallenges();

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this challenge?")) {
            await deleteChallenge(id);
        }
    };

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col h-full">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm flex items-center gap-3">
                        <BookOpen className="w-10 h-10 text-orange-500" />
                        Challenges
                    </h1>
                    <p className="text-base font-medium text-neutral-400 mt-2">
                        Manage temporal and skill-based challenges for your players.
                    </p>
                </div>
                <div>
                    <Link
                        href="/org/challenges/new"
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create Challenge
                    </Link>
                </div>
            </header>

            <div className="flex-1 min-h-0 relative">
                <div className="h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? (
                        <div className="text-neutral-500">Loading challenges...</div>
                    ) : challenges.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-neutral-800 border-dashed text-neutral-500 bg-neutral-900/20">
                            No challenges created yet. Click "Create Challenge" to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {challenges.map((challenge: Challenge) => (
                                <Link href={`/org/challenges/${challenge.id}`} key={challenge.id} className="block group">
                                    <div className="h-full p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm hover:bg-neutral-800/60 hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-orange-500/10 flex flex-col relative">
                                        <button
                                            onClick={(e) => handleDelete(e, challenge.id)}
                                            className="absolute top-4 right-4 text-neutral-500 flex opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 z-10"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                        <h3 className="font-bold text-white text-xl leading-tight mb-2 group-hover:text-orange-400 transition-colors">
                                            {challenge.title}
                                        </h3>
                                        <span className="inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md bg-neutral-800 text-orange-400 w-fit mb-3">
                                            {challenge.type} / {(challenge.temporal_period || 'ongoing')}
                                        </span>
                                        <p className="text-sm text-neutral-400 line-clamp-2 mb-4 flex-1">
                                            {challenge.description || "No description provided."}
                                        </p>

                                        <div className="space-y-3 mt-auto border-t border-neutral-800 pt-4">
                                            <div className="pt-2 mt-2 flex items-center justify-between">
                                                <span className="text-xs font-medium text-neutral-400">
                                                    {(challenge.game_ids || []).length} games included
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

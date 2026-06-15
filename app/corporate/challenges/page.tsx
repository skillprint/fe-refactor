'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useChallenges } from '../../hooks/useChallenges';

const TrophyIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function CorporateChallengesPage() {
    const { challenges, loading, fetchChallenges, deleteChallenge } = useChallenges();

    useEffect(() => {
        fetchChallenges();
    }, [fetchChallenges]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this corporate challenge?')) {
            await deleteChallenge(id);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <TrophyIcon />
                        Enterprise Challenges
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Manage team-wide and goal-oriented focus programs.</p>
                </div>
                <Link
                    href="/corporate/challenges/new"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-98 transition-all flex items-center gap-1.5"
                >
                    <span>+ Create Challenge</span>
                </Link>
            </header>

            {/* List */}
            <div className="relative">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="p-16 text-center rounded-2xl border border-slate-800 border-dashed text-slate-500 bg-slate-900/10">
                        <p className="text-sm">No corporate challenges found in database.</p>
                        <p className="text-xs text-slate-600 mt-1">Click "+ Create Challenge" to kick off a new team competition.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map((challenge) => (
                            <div key={challenge.id} className="group relative p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-300 backdrop-blur-md flex flex-col justify-between shadow-sm">
                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDelete(e, challenge.id)}
                                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-1 bg-slate-950/40 rounded-lg hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent"
                                >
                                    <TrashIcon />
                                </button>

                                <div className="space-y-3">
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase">
                                        {challenge.type} / {challenge.temporal_period || 'custom'}
                                    </span>
                                    
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {challenge.title}
                                    </h3>
                                    
                                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                                        {challenge.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                                    <span>{(challenge.game_ids || []).length} catalog games</span>
                                    <span>
                                        {challenge.start_date ? new Date(challenge.start_date).toLocaleDateString() : 'Ongoing'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

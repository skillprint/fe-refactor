'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Playbook {
    id: string;
    title: string;
    description: string | null;
    associated_skills: string[] | null;
    associated_moods: string[] | null;
    game_ids: string[] | null;
}

const BookIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m7-7H5" /></svg>;

export default function CorporatePlaybooksPage() {
    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaybooks = async () => {
            try {
                const res = await fetch('/api/org/playbooks');
                const data = await res.json();
                if (data.success) {
                    setPlaybooks(data.playbooks);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load playbooks.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaybooks();
    }, []);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <BookIcon />
                        Playbooks Catalog
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Manage game lists curated for specific team skill development and mood goals.</p>
                </div>
                <Link
                    href="/corporate/playbooks/new"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-98 transition-all flex items-center gap-1.5"
                >
                    <PlusIcon />
                    <span>Create Playbook</span>
                </Link>
            </header>

            {/* List grid */}
            <div className="relative">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : playbooks.length === 0 ? (
                    <div className="p-16 text-center rounded-2xl border border-slate-800 border-dashed text-slate-500 bg-slate-900/10">
                        <p className="text-sm">No playbooks found in database.</p>
                        <p className="text-xs text-slate-600 mt-1">Click "Create Playbook" to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {playbooks.map((playbook) => (
                            <Link href={`/corporate/playbooks/${playbook.id}`} key={playbook.id} className="block group">
                                <div className="h-full p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-300 backdrop-blur-md flex flex-col justify-between shadow-sm relative">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {playbook.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                                {playbook.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        {/* Tag breakdowns */}
                                        <div className="space-y-3">
                                            {/* Skills */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Skills</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(playbook.associated_skills || []).length > 0 ? (
                                                        playbook.associated_skills!.slice(0, 3).map(skill => (
                                                            <span key={skill} className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 italic">None</span>
                                                    )}
                                                    {(playbook.associated_skills?.length || 0) > 3 && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-850 text-slate-400 rounded-md">+{playbook.associated_skills!.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Moods */}
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Moods</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(playbook.associated_moods || []).length > 0 ? (
                                                        playbook.associated_moods!.slice(0, 3).map(mood => (
                                                            <span key={mood} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                                                                {mood}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-slate-600 italic">None</span>
                                                    )}
                                                    {(playbook.associated_moods?.length || 0) > 3 && (
                                                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-850 text-slate-400 rounded-md">+{playbook.associated_moods!.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>{(playbook.game_ids || []).length} catalog games</span>
                                        <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">
                                            Edit Playbook →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

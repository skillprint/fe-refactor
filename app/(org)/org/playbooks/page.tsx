"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const BookOpen = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const Plus = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;

interface Playbook {
    id: string;
    title: string;
    description: string | null;
    associated_skills: string[] | null;
    associated_moods: string[] | null;
    game_ids: string[] | null;
}

export default function PlaybooksPage() {
    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaybooks();
    }, []);

    const fetchPlaybooks = async () => {
        try {
            const res = await fetch("/api/org/playbooks");
            const data = await res.json();
            if (data.success) {
                setPlaybooks(data.playbooks);
            }
        } catch {
            toast.error("Failed to load playbooks.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col h-full">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm flex items-center gap-3">
                        <BookOpen className="w-10 h-10 text-orange-500" />
                        Playbooks
                    </h1>
                    <p className="text-base font-medium text-neutral-400 mt-2">
                        Manage curations of games tailored to specific skills and moods.
                    </p>
                </div>
                <div>
                    <Link
                        href="/org/playbooks/new"
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create Playbook
                    </Link>
                </div>
            </header>

            <div className="flex-1 min-h-0 relative">
                <div className="h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {loading ? (
                        <div className="text-neutral-500">Loading playbooks...</div>
                    ) : playbooks.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-neutral-800 border-dashed text-neutral-500 bg-neutral-900/20">
                            No playbooks created yet. Click "Create Playbook" to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {playbooks.map((playbook: Playbook) => (
                                <Link href={`/org/playbooks/${playbook.id}`} key={playbook.id} className="block group">
                                    <div className="h-full p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm hover:bg-neutral-800/60 hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-orange-500/10 flex flex-col">
                                        <h3 className="font-bold text-white text-xl leading-tight mb-2 group-hover:text-orange-400 transition-colors">
                                            {playbook.title}
                                        </h3>
                                        <p className="text-sm text-neutral-400 line-clamp-2 mb-4 flex-1">
                                            {playbook.description || "No description provided."}
                                        </p>

                                        <div className="space-y-3 mt-auto border-t border-neutral-800 pt-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Skills</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(playbook.associated_skills || []).length > 0 ? (
                                                        playbook.associated_skills!.slice(0, 3).map(skill => (
                                                            <span key={skill} className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-neutral-600 italic">None specified</span>
                                                    )}
                                                    {(playbook.associated_skills?.length || 0) > 3 && (
                                                        <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-800 text-neutral-400 rounded-md">+{playbook.associated_skills!.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Moods</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(playbook.associated_moods || []).length > 0 ? (
                                                        playbook.associated_moods!.slice(0, 3).map(mood => (
                                                            <span key={mood} className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                                                                {mood}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-neutral-600 italic">None specified</span>
                                                    )}
                                                    {(playbook.associated_moods?.length || 0) > 3 && (
                                                        <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-800 text-neutral-400 rounded-md">+{playbook.associated_moods!.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-2 mt-2 flex items-center justify-between">
                                                <span className="text-xs font-medium text-neutral-400">
                                                    {(playbook.game_ids || []).length} games included
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

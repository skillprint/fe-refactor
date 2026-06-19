'use client';

import React, { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useGamesBySkill } from '../../../hooks/useGamesBySkill';

const ArrowLeftIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const GamepadIcon = () => <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const BLACKLISTED_GAMES = ['infinite-runner-3d', 'hextris', 'fruit-ninja', 'plastoblasto', 'flappy-bird-1', 'lastwar-frontline', 'line-color'];
const AVAILABLE_SKILLS = ['memory', 'logic', 'speed', 'pattern recognition', 'coordination'];
const AVAILABLE_MOODS = ['relax', 'focus', 'collaborate', 'creative'];

interface Game {
    id: string;
    title: string | null;
    target_mode: string;
    target_value: string;
    icon: string | null;
    is_active: boolean;
}

export default function CorporatePlaybookDetailPage({
    params
}: {
    params: Promise<{ playbookId: string }>;
}) {
    const { playbookId } = use(params);
    const router = useRouter();
    const isNew = playbookId === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [moods, setMoods] = useState<string[]>([]);
    const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

    const [fetchedOrgGames, setFetchedOrgGames] = useState<Game[]>([]);
    const { gamesBySkill, isLoading: catalogLoading } = useGamesBySkill();

    const allGames = useMemo(() => {
        const uniqueCatalogGames: Game[] = [];
        const seenSlugs = new Set();
        
        gamesBySkill.forEach((g: any) => {
            if (!seenSlugs.has(g.slug) && !BLACKLISTED_GAMES.includes(g.slug)) {
                seenSlugs.add(g.slug);
                uniqueCatalogGames.push({
                    id: g.slug,
                    title: g.name,
                    target_mode: 'Catalog Game',
                    target_value: '',
                    icon: g.screenshot,
                    is_active: true
                });
            }
        });
        return [...fetchedOrgGames, ...uniqueCatalogGames];
    }, [fetchedOrgGames, gamesBySkill]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch games
                const gamesRes = await fetch('/api/org/games');
                const gamesData = await gamesRes.json();
                if (gamesData.success) {
                    setFetchedOrgGames(gamesData.games.filter((g: Game) => g.is_active));
                }

                if (!isNew) {
                    const pbRes = await fetch(`/api/org/playbooks/${playbookId}`);
                    const pbData = await pbRes.json();

                    if (!pbRes.ok) throw new Error(pbData.error || 'Failed to load playbook');

                    const pb = pbData.playbook;
                    setTitle(pb.title || '');
                    setDescription(pb.description || '');
                    setSkills(pb.associated_skills || []);
                    setMoods(pb.associated_moods || []);
                    setSelectedGameIds(pb.game_ids || []);
                }
            } catch (err: any) {
                toast.error(err.message || 'Failed to load necessary data');
                router.push('/corporate/playbooks');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isNew, playbookId, router]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        try {
            const url = isNew ? '/api/org/playbooks' : `/api/org/playbooks/${playbookId}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    associated_skills: skills,
                    associated_moods: moods,
                    game_ids: selectedGameIds
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save playbook');

            toast.success(isNew ? 'Playbook created successfully!' : 'Playbook updated successfully.');
            router.push('/corporate/playbooks');
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove this playbook?')) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/org/playbooks/${playbookId}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to delete');

            toast.success('Playbook deleted successfully.');
            router.push('/corporate/playbooks');
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
            setSaving(false);
        }
    };

    const toggleGame = (gameId: string) => {
        setSelectedGameIds(prev =>
            prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
        );
    };

    if (loading || catalogLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            {/* Navigation back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
            >
                <ArrowLeftIcon />
                Back to Playbooks
            </button>

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        {isNew ? 'New Playbook' : 'Edit Playbook'}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Configure curations and cognitive mappings.</p>
                </div>

                <div className="flex items-center gap-3">
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="px-4 py-2 bg-slate-900 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-98"
                        >
                            Delete Playbook
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-98 transition-all"
                    >
                        {saving ? 'Saving...' : 'Save Playbook'}
                    </button>
                </div>
            </header>

            {/* Grid editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Form */}
                <div className="lg:col-span-2 space-y-6 border border-slate-800/80 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md">
                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                            Playbook Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Creative Warm-up Sequences"
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detail the target purpose of this game sequence..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Associated Skills */}
                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2.5 pl-1">
                            Associated Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {skills.map(skill => (
                                <span key={skill} className="px-2.5 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center gap-1.5 border border-indigo-500/20">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => setSkills(skills.filter(s => s !== skill))}
                                        className="hover:text-red-400 text-indigo-400/80 transition-colors p-0.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            list="pb-skills"
                            placeholder="Add skill (press Enter)..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = (e.currentTarget.value || '').toLowerCase().trim();
                                    if (val && !AVAILABLE_SKILLS.includes(val)) {
                                        toast.error(`Invalid skill. Must be one of: ${AVAILABLE_SKILLS.join(', ')}`);
                                    } else if (val && !skills.includes(val)) {
                                        setSkills([...skills, val]);
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                            onBlur={(e) => { e.target.value = ''; }}
                            className="w-full px-4 py-2.5 bg-slate-950/85 border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-slate-300 outline-none transition-all"
                        />
                        <datalist id="pb-skills">
                            {AVAILABLE_SKILLS.map(skill => (
                                <option key={skill} value={skill} />
                            ))}
                        </datalist>
                    </div>

                    {/* Associated Moods */}
                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2.5 pl-1">
                            Associated Moods
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {moods.map(mood => (
                                <span key={mood} className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center gap-1.5 border border-emerald-500/20">
                                    {mood}
                                    <button
                                        type="button"
                                        onClick={() => setMoods(moods.filter(m => m !== mood))}
                                        className="hover:text-red-400 text-emerald-400/80 transition-colors p-0.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            list="pb-moods"
                            placeholder="Add mood (press Enter)..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = (e.currentTarget.value || '').toLowerCase().trim();
                                    if (val && !AVAILABLE_MOODS.includes(val)) {
                                        toast.error(`Invalid mood. Must be one of: ${AVAILABLE_MOODS.join(', ')}`);
                                    } else if (val && !moods.includes(val)) {
                                        setMoods([...moods, val]);
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                            onBlur={(e) => { e.target.value = ''; }}
                            className="w-full px-4 py-2.5 bg-slate-950/85 border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-slate-300 outline-none transition-all"
                        />
                        <datalist id="pb-moods">
                            {AVAILABLE_MOODS.map(mood => (
                                <option key={mood} value={mood} />
                            ))}
                        </datalist>
                    </div>
                </div>

                {/* Game Selection sidebar */}
                <div className="border border-slate-800/80 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md flex flex-col h-[520px]">
                    <div className="mb-4">
                        <h3 className="font-bold text-white text-sm">Included Games</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">{selectedGameIds.length} games selected</p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                        {allGames.map(game => {
                            const isSelected = selectedGameIds.includes(game.id);
                            return (
                                <div
                                    key={game.id}
                                    onClick={() => toggleGame(game.id)}
                                    className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-sm'
                                            : 'bg-slate-950/45 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 text-slate-400'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                            ? 'bg-indigo-500 border-indigo-500 text-white'
                                            : 'bg-slate-900 border-slate-800'
                                    }`}>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {game.icon ? (
                                        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                                            <img src={game.icon} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-slate-900 border border-slate-800">
                                            <GamepadIcon />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                            {game.title || 'Untitled'}
                                        </h4>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                            {game.target_mode}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

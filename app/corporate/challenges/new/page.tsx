'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChallenges } from '../../../hooks/useChallenges';

const ArrowLeftIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;

const AVAILABLE_GAMES = [
    { name: '2048', slug: '2048' },
    { name: 'Alchemy', slug: 'alchemy' },
    { name: 'Brick Out', slug: 'brick-out' },
    { name: 'Bubble Spirit', slug: 'bubble-spirit' },
    { name: 'Change Word', slug: 'change-word' },
    { name: 'Flapcat Steampunk', slug: 'flapcat-steampunk' },
    { name: 'Fruit Sorting', slug: 'fruit-sorting' },
    { name: 'Garden Match', slug: 'garden-match' },
    { name: 'Hextris', slug: 'hextris' },
    { name: 'I Love Hue', slug: 'i-love-hue' },
    { name: 'Mahjong Deluxe', slug: 'mahjong-deluxe' },
    { name: 'Snake Attack', slug: 'snake-attack' },
];

export default function CreateChallengePage() {
    const { createChallenge } = useChallenges();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'temporal' | 'skill_mood' | 'mixed'>('temporal');
    const [temporalPeriod, setTemporalPeriod] = useState<'daily' | 'weekly' | 'monthly' | ''>('weekly');
    const [skillsString, setSkillsString] = useState('');
    const [moodsString, setMoodsString] = useState('');
    const [selectedGames, setSelectedGames] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleGame = (slug: string) => {
        setSelectedGames(prev =>
            prev.includes(slug) ? prev.filter(g => g !== slug) : [...prev, slug]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            alert('Title and description are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formattedSkills = skillsString
                ? skillsString.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
                : [];
            const formattedMoods = moodsString
                ? moodsString.split(',').map(m => m.trim().toLowerCase()).filter(Boolean)
                : [];

            await createChallenge({
                title,
                description,
                type,
                temporal_period: type === 'temporal' || type === 'mixed' ? temporalPeriod || null : null,
                associated_skill: formattedSkills,
                associated_mood: formattedMoods,
                game_ids: selectedGames,
            });
            router.push('/corporate/challenges');
        } catch (err) {
            console.error('Failed to create challenge:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-2xl mx-auto animate-in fade-in duration-300">
            {/* Navigation back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
            >
                <ArrowLeftIcon />
                Back to Challenges
            </button>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">New Challenge</h1>
                <p className="text-sm text-slate-400 mt-1">Configure telemetry targets and gameplay objectives.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                        Challenge Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Weekly Logic Sprint"
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
                        placeholder="Explain the purpose of this challenge..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                            Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white outline-none transition-all"
                        >
                            <option value="temporal">Temporal</option>
                            <option value="skill_mood">Skill & Mood</option>
                            <option value="mixed">Mixed Goal</option>
                        </select>
                    </div>

                    {(type === 'temporal' || type === 'mixed') && (
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Duration Period
                            </label>
                            <select
                                value={temporalPeriod}
                                onChange={(e) => setTemporalPeriod(e.target.value as any)}
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white outline-none transition-all"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                            Associated Skills
                        </label>
                        <input
                            type="text"
                            value={skillsString}
                            onChange={(e) => setSkillsString(e.target.value)}
                            placeholder="planning, deduction (comma separated)"
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                            Associated Moods
                        </label>
                        <input
                            type="text"
                            value={moodsString}
                            onChange={(e) => setMoodsString(e.target.value)}
                            placeholder="focus, relax (comma separated)"
                            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2.5 pl-1">
                        Select Associated Games
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {AVAILABLE_GAMES.map((game) => {
                            const isChecked = selectedGames.includes(game.slug);
                            return (
                                <button
                                    type="button"
                                    key={game.slug}
                                    onClick={() => toggleGame(game.slug)}
                                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl border text-left transition-all ${
                                        isChecked
                                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {game.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/10 active:scale-98 flex items-center justify-center disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        'Publish Challenge'
                    )}
                </button>
            </form>
        </div>
    );
}

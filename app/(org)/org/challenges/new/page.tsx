"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChallenges } from "@/app/hooks/useChallenges";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewChallengePage() {
    const router = useRouter();
    const { createChallenge } = useChallenges();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "temporal" as "temporal" | "skill_mood" | "mixed",
        temporal_period: "daily" as "daily" | "weekly" | "monthly" | "",
        associated_skill: [] as string[],
        associated_mood: [] as string[],
        game_ids: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createChallenge({
                ...form,
                temporal_period: form.temporal_period || null,
                associated_skill: form.associated_skill,
                associated_mood: form.associated_mood,
            });
            router.push("/org/challenges");
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
            <header className="flex flex-col gap-2">
                <Link href="/org/challenges" className="text-sm font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1">
                    ← Back to Challenges
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Create New Challenge
                </h1>
            </header>

            <div className="max-w-2xl bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-300">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Daily Focus Challenge"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-300">Description</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe what players need to do..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-300">Challenge Type</label>
                        <select
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value as any })}
                        >
                            <option value="temporal">Temporal (Time-based)</option>
                            <option value="skill_mood">Skill/Mood Based</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>

                    {(form.type === 'temporal' || form.type === 'mixed') && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-300">Temporal Period</label>
                            <select
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                value={form.temporal_period}
                                onChange={e => setForm({ ...form, temporal_period: e.target.value as any })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                        <Link href="/org/challenges" className="px-5 py-2 rounded-lg font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Challenge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

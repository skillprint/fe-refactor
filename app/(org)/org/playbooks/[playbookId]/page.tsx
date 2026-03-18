"use client";
import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGamesBySkill } from "../../../../hooks/useGamesBySkill";

const BLACKLISTED_GAMES = ['infinite-runner-3d', 'hextris', 'fruit-ninja', 'plastoblasto', 'flappy-bird-1', 'lastwar-frontline', 'line-color'];

const ArrowLeft = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
const Gamepad2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>;

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

export default function PlaybookDetailPage({ params }: { params: Promise<{ playbookId: string }> }) {
    const { playbookId } = use(params);
    const router = useRouter();
    const isNew = playbookId === "new";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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
                    target_mode: "Catalog Game",
                    target_value: "",
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
                // Fetch games for selection
                const gamesRes = await fetch("/api/org/games");
                const gamesData = await gamesRes.json();
                if (gamesData.success) {
                    setFetchedOrgGames(gamesData.games.filter((g: Game) => g.is_active));
                }

                if (!isNew) {
                    const pbRes = await fetch(`/api/org/playbooks/${playbookId}`);
                    const pbData = await pbRes.json();

                    if (!pbRes.ok) throw new Error(pbData.error || "Failed to load playbook");

                    const pb = pbData.playbook;
                    setTitle(pb.title || "");
                    setDescription(pb.description || "");
                    setSkills(pb.associated_skills || []);
                    setMoods(pb.associated_moods || []);
                    setSelectedGameIds(pb.game_ids || []);
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to load necessary data");
                router.push("/org/playbooks");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isNew, playbookId, router]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        setSaving(true);
        try {
            const url = isNew ? "/api/org/playbooks" : `/api/org/playbooks/${playbookId}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    associated_skills: skills,
                    associated_moods: moods,
                    game_ids: selectedGameIds
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save playbook");

            toast.success(isNew ? "Playbook created successfully!" : "Playbook updated.");

            if (isNew) {
                router.push("/org/playbooks");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this playbook?")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/org/playbooks/${playbookId}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete");

            toast.success("Playbook deleted.");
            router.push("/org/playbooks");
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
            setSaving(false);
        }
    };

    const toggleGame = (gameId: string) => {
        setSelectedGameIds(prev =>
            prev.includes(gameId)
                ? prev.filter(id => id !== gameId)
                : [...prev, gameId]
        );
    };

    if (loading || catalogLoading) {
        return <div className="p-8 text-neutral-400">Loading editor...</div>;
    }

    return (
        <div className="min-h-full p-8 lg:p-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/org/playbooks" className="p-2 -ml-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {isNew ? "Create Playbook" : "Edit Playbook"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isNew && (
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500 border border-red-500/20 hover:border-red-500 rounded-xl transition-all"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 rounded-xl transition-all active:scale-95"
                        >
                            {saving ? "Saving..." : "Save Playbook"}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Form Details */}
                    <div className="md:col-span-2 space-y-6 bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-400 tracking-wide">Playbook Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. Focus & Productivity Suite"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-400 tracking-wide">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this curation of games meant for?"
                                rows={3}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium resize-none"
                            />
                        </div>

                        {/* Skills Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-neutral-400 tracking-wide">Associated Skills</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {skills.map(skill => (
                                    <span key={skill} className="px-3 py-1.5 text-sm font-bold bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center gap-2 border border-indigo-500/20">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => setSkills(skills.filter(s => s !== skill))}
                                            className="hover:text-red-400 text-indigo-400 transition-colors p-0.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                            <datalist id="pb-skills">
                                {AVAILABLE_SKILLS.map(skill => (
                                    <option key={skill} value={skill} />
                                ))}
                            </datalist>
                        </div>

                        {/* Moods Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-neutral-400 tracking-wide">Associated Moods</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {moods.map(mood => (
                                    <span key={mood} className="px-3 py-1.5 text-sm font-bold bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center gap-2 border border-emerald-500/20">
                                        {mood}
                                        <button
                                            type="button"
                                            onClick={() => setMoods(moods.filter(m => m !== mood))}
                                            className="hover:text-red-400 text-emerald-400 transition-colors p-0.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            />
                            <datalist id="pb-moods">
                                {AVAILABLE_MOODS.map(mood => (
                                    <option key={mood} value={mood} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {/* Right Column: Game Selection */}
                    <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800 flex flex-col h-[600px]">
                        <div className="mb-4 space-y-1">
                            <h3 className="font-bold text-white text-lg tracking-wide">Included Games</h3>
                            <p className="text-xs text-neutral-400">{selectedGameIds.length} out of {allGames.length} selected</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {allGames.length === 0 ? (
                                <div className="text-center p-4 text-sm text-neutral-500">
                                    No active games available.<br />Go to the Games tab to activate some!
                                </div>
                            ) : (
                                allGames.map(game => {
                                    const isSelected = selectedGameIds.includes(game.id);
                                    return (
                                        <div
                                            key={game.id}
                                            onClick={() => toggleGame(game.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                ? "bg-orange-500/10 border-orange-500/50"
                                                : "bg-neutral-950/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                ? "bg-orange-500 border-orange-500"
                                                : "bg-neutral-900 border-neutral-600"
                                                }`}>
                                                {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                            </div>

                                            {game.icon ? (
                                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                                                    <img src={game.icon} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-neutral-800">
                                                    <Gamepad2 className="w-4 h-4 text-neutral-500" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-neutral-300"}`}>
                                                    {game.title || 'Untitled'}
                                                </h4>
                                                <p className="text-[10px] text-neutral-500 truncate uppercase mt-0.5 tracking-wider">
                                                    {game.target_mode}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

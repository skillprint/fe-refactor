"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
const UserPlus = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>;
const Shield = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z" /></svg>;
const User = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const Trash2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>;

interface Member {
    id: string;
    organization_id: string;
    user_id: string;
    role: string;
    created_at: string;
    User: {
        id: string;
        first_name: string;
        profile_image: string | null;
    };
}

export default function OrgSettingsPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteUserId, setInviteUserId] = useState("");
    const [inviteRole, setInviteRole] = useState("member");
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch("/api/org/members");
            const data = await res.json();
            if (data.success) {
                setMembers(data.members);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUserId.trim()) return;

        setInviting(true);
        try {
            const res = await fetch("/api/org/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: inviteUserId, role: inviteRole }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Member added successfully!");
                setInviteUserId("");
                fetchMembers();
            } else {
                toast.error(data.error || "Failed to add member");
            }
        } catch (error) {
            toast.error("Internal error");
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        try {
            const res = await fetch(`/api/org/members?user_id=${userId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Member removed");
                setMembers(members.filter((m) => m.user_id !== userId));
            } else {
                toast.error("Failed to remove member");
            }
        } catch (error) {
            toast.error("Internal error");
        }
    };

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
            <header className="space-y-1">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm">
                    Settings
                </h1>
                <p className="text-base font-medium text-neutral-400">
                    Manage your organization members and preferences.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <UsersIcon className="w-5 h-5 text-orange-500" />
                            Members List
                        </h2>

                        {loading ? (
                            <div className="text-neutral-500 text-sm">Loading members...</div>
                        ) : members.length === 0 ? (
                            <div className="text-neutral-500 text-sm">No members found.</div>
                        ) : (
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between py-3 border-b border-neutral-800/60 last:border-0 hover:bg-neutral-800/20 px-4 rounded-xl transition-all duration-200">
                                        <div className="flex items-center gap-4">
                                            {member.User.profile_image ? (
                                                <img src={member.User.profile_image} alt="" className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-neutral-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-white">{member.User.first_name}</p>
                                                <p className="text-xs text-neutral-500">ID: {member.user_id}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${member.role === 'admin'
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                : 'bg-neutral-800 text-neutral-400'
                                                }`}>
                                                {member.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                            </span>
                                            <button
                                                onClick={() => handleRemove(member.user_id)}
                                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-orange-500" />
                            Add Member
                        </h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">User ID</label>
                                <input
                                    type="text"
                                    required
                                    value={inviteUserId}
                                    onChange={(e) => setInviteUserId(e.target.value)}
                                    placeholder="Enter User ID..."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={inviting}
                                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] transform hover:-translate-y-0.5"
                            >
                                {inviting ? "Adding..." : "Add to Organization"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

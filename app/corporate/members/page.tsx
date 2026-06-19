'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Member {
    id: string;
    organization_id: string;
    user_id: string;
    role: string;
    created_at: string;
    User?: {
        id: string;
        first_name: string;
        profile_image: string | null;
    };
}

const UsersIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function CorporateMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const [inviteUserId, setInviteUserId] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [isInviting, setIsInviting] = useState(false);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/org/members');
            const data = await res.json();
            if (data.success) {
                setMembers(data.members);
            } else {
                toast.error(data.error || 'Failed to load members.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load team members.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUserId.trim()) {
            toast.error('User ID is required.');
            return;
        }

        setIsInviting(true);
        try {
            const res = await fetch('/api/org/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: inviteUserId.trim(), role: inviteRole })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Member added successfully.');
                setInviteUserId('');
                fetchMembers();
            } else {
                toast.error(data.error || 'Failed to add member.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error during invite.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to revoke this user\'s access to the organization?')) {
            return;
        }

        try {
            const res = await fetch(`/api/org/members?user_id=${userId}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Member removed successfully.');
                fetchMembers();
            } else {
                toast.error(data.error || 'Failed to remove member.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error during deletion.');
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <UsersIcon />
                        Team Members
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Review active employees, edit credentials, and modify access rules.</p>
                </div>
            </header>

            {/* Split layout: Invite Form + Members List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Invite Form */}
                <div className="border border-slate-800/80 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md">
                    <h2 className="text-base font-bold text-white mb-1">Add Collaborator</h2>
                    <p className="text-xs text-slate-500 mb-6 font-medium">Grant workspace access to active players.</p>

                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                User ID (Skillprint Player ID)
                            </label>
                            <input
                                type="text"
                                value={inviteUserId}
                                onChange={(e) => setInviteUserId(e.target.value)}
                                placeholder="Enter user's registration ID"
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Access Level
                            </label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white outline-none transition-all"
                            >
                                <option value="member">Contributor (Standard player)</option>
                                <option value="manager">Manager (Read/Write playbooks)</option>
                                <option value="admin">Administrator (Full permissions)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isInviting}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/10 active:scale-98 flex items-center justify-center disabled:opacity-50 mt-2"
                        >
                            {isInviting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Add Member'
                            )}
                        </button>
                    </form>
                </div>

                {/* Members List table */}
                <div className="lg:col-span-2 border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md">
                    <h2 className="text-base font-bold text-white mb-6">Access Registry</h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No team members added yet. Invite players using the form.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                        <th className="pb-3 pl-2">Name</th>
                                        <th className="pb-3">User ID</th>
                                        <th className="pb-3">Role</th>
                                        <th className="pb-3">Date Joined</th>
                                        <th className="pb-3 pr-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {members.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-800/10 transition-colors">
                                            <td className="py-3.5 pl-2 font-semibold text-white flex items-center gap-2">
                                                {member.User?.profile_image ? (
                                                    <img
                                                        src={member.User.profile_image}
                                                        alt=""
                                                        className="w-6 h-6 rounded-full object-cover border border-slate-800"
                                                    />
                                                ) : (
                                                    <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                                                        {member.User?.first_name?.charAt(0) || 'U'}
                                                    </span>
                                                )}
                                                {member.User?.first_name || 'Anonymous User'}
                                            </td>
                                            <td className="py-3.5 text-slate-400 font-mono text-[10px]">{member.user_id}</td>
                                            <td className="py-3.5">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                                    member.role === 'admin'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                        : member.role === 'manager'
                                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-slate-500">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 pr-2 text-right">
                                                <button
                                                    onClick={() => handleRemove(member.user_id)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/5 transition-all"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

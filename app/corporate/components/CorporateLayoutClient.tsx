'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BuckyballLoading from '../../components/BuckyballLoading';
import toast from 'react-hot-toast';

export default function CorporateLayoutClient({
    children
}: {
    children: React.ReactNode;
}) {
    const { status, isLoading, loginAsOrg } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Username and password are required');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/auth/org/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (data.success) {
                loginAsOrg(data.token, { firstName: data.organization.name });
                toast.success(`Welcome back, ${data.organization.name}!`);
            } else {
                toast.error(data.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error during login.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <BuckyballLoading />
            </div>
        );
    }

    if (status !== 'organization') {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white relative overflow-hidden select-none">
                {/* Tech background designs */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#312e81_0%,transparent_50%)] opacity-30 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#0f766e_0%,transparent_50%)] opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-350">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-500/20 mb-4">
                            SP
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Skillprint Enterprise</h2>
                        <p className="text-xs text-slate-400 mt-1">Telemetry & Analytics Portal Login</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter corporate username"
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 focus:ring-1 focus:ring-slate-700/50 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 focus:ring-1 focus:ring-slate-700/50 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-98 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-4">
                        Protected by enterprise-grade data telemetry policies.
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

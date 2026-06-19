'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>;
const AnalyticsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2" /></svg>;
const PlaybooksIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ChallengesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MembersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SignOutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default function CorporateSidebar() {
    const pathname = usePathname();
    const { logout, userProfile } = useAuth();

    const menuItems = [
        { name: 'Overview', href: '/corporate', icon: DashboardIcon },
        { name: 'Analytics', href: '/corporate/analytics', icon: AnalyticsIcon },
        { name: 'Playbooks', href: '/corporate/playbooks', icon: PlaybooksIcon },
        { name: 'Challenges', href: '/corporate/challenges', icon: ChallengesIcon },
        { name: 'Team Members', href: '/corporate/members', icon: MembersIcon },
        { name: 'Settings', href: '/corporate/settings', icon: SettingsIcon }
    ];

    const isActive = (href: string) => {
        if (href === '/corporate') {
            return pathname === '/corporate';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 flex flex-col justify-between border-r border-slate-800 bg-slate-950 p-5 shrink-0 select-none relative z-20">
            {/* Subtle glow behind logo */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            <div>
                {/* Branding */}
                <div className="flex items-center gap-3.5 mb-8 px-2 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20 hover:rotate-6 transition-transform duration-300">
                        SP
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white leading-none">Skillprint</span>
                        <span className="text-[10px] font-bold text-teal-400 tracking-widest uppercase mt-0.5">Enterprise</span>
                    </div>
                </div>

                {/* Nav Menu */}
                <nav className="space-y-1 relative z-10">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group font-medium text-sm border ${
                                    active
                                        ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                                        : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40 hover:border-slate-900/60'
                                }`}
                            >
                                <span className={`transition-all duration-300 ${
                                    active ? 'text-indigo-400 scale-110' : 'text-slate-500 group-hover:text-indigo-400'
                                }`}>
                                    <item.icon />
                                </span>
                                <span>{item.name}</span>
                                {active && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile Footer */}
            <div className="pt-4 border-t border-slate-900 relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
                        {userProfile?.firstName?.charAt(0) || 'A'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate leading-tight">
                            {userProfile?.firstName || 'Corporate Admin'}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate mt-0.5">
                            Acme Corporation
                        </span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/10 border border-transparent transition-all duration-200 text-left font-medium text-sm"
                >
                    <span className="text-slate-500 group-hover:text-rose-400 transition-colors">
                        <SignOutIcon />
                    </span>
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}

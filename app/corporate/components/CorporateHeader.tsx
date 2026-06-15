'use client';

import React, { useState, useEffect, useRef } from 'react';

const SearchIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const BellIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

export default function CorporateHeader() {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New weekly challenge published successfully.', time: '10m ago', unread: true },
        { id: 2, text: 'Acme Corp member count reached 42 users.', time: '2h ago', unread: true },
        { id: 3, text: 'Telemetry synchronization succeeded.', time: '1d ago', unread: false },
    ]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between relative z-10 select-none">
            {/* Search Input bar */}
            <div className="flex items-center gap-3 w-80 relative group">
                <span className="text-slate-500 absolute left-3.5 group-focus-within:text-indigo-400 transition-colors">
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder="Search queries, playbooks, telemetry logs..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all focus:ring-1 focus:ring-slate-700/50"
                />
            </div>

            {/* Right Header items */}
            <div className="flex items-center gap-5">
                {/* Global Status Badging */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold tracking-wider text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SYSTEM OPERATIONAL</span>
                </div>

                {/* Notifications Bell with toggle dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`p-2 rounded-xl border relative transition-all duration-200 ${
                            isNotifOpen
                                ? 'bg-slate-900 border-slate-700 text-white'
                                : 'bg-transparent border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/40 hover:border-slate-900'
                        }`}
                    >
                        <BellIcon />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 border-2 border-slate-950 rounded-full" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3.5 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-30 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-250">
                            <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-800">
                                <span className="text-xs font-bold text-white">Notifications</span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="p-3.5 flex flex-col gap-1 hover:bg-slate-800/30 transition-colors">
                                        <div className="flex gap-2 items-start">
                                            {notif.unread && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                            )}
                                            <p className={`text-xs ${notif.unread ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                {notif.text}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-slate-500 pl-3.5">{notif.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

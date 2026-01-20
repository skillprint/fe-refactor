'use client';

import React from 'react';
import { useGameSessions } from '../hooks/useGameSessions';
import { GameSession } from '../lib/gameSessionUtils';

export const GameSessionManager: React.FC = () => {
    const { sessions, count, addSession, clearAll } = useGameSessions();

    const handleAddDummySession = () => {
        const newSession: GameSession = {
            id: Math.random().toString(36).substr(2, 9),
            gameSlug: 'sample-game',
            timestamp: Date.now(),
            completed: true,
            score: Math.floor(Math.random() * 1000),
            duration: Math.floor(Math.random() * 300) + 60,
        };
        addSession(newSession);
    };

    return (
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">Game Sessions</h3>
                        <p className="text-muted-foreground text-sm mt-1">Test utility that increases play count</p>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <span className="text-primary font-bold text-lg">{count}</span>
                        <span className="text-primary/70 text-sm ml-2">Played</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={handleAddDummySession}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/25 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Record Session
                    </button>
                    <button
                        onClick={clearAll}
                        className="bg-secondary hover:bg-destructive hover:text-destructive-foreground text-secondary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95"
                    >
                        Clear
                    </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {sessions.length === 0 ? (
                        <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                            <div className="text-4xl mb-3">🎮</div>
                            <p className="text-muted-foreground">No sessions recorded yet.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Start playing to see your history!</p>
                        </div>
                    ) : (
                        sessions.slice().reverse().map((session) => (
                            <div
                                key={session.id}
                                className="group flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl shadow-inner">
                                        🕹️
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground capitalize">
                                            {session.gameSlug.replace(/-/g, ' ')}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(session.timestamp).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary">
                                        {session.score?.toLocaleString() || '---'}
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                        Score
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

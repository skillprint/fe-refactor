'use client';

import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    icon: React.ReactNode;
    color?: 'indigo' | 'teal' | 'orange' | 'purple' | 'blue';
}

export default function MetricCard({
    title,
    value,
    subtitle,
    trend,
    icon,
    color = 'indigo'
}: MetricCardProps) {
    const colorStyles = {
        indigo: {
            bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            hoverBg: 'group-hover:bg-indigo-500/20',
            glow: 'shadow-indigo-500/10',
            text: 'text-indigo-400',
            gradient: 'from-indigo-500 to-indigo-600'
        },
        teal: {
            bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            hoverBg: 'group-hover:bg-emerald-500/20',
            glow: 'shadow-emerald-500/10',
            text: 'text-emerald-400',
            gradient: 'from-emerald-500 to-teal-600'
        },
        orange: {
            bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            hoverBg: 'group-hover:bg-orange-500/20',
            glow: 'shadow-orange-500/10',
            text: 'text-orange-400',
            gradient: 'from-orange-500 to-amber-600'
        },
        purple: {
            bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            hoverBg: 'group-hover:bg-purple-500/20',
            glow: 'shadow-purple-500/10',
            text: 'text-purple-400',
            gradient: 'from-purple-500 to-fuchsia-600'
        },
        blue: {
            bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            hoverBg: 'group-hover:bg-blue-500/20',
            glow: 'shadow-blue-500/10',
            text: 'text-blue-400',
            gradient: 'from-blue-500 to-cyan-600'
        }
    };

    const styles = colorStyles[color];

    return (
        <div className={`group relative p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-md hover:border-slate-700/80 hover:shadow-lg ${styles.glow}`}>
            {/* Subtle light overlay grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none rounded-2xl" />

            <div className="flex items-start justify-between relative z-10">
                <div className={`p-3 rounded-xl border transition-all duration-300 ${styles.bg} ${styles.hoverBg} group-hover:scale-115`}>
                    {icon}
                </div>
                
                {trend && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border ${
                        trend.isPositive 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                        {trend.isPositive ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0v-8m0 8l-9-9-4 4-6-6" />
                            </svg>
                        )}
                        {trend.value}
                    </span>
                )}
            </div>

            <div className="mt-4 relative z-10">
                <h3 className="text-3xl font-extrabold tracking-tight text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:gradient transition-all duration-300">
                    {value}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
                <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
            
            {/* Ambient background glow effect on hover */}
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${styles.gradient} opacity-0 group-hover:opacity-5 blur-sm transition-opacity duration-300 pointer-events-none`} />
        </div>
    );
}

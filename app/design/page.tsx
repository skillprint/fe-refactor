import React from 'react';

const colors = [
    { name: 'Background', class: 'bg-background', text: 'text-foreground' },
    { name: 'Foreground', class: 'bg-foreground', text: 'text-background' },
    { name: 'Card', class: 'bg-card', text: 'text-card-foreground', border: 'border-border' },
    { name: 'Card Foreground', class: 'bg-card-foreground', text: 'text-card' },
    { name: 'Popover', class: 'bg-popover', text: 'text-popover-foreground', border: 'border-border' },
    { name: 'Popover Foreground', class: 'bg-popover-foreground', text: 'text-popover' },
    { name: 'Primary', class: 'bg-primary', text: 'text-primary-foreground' },
    { name: 'Primary Foreground', class: 'bg-primary-foreground', text: 'text-primary' },
    { name: 'Secondary', class: 'bg-secondary', text: 'text-secondary-foreground' },
    { name: 'Secondary Foreground', class: 'bg-secondary-foreground', text: 'text-secondary' },
    { name: 'Muted', class: 'bg-muted', text: 'text-muted-foreground' },
    { name: 'Muted Foreground', class: 'bg-muted-foreground', text: 'text-muted' },
    { name: 'Accent', class: 'bg-accent', text: 'text-accent-foreground' },
    { name: 'Accent Foreground', class: 'bg-accent-foreground', text: 'text-accent' },
    { name: 'Destructive', class: 'bg-destructive', text: 'text-destructive-foreground' },
    { name: 'Destructive Foreground', class: 'bg-destructive-foreground', text: 'text-destructive' },
    { name: 'Border', class: 'bg-border', text: 'text-foreground' },
    { name: 'Input', class: 'bg-input', text: 'text-foreground' },
    { name: 'Ring', class: 'bg-ring', text: 'text-primary' },
];

const gradients = [
    { name: 'Primary Action', class: 'bg-gradient-to-r from-blue-600 to-purple-600' },
    { name: 'Primary Hover', class: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { name: 'Game Banner', class: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
    { name: 'Destructive/Urgent', class: 'bg-gradient-to-br from-orange-500 to-red-500' },
    { name: 'Over-Achiever / Success', class: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500' },
    { name: 'Default Progress', class: 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600' },
    { name: 'Subtle Progress', class: 'bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300' },
    { name: 'Org Dashboard / Gold', class: 'bg-gradient-to-r from-orange-400 to-amber-500' },
    { name: 'Skillprint Emoji Gold', class: 'bg-gradient-to-br from-yellow-400 to-orange-500' },
    { name: 'Skillprint Emoji Blue', class: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
    { name: 'Skillprint Emoji Red', class: 'bg-gradient-to-br from-red-400 to-pink-500' },
    { name: 'Tooltip Background', class: 'bg-gradient-to-br from-neutral-900 to-neutral-800' },
    { name: 'Featured Skill Hover', class: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20', text: 'text-foreground' },
    { name: 'Featured Skill Hover Alt', class: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20', text: 'text-foreground' },
    { name: 'Pastel Blue/Purple', class: 'bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-500 dark:to-purple-500', text: 'text-foreground' }
];

export default function DesignPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-16 px-6 sm:px-12">
            <div className="max-w-6xl mx-auto space-y-16">

                <header className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tight">Design System</h1>
                    <p className="text-xl text-muted-foreground">Colors and Gradients swatches used across the application.</p>
                </header>

                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-border flex-1"></div>
                        <h2 className="text-3xl font-bold">Theme Colors</h2>
                        <div className="h-px bg-border flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {colors.map((color, idx) => (
                            <div key={idx} className="flex flex-col rounded-xl overflow-hidden shadow-sm border border-border group hover:shadow-md transition-shadow">
                                <div className={`h-32 w-full flex items-center justify-center p-4 transition-transform group-hover:scale-105 duration-300 ${color.class} ${color.border ? color.border + ' border-b' : ''}`}>
                                    <span className={`text-sm font-medium ${color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {color.class.replace('bg-', '')}
                                    </span>
                                </div>
                                <div className="p-4 bg-card">
                                    <h3 className="font-semibold text-card-foreground truncate">{color.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                                        {color.class}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-border flex-1"></div>
                        <h2 className="text-3xl font-bold">Gradients</h2>
                        <div className="h-px bg-border flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gradients.map((gradient, idx) => (
                            <div key={idx} className="flex flex-col rounded-2xl overflow-hidden shadow-sm border border-border group hover:shadow-lg transition-all hover:-translate-y-1 duration-300 bg-card">
                                <div className={`h-40 w-full relative ${gradient.class}`}>
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                                </div>
                                <div className="p-5 flex flex-col items-start gap-2">
                                    <h3 className="text-lg font-bold text-card-foreground">{gradient.name}</h3>
                                    <code className="text-xs text-muted-foreground bg-muted p-2 rounded-lg break-words text-wrap w-full">
                                        {gradient.class}
                                    </code>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-8 pb-12">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-border flex-1"></div>
                        <h2 className="text-3xl font-bold">Typography & Interactivity</h2>
                        <div className="h-px bg-border flex-1"></div>
                    </div>

                    <div className="flex flex-wrap gap-6 items-center">
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all hover:scale-105 active:scale-95">
                            Primary Action
                        </button>

                        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95">
                            Theme Button
                        </button>

                        <div className="px-4 py-2 border border-border rounded-lg bg-card text-card-foreground flex items-center gap-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                            <span className="w-4 h-4 rounded-full bg-destructive shrink-0" />
                            Card Element
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                            Gradient Text
                        </h1>
                    </div>
                </section>

            </div>
        </div>
    );
}

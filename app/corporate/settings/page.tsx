'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

const SettingsIcon = () => <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default function CorporateSettingsPage() {
    const [orgName, setOrgName] = useState('Acme Corporation');
    const [contactEmail, setContactEmail] = useState('admin@acme.com');
    
    // Telemetry configs
    const [screenshotRate, setScreenshotRate] = useState(5); // seconds
    const [shareTelemetry, setShareTelemetry] = useState(true);
    
    // API configs
    const [apiKey, setApiKey] = useState('sp_live_9a87f123bc45de67');
    const [webhookUrl, setWebhookUrl] = useState('https://api.acme.com/v1/skillprint-webhook');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: 'Saving system configuration...',
                success: 'Workspace settings updated successfully!',
                error: 'Failed to update configurations.'
            }
        );
    };

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        toast.success('API credential copied to clipboard!');
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <SettingsIcon />
                        Workspace Settings
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Configure telemetry schedules, notification preferences, and API keys.</p>
                </div>
            </header>

            {/* Forms */}
            <form onSubmit={handleSave} className="space-y-6">
                
                {/* Profile section */}
                <div className="border border-slate-800/80 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md space-y-4">
                    <h2 className="text-base font-bold text-white mb-2">Organization Profile</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Primary Contact Email
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm text-white outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Telemetry Rules */}
                <div className="border border-slate-800/80 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md space-y-4">
                    <h2 className="text-base font-bold text-white mb-2">Gameplay Telemetry Preferences</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/50">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-white">Share Telemetry Logs</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">Allow automatic sync of player game scores to local DB.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={shareTelemetry}
                                onChange={(e) => setShareTelemetry(e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                SDK Screenshot Capture Rate ({screenshotRate} seconds)
                            </label>
                            <input
                                type="range"
                                min={3}
                                max={15}
                                value={screenshotRate}
                                onChange={(e) => setScreenshotRate(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-bold">
                                <span>3s (Aggressive)</span>
                                <span>15s (Conserving)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* API & Webhooks */}
                <div className="border border-slate-800/80 bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md space-y-4">
                    <h2 className="text-base font-bold text-white mb-2">Developer Integrations</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Enterprise API Key
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={apiKey}
                                    readOnly
                                    className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono text-indigo-400 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={copyApiKey}
                                    className="px-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all"
                                >
                                    Copy Key
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 pl-1">
                                Webhook Endpoint URL
                            </label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-slate-700 rounded-xl text-sm font-mono text-white outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/10 active:scale-98"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}

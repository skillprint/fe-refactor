"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameAdjustmentBanner from '../components/GameAdjustmentBanner';

const MOODS = [
    'relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe'
];
const SKILLS = [
    'problem solving', 'memory', 'logic', 'spatial reasoning', 'attention', 'pattern recognition', 'reaction time'
];

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    configSnapshot?: {
        targetMode: 'mood' | 'skill';
        targetValue: string;
        artStyleId: string;
        genreId: string;
        parameters: { name: string; value: string }[];
        optionalPrompt: string;
    };
}

function GameSandboxContent() {
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const [targetMode, setTargetMode] = useState<'mood' | 'skill'>('mood');
    const [targetValue, setTargetValue] = useState(MOODS[0]);
    const [optionalPrompt, setOptionalPrompt] = useState('');
    const [refinePrompt, setRefinePrompt] = useState('');
    const [artStyleId, setArtStyleId] = useState('');
    const [genreId, setGenreId] = useState('');
    const [modelProvider, setModelProvider] = useState<'gemini' | 'ollama'>('gemini');
    const [ollamaModel, setOllamaModel] = useState('qwen2.5-coder:14b');
    const [artStyles, setArtStyles] = useState<{ id: string, name: string }[]>([]);
    const [genres, setGenres] = useState<{ id: string, name: string }[]>([]);
    const [parameters, setParameters] = useState<{ name: string, value: string }[]>([{ name: '', value: '' }]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationOutput, setGenerationOutput] = useState('');
    const [gameUrl, setGameUrl] = useState<string | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ promptTokenCount?: number, candidatesTokenCount?: number, totalTokenCount?: number } | null>(null);

    // Chat Interface State
    const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            text: "Hello! I am your Skillprint AI Game Design Assistant. Describe the type of game you want to build, its theme, target mood/skill, or mechanics, and I'll configure and build it for you!"
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // If editId param is passed, update game config
    useEffect(() => {
        if (editId) {
            fetch(`/api/org/games/${editId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.game) {
                        setTargetMode(data.game.target_mode);
                        setTargetValue(data.game.target_value);
                        if (data.game.optional_prompt) setOptionalPrompt(data.game.optional_prompt);
                        setGameUrl(data.game.file_url);
                        if (data.parameters && data.parameters.length > 0) {
                            setParameters(data.parameters.map((p: any) => ({
                                name: p.name,
                                value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value)
                            })));
                        } else {
                            setParameters([{ name: '', value: '' }]);
                        }
                    }
                })
                .catch(err => console.error("Could not fetch game for edit", err));
        }
    }, [editId]);

    const outputRef = useRef<HTMLPreElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // keep scroll to bottom for streaming output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [generationOutput]);

    // keep scroll to bottom for chat messages
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChatLoading]);

    const [currentAdjustment, setCurrentAdjustment] = useState<{ parameterName: string, parameterValue: any } | null>(null);
    const [adjustmentMappings, setAdjustmentMappings] = useState<Record<string, { parameterName: string, description: string, value: any }> | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'ADJUSTMENT_MADE') {
                setCurrentAdjustment({
                    parameterName: event.data.parameterName,
                    parameterValue: event.data.parameterValue
                });
            } else if (event.data?.type === 'REGISTER_ADJUSTMENTS' && event.data.mappings) {
                setAdjustmentMappings(event.data.mappings);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        fetch('/api/art-styles')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setArtStyles(data);
            })
            .catch(err => console.error("Could not fetch art styles", err));

        fetch('/api/genres')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setGenres(data);
            })
            .catch(err => console.error("Could not fetch genres", err));
    }, []);

    useEffect(() => {
        // reset target value when mode changes
        if (targetMode === 'mood') setTargetValue(MOODS[0]);
        else setTargetValue(SKILLS[0]);
    }, [targetMode]);

    const handleGenerate = async (isRefine: boolean = false, promptOverride?: string) => {
        let existingCode = undefined;
        let promptToSend = optionalPrompt;

        // If game URL exists, treat it as refinement
        const actualIsRefine = isRefine || !!gameUrl;

        if (actualIsRefine && gameUrl) {
            promptToSend = promptOverride || refinePrompt || optionalPrompt;
            try {
                // Fetch the actual HTML content
                const fetchUrl = gameUrl.startsWith('/sandbox/') ? `/games/generated/${gameUrl.split('/').pop()}.html` : gameUrl;
                const htmlResponse = await fetch(fetchUrl);
                existingCode = await htmlResponse.text();
            } catch (err) {
                console.error("Failed to fetch existing game code", err);
            }
        }

        setIsGenerating(true);
        setGenerationOutput('');
        setGameUrl(null);
        setAdjustmentMappings(null);
        setCurrentAdjustment(null);
        setTokenUsage(null);

        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetMode,
                    targetValue,
                    optionalPrompt: promptToSend,
                    existingCode,
                    artStyleId: artStyleId || undefined,
                    genreId: genreId || undefined,
                    modelProvider,
                    modelName: modelProvider === 'ollama' ? ollamaModel : undefined,
                    parameters: parameters.filter(p => p.name.trim() !== '' && p.value.trim() !== ''),
                    editGameId: editId || undefined
                }),
            });

            if (!response.ok || !response.body) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to generate game');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const tokenMatch = buffer.match(/\n___TOKEN_USAGE___:({.*?})\n/);
                    if (tokenMatch) {
                        try {
                            setTokenUsage(JSON.parse(tokenMatch[1]));
                        } catch (e) { }
                        buffer = buffer.replace(tokenMatch[0], '');
                    }

                    if (buffer.includes('___FILE_READY___:')) {
                        const parts = buffer.split('___FILE_READY___:');
                        setGenerationOutput(prev => prev + parts[0]);
                        const rawUrl = parts[1].trim(); // e.g. /games/generated/mood-focus-123.html

                        let gameId = '';
                        if (rawUrl.startsWith('/games/generated/') && rawUrl.endsWith('.html')) {
                            gameId = rawUrl.substring('/games/generated/'.length, rawUrl.length - 5);
                        }

                        if (gameId) {
                            setGameUrl("/sandbox/" + gameId);
                        } else {
                            setGameUrl(rawUrl);
                        }
                        buffer = '';
                    } else if (buffer.includes('___ERROR___:')) {
                        const parts = buffer.split('___ERROR___:');
                        setGenerationOutput(prev => prev + parts[0] + '\nError: ' + parts[1]);
                        buffer = '';
                    } else {
                        setGenerationOutput(prev => prev + chunk);
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            setGenerationOutput(prev => prev + '\n\nError: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendChatMessage = async (textToSend: string) => {
        if (!textToSend.trim() || isChatLoading || isGenerating) return;

        const userMessage: ChatMessage = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const currentConfig = {
                targetMode,
                targetValue,
                artStyleId,
                genreId,
                parameters: parameters.filter(p => p.name.trim() !== '' && p.value.trim() !== ''),
                optionalPrompt,
                modelProvider,
                modelName: modelProvider === 'ollama' ? ollamaModel : undefined
            };

            const historyToSend = messages
                .filter((_, idx) => idx > 0) // Skip welcome message
                .map(m => ({ role: m.role, text: m.text }));

            const chatResponse = await fetch('/api/chat-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: textToSend,
                    history: historyToSend,
                    currentConfig
                })
            });

            if (!chatResponse.ok) {
                throw new Error('Chat Assistant returned an error');
            }

            const chatData = await chatResponse.json();

            // Synchronize configuration if updated
            if (chatData.updatedConfig) {
                const cfg = chatData.updatedConfig;
                if (cfg.targetMode) setTargetMode(cfg.targetMode);
                if (cfg.targetValue) setTargetValue(cfg.targetValue);
                if (cfg.artStyleId !== undefined) {
                    setArtStyleId(cfg.artStyleId === 'none' ? '' : cfg.artStyleId);
                }
                if (cfg.genreId !== undefined) {
                    setGenreId(cfg.genreId === 'none' ? '' : cfg.genreId);
                }
                if (cfg.optionalPrompt) {
                    setOptionalPrompt(cfg.optionalPrompt);
                }
                if (cfg.parameters) {
                    if (cfg.parameters.length > 0) {
                        setParameters(cfg.parameters.map((p: any) => ({
                            name: p.name,
                            value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value)
                        })));
                    } else {
                        setParameters([{ name: '', value: '' }]);
                    }
                }
            }

            const assistantMessage: ChatMessage = {
                role: 'model',
                text: chatData.reply || "Configuration updated successfully.",
                configSnapshot: chatData.updatedConfig ? {
                    targetMode: chatData.updatedConfig.targetMode || targetMode,
                    targetValue: chatData.updatedConfig.targetValue || targetValue,
                    artStyleId: chatData.updatedConfig.artStyleId || artStyleId,
                    genreId: chatData.updatedConfig.genreId || genreId,
                    parameters: chatData.updatedConfig.parameters || parameters,
                    optionalPrompt: chatData.updatedConfig.optionalPrompt || optionalPrompt
                } : undefined
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsChatLoading(false);

            if (chatData.triggerGeneration) {
                const promptToUse = chatData.updatedConfig?.optionalPrompt || textToSend;
                // Tiny timeout for React state batching
                setTimeout(() => {
                    handleGenerate(!!gameUrl, promptToUse);
                }, 100);
            }
        } catch (err: any) {
            console.error("Failed to send chat message:", err);
            setMessages(prev => [...prev, {
                role: 'model',
                text: `Sorry, I encountered an issue updating the game settings: ${err.message}`
            }]);
            setIsChatLoading(false);
        }
    };

    const handleChatPresetClick = (presetText: string) => {
        handleSendChatMessage(presetText);
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col md:flex-row dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Sidebar Pane (Chat or Form Toggle) */}
            <div className="w-full md:w-[35%] xl:w-[30%] bg-white dark:bg-slate-800 flex flex-col h-full overflow-hidden shrink-0 border-r border-gray-200 dark:border-slate-700/50">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 dark:bg-indigo-400"></span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Game Sandbox</h1>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="p-3 pb-1 shrink-0">
                    <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'chat'
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            AI Assistant
                        </button>
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'form'
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Settings Form
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    
                    {activeTab === 'chat' ? (
                        /* CHAT MODE */
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                            
                            {/* Sync Status Badge Container */}
                            <div className="px-4 py-2 shrink-0">
                                <div className="flex flex-wrap gap-1.5 p-2 bg-indigo-50/40 dark:bg-slate-900/30 rounded-xl border border-indigo-100/30 dark:border-slate-700/30">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-100/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 capitalize">
                                        Target: {targetMode} ({targetValue})
                                    </span>
                                    {artStyleId && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                                            Style: {artStyles.find(a => a.id === artStyleId)?.name || 'Custom'}
                                        </span>
                                    )}
                                    {genreId && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                            Genre: {genres.find(g => g.id === genreId)?.name || 'Custom'}
                                        </span>
                                    )}
                                    {parameters.filter(p => p.name.trim() !== '').length > 0 && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-mono">
                                            Params: {parameters.filter(p => p.name.trim() !== '').length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`py-2.5 px-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                                                msg.role === 'user'
                                                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-gray-200/50 dark:border-slate-600/50 rounded-tl-none'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}

                                {isChatLoading && (
                                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-700/30 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-800 w-[60px] justify-center">
                                        <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Suggestion Starter Grid (only shown initially) */}
                            {messages.length === 1 && !isChatLoading && (
                                <div className="px-4 pb-2 mt-auto shrink-0">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Try these ideas</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Relaxing Garden Sort", prompt: "Create a peaceful garden sorting game targeting relaxation" },
                                            { label: "Reaction Shooter", prompt: "Create a fast reaction shooter targeting reaction time" },
                                            { label: "Memory Matching Game", prompt: "Create a memory cards matching game in pixel art style" },
                                            { label: "Logic Matrix Puzzle", prompt: "Create a logic block puzzle game with sci-fi theme for focus" }
                                        ].map(item => (
                                            <button
                                                key={item.label}
                                                onClick={() => handleChatPresetClick(item.prompt)}
                                                className="text-left p-3 rounded-xl bg-gray-50 hover:bg-indigo-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-700/60 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-sm"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Form */}
                            <div className="p-4 border-t border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 shrink-0">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendChatMessage(chatInput);
                                    }}
                                    className="relative flex items-center"
                                >
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder={isGenerating ? "System generating code..." : "Ask to create, configure, or refine a game..."}
                                        disabled={isChatLoading || isGenerating}
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60 transition-all shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isChatLoading || isGenerating}
                                        className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-40 transition-all shadow cursor-pointer flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </form>
                            </div>

                        </div>
                    ) : (
                        /* FORM MODE */
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            
                            {/* Target Type */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Target Type</label>
                                <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl">
                                    <button
                                        onClick={() => setTargetMode('mood')}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                            targetMode === 'mood'
                                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Mood
                                    </button>
                                    <button
                                        onClick={() => setTargetMode('skill')}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                            targetMode === 'skill'
                                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Skill
                                    </button>
                                </div>
                            </div>

                            {/* Select Target Value */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 capitalize">
                                    Select {targetMode}
                                </label>
                                <select
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {(targetMode === 'mood' ? MOODS : SKILLS).map(opt => (
                                        <option key={opt} value={opt} className="capitalize">{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Model Provider */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Model Provider</label>
                                <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl">
                                    <button
                                        onClick={() => setModelProvider('gemini')}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                            modelProvider === 'gemini'
                                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Gemini
                                    </button>
                                    <button
                                        onClick={() => setModelProvider('ollama')}
                                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                            modelProvider === 'ollama'
                                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Ollama Local
                                    </button>
                                </div>
                            </div>

                            {modelProvider === 'ollama' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        Ollama Model
                                    </label>
                                    <select
                                        value={ollamaModel}
                                        onChange={(e) => setOllamaModel(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="qwen2.5-coder:14b">qwen2.5-coder:14b</option>
                                        <option value="qwen2.5-coder:32b">qwen2.5-coder:32b</option>
                                        <option value="deepseek-coder-v2">deepseek-coder-v2</option>
                                        <option value="llama3.1">llama3.1 (8B)</option>
                                        <option value="codestral">codestral</option>
                                        <option value="llama3.2:3b">llama3.2:3b (Fast)</option>
                                    </select>
                                </div>
                            )}

                            {/* Art Style */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                    Art Style (Optional)
                                </label>
                                <select
                                    value={artStyleId}
                                    onChange={(e) => setArtStyleId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">None / Default</option>
                                    {artStyles.map(style => (
                                        <option key={style.id} value={style.id}>{style.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Genre */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                    Game Genre (Optional)
                                </label>
                                <select
                                    value={genreId}
                                    onChange={(e) => setGenreId(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">None / Default</option>
                                    {genres.map(genre => (
                                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Game Parameters */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                        Game Parameters
                                    </label>
                                    <button
                                        onClick={() => setParameters([...parameters, { name: '', value: '' }])}
                                        type="button"
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 cursor-pointer"
                                    >
                                        + Add Param
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {parameters.map((param, index) => (
                                        <div key={index} className="flex space-x-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Name (e.g. speed)"
                                                value={param.name}
                                                onChange={(e) => {
                                                    const newParams = [...parameters];
                                                    newParams[index].name = e.target.value;
                                                    setParameters(newParams);
                                                }}
                                                className="flex-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white py-1.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value (e.g. 10)"
                                                value={param.value}
                                                onChange={(e) => {
                                                    const newParams = [...parameters];
                                                    newParams[index].value = e.target.value;
                                                    setParameters(newParams);
                                                }}
                                                className="flex-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white py-1.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newParams = parameters.filter((_, i) => i !== index);
                                                    setParameters(newParams.length > 0 ? newParams : [{ name: '', value: '' }]);
                                                }}
                                                type="button"
                                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Optional Prompt */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                    Instructions Prompt
                                </label>
                                <textarea
                                    value={optionalPrompt}
                                    onChange={(e) => setOptionalPrompt(e.target.value)}
                                    placeholder="e.g. Make it a puzzle game with space theme..."
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Manual Build Button */}
                            <button
                                onClick={() => handleGenerate(false)}
                                disabled={isGenerating}
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Building...
                                    </>
                                ) : 'Build Game'}
                            </button>

                        </div>
                    )}

                </div>
            </div>

            {/* Main Content Pane (Terminal Output & Game Preview) */}
            <div className="flex-1 flex flex-col p-5 bg-gray-50 dark:bg-slate-900 overflow-hidden relative">
                {!gameUrl ? (
                    /* Terminal Streaming Output */
                    <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-800">
                        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="text-xs font-mono text-slate-400 ml-2">Sandbox Compiler Console</span>
                            </div>
                            {isGenerating && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            )}
                        </div>
                        <pre
                            ref={outputRef}
                            className="flex-1 p-6 text-sm font-mono text-green-400 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed select-text"
                        >
                            {generationOutput || "Sandbox Ready.\nDescribe your game in the AI Chat panel to start building..."}
                        </pre>
                    </div>
                ) : (
                    /* Generated Game IFrame View */
                    <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden relative border border-gray-200/80 dark:border-slate-700/80">
                        
                        {/* URL / Action Header */}
                        <div className="bg-gray-100 dark:bg-slate-800/80 py-2.5 px-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                            <div className="flex items-center space-x-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                                <span className="text-xs font-mono text-gray-500 dark:text-slate-400 pl-2 truncate max-w-[200px] md:max-w-md">
                                    {gameUrl.split('?')[0].split('/').pop()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={gameUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 transition-all font-semibold shadow-sm"
                                >
                                    Open New Tab
                                </a>
                            </div>
                        </div>

                        {/* Interactive Frame */}
                        <div className="flex-1 w-full bg-black relative overflow-hidden">
                            {currentAdjustment && (
                                <GameAdjustmentBanner
                                    parameterName={currentAdjustment.parameterName}
                                    parameterValue={currentAdjustment.parameterValue}
                                    onDismiss={() => setCurrentAdjustment(null)}
                                />
                            )}
                            <iframe
                                src={gameUrl}
                                title="Generated Game Sandbox"
                                className="absolute inset-0 w-full h-full border-0 select-none"
                                sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                            />
                        </div>

                        {/* Keyboard Tester Instructions */}
                        {adjustmentMappings && (
                            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 shrink-0 overflow-y-auto max-h-[25vh]">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Adjustment Keys (Press 1-9 to Test Parameter Adjustments)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {Object.entries(adjustmentMappings).map(([key, mapping]) => (
                                        <div key={key} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                                            <div className="w-6 h-6 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-gray-800 dark:text-slate-300 shadow-sm shrink-0">
                                                {key}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                    {mapping.description || mapping.parameterName}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-mono truncate">
                                                    {mapping.parameterName}: {JSON.stringify(mapping.value)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Refinement Shortcuts Bar (Under iframe when active) */}
                        <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-3 flex flex-wrap gap-2 shrink-0 items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Improvements:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {['Make it harder', 'Make it easier', 'Add a score counter', 'Improve colors', 'Add a start screen'].map(preset => (
                                    <button
                                        key={preset}
                                        onClick={() => {
                                            setActiveTab('chat');
                                            handleSendChatMessage(`Make the game: ${preset}`);
                                        }}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-100/50 dark:border-indigo-900/30 font-medium transition-all cursor-pointer shadow-sm"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* Token Usage Debug Panel (Fixed overlay or bottom box) */}
                {(tokenUsage || isGenerating) && (
                    <div className="absolute bottom-9 right-9 p-3 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur max-w-[200px] shrink-0 text-[10px]">
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider mb-2">LLM Token Usage</h3>
                        {tokenUsage ? (
                            <div className="space-y-1 font-mono text-slate-300">
                                <div className="flex justify-between">
                                    <span>Input:</span>
                                    <span className="text-indigo-400 font-semibold">{tokenUsage.promptTokenCount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Output:</span>
                                    <span className="text-green-400 font-semibold">{tokenUsage.candidatesTokenCount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-1 mt-1 font-bold">
                                    <span>Total:</span>
                                    <span className="text-white">{tokenUsage.totalTokenCount?.toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-slate-400 animate-pulse font-mono">Streaming response...</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GameSandboxPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <GameSandboxContent />
        </Suspense>
    );
}

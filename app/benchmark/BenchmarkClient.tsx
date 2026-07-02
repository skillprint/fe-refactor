'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBenchmarkData } from './hooks/useBenchmarkData';
import { useSubmitBenchmarkSurvey } from './hooks/useSubmitBenchmarkSurvey';
import DynamicScatterPlot from './components/DynamicScatterPlot';
import LeaderboardTable from './components/LeaderboardTable';
import GameCards from './components/GameCards';
import VLMAgentSimulator from './components/VLMAgentSimulator';

export default function BenchmarkClient() {
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [selectedModelId, setSelectedModelId] = useState<string | null>('claude-3-7-sonnet-reasoning');
  const [launchGame, setLaunchGame] = useState<string>('hextris');
  const [launchMood, setLaunchMood] = useState<string>('focus');
  const [disableSdk, setDisableSdk] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-game survey state
  const [showPreGameSurvey, setShowPreGameSurvey] = useState(false);
  const [pendingLaunchConfig, setPendingLaunchConfig] = useState<{ withAdjustments: boolean; url: string } | null>(null);
  const [preGameRating, setPreGameRating] = useState<number | null>(null);

  // Post-game survey state
  const isPostGameSurvey = searchParams.get('postGameSurvey') === 'true';
  const postGameGameSlug = searchParams.get('gameSlug') || '';
  const postGameMood = searchParams.get('mood') || 'focus';

  const [showPostGameSurvey, setShowPostGameSurvey] = useState(isPostGameSurvey);
  const [postGameResponse, setPostGameResponse] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Effect to update post-game survey visibility if query parameters change
  useEffect(() => {
    if (searchParams.get('postGameSurvey') === 'true') {
      setShowPostGameSurvey(true);
      setSurveyCompleted(false);
      setPostGameResponse(null);
    }
  }, [searchParams]);

  // Load benchmark dataset
  const { models, scatterData, stats, simulatorSteps } = useBenchmarkData(gameFilter, moodFilter);

  // Hook for submitting post-game surveys to backend
  const { submitSurvey, isLoading: isSubmittingSurvey, error: submitError } = useSubmitBenchmarkSurvey();

  // Set default model if the current selection is somehow empty
  const activeModel = useMemo(() => {
    return models.find((m) => m.id === selectedModelId) || models[0];
  }, [models, selectedModelId]);

  // Adjust simulator game target based on filter (simulate hextris if 'all' is selected)
  const simulatorGameId = gameFilter === 'all' ? 'hextris' : gameFilter;

  const handleSelectModel = (id: string) => {
    setSelectedModelId(id);
  };

  const handleLaunchGame = (withAdjustments: boolean) => {
    localStorage.setItem('targetMood', launchMood);
    let url = `/benchmark/play/${launchGame}?adjustments=${withAdjustments}&source=benchmark`;
    if (disableSdk) {
      url += `&sdk=false`;
    }
    if (withAdjustments) {
      url += `&use_ai=true`;
    }
    setPendingLaunchConfig({ withAdjustments, url });
    setPreGameRating(null); // Reset rating selection
    
    // Bypassing pre-game survey for now: routing directly
    router.push(url);
    // setShowPreGameSurvey(true);
  };

  const handlePreGameSubmit = () => {
    if (preGameRating !== null && pendingLaunchConfig) {
      // Save pre-game score
      const key = `preGameSurvey_${launchGame}_${launchMood}`;
      localStorage.setItem(key, preGameRating.toString());
      localStorage.setItem('lastPreGameMood', launchMood);
      localStorage.setItem('lastPreGameRating', preGameRating.toString());
      setShowPreGameSurvey(false);
      router.push(pendingLaunchConfig.url);
    }
  };

  const handlePostGameSubmit = async () => {
    if (postGameResponse !== null) {
      // Map response to 1-5 rating: yes -> 5, not_sure -> 3, no -> 1
      let moodRating = 3;
      if (postGameResponse === 'yes') moodRating = 5;
      if (postGameResponse === 'no') moodRating = 1;

      // Extract sessionId from searchParams (fallback to random UUID if not present)
      const sessionId = searchParams.get('sessionId') || crypto.randomUUID();

      try {
        await submitSurvey({
          sessionId,
          moodRating
        });

        // Save post-game feedback
        const key = `postGameSurvey_${postGameGameSlug}_${postGameMood}`;
        localStorage.setItem(key, postGameResponse);
        
        // Calculate shifts (just mock logs for analytics dashboard)
        const prevRating = localStorage.getItem('lastPreGameRating');
        const prevMood = localStorage.getItem('lastPreGameMood');
        console.log(`Survey result: Mood ${postGameMood} pre-rating was ${prevRating}, post-response is ${postGameResponse}`);
        
        setSurveyCompleted(true);
      } catch (err) {
        console.error('Failed to submit benchmark survey:', err);
      }
    }
  };

  const handleClosePostGameSurvey = () => {
    setShowPostGameSurvey(false);
    // Remove query parameters from URL
    router.replace('/benchmark/static');
  };

  const getMoodLabel = (mood: string) => {
    if (mood.toLowerCase() === 'focus') return 'Focus';
    if (mood.toLowerCase() === 'relax' || mood.toLowerCase() === 'colorize-2' || mood.toLowerCase() === 'colorize') return 'Relaxation';
    if (mood.toLowerCase() === 'creativity') return 'Creativity';
    return mood;
  };

  const getGameDisplayName = (slug: string) => {
    if (slug === 'hextris') return 'Hextris';
    if (slug === 'colorize-2' || slug === 'colorize') return 'Colorize';
    if (slug === 'box-tower') return 'Box Tower';
    return slug;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-16 space-y-8 animate-in fade-in duration-500">

      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-slate-900/40 border-b border-slate-900/80 py-12 md:py-16">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[20%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-[700px]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Skillprint Telemetry
                </span>
                <span className="text-[10px] bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  V1.0 Live
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                The AI Game-Agent Benchmark
              </h1>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                Assessing popular Vision-Language Models (VLMs) and reasoning agents on how they play Skillprint's game catalog. Scoring is derived from Skillprint's real-time VLM cognitive assessment system.
              </p>
            </div>

            {/* <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sandbox"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 transition-all hover:scale-[1.01]"
              >
                Launch Sandbox
              </Link>
              <a
                href="#leaderboard"
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                View Leaderboard
              </a>
            </div> */}
          </div>

          {/* Sub Navigation Tabs */}
          {/* <div className="flex items-center gap-5 text-xs text-slate-400 font-bold border-t border-slate-900 mt-8 pt-4">
            <span className="text-white border-b-2 border-indigo-500 pb-4 -mb-4">Overview</span>
            <a href="#simulator" className="hover:text-white transition-colors">VLM Agent Simulator</a>
            <a href="#games" className="hover:text-white transition-colors">Games Catalog</a>
            <a href="#leaderboard" className="hover:text-white transition-colors">Leaderboard Breakdown</a>
            <a href="#docs" className="hover:text-white transition-colors">Docs & SDK</a>
          </div> */}
        </div>
      </div>


      {/* Main Grid Wrapper */}
      <div className="max-w-[1200px] mx-auto px-6 space-y-8">

        {/* Post-game Survey Card (Modal popup) */}
        {showPostGameSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Glow effect */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />

              <button
                onClick={handleClosePostGameSurvey}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {isSubmittingSurvey ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-200">
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring outer */}
                    <div className="absolute w-14 h-14 rounded-full border-2 border-indigo-500/20 animate-ping" />
                    {/* Spinner inner */}
                    <svg className="animate-spin h-10 w-10 text-indigo-500 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider animate-pulse">
                      Submitting Survey...
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Saving shift telemetry to the registry
                    </p>
                  </div>
                </div>
              ) : !surveyCompleted ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                      Post-Game Evaluation
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-white">
                      Welcome back! How did it go?
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Now that you've finished playing <strong className="text-indigo-400">{getGameDisplayName(postGameGameSlug)}</strong>, do you feel your target mood/skill (<strong className="text-indigo-400">{getMoodLabel(postGameMood)}</strong>) has improved?
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full">
                    {[
                      { val: 'yes', label: 'Yes', icon: (
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )},
                      { val: 'not_sure', label: 'Not Sure', icon: (
                        <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )},
                      { val: 'no', label: 'No', icon: (
                        <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setPostGameResponse(opt.val)}
                        className={`aspect-square rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          postGameResponse === opt.val
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/5 scale-105'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {submitError && (
                    <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl text-center">
                      Failed to submit: {submitError.message || 'Unknown error'}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t border-slate-950">
                    <button
                      onClick={handleClosePostGameSurvey}
                      className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePostGameSubmit}
                      disabled={postGameResponse === null}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 transition-all text-center cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">
                      Feedback Received
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-white font-sans">Thank you for playtesting!</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your responses have been saved. This mindset shift telemetry contributes directly to evaluating the cognitive benefits of AI game-state parameters.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-950">
                    <button
                      onClick={handleClosePostGameSurvey}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all text-center cursor-pointer"
                    >
                      Close & Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Playtest Arena Section */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Live Assessment Playtest Arena</h2>
              <p className="text-xs text-slate-400 mt-1">
                Launch a live playtest in the Skillprint sandbox with your choice of target cognitive dimension.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              {/* Game Selection Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Select Game</label>
                <select
                  value={launchGame}
                  onChange={(e) => setLaunchGame(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer h-[38px]"
                >
                  <option value="hextris">Hextris (Focus emphasis)</option>
                  <option value="colorize-2">Colorize (Relax emphasis)</option>
                  <option value="box-tower">Box Tower (Creativity emphasis)</option>
                </select>
              </div>

              {/* Mood/Skill Selection Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Select Target Mood/Skill</label>
                <select
                  value={launchMood}
                  onChange={(e) => setLaunchMood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer h-[38px]"
                >
                  <option value="focus">Focus</option>
                  <option value="relax">Relax</option>
                  <option value="creativity">Creativity</option>
                </select>
              </div>

              {/* SDK Integration Option */}
              {/* <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Telemetry</label>
                <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer text-xs text-slate-300 hover:text-white transition-colors h-[38px]">
                  <input
                    type="checkbox"
                    checked={disableSdk}
                    onChange={(e) => setDisableSdk(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 h-4 w-4 cursor-pointer"
                  />
                  <span className="select-none font-semibold">Disable SDK</span>
                </label>
              </div> */}
            </div>

            {/* Play CTA Buttons (Full Width on a New Line) */}
            <div className="flex flex-col md:flex-row gap-4 w-full pt-2">
              <button
                onClick={() => handleLaunchGame(true)}
                className="group flex-1 h-20 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-98 flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <svg className="w-6 h-6 text-indigo-200 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span>Play w/ AI</span>
              </button>
              <button
                onClick={() => handleLaunchGame(false)}
                className="group flex-1 h-20 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-98 flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H4v4M2 12h20M6 12v4a2 2 0 002 2h8a2 2 0 002-2v-4M10 15h4" />
                </svg>
                <span>Play w/o AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sortable Leaderboard Grid */}
        <div id="leaderboard" className="pt-4">
          <LeaderboardTable
            models={models}
            selectedModelId={selectedModelId}
            onSelectModel={handleSelectModel}
            activeGame={gameFilter}
            activeMood={moodFilter}
          />
        </div>

        {/* Filters Controls Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/30 border border-slate-900 rounded-2xl gap-4">
          <div className="flex flex-wrap items-center gap-4">

            {/* Game Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Benchmark Game</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
                {['all', 'colorize', 'hextris', 'box_tower'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGameFilter(g)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${gameFilter === g
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {g === 'all' ? 'All Games' : g.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cognitive Dimension</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
                {['all', 'relax', 'focus', 'creativity'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMoodFilter(m)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${moodFilter === m
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    {m === 'all' ? 'All Moods' : m}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Evaluation Context</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">
              Active: {gameFilter === 'all' ? 'All Games' : gameFilter.replace('_', ' ')} / {moodFilter === 'all' ? 'All Dimensions' : moodFilter}
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Evaluated Models</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.totalModels}</div>
            <span className="text-[10px] text-slate-400 mt-1">Reasoning + Visual systems</span>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Move Cost</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">${stats.avgCost.toFixed(2)}</div>
            <span className="text-[10px] text-slate-400 mt-1">Per 100 game operations</span>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Aligned System</span>
            <div className="text-sm font-extrabold text-white mt-1.5 truncate">{stats.bestModel}</div>
            <span className="text-[10px] text-emerald-400 font-bold mt-1 font-mono">{stats.bestScore}% Overall</span>
          </div>

          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peak Vision Rate</span>
            <div className="text-sm font-extrabold text-white mt-1.5 truncate">{stats.fastestModel}</div>
            <span className="text-[10px] text-sky-400 font-bold mt-1 font-mono">{stats.highestFPS} FPS Scanning</span>
          </div>

        </div>

        {/* Charts & Interactive Simulation Arena */}
        <div id="simulator" className="w-full">
          <DynamicScatterPlot
            data={scatterData}
            selectedModelId={selectedModelId}
            onSelectModel={handleSelectModel}
          />
        </div>

        {/* Games Catalog Section */}
        <div id="games" className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Evaluated Game Catalog</h2>
            <p className="text-xs text-slate-500">
              Each game targets specific cognitive abilities, triggering unique gameplay strategies from AI agents.
            </p>
          </div>
          <GameCards
            activeGame={gameFilter === 'all' ? 'hextris' : gameFilter}
            onSelectGame={(gameId) => setGameFilter(gameId)}
          />
        </div>

        {/* Explanations & FAQ Footer Section */}
        <div id="docs" className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-900 pt-10">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Understanding the AI-Human Gap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Skillprint's benchmark does not just record high scores. Instead, we measure the efficiency of learning and adjustment. Real intelligence is defined as achieving a high cognitive alignment score (Relax, Focus, Creativity) with minimal VLM tokens and computing overhead.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Base LLMs often play by taking snapshots at fixed intervals, resulting in high latency and low feedback precision. Vision-Agents react dynamically to screen shifts at 4+ FPS, while Reasoning systems (e.g. DeepSeek R1) output chain-of-thought strategy paths before key inputs.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Methodology & Verification</h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5">
              <li>
                <strong>Gameplay Sandbox Integration:</strong> Models are deployed into iframe sandboxes using the Skillprint Unity/Cocos SDKs.
              </li>
              <li>
                <strong>Screen Stream Processing:</strong> The agent VLM scans the gameplay interface 2 to 8 times per second, receiving active coordinates.
              </li>
              <li>
                <strong>State-Space Action Density:</strong> Standardised move costs are calculated based on model API pricing per input token.
              </li>
              <li>
                <strong>Score Recalibration:</strong> Human baselines are calculated by averaging gameplay data of verified human cohorts in the exact same environments.
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Pre-game Survey Modal */}
      {showPreGameSurvey && pendingLaunchConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Glow effect */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Mindset Check-In
                </span>
                <span className="text-[10px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Pre-Game
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white">
                  How is your focus, relaxation or creativity right now?
                </h3>
                <p className="text-xs text-slate-400">
                  On a scale of 1 to 5, rate your current level of <strong className="text-indigo-400">{getMoodLabel(launchMood)}</strong>:
                </p>
              </div>

              {/* Rating options 1-5 */}
              <div className="flex justify-between items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPreGameRating(val)}
                    className={`w-12 h-12 rounded-xl border text-sm font-bold font-mono transition-all flex items-center justify-center cursor-pointer ${
                      preGameRating === val
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/25 scale-105'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 font-semibold font-mono">
                <span>1 - Low {getMoodLabel(launchMood)}</span>
                <span>5 - Peak {getMoodLabel(launchMood)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-950">
                <button
                  onClick={() => setShowPreGameSurvey(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePreGameSubmit}
                  disabled={preGameRating === null}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/15 transition-all text-center cursor-pointer"
                >
                  Start Playtest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

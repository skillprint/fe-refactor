'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBenchmarkData } from './hooks/useBenchmarkData';
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

  // Load benchmark dataset
  const { models, scatterData, stats, simulatorSteps } = useBenchmarkData(gameFilter, moodFilter);

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
    let url = `/game/${launchGame}?adjustments=${withAdjustments}`;
    if (disableSdk) {
      url += `&sdk=false`;
    }
    router.push(url);
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
                <span>Play with AI</span>
              </button>
              <button
                onClick={() => handleLaunchGame(false)}
                className="group flex-1 h-20 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-98 flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H4v4M2 12h20M6 12v4a2 2 0 002 2h8a2 2 0 002-2v-4M10 15h4" />
                </svg>
                <span>Play without AI</span>
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
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { mapSlugToGamePath } from '../../game/[slug]/GameClient';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SkillprintClient, Mood, Adjustment, SkillScores, MoodScores } from '../../lib/skillprintSdk';
import AnalysisResultsModule from './AnalysisResultsModule';
import FlowStateModule from './FlowStateModule';
import { getApiBaseUrl } from '../../utils/cookieUtils';
import { unifiedSlugFromBESlug, mapLocalGameSlugToServerGameSlug } from '../../utils/slugUtils';
import { getGameCatalogDetail } from '../../api/api';

const getApiKey = () => {
  return process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
};

interface LogEntry {
  time: string;
  timestamp: number;
  level: string;
  message: string;
}

export default function AiGuideClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const gameQuery = searchParams.get('game');
  const moodQuery = searchParams.get('mood');

  const [selectedGame, setSelectedGame] = useState(gameQuery || 'hextris');
  const [selectedMood, setSelectedMood] = useState<string>(moodQuery || Mood.FOCUS);
  const [sessionId, setSessionId] = useState<string>('');
  const [isSessionClosedOnBackend, setIsSessionClosedOnBackend] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'Disconnected' | 'Active'>('Disconnected');
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [skillScores, setSkillScores] = useState<SkillScores | undefined>(undefined);
  const [skillScoresHistory, setSkillScoresHistory] = useState<{ timestamp: number; scores: SkillScores }[]>([]);
  const [moodScores, setMoodScores] = useState<MoodScores | undefined>(undefined);
  const [moodScoresHistory, setMoodScoresHistory] = useState<{ timestamp: number; scores: MoodScores }[]>([]);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);
  const [gameMetadata, setGameMetadata] = useState<any>(null);

  // Sync state to URL
  useEffect(() => {
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    let changed = false;
    
    if (selectedGame && currentParams.get('game') !== selectedGame) {
      currentParams.set('game', selectedGame);
      changed = true;
    }
    
    if (selectedMood && currentParams.get('mood') !== selectedMood) {
      currentParams.set('mood', selectedMood);
      changed = true;
    }
    
    if (changed) {
      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
    }
  }, [selectedGame, selectedMood, pathname, router, searchParams]);

  const sessionEndedRef = useRef(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<SkillprintClient | null>(null);
  const shouldPollRef = useRef(false);
  const processedAdjustmentsRef = useRef(new Set<string>());
  const sessionStartedRef = useRef(false);
  const sessionFailedRef = useRef(false);

  // Initialize SDK and Session
  useEffect(() => {
    setSessionId('');
    setConnectionStatus('Disconnected');
    setAdjustments([]);
    setLogs([]);
    setSkillScores(undefined);
    setSkillScoresHistory([]);
    setMoodScores(undefined);
    setMoodScoresHistory([]);
    setIsSessionEnded(false);
    setIsSessionStarted(false);
    setIsSessionClosedOnBackend(false);
    sessionEndedRef.current = false;
    processedAdjustmentsRef.current.clear();
    shouldPollRef.current = false;
    sessionStartedRef.current = false;
    sessionFailedRef.current = false;

    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);

    const client = new SkillprintClient({
      apiKey: getApiKey(),
      baseUrl: getApiBaseUrl(),
      logger: (msg, level) => {
        const date = new Date();
        const time = date.toLocaleTimeString();
        const timestamp = date.getTime();
        setLogs(prev => [{ time, timestamp, level, message: msg }, ...prev].slice(0, 100));
      }
    });
    clientRef.current = client;

    return () => {
      shouldPollRef.current = false;
    };
  }, [selectedGame]);

  // Fetch Game Metadata
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const serverSlug = mapLocalGameSlugToServerGameSlug(selectedGame);
        const game = await getGameCatalogDetail(serverSlug);
        if (isMounted) {
          setGameMetadata(game);
          
          const validTargets: string[] = [];
          if (game?.moods) validTargets.push(...game.moods.map((m: any) => m.slug));
          if (game?.skills) validTargets.push(...game.skills.map((s: any) => s.slug));

          if (validTargets.length > 0) {
            setSelectedMood((currentMood) => {
              if (!validTargets.includes(currentMood)) {
                return validTargets[0];
              }
              return currentMood;
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch game metadata", e);
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [selectedGame]);

  const pollSessionResults = async (client: SkillprintClient, sid: string) => {
    const poll = async () => {
      if (!shouldPollRef.current) return;
      try {
        const res = await client.pollParameterResults(sid);
        if (!shouldPollRef.current) return;

        if (res && (res.state === "OPEN" || res.state === "CLOSED")) {
          setConnectionStatus('Active');

          if (res.skillScores) {
            setSkillScores(res.skillScores);
            setSkillScoresHistory(prev => [...prev, { timestamp: Date.now(), scores: res.skillScores! }]);
          }
          if (res.moodScores) {
            setMoodScores(res.moodScores);
            setMoodScoresHistory(prev => [...prev, { timestamp: Date.now(), scores: res.moodScores! }]);
          }

          if (res.telemetry && res.telemetry.length > 0) {
            const newAdjustments = [...res.telemetry]
              .sort((a, b) => new Date(b.adjustment.createDate).getTime() - new Date(a.adjustment.createDate).getTime())
              .map(t => t.adjustment)
              .filter(adj => {
                const id = `${adj.gameSlug}-${adj.createDate}-${adj.parameterName}`;
                if (!processedAdjustmentsRef.current.has(id)) {
                  processedAdjustmentsRef.current.add(id);
                  // Forward to iframe
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({ type: 'ADJUST_GAME', data: adj }, '*');
                  }
                  return true;
                }
                return false;
              });

            if (newAdjustments.length > 0) {
              setAdjustments(prev => [...newAdjustments, ...prev].slice(0, 20));
            }
          }

          if (res.state === "CLOSED") {
            setIsSessionClosedOnBackend(true);
            shouldPollRef.current = false;
            setConnectionStatus('Disconnected');
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }
      if (shouldPollRef.current) {
        setTimeout(poll, 2000);
      }
    };
    setTimeout(poll, 2000);
  };

  // Iframe Message Listener
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      let eventData = event.data;
      if (typeof eventData === 'string') {
        try {
          eventData = JSON.parse(eventData);
        } catch (e) { }
      }

      const type = eventData?.type || eventData?.messageType;

      let isGameStart = false;
      if (selectedGame === 'hextris') {
        if (type === 'gameState' && eventData?.data?.gameState === 1) {
          isGameStart = true;
        }
      } else if (selectedGame === '2048') {
        // 2048 defaults to starting upon load, so we can trigger on the first screenshot 
        if (
          type === 'screenshot' ||
          type === 'skillprint_keydown' ||
          type === 'skillprint_mousedown'
        ) {
          isGameStart = true;
        }
      } else {
        if (
          type === 'skillprint_keydown' ||
          type === 'skillprint_mousedown' ||
          (type === 'gameEvent' && (eventData?.event === 'LEVEL_START' || eventData?.event === 'LEVEL_RESTART'))
        ) {
          isGameStart = true;
        }
      }

      if (isGameStart && !sessionStartedRef.current && !sessionFailedRef.current && clientRef.current && sessionId) {
        sessionStartedRef.current = true;
        setIsSessionStarted(true);
        try {
          const serverSlug = mapLocalGameSlugToServerGameSlug(selectedGame);
          await clientRef.current.startSession(sessionId, selectedMood, serverSlug);
          shouldPollRef.current = true;
          pollSessionResults(clientRef.current, sessionId);
        } catch (e) {
          console.error('Failed to start session', e);
          sessionStartedRef.current = false;
          setIsSessionStarted(false);
          sessionFailedRef.current = true;
        }
      }

      if (type === 'screenshot' && clientRef.current && sessionId && sessionStartedRef.current) {
        if (sessionEndedRef.current) return;
        try {
          // Some games send dataUrl directly, some nest it in data.dataUrl, some send it as data
          const base64String = eventData.dataUrl || eventData.data?.dataUrl || eventData.data;

          if (!base64String || typeof base64String !== 'string') {
            console.warn('Invalid screenshot data format received:', eventData);
            return;
          }

          clientRef.current.setLastScreenshotDataURI(base64String);
          const res = await fetch(base64String);
          const blob = await res.blob();
          clientRef.current.postScreenshots(sessionId, [blob]);
        } catch (e) {
          console.error("Failed to process screenshot", e);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sessionId, selectedGame]);

  const handleIframeLoad = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        const script = doc.createElement('script');
        script.src = '/lib/skillprint-js-sdk/main-manager.js';
        doc.body.appendChild(script);
      }
      iframeRef.current.contentWindow?.postMessage({ type: 'GAME_RESUME' }, '*');
    }
  };

  const handleEndGame = async () => {
    setIsSessionEnded(true);
    sessionEndedRef.current = true;

    if (clientRef.current && sessionId) {
      try {
        await clientRef.current.postScreenshots(sessionId, [], true);
      } catch (e) {
        console.error('Failed to post final screenshot chunk', e);
      }
    }
  };

  const getAdjustmentTrend = (adj: Adjustment, index: number) => {
    const prev = adjustments.slice(index + 1).find(a => a.parameterName === adj.parameterName);
    let arrow = '→';
    let color = 'var(--mint-400)';

    if (prev) {
      const currentVal = typeof adj.parameterValue === 'string' ? parseFloat(adj.parameterValue) : Number(adj.parameterValue);
      const prevVal = typeof prev.parameterValue === 'string' ? parseFloat(prev.parameterValue) : Number(prev.parameterValue);
      if (!isNaN(currentVal) && !isNaN(prevVal)) {
        if (currentVal > prevVal) {
          arrow = '↑';
          color = 'var(--mint-400)';
        } else if (currentVal < prevVal) {
          arrow = '↓';
          color = 'var(--error-400)';
        } else {
          arrow = '→';
          color = 'var(--ui-muted)';
        }
      }
    }
    return { arrow, color };
  };

  let sessionStatus = 'Not Started';
  if (isSessionClosedOnBackend) {
    sessionStatus = 'Closed';
  } else if (isSessionEnded) {
    sessionStatus = 'Closing';
  } else if (isSessionStarted) {
    sessionStatus = 'Open';
  }

  let statusColor = '#9ca3af'; // gray-400
  if (sessionStatus === 'Open') statusColor = '#4ade80'; // green-400 (mint)
  else if (sessionStatus === 'Closing') statusColor = '#eab308'; // yellow-500

  return (
    <div className="page scrollbar-subtle page--portal margin-none text-default font-ui leading-base min-h-screen bg-gray-900" data-theme="dark">
      <div className="portal-app w-full max-w-none px-4 md:px-8 py-8">
        <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-blue-400" style={{ fontSize: '2rem' }}>AI Guide</h1>
            <p className="text-gray-400 mt-2">Diagnostic environment for game adjustments and AI interaction.</p>
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Select Game</h2>
            <div className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-lg p-1 pr-3 shadow-sm">
              <img
                src={`/images/activities/covers/${selectedGame === 'hextris' ? 'Hextris' : selectedGame}.png`}
                alt={selectedGame}
                className="w-8 h-8 rounded"
                style={{ objectFit: 'cover' }}
              />
              <select
                className="bg-transparent text-white text-lg font-bold h-8 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                disabled={isSessionStarted}
              >
                <option value="hextris">Hextris</option>
                <option value="box-tower">Box Tower</option>
                <option value="2048">2048</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Target</span>
              <select
                className="bg-transparent font-medium uppercase outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--violet-400)' }}
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                disabled={isSessionStarted || (!gameMetadata?.moods && !gameMetadata?.skills)}
              >
                {!gameMetadata ? (
                  <option value={selectedMood} className="bg-gray-800 text-white">Loading...</option>
                ) : (
                  <>
                    {gameMetadata.moods && gameMetadata.moods.length > 0 && (
                      <optgroup label="Moods" className="bg-gray-900 text-gray-400 font-bold">
                        {gameMetadata.moods.map((mood: any) => (
                          <option key={mood.slug} value={mood.slug} className="bg-gray-800 text-white font-normal">
                            {mood.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {gameMetadata.skills && gameMetadata.skills.length > 0 && (
                      <optgroup label="Skills" className="bg-gray-900 text-gray-400 font-bold">
                        {gameMetadata.skills.map((skill: any) => (
                          <option key={skill.slug} value={skill.slug} className="bg-gray-800 text-white font-normal">
                            {skill.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                )}
              </select>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Session ID</span>
              <span className="font-mono text-gray-300" style={{ fontSize: '0.75rem' }}>{sessionId || 'Initializing...'}</span>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Status</span>
              <span className="flex items-center gap-2" style={{ color: statusColor }}>
                <span className="relative flex h-2 w-2">
                  {sessionStatus === 'Open' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: statusColor }}></span>
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: statusColor }}></span>
                </span>
                {sessionStatus}
              </span>
            </div>
          </div>
        </header>

        <div className="flex justify-between gap-8 w-full items-start">

          {/* Left Column: Parameter Adjustments */}
          <aside className="w-[350px] flex-shrink-0 flex flex-col gap-8">
            {/* Parameter Adjustments Panel */}
            <div className="sp-card card--interactive relative overflow-visible p-4 flex flex-col mt-3" style={{ maxHeight: '812px' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full z-30 border border-gray-700 shadow-md whitespace-nowrap">
                Parameter Adjustments
              </div>
              <div className="layout-grid gap-md overflow-y-auto pr-2 scrollbar-subtle flex-grow mt-4 relative">
                {selectedParameter ? (
                  <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-violet-400 capitalize">{selectedParameter} Trend</h3>
                      <button
                        onClick={() => setSelectedParameter(null)}
                        className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider bg-gray-800 px-2 py-1 rounded border border-gray-700 hover:bg-gray-700"
                      >
                        ← Back
                      </button>
                    </div>

                    <div className="flex-grow w-full min-h-[200px]">
                      {(() => {
                        const paramHistory = adjustments
                          .filter(a => a.parameterName === selectedParameter)
                          .sort((a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime());

                        return paramHistory.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={paramHistory.map(h => ({
                              time: new Date(h.createDate).toLocaleTimeString(),
                              value: typeof h.parameterValue === 'string' ? parseFloat(h.parameterValue) || 0 : Number(h.parameterValue) || 0
                            }))}>
                              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6b7280' }} width={30} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                                itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                              />
                              <Line
                                type="linear"
                                dataKey="value"
                                stroke="#a78bfa"
                                strokeWidth={2}
                                dot={(props: any) => {
                                  const isLast = props.index === paramHistory.length - 1;
                                  if (isLast && isSessionClosedOnBackend) {
                                    return <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
                                  }
                                  if (props.index % 5 === 0 || isLast) {
                                    return <circle key={props.index} cx={props.cx} cy={props.cy} r={1.5} fill={props.stroke} stroke="none" />;
                                  }
                                  return null;
                                }}
                                activeDot={{ r: 3, fill: '#a78bfa' }}
                                isAnimationActive={true}
                                animateNewValues={true}
                                animationDuration={300}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500 text-xs italic">
                            Waiting for trend data...
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <>
                    {adjustments.length === 0 ? (
                      <p className="text-muted font-sm italic margin-none">No adjustments received yet.</p>
                    ) : (
                      <div className="layout-grid gap-2">
                        {adjustments
                          .filter((adj, index, self) => index === self.findIndex(a => a.parameterName === adj.parameterName))
                          .map((adj) => {
                            const originalIndex = adjustments.indexOf(adj);
                            const { arrow, color } = getAdjustmentTrend(adj, originalIndex);
                            return (
                              <div
                                key={adj.parameterName}
                                onClick={() => setSelectedParameter(adj.parameterName)}
                                className="sp-panel tone tone--violet px-3 py-2 radius-compact opacity-90 flex justify-between items-center cursor-pointer hover:opacity-100 hover:bg-violet-900/20 transition-all border border-transparent hover:border-violet-500/30"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold">{adj.parameterName}</span>
                                </div>
                                <span className="font-semibold text-sm font-mono" style={{ color }}>{arrow} {adj.parameterValue}</span>
                              </div>
                            );
                          })
                        }
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* SDK Logs Panel */}
            <div className="sp-card card--interactive relative overflow-visible p-4 flex flex-col max-h-[400px] mt-3">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full z-30 border border-gray-700 shadow-md whitespace-nowrap">
                SDK Logs
              </div>
              <div className="overflow-y-auto flex-grow scrollbar-subtle pr-2 bg-gray-900 rounded p-2 border border-gray-800 mt-4">
                {logs.length === 0 && (
                  <p className="text-muted font-sm italic margin-none p-2">Waiting for SDK events...</p>
                )}
                <table className="w-full text-xs font-mono text-left" style={{ borderSpacing: '0 4px', borderCollapse: 'separate' }}>
                  <tbody>
                    {logs.slice().sort((a, b) => b.timestamp - a.timestamp).map((log, i) => (
                      <tr key={i} className="align-top">
                        <td className="pr-3 whitespace-nowrap text-gray-500">{log.time}</td>
                        <td className="pr-3 whitespace-nowrap align-middle">
                          <div
                            className={`w-2 h-2 rounded-full inline-block ${log.level === 'error' ? 'bg-red-500' : log.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            title={log.level.toUpperCase()}
                          />
                        </td>
                        <td className="text-gray-300 break-words">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </aside>

          {/* Middle Column: Game Frame */}
          <div className="flex-shrink-0 flex flex-col items-center mt-3">
            <div className="relative">
              <div className="relative w-[375px] h-[812px] bg-black rounded-xl overflow-hidden shadow-2xl flex-shrink-0" style={{ outline: '1px solid var(--border-subtle)', transform: 'scale(1)' }}>
                {isSessionEnded && (
                  <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="text-center p-4 bg-gray-900/80 rounded-lg border border-gray-700">
                      {!isSessionClosedOnBackend ? (
                        <>
                          <h3 className="text-white text-xl font-bold mb-2 flex items-center justify-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            Processing...
                          </h3>
                          <p className="text-gray-300 text-sm">Waiting for final results.</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-white text-xl font-bold mb-2">Session Ended</h3>
                          <p className="text-gray-300 text-sm">Final results are displayed.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  onLoad={handleIframeLoad}
                  src={mapSlugToGamePath(selectedGame)}
                  className="w-full h-full border-0 absolute inset-0 z-10"
                  title={`${selectedGame} Game`}
                />
              </div>
            </div>

            <div className="w-full max-w-[375px] mt-6 flex justify-center">
              <button
                onClick={handleEndGame}
                disabled={!isSessionStarted || isSessionEnded || connectionStatus !== 'Active'}
                className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg border transition-all duration-500 uppercase tracking-wider text-sm
                  ${!isSessionStarted
                    ? 'bg-gray-800 text-gray-500 border-gray-700 scale-95 opacity-50'
                    : isSessionEnded
                      ? 'bg-red-900/50 text-red-200/50 border-red-900 scale-100 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white border-red-500 scale-100 shadow-red-900/20 shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                  }`}
              >
                {isSessionEnded ? 'Session Ended' : 'End Session'}
              </button>
            </div>
          </div>

          {/* Right Column: Diagnostics */}
          <aside className="w-[450px] flex flex-col gap-lg flex-shrink-0" style={{ height: '812px' }}>

            {/* Flow State Module */}
            <FlowStateModule moodScores={moodScores} moodScoresHistory={moodScoresHistory} isSessionClosed={isSessionClosedOnBackend} />

            {/* Individual Skills Module */}
            <AnalysisResultsModule 
              skillScores={skillScores} 
              skillScoresHistory={skillScoresHistory} 
              isSessionClosed={isSessionClosedOnBackend} 
              gameSkills={gameMetadata?.skills}
            />

          </aside>

        </div>
      </div>
    </div>
  );
}

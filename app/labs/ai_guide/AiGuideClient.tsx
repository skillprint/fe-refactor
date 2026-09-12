'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, CSSProperties } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { mapSlugToGamePath } from '../../game/[slug]/GameClient';
import { SkillprintClient, Mood, Adjustment, SkillScores, MoodScores } from '../../lib/skillprintSdk';
import { getApiBaseUrl } from '../../utils/cookieUtils';
import { mapLocalGameSlugToServerGameSlug } from '../../utils/slugUtils';
import { getGameCatalogDetail } from '../../api/api';
import { useTheme } from '../../components/ThemeProvider';
import { ConsoleIcon } from '@/components/LiveConsole/ConsoleIcon';
import { CardHead, CardLede, CardNote } from '@/components/LiveConsole/ConsoleCard';
import { FlowHero } from '@/components/LiveConsole/FlowHero';
import { SkillList } from '@/components/LiveConsole/SkillList';
import { TrendChart, TrendLegend, TrendSeries } from '@/components/LiveConsole/TrendChart';
import { AnalysisLog, LogEntry } from '@/components/LiveConsole/AnalysisLog';
import {
  toPercent,
  toPercentDelta,
  trendKey,
  TREND_GLYPH,
  formatSkillName,
  formatClock,
  formatDuration,
} from '@/components/LiveConsole/scores';

const getApiKey = () => process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';

interface GameOption {
  slug: string;
  name: string;
  art: string;
  hint: string;
}

const GAMES: GameOption[] = [
  { slug: 'hextris', name: 'Hextris', art: '/assets/images/games/game-hextris.svg', hint: 'Arrow keys rotate the hexagon. P pauses.' },
  { slug: 'box-tower', name: 'Box Tower', art: '/assets/images/games/game-box-tower.svg', hint: 'Tap or click to drop each box.' },
  { slug: '2048', name: '2048', art: '/images/activities/covers/2048.png', hint: 'Arrow keys slide the tiles.' },
  { slug: 'simon-says', name: 'Simon Says', art: '/assets/images/games/game-simon-says.svg', hint: 'Watch the sequence, then click the tiles back in order.' },
];

const FLOW_SERIES: TrendSeries[] = [
  { key: 'flow', label: 'Flow score', colour: 'var(--violet)' },
  { key: 'confidence', label: 'Confidence', colour: 'var(--mint)' },
];

const SKILL_SERIES: TrendSeries[] = [
  { key: 'score', label: 'Score', colour: 'var(--violet)' },
  { key: 'trend', label: 'Trend', colour: 'var(--mint)' },
  { key: 'confidence', label: 'Confidence', colour: 'var(--orange)' },
];

const PARAM_SERIES: TrendSeries[] = [{ key: 'value', label: 'Value', colour: 'var(--violet)' }];

const apiHost = () => {
  try {
    return new URL(getApiBaseUrl()).host;
  } catch {
    return getApiBaseUrl();
  }
};

export default function AiGuideClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const gameQuery = searchParams.get('game');
  const moodQuery = searchParams.get('mood');

  const [selectedGame, setSelectedGame] = useState(gameQuery || 'hextris');
  const [selectedMood, setSelectedMood] = useState<string>(moodQuery || Mood.FOCUS);
  const [sessionId, setSessionId] = useState<string>('');
  const [runKey, setRunKey] = useState(0);
  const [consoleOpen, setConsoleOpen] = useState(false);
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
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [trendTab, setTrendTab] = useState<'flow' | 'skills'>('flow');
  const [gameMetadata, setGameMetadata] = useState<any>(null);
  const [framesCaptured, setFramesCaptured] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [closedAt, setClosedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [keyShown, setKeyShown] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [flash, setFlash] = useState(false);

  const sessionEndedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<SkillprintClient | null>(null);
  const shouldPollRef = useRef(false);
  const processedAdjustmentsRef = useRef(new Set<string>());
  const sessionStartedRef = useRef(false);
  const sessionFailedRef = useRef(false);

  const game = GAMES.find(g => g.slug === selectedGame) || GAMES[0];
  const serverSlug = mapLocalGameSlugToServerGameSlug(selectedGame);
  const gamePath = mapSlugToGamePath(selectedGame);

  const addLog = useCallback((message: string, level: string = 'info') => {
    const date = new Date();
    setLogs(prev => [{ time: date.toLocaleTimeString(), timestamp: date.getTime(), level, message }, ...prev].slice(0, 200));
  }, []);

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

  // Initialise the SDK and a fresh session id for every run
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
    setSelectedParameter(null);
    setFramesCaptured(0);
    setStartedAt(null);
    setClosedAt(null);
    setGameLoaded(false);
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
      logger: (msg, level) => addLog(msg, level),
    });
    clientRef.current = client;

    return () => {
      shouldPollRef.current = false;
    };
  }, [selectedGame, runKey, addLog]);

  // Game metadata: the moods and skills the target picker offers
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const detail = await getGameCatalogDetail(mapLocalGameSlugToServerGameSlug(selectedGame));
        if (isMounted) {
          setGameMetadata(detail);
          const validTargets: string[] = [];
          if (detail?.moods) validTargets.push(...detail.moods.map((m: any) => m.slug));
          if (detail?.skills) validTargets.push(...detail.skills.map((s: any) => s.slug));
          if (validTargets.length > 0) {
            setSelectedMood(current => (validTargets.includes(current) ? current : validTargets[0]));
          }
        }
      } catch (e) {
        console.error('Failed to fetch game metadata', e);
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [selectedGame]);

  // The clock for the session's duration
  useEffect(() => {
    if (!startedAt || closedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, closedAt]);

  useEffect(() => {
    if (isSessionClosedOnBackend && !closedAt) setClosedAt(Date.now());
  }, [isSessionClosedOnBackend, closedAt]);

  const pollSessionResults = (client: SkillprintClient, sid: string) => {
    const poll = async () => {
      if (!shouldPollRef.current) return;
      try {
        const res = await client.pollParameterResults(sid);
        if (!shouldPollRef.current) return;

        if (res && (res.state === 'OPEN' || res.state === 'CLOSED')) {
          setConnectionStatus('Active');

          if (res.skillScores) {
            setSkillScores(res.skillScores);
            setSkillScoresHistory(prev => [...prev, { timestamp: Date.now(), scores: res.skillScores! }]);
            setFlash(true);
            setTimeout(() => setFlash(false), 900);
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
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({ type: 'ADJUST_GAME', data: adj }, '*');
                  }
                  return true;
                }
                return false;
              });

            if (newAdjustments.length > 0) {
              setAdjustments(prev => [...newAdjustments, ...prev].slice(0, 200));
              newAdjustments.forEach(adj => addLog(`Game adjusted: ${adj.parameterName} → ${adj.parameterValue}`, 'success'));
            }
          }

          if (res.state === 'CLOSED') {
            setIsSessionClosedOnBackend(true);
            shouldPollRef.current = false;
            setConnectionStatus('Disconnected');
            addLog('The API closed the session. Final results are in.', 'success');
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
      if (shouldPollRef.current) {
        setTimeout(poll, 2000);
      }
    };
    setTimeout(poll, 2000);
  };

  // Messages from the game frame
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      let eventData = event.data;
      if (typeof eventData === 'string') {
        try {
          eventData = JSON.parse(eventData);
        } catch (e) { /* not JSON */ }
      }

      const type = eventData?.type || eventData?.messageType;

      let isGameStart = false;
      if (selectedGame === 'hextris') {
        if (type === 'gameState' && eventData?.data?.gameState === 1) isGameStart = true;
      } else if (selectedGame === '2048') {
        if (type === 'screenshot' || type === 'skillprint_keydown' || type === 'skillprint_mousedown') isGameStart = true;
      } else if (
        type === 'skillprint_keydown' ||
        type === 'skillprint_mousedown' ||
        (type === 'gameEvent' && (eventData?.event === 'LEVEL_START' || eventData?.event === 'LEVEL_RESTART'))
      ) {
        isGameStart = true;
      }

      if (isGameStart && !sessionStartedRef.current && !sessionFailedRef.current && clientRef.current && sessionId) {
        sessionStartedRef.current = true;
        setIsSessionStarted(true);
        setStartedAt(Date.now());
        try {
          await clientRef.current.startSession(sessionId, selectedMood, mapLocalGameSlugToServerGameSlug(selectedGame));
          shouldPollRef.current = true;
          pollSessionResults(clientRef.current, sessionId);
        } catch (e) {
          console.error('Failed to start session', e);
          sessionStartedRef.current = false;
          setIsSessionStarted(false);
          setStartedAt(null);
          sessionFailedRef.current = true;
          addLog('The session could not be opened with the API.', 'error');
        }
      }

      if (type === 'screenshot' && clientRef.current && sessionId && sessionStartedRef.current) {
        if (sessionEndedRef.current) return;
        try {
          const base64String = eventData.dataUrl || eventData.data?.dataUrl || eventData.data;
          if (!base64String || typeof base64String !== 'string') {
            console.warn('Invalid screenshot data format received:', eventData);
            return;
          }
          setFramesCaptured(n => n + 1);
          clientRef.current.setLastScreenshotDataURI(base64String);
          const res = await fetch(base64String);
          const blob = await res.blob();
          clientRef.current.postScreenshots(sessionId, [blob]);
        } catch (e) {
          console.error('Failed to process screenshot', e);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, selectedGame, selectedMood]);

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
    setGameLoaded(true);
    addLog(`${game.name} loaded in the frame. The session opens with the API when play starts.`);
  };

  const handleStart = (event: React.FormEvent) => {
    event.preventDefault();
    setConsoleOpen(true);
    addLog(`Console opened for ${game.name}, target ${targetLabel}.`);
  };

  const handleEndGame = async () => {
    setIsSessionEnded(true);
    sessionEndedRef.current = true;
    addLog('Ending the session: sending the final batch.', 'success');
    if (clientRef.current && sessionId) {
      try {
        await clientRef.current.postScreenshots(sessionId, [], true);
      } catch (e) {
        console.error('Failed to post final screenshot chunk', e);
        addLog('The final batch could not be sent.', 'error');
      }
    }
  };

  const handleExit = () => {
    shouldPollRef.current = false;
    setConsoleOpen(false);
    setRunKey(k => k + 1);
  };

  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Could not copy the session id', e);
    }
  };

  const isLight = theme === 'light';
  const toggleTheme = () => setTheme(isLight ? 'dark' : 'light');

  // ---- Derived readouts --------------------------------------------------

  const targetLabel = useMemo(() => {
    const mood = gameMetadata?.moods?.find((m: any) => m.slug === selectedMood);
    if (mood) return mood.name as string;
    const skill = gameMetadata?.skills?.find((s: any) => s.slug === selectedMood);
    if (skill) return skill.name as string;
    return selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1);
  }, [gameMetadata, selectedMood]);

  const skillNames = useMemo(() => {
    const names: Record<string, string> = {};
    (gameMetadata?.skills || []).forEach((s: any) => {
      names[s.slug] = s.name;
      names[s.slug.replace(/-/g, '_')] = s.name;
    });
    return names;
  }, [gameMetadata]);

  const metrics = skillScores?.metrics;
  const skillKeys = useMemo(() => Object.keys(metrics || {}), [metrics]);
  const activeSkill = selectedSkill && skillKeys.includes(selectedSkill) ? selectedSkill : skillKeys[0] || '';

  let sessionStatus: 'Not started' | 'Open' | 'Closing' | 'Closed' = 'Not started';
  if (isSessionClosedOnBackend) sessionStatus = 'Closed';
  else if (isSessionEnded) sessionStatus = 'Closing';
  else if (isSessionStarted) sessionStatus = 'Open';

  const live = !consoleOpen
    ? { label: 'Idle', tone: 'neutral' }
    : sessionStatus === 'Open'
      ? { label: 'Live', tone: 'success' }
      : sessionStatus === 'Closing'
        ? { label: 'Closing', tone: 'warning' }
        : sessionStatus === 'Closed'
          ? { label: 'Closed', tone: 'neutral' }
          : { label: 'Waiting for play', tone: 'neutral' };

  const stageStatus =
    sessionStatus === 'Open'
      ? { tone: 'success', text: 'Session open. Frames are going to the scoring API.' }
      : sessionStatus === 'Closing'
        ? { tone: 'info', text: 'Final batch sent. Waiting for the API to close the session.' }
        : sessionStatus === 'Closed'
          ? { tone: 'success', text: 'Session closed. Final results are displayed.' }
          : sessionFailedRef.current
            ? { tone: 'danger', text: 'The session could not be opened with the API.' }
            : { tone: 'info', text: gameLoaded ? 'Start playing to open the session.' : 'Loading the game.' };

  const latestAdjustment = adjustments[0];
  const uniqueParameters = useMemo(
    () => adjustments.filter((adj, index, self) => index === self.findIndex(a => a.parameterName === adj.parameterName)),
    [adjustments],
  );
  const activeParameter = selectedParameter && uniqueParameters.some(p => p.parameterName === selectedParameter)
    ? selectedParameter
    : uniqueParameters[0]?.parameterName || null;

  const parameterTrend = (adj: Adjustment) => {
    const index = adjustments.indexOf(adj);
    const prev = adjustments.slice(index + 1).find(a => a.parameterName === adj.parameterName);
    if (!prev) return 'flat' as const;
    const cur = Number(adj.parameterValue);
    const before = Number(prev.parameterValue);
    if (!Number.isFinite(cur) || !Number.isFinite(before)) return 'flat' as const;
    return cur > before ? ('up' as const) : cur < before ? ('down' as const) : ('flat' as const);
  };

  const parameterData = useMemo(() => {
    if (!activeParameter) return [];
    return adjustments
      .filter(a => a.parameterName === activeParameter)
      .sort((a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime())
      .map(a => ({ time: formatClock(a.createDate), value: Number(a.parameterValue) || 0 }));
  }, [adjustments, activeParameter]);

  const flowData = useMemo(
    () => moodScoresHistory.map(h => ({
      time: formatClock(h.timestamp),
      flow: Math.round(toPercent(h.scores.flowScore)),
      confidence: Math.round(toPercent(h.scores.confidence)),
    })),
    [moodScoresHistory],
  );

  const skillData = useMemo(() => {
    if (!activeSkill) return [];
    return skillScoresHistory.map(h => {
      const m = h.scores.metrics?.[activeSkill];
      return {
        time: formatClock(h.timestamp),
        score: Math.round(toPercent(m?.score)),
        trend: Math.round(toPercentDelta(m?.trend, m?.score) * 10) / 10,
        confidence: Math.round(toPercent(m?.confidence)),
      };
    });
  }, [skillScoresHistory, activeSkill]);

  const lastScoredAt = skillScores?.analyzedAt ? formatClock(skillScores.analyzedAt) : null;
  const duration = startedAt ? formatDuration((closedAt ?? now) - startedAt) : '—';
  const environment = apiHost();

  const gameArt = (
    <img className="aa-stage__art" src={game.art} width={380} height={210} alt="" />
  );

  return (
    <div className="page--adaptive-assist" data-skillprint-page="adaptive-assist" data-session-state={consoleOpen ? 'live' : 'idle'}>
      <a className="skip-link" href="#dashboard">Skip to the dashboard</a>

      <header className="sp-nav sp-nav--sticky aa-topbar">
        <div className="sp-nav__inner">
          <a className="sp-nav__brand sp-nav__brand--labelled" href="/labs/ai_guide" aria-label="Skillprint AI Guide">
            <img className="brand-logo brand-logo--dark" src="/assets/logos/skillprint-logo-developer-dark.svg" width={168} height={34} alt="Skillprint" />
            <img className="brand-logo brand-logo--light" src="/assets/logos/skillprint-logo-developer-light.svg" width={168} height={34} alt="Skillprint" />
            <span className="sp-nav__divider" aria-hidden="true" />
            <span className="sp-page-label sp-page-label--nav">AI Guide</span>
          </a>
          <div className="sp-nav__actions">
            <span className="ui-badge ui-badge--pill ui-badge--md ui-badge--leading aa-live" data-badge-tone={live.tone} role="status">
              <span className="ui-badge__dot" aria-hidden="true" />
              <span>{live.label}</span>
            </span>
            <button className="icon-button" type="button" onClick={toggleTheme} aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'} title="Toggle colour mode">
              <ConsoleIcon name={isLight ? 'moon' : 'sun'} />
            </button>
          </div>
        </div>
      </header>

      <main className="aa-main" id="top">
        <div className="aa-container" id="dashboard">
          <h1 className="sr-only">AI Guide</h1>

          {/* Idle: the start panel */}
          {!consoleOpen && (
            <section className="aa-start" aria-labelledby="startTitle">
              <form className="sp-card" onSubmit={handleStart} noValidate>
                <CardHead as="h2" id="startTitle" icon="play" title="Start a session">
                  <span className="ui-badge ui-badge--pill" data-badge-tone="brand">{game.name}</span>
                </CardHead>
                <div className="aa-card__body">
                  <p className="aa-start__lede">
                    Play while Skillprint watches. Every second a frame of the game goes to the scoring API, which sends back skill and flow scores and adjusts the game as you play.
                  </p>

                  <div className="aa-start__fields">
                    <div className="field">
                      <label htmlFor="aaGame">Game</label>
                      <select id="aaGame" value={selectedGame} onChange={e => setSelectedGame(e.target.value)}>
                        {GAMES.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="aaTarget">Target</label>
                      <select
                        id="aaTarget"
                        value={selectedMood}
                        onChange={e => setSelectedMood(e.target.value)}
                        disabled={!gameMetadata?.moods && !gameMetadata?.skills}
                      >
                        {!gameMetadata ? (
                          <option value={selectedMood}>Loading…</option>
                        ) : (
                          <>
                            {gameMetadata.moods?.length > 0 && (
                              <optgroup label="Moods">
                                {gameMetadata.moods.map((mood: any) => <option key={mood.slug} value={mood.slug}>{mood.name}</option>)}
                              </optgroup>
                            )}
                            {gameMetadata.skills?.length > 0 && (
                              <optgroup label="Skills">
                                {gameMetadata.skills.map((skill: any) => <option key={skill.slug} value={skill.slug}>{skill.name}</option>)}
                              </optgroup>
                            )}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <details className="aa-key-box">
                    <summary className="aa-key-box__summary">
                      <span className="aa-key-box__title"><ConsoleIcon name="key" />API key</span>
                      <span className="aa-key-box__state">Using the key from this build&apos;s environment</span>
                      <span className="aa-tech__action"><span>Show</span><ConsoleIcon name="chevron-down" className="aa-tech__chevron" /></span>
                    </summary>
                    <div className="field aa-key">
                      <label htmlFor="apiKey" className="sr-only">API key</label>
                      <div className="aa-key__control">
                        <input id="apiKey" type={keyShown ? 'text' : 'password'} value={getApiKey()} readOnly autoComplete="off" spellCheck={false} />
                        <button
                          className="button button--secondary button--icon-only button--md aa-key__reveal"
                          type="button"
                          onClick={() => setKeyShown(v => !v)}
                          aria-pressed={keyShown}
                          aria-label={keyShown ? 'Hide API key' : 'Show API key'}
                          title="Show or hide the key"
                        >
                          <ConsoleIcon name={keyShown ? 'eye-off' : 'eye'} className="sp-icon--sm" />
                        </button>
                      </div>
                      <p className="aa-field__hint">
                        Sent as <code className="inline-code">Authorization: Api-Key …</code> on every request to <span className="aa-mono">{environment}</span>. Set with <code className="inline-code">NEXT_PUBLIC_API_KEY</code>.
                      </p>
                    </div>
                  </details>

                  <div className="sp-alert sp-alert--compact" data-alert-tone="info" role="status" aria-live="polite">
                    <ConsoleIcon name="info" className="sp-icon--sm sp-alert__icon" />
                    <div className="sp-alert__body">
                      <p className="sp-alert__text">Ready to start {game.name} with the target {targetLabel}. The session opens with the API the moment play begins.</p>
                    </div>
                  </div>

                  <button className="button button--primary button--lg full-width" type="submit">
                    <ConsoleIcon name="play" />Start {game.name}
                  </button>
                </div>
              </form>

              <aside className="sp-card" aria-labelledby="loopTitle">
                <CardHead as="h2" id="loopTitle" icon="bolt" title="What happens when you press Start" />
                <ol className="aa-loop">
                  <li><span><strong>Play</strong>{game.name} opens beside the live scores. {game.hint}</span></li>
                  <li><span><strong>Capture</strong>One frame a second goes to the scoring API as the game reports it.</span></li>
                  <li><span><strong>Score</strong>Flow and skill scores fill in as each batch is analysed, usually within a minute.</span></li>
                  <li><span><strong>Adapt</strong>When the API changes a game parameter, the new value is sent straight into the game.</span></li>
                </ol>
                <dl className="aa-kv aa-start__facts">
                  <div><dt>Game</dt><dd>{serverSlug}</dd></div>
                  <div><dt>Game frame</dt><dd>{gamePath}</dd></div>
                  <div><dt>Target</dt><dd>{selectedMood}</dd></div>
                  <div><dt>Session id</dt><dd>{sessionId || '—'}</dd></div>
                  <div><dt>API</dt><dd>{environment}</dd></div>
                </dl>
              </aside>
            </section>
          )}

          {/* Live: the session */}
          {consoleOpen && (
            <section className="aa-session" aria-labelledby="sessionTitle">
              <h2 className="sr-only" id="sessionTitle">Live session</h2>

              <div className="aa-layout">
                <article className="sp-card aa-stage" aria-labelledby="stageTitle">
                  <div className="aa-card__head aa-stage__head">
                    <h3 className="aa-card__title aa-stage__title" id="stageTitle">{gameArt}<span>{game.name}</span></h3>
                    <div className="aa-card__tools aa-stage__tools">
                      <span className="ui-badge ui-badge--pill" data-badge-tone="brand">Target · {targetLabel}</span>
                      <button
                        className="button button--danger button--sm"
                        type="button"
                        onClick={handleEndGame}
                        disabled={!isSessionStarted || isSessionEnded || connectionStatus !== 'Active'}
                      >
                        <ConsoleIcon name="pause" />{isSessionEnded ? 'Session ended' : 'End session'}
                      </button>
                      <button className="button button--secondary button--sm aa-stage__exit" type="button" onClick={handleExit}>
                        <ConsoleIcon name="logout" />Exit game
                      </button>
                    </div>
                  </div>

                  <div className="aa-stage__bar" role="region" aria-label="Session counters">
                    <dl className="aa-stats">
                      <div className="aa-stat" title="Frames captured from the game, one a second">
                        <dt><ConsoleIcon name="camera" />Frames captured</dt><dd>{framesCaptured}</dd>
                      </div>
                      <div className="aa-stat" title="Score readings the API has returned for this session">
                        <dt>Score updates</dt><dd>{skillScoresHistory.length}<small>{skillKeys.length} skills</small></dd>
                      </div>
                      <div className="aa-stat" title="Game parameters the API has changed during this session">
                        <dt>Game adjustments</dt><dd>{adjustments.length}</dd>
                      </div>
                    </dl>
                    <div className="aa-status" data-alert-tone={stageStatus.tone} role="status" aria-live="polite">
                      <ConsoleIcon name={stageStatus.tone === 'danger' ? 'error' : stageStatus.tone === 'success' ? 'success' : 'info'} />
                      <span>{stageStatus.text}</span>
                    </div>
                    <div className="aa-stage__links">
                      <span className="ui-badge ui-badge--pill ui-badge--leading" data-badge-tone={gameLoaded ? 'success' : 'neutral'}>
                        <span className="ui-badge__dot" aria-hidden="true" />
                        <span>{gameLoaded ? 'Game ready' : 'Game loading'}</span>
                      </span>
                      <a className="button button--tertiary button--xs" href={gamePath} target="_blank" rel="noopener">
                        Open game<ConsoleIcon name="external" />
                      </a>
                    </div>
                  </div>

                  <div className="aa-stage__frame aa-stage__frame--phone">
                    <iframe ref={iframeRef} onLoad={handleIframeLoad} src={gamePath} title={`${game.name} game`} allowFullScreen />
                    {isSessionEnded && (
                      <div className="aa-stage__veil" data-state={isSessionClosedOnBackend ? 'closed' : 'closing'}>
                        <div className="aa-stage__ready">
                          {!isSessionClosedOnBackend ? (
                            <>
                              <span className="button button--secondary button--sm" aria-busy="true">Processing the final batch</span>
                              <span className="aa-stage__ready-hint">Waiting for the API to return the final results.</span>
                            </>
                          ) : (
                            <>
                              <span className="button button--secondary button--sm">Session ended</span>
                              <span className="aa-stage__ready-hint">Final results are displayed.</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="aa-stage__foot">
                    <span className="aa-stage__hint">{game.hint} The game changes as the API sends new settings.</span>
                    <span className={latestAdjustment ? 'aa-adjust is-fresh' : 'aa-adjust'} title="The latest game setting the API changed">
                      <span className="ui-label">Latest change</span>
                      <span className="aa-adjust__text">{latestAdjustment ? `${latestAdjustment.parameterName} → ${latestAdjustment.parameterValue}` : 'None yet'}</span>
                      {latestAdjustment && <span className="aa-adjust__time">{formatClock(latestAdjustment.createDate)}</span>}
                    </span>
                  </div>
                </article>

                <aside className="sp-card aa-panel" aria-labelledby="scoresTitle">
                  <CardHead id="scoresTitle" icon="trending" title="Live scores">
                    <span className="ui-badge ui-badge--pill">{skillKeys.length} {skillKeys.length === 1 ? 'skill' : 'skills'}</span>
                  </CardHead>
                  <CardLede>What the scoring API reads from the play, updated as each batch of frames is scored. Scores run from 0 to 100.</CardLede>
                  <FlowHero flowScore={moodScores?.flowScore} confidence={moodScores?.confidence} targetLabel={targetLabel} hasReading={!!moodScores} />
                  <div className="aa-skill-list__head" aria-hidden="true"><span>Skill</span><span>Score</span><span>Trend</span></div>
                  <SkillList metrics={metrics} names={skillNames} flash={flash} />
                  <CardNote>{lastScoredAt ? `Last scored at ${lastScoredAt} after ${skillScores?.numChunksAnalyzed ?? 0} batches.` : 'Nothing scored yet.'}</CardNote>
                </aside>
              </div>

              <div className="aa-details">
                <article className="sp-card aa-speed" aria-labelledby="paramsTitle">
                  <CardHead id="paramsTitle" icon="adjust" title="Parameter adjustments">
                    <span className="ui-badge ui-badge--pill">{adjustments.length} {adjustments.length === 1 ? 'change' : 'changes'}</span>
                  </CardHead>
                  <CardLede>Game settings the API has changed during this session. Pick a parameter to see how it moved.</CardLede>
                  <div className="aa-speed__body">
                    <dl className="aa-speed__stats">
                      <div><dt>Latest</dt><dd>{latestAdjustment ? `${latestAdjustment.parameterValue}` : '—'}</dd></div>
                      <div><dt>Parameters changed</dt><dd>{uniqueParameters.length}</dd></div>
                    </dl>
                    {uniqueParameters.length === 0 ? (
                      <div className="aa-chart">
                        <p className="aa-chart__empty">The API has not changed any game parameter yet.</p>
                      </div>
                    ) : (
                      <>
                        <div className="aa-param-list" role="group" aria-label="Parameters changed">
                          {uniqueParameters.map(adj => {
                            const key = parameterTrend(adj);
                            return (
                              <button
                                key={adj.parameterName}
                                type="button"
                                className="aa-param-row"
                                aria-pressed={activeParameter === adj.parameterName}
                                onClick={() => setSelectedParameter(adj.parameterName)}
                              >
                                <span className="aa-param-row__name">{adj.parameterName}</span>
                                <span className="aa-param-row__value aa-trend" data-trend={key}>
                                  <ConsoleIcon name={TREND_GLYPH[key]} />{String(adj.parameterValue)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <TrendChart data={parameterData} series={PARAM_SERIES} isClosed={isSessionClosedOnBackend} emptyText="Waiting for changes to this parameter." />
                      </>
                    )}
                  </div>
                </article>

                <article className="sp-card aa-analysis" aria-labelledby="trendsTitle">
                  <CardHead id="trendsTitle" icon="chart" title="Score trends">
                    <div className="button-group aa-tabs" role="tablist" aria-label="Score trends">
                      <button
                        className={trendTab === 'flow' ? 'button-group__item is-current' : 'button-group__item'}
                        type="button"
                        role="tab"
                        id="flowTabButton"
                        aria-controls="flowTab"
                        aria-selected={trendTab === 'flow'}
                        onClick={() => setTrendTab('flow')}
                      >
                        Flow state
                      </button>
                      <button
                        className={trendTab === 'skills' ? 'button-group__item is-current' : 'button-group__item'}
                        type="button"
                        role="tab"
                        id="skillsTabButton"
                        aria-controls="skillsTab"
                        aria-selected={trendTab === 'skills'}
                        onClick={() => setTrendTab('skills')}
                      >
                        Skills
                      </button>
                    </div>
                  </CardHead>
                  <CardLede>How the readings moved over the session, one point per scored batch.</CardLede>
                  {trendTab === 'flow' ? (
                    <div className="aa-analysis__panel" id="flowTab" role="tabpanel" aria-labelledby="flowTabButton" style={{ padding: 0 }}>
                      <TrendLegend series={FLOW_SERIES} />
                      <TrendChart data={flowData} series={FLOW_SERIES} domain={[0, 100]} isClosed={isSessionClosedOnBackend} emptyText="Flow readings appear here after the first scored batch." />
                    </div>
                  ) : (
                    <div className="aa-analysis__panel" id="skillsTab" role="tabpanel" aria-labelledby="skillsTabButton" style={{ padding: 0 }}>
                      <div className="aa-select-row">
                        <div className="field">
                          <label htmlFor="aaSkill" className="sr-only">Skill</label>
                          <select id="aaSkill" value={activeSkill} onChange={e => setSelectedSkill(e.target.value)} disabled={!skillKeys.length}>
                            {skillKeys.length === 0 ? <option value="">No skills scored yet</option> : skillKeys.map(k => <option key={k} value={k}>{formatSkillName(k, skillNames)}</option>)}
                          </select>
                        </div>
                      </div>
                      <TrendLegend series={SKILL_SERIES} />
                      <TrendChart data={skillData} series={SKILL_SERIES} isClosed={isSessionClosedOnBackend} emptyText="Skill readings appear here after the first scored batch." />
                    </div>
                  )}
                  <CardNote>{skillScoresHistory.length ? `${skillScoresHistory.length} readings so far.` : 'Waiting for the first scored batch.'}</CardNote>
                </article>

                <article className="sp-card aa-record" aria-labelledby="recordTitle">
                  <CardHead id="recordTitle" icon="database" title="This session">
                    <span className="ui-badge ui-badge--pill" data-badge-tone={sessionStatus === 'Open' ? 'success' : sessionStatus === 'Closing' ? 'warning' : 'neutral'}>{sessionStatus}</span>
                  </CardHead>
                  <CardLede>The session as the console tracks it, refreshed with every poll of the API.</CardLede>
                  <div className="aa-record__id">
                    <span className="ui-label">Session id</span>
                    <span className="aa-record__value">
                      <code className="aa-mono">{sessionId || '—'}</code>
                      <button className="button button--tertiary button--xs aa-copy" type="button" onClick={copySessionId} aria-label="Copy the session id">
                        <ConsoleIcon name="copy" /><span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </span>
                  </div>
                  <dl className="aa-kv aa-record__facts">
                    <div><dt>Game</dt><dd>{serverSlug}</dd></div>
                    <div><dt>Target</dt><dd>{selectedMood}</dd></div>
                    <div><dt>API</dt><dd>{environment}</dd></div>
                    <div><dt>Connection</dt><dd>{connectionStatus}</dd></div>
                    <div><dt>Frames captured</dt><dd>{framesCaptured}</dd></div>
                    <div><dt>Settings changed</dt><dd>{adjustments.length}</dd></div>
                    <div><dt>Batches scored</dt><dd>{skillScores?.numChunksAnalyzed ?? 0}</dd></div>
                    <div><dt>Last scored at</dt><dd>{lastScoredAt || '—'}</dd></div>
                    <div><dt>Started</dt><dd>{startedAt ? formatClock(startedAt) : '—'}</dd></div>
                    <div><dt>Duration</dt><dd>{duration}</dd></div>
                  </dl>
                  <CardNote>Polled from the scoring API every two seconds while the session is open.</CardNote>
                </article>
              </div>

              <details className="aa-tech">
                <summary className="aa-tech__summary">
                  <span className="aa-tech__title"><ConsoleIcon name="terminal" />Technical details</span>
                  <span className="aa-tech__meta">For engineers: the full skill table, the latest batch as returned and the SDK log ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})</span>
                  <span className="aa-tech__action"><span>Expand</span><ConsoleIcon name="chevron-down" className="aa-tech__chevron" /></span>
                </summary>
                <div className="aa-tech__body">
                  <article className="sp-card aa-skills" aria-labelledby="skillsTitle">
                    <CardHead id="skillsTitle" icon="bolt" title="Skill scores in full">
                      <span className="aa-card__meta">{lastScoredAt ? `Last scored at ${lastScoredAt}.` : 'Nothing scored yet.'}</span>
                    </CardHead>
                    <div className="table-scroll">
                      <table className="sp-table aa-table">
                        <thead>
                          <tr><th scope="col">Skill</th><th scope="col">Score</th><th scope="col">Trend</th><th scope="col">Confidence</th><th scope="col">Consistency</th><th scope="col">Momentum</th><th scope="col">Volatility</th></tr>
                        </thead>
                        <tbody>
                          {skillKeys.length === 0 ? (
                            <tr className="aa-table__placeholder"><td colSpan={7}>Skill data will appear here after processing…</td></tr>
                          ) : (
                            skillKeys
                              .slice()
                              .sort((a, b) => toPercent(metrics![b].score) - toPercent(metrics![a].score))
                              .map(key => {
                                const m = metrics![key];
                                const score = toPercent(m.score);
                                const delta = toPercentDelta(m.trend, m.score);
                                const t = trendKey(delta);
                                return (
                                  <tr key={key} className={flash ? 'is-updated' : undefined}>
                                    <td className="aa-table__skill">{formatSkillName(key, skillNames)}</td>
                                    <td data-label="Score">
                                      <span className="aa-table__score">
                                        <span>{score.toFixed(1)}</span>
                                        <span className="sp-progress" aria-hidden="true" style={{ '--progress': `${Math.round(score)}%` } as CSSProperties}>
                                          <span className="sp-progress__track"><span className="sp-progress__fill" /></span>
                                        </span>
                                      </span>
                                    </td>
                                    <td data-label="Trend"><span className="aa-trend" data-trend={t}><ConsoleIcon name={TREND_GLYPH[t]} /><span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}</span></span></td>
                                    <td data-label="Confidence">{toPercent(m.confidence).toFixed(1)}</td>
                                    <td data-label="Consistency">{toPercent(m.consistency).toFixed(1)}</td>
                                    <td data-label="Momentum">{Number(m.momentum ?? 0).toFixed(2)}</td>
                                    <td data-label="Volatility">{Number(m.volatility ?? 0).toFixed(2)}</td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="sp-card aa-analysis" aria-labelledby="batchTitle">
                    <CardHead id="batchTitle" icon="chart" title="Latest batch, as scored" />
                    <CardLede>The raw flow result the model returned for the most recent batch of frames.</CardLede>
                    <div className="aa-analysis__panel">
                      {!moodScores ? (
                        <p className="aa-placeholder">Flow metrics will appear here after processing…</p>
                      ) : (
                        <dl className="aa-kv">
                          <div><dt>Flow score</dt><dd>{Number(moodScores.flowScore ?? 0).toFixed(3)}</dd></div>
                          <div><dt>Confidence</dt><dd>{Number(moodScores.confidence ?? 0).toFixed(3)}</dd></div>
                          <div><dt>Target mood</dt><dd>{moodScores.targetMood || selectedMood}</dd></div>
                          <div><dt>Analysed at</dt><dd>{skillScores?.analyzedAt ? formatClock(skillScores.analyzedAt) : '—'}</dd></div>
                          <div><dt>Batches analysed</dt><dd>{skillScores?.numChunksAnalyzed ?? 0}</dd></div>
                        </dl>
                      )}
                    </div>
                    <CardNote>The live scores above blend these over the whole session.</CardNote>
                  </article>

                  <AnalysisLog entries={logs} onClear={() => setLogs([])} />
                </div>
              </details>
            </section>
          )}
        </div>
      </main>

      <footer className="aa-foot">
        <div className="aa-foot__inner">
          <span>© 2026 Skillprint · AI Guide</span>
          <span className="sp-product-tag" data-product="signal">
            <span className="sp-product-tag__icon" aria-hidden="true"><ConsoleIcon name="code" /></span>
            <span className="sp-product-tag__copy"><span className="sp-product-tag__audience">AI Labs</span><span className="sp-product-tag__name">Signal</span></span>
          </span>
        </div>
      </footer>
    </div>
  );
}

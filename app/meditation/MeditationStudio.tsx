'use client';

import { GoogleLogin } from '@react-oauth/google';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserSession } from '../hooks/useUserSession';
import { googlePicture, signInWithGoogle } from '../../lib/models/portal/googleSignIn';
import {
  generator, GENERATOR_URL, GeneratorError, Job, Pacing, RenderResult, Voice, VoiceCatalog, waitForJob,
} from '../../lib/models/meditation/generator';
import {
  DEFAULT_VISUAL, Meditation, meditationApi, MeditationApiError, PaletteName, VisualSettings, VisualStyle, visualSettings,
} from '../../lib/models/meditation/meditationApi';
import MeditationVisual, { PALETTES } from './components/MeditationVisual';
import VoicePanel from './components/VoicePanel';
import './meditation.css';

const SAMPLE_SCRIPT = `Welcome. Find a comfortable position, and let your hands rest wherever they feel at ease. [breathe]

Gently close your eyes, or soften your gaze toward the floor. Notice the weight of your body, supported by whatever is beneath you. [pause 4s]

Take a slow breath in through your nose. [pause 4] And let it go, slowly, through your mouth. [breathe]

With each breath out, let your shoulders drop a little lower. There is nothing you need to do right now. [pause 6]

When you are ready, bring a little movement back into your fingers, and open your eyes.`;

const DEFAULT_PACING: Pacing = { sentencePause: 1.2, paragraphPause: 3, breathSeconds: 6, leadIn: 2, tail: 4 };
const PREVIEW_LINE = 'Take a slow, gentle breath in. And let it go.';
const DRAFT_KEY = 'meditation-studio-draft';

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds && seconds !== 0) return '–';
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

interface Draft {
  title: string;
  description: string;
  script: string;
  voiceId: string;
  language: string;
  tempo: number;
  pacing: Pacing;
  visual: VisualSettings;
}

function loadDraft(): Partial<Draft> {
  try {
    return JSON.parse(window.localStorage.getItem(DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
}

type GeneratorState = 'checking' | 'online' | 'offline';

export default function MeditationStudio() {
  const { userToken } = useUserSession();
  const { completeGoogleSignIn, status: authStatus } = useAuth();
  /** Authoring is for verified skillprint.co staff; the backend decides, the library call tells us. */
  const [access, setAccess] = useState<'checking' | 'author' | 'denied'>('checking');
  const [signInError, setSignInError] = useState<string | null>(null);

  const [generatorState, setGeneratorState] = useState<GeneratorState>('checking');
  const [mockMode, setMockMode] = useState(false);
  const [catalog, setCatalog] = useState<VoiceCatalog | null>(null);

  const [title, setTitle] = useState('Evening wind-down');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState(SAMPLE_SCRIPT);
  const [voiceId, setVoiceId] = useState('ryan');
  const [language, setLanguage] = useState('English');
  const [tempo, setTempo] = useState(0.92);
  const [pacing, setPacing] = useState<Pacing>(DEFAULT_PACING);
  const [visual, setVisual] = useState<VisualSettings>(DEFAULT_VISUAL);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [renderJob, setRenderJob] = useState<Job<RenderResult> | null>(null);
  const [rendered, setRendered] = useState<RenderResult | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ busy: boolean; url: string | null }>({ busy: false, url: null });

  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [library, setLibrary] = useState<Meditation[] | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // ---- draft persistence (per browser convenience only) ----
  useEffect(() => {
    const draft = loadDraft();
    if (draft.title !== undefined) setTitle(draft.title);
    if (draft.description !== undefined) setDescription(draft.description);
    if (draft.script) setScript(draft.script);
    if (draft.voiceId) setVoiceId(draft.voiceId);
    if (draft.language) setLanguage(draft.language);
    if (draft.tempo) setTempo(draft.tempo);
    if (draft.pacing) setPacing({ ...DEFAULT_PACING, ...draft.pacing });
    if (draft.visual) setVisual({ ...DEFAULT_VISUAL, ...draft.visual });
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const draft: Draft = { title, description, script, voiceId, language, tempo, pacing, visual };
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage unavailable: drafts just don't persist */
    }
  }, [draftLoaded, title, description, script, voiceId, language, tempo, pacing, visual]);

  // ---- generator connection ----
  const refreshCatalog = useCallback(async () => {
    try {
      setCatalog(await generator.voices());
    } catch {
      /* surfaced by the health check */
    }
  }, []);

  const wasOnline = useRef(false);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        const health = await generator.health();
        if (cancelled) return;
        setMockMode(health.tts.mock);
        if (!wasOnline.current) refreshCatalog();
        wasOnline.current = true;
        setGeneratorState('online');
      } catch {
        wasOnline.current = false;
        if (!cancelled) setGeneratorState('offline');
      }
      if (!cancelled) timer = setTimeout(check, 10000);
    };
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refreshCatalog]);

  const allVoices = catalog ? [...catalog.cloned, ...catalog.presets] : [];
  const selectedVoice = allVoices.find((v) => v.id === voiceId);
  const online = generatorState === 'online';

  // A draft can name a voice that has since been deleted from the generator.
  useEffect(() => {
    if (catalog && !selectedVoice && catalog.presets.length) {
      setVoiceId((catalog.presets.find((v) => v.id === 'ryan') ?? catalog.presets[0]).id);
    }
  }, [catalog, selectedVoice]);

  // ---- library ----
  const loadLibrary = useCallback(async () => {
    if (!userToken) return;
    try {
      setLibrary((await meditationApi.list(userToken)).results);
      setLibraryError(null);
      setAccess('author');
    } catch (err) {
      if (err instanceof MeditationApiError && (err.status === 401 || err.status === 403)) setAccess('denied');
      else setLibraryError(String(err instanceof Error ? err.message : err));
    }
  }, [userToken]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // ---- rendering ----
  const render = async () => {
    setRenderError(null);
    setRendered(null);
    setSavedId(null);
    setSaveError(null);
    try {
      const job = await generator.render({ script, voiceId, language, tempo, pacing });
      setRenderJob(job);
      const done = await waitForJob<RenderResult>(job.id, setRenderJob);
      if (done.status === 'FAILED' || !done.result) setRenderError(done.error || 'Rendering failed');
      else setRendered(done.result);
    } catch (err) {
      setRenderError(err instanceof GeneratorError ? err.message : String(err));
    } finally {
      setRenderJob(null);
    }
  };

  const previewVoice = async () => {
    setPreview({ busy: true, url: null });
    try {
      const job = await generator.render({
        script: PREVIEW_LINE, voiceId, language, tempo, pacing: { ...pacing, leadIn: 0, tail: 0.5 },
      });
      const done = await waitForJob<RenderResult>(job.id, () => undefined);
      setPreview({ busy: false, url: done.result ? generator.fileUrl(done.result.audioUrl) : null });
      if (done.status === 'FAILED') setRenderError(done.error || 'Preview failed');
    } catch (err) {
      setPreview({ busy: false, url: null });
      setRenderError(err instanceof GeneratorError ? err.message : String(err));
    }
  };

  // ---- saving ----
  const save = async () => {
    if (!rendered || !userToken || !selectedVoice) return;
    setSaving('Preparing upload…');
    setSaveError(null);
    try {
      const audioResponse = await fetch(generator.fileUrl(rendered.audioUrl));
      if (!audioResponse.ok) throw new Error('Could not read the rendered audio from the generator');
      const audio = await audioResponse.blob();
      const saved = await meditationApi.create(userToken, {
        title: title.trim() || 'Untitled meditation',
        description: description.trim(),
        script,
        voiceId: rendered.config.voice.id,
        voiceName: rendered.config.voice.name,
        voiceKind: rendered.config.voice.kind,
        language: rendered.config.language,
        durationSeconds: rendered.config.durationSeconds,
        audio,
        audioFilename: rendered.audioFilename,
        config: rendered.config,
        visual,
      }, (fraction) => setSaving(fraction < 1 ? `Uploading audio… ${Math.round(fraction * 100)}%` : 'Saving…'));
      setSavedId(saved.id);
      loadLibrary();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(null);
    }
  };

  const remove = async (m: Meditation) => {
    if (!userToken || !window.confirm(`Delete "${m.title}"? This removes its audio too.`)) return;
    try {
      await meditationApi.remove(m.id, userToken);
      loadLibrary();
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : String(err));
    }
  };

  const setPacingField = (field: keyof Pacing) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPacing((p) => ({ ...p, [field]: Number(e.target.value) }));

  const duration = rendered?.config.durationSeconds ?? 0;

  return (
    <main className="meditation-app">
      <div className="med-shell">
        <header className="med-header">
          <div>
            <h1>Meditation Studio</h1>
            <p>Write a script, choose or train a voice, render it locally, and save it to Skillprint.</p>
          </div>
          <span className="med-pill" role="status">
            <span className={`med-dot ${online ? (mockMode ? 'med-dot--warn' : 'med-dot--ok') : generatorState === 'offline' ? 'med-dot--off' : ''}`} />
            {generatorState === 'checking' && 'Connecting to generator…'}
            {online && (mockMode ? 'Generator online (mock voices)' : 'Generator online')}
            {generatorState === 'offline' && 'Generator offline'}
          </span>
        </header>

        {access === 'denied' && (
          <section className="med-card" aria-labelledby="med-gate-heading">
            <h2 id="med-gate-heading">For Skillprint staff</h2>
            {authStatus === 'social' ? (
              // Signing in again with the same account would only reload into this screen.
              <p className="med-hint">
                You&apos;re signed in, but this account isn&apos;t recognised as Skillprint staff. Use the Google
                account for your skillprint.co address. If you already did, ask an admin to check your access.
              </p>
            ) : (
              <p className="med-hint">
                Creating meditations is limited to Skillprint staff. Sign in with your verified skillprint.co Google
                account to continue.
              </p>
            )}
            <div>
              <GoogleLogin
                onSuccess={async ({ credential }) => {
                  if (!credential) return;
                  try {
                    completeGoogleSignIn(await signInWithGoogle(credential), googlePicture(credential));
                    window.location.reload(); // the session hook picks up the new account on load
                  } catch {
                    setSignInError("We couldn't sign you in with Google. Try again.");
                  }
                }}
                onError={() => setSignInError("Google sign-in didn't complete. Try again.")}
                text={authStatus === 'social' ? 'continue_with' : 'signin_with'}
                theme="filled_black"
                shape="pill"
              />
            </div>
            {signInError && <div className="med-alert" role="alert">{signInError}</div>}
          </section>
        )}

        {access === 'checking' && <p className="med-hint">Checking your access…</p>}

        {access === 'author' && <>
        {generatorState === 'offline' && (
          <div className="med-alert med-alert--info">
            The meditation generator runs on your machine and isn&apos;t reachable at {GENERATOR_URL}. Start it from the
            meditation-generator project:
            <pre>./start.sh</pre>
          </div>
        )}

        <div className="med-grid">
          <div className="med-col">
            <section className="med-card" aria-labelledby="med-script-heading">
              <h2 id="med-script-heading">Script</h2>
              <div className="med-field-row">
                <label className="med-field">
                  Title
                  <input className="med-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
                </label>
                <label className="med-field">
                  Description
                  <input className="med-input" value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
              </div>
              <label className="med-field">
                Meditation text
                <textarea className="med-textarea" value={script} onChange={(e) => setScript(e.target.value)} spellCheck />
              </label>
              <p className="med-hint">
                Each sentence is spoken on its own. A blank line adds a longer pause. Add <code>[pause 5s]</code> for an
                exact pause or <code>[breathe]</code> for one breath ({pacing.breathSeconds}s).
              </p>
              <div className="med-actions">
                <button type="button" className="med-btn med-btn--primary" onClick={render}
                  disabled={!online || !!renderJob || !script.trim() || !selectedVoice}>
                  {renderJob ? 'Rendering…' : 'Render meditation'}
                </button>
                <button type="button" className="med-btn med-btn--ghost" onClick={() => setScript(SAMPLE_SCRIPT)}>
                  Use sample script
                </button>
                <span className="med-hint">{script.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              {renderJob && (
                <div>
                  <div className="med-progress"><span style={{ width: `${Math.max(4, Math.round(renderJob.progress * 100))}%` }} /></div>
                  <p className="med-hint" style={{ marginTop: 6 }}>{renderJob.message}</p>
                </div>
              )}
              {renderError && <div className="med-alert" role="alert">{renderError}</div>}
            </section>

            {rendered && (
              <section className="med-card" aria-labelledby="med-result-heading">
                <div className="med-card-head">
                  <h2 id="med-result-heading">Rendered · {formatDuration(duration)}</h2>
                  <span className="med-hint">{rendered.config.voice.name}</span>
                </div>
                <audio ref={audioRef} className="med-audio" src={generator.fileUrl(rendered.audioUrl)} controls
                  onPlay={() => setPreviewPlaying(true)} onPause={() => setPreviewPlaying(false)} />
                <div className="med-timeline" aria-label="Speech and pause timeline">
                  {rendered.config.segments.map((s, i) => (
                    <span key={i} className={s.kind === 'speech' ? 'is-speech' : 'is-pause'}
                      style={{ width: `${((s.end - s.start) / duration) * 100}%` }} title={s.text ?? `pause ${Math.round(s.end - s.start)}s`} />
                  ))}
                </div>
                <div className="med-actions">
                  <button type="button" className="med-btn med-btn--primary" onClick={save} disabled={!!saving || !userToken || !!savedId}>
                    {saving ?? (savedId ? 'Saved' : 'Save to Skillprint')}
                  </button>
                  {savedId && (
                    <Link className="med-btn" href={`/meditation/play/${savedId}`}>Open player →</Link>
                  )}
                  {!userToken && <span className="med-hint">Waiting for your Skillprint session…</span>}
                </div>
                {saveError && <div className="med-alert" role="alert">{saveError}</div>}
              </section>
            )}
          </div>

          <div className="med-col">
            <VoicePanel
              catalog={catalog}
              online={online}
              selectedId={voiceId}
              onSelect={(v: Voice) => setVoiceId(v.id)}
              onCatalogChange={refreshCatalog}
              onPreview={previewVoice}
              previewing={preview.busy}
              previewUrl={preview.url}
            />

            <section className="med-card" aria-labelledby="med-pacing-heading">
              <h2 id="med-pacing-heading">Delivery</h2>
              <div className="med-field-row">
                <label className="med-field">
                  Language
                  <select className="med-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {(catalog?.languages ?? ['English']).map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
                <label className="med-field">
                  Speaking pace · {Math.round(tempo * 100)}%
                  <input className="med-range" type="range" min={0.75} max={1.1} step={0.01} value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))} />
                </label>
              </div>
              <div className="med-field-row">
                <label className="med-field">
                  Between sentences · {pacing.sentencePause}s
                  <input className="med-range" type="range" min={0} max={5} step={0.1} value={pacing.sentencePause} onChange={setPacingField('sentencePause')} />
                </label>
                <label className="med-field">
                  Between paragraphs · {pacing.paragraphPause}s
                  <input className="med-range" type="range" min={0} max={15} step={0.5} value={pacing.paragraphPause} onChange={setPacingField('paragraphPause')} />
                </label>
                <label className="med-field">
                  One breath · {pacing.breathSeconds}s
                  <input className="med-range" type="range" min={3} max={15} step={0.5} value={pacing.breathSeconds} onChange={setPacingField('breathSeconds')} />
                </label>
              </div>
            </section>

            <section className="med-card" aria-labelledby="med-visual-heading">
              <h2 id="med-visual-heading">Visual</h2>
              <div className="med-preview">
                <MeditationVisual
                  settings={visual}
                  segments={rendered?.config.segments}
                  getTime={rendered ? () => audioRef.current?.currentTime ?? 0 : undefined}
                  playing={rendered ? previewPlaying : true}
                />
              </div>
              <div className="med-segmented" role="group" aria-label="Visual style">
                {(['waves', 'orb', 'aurora'] as VisualStyle[]).map((style) => (
                  <button key={style} type="button" aria-pressed={visual.style === style}
                    onClick={() => setVisual((v) => ({ ...v, style }))}>
                    {style[0].toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
              <div className="med-swatches" role="group" aria-label="Palette">
                {(Object.keys(PALETTES) as PaletteName[]).map((name) => (
                  <button key={name} type="button" className="med-swatch" aria-pressed={visual.palette === name}
                    aria-label={PALETTES[name].label} title={PALETTES[name].label}
                    style={{ background: `linear-gradient(135deg, ${PALETTES[name].waves[0]}, ${PALETTES[name].waves[2]})` }}
                    onClick={() => setVisual((v) => ({ ...v, palette: name }))} />
                ))}
              </div>
              <label className="med-field">
                Breathing cycle · {visual.breathSeconds}s ({Math.round(60 / visual.breathSeconds * 10) / 10} breaths/min)
                <input className="med-range" type="range" min={4} max={16} step={0.5} value={visual.breathSeconds}
                  onChange={(e) => setVisual((v) => ({ ...v, breathSeconds: Number(e.target.value) }))} />
              </label>
              <label className="med-check">
                <input type="checkbox" checked={visual.showCaptions}
                  onChange={(e) => setVisual((v) => ({ ...v, showCaptions: e.target.checked }))} />
                Show captions in the player
              </label>
            </section>
          </div>
        </div>

        <section className="med-card" aria-labelledby="med-library-heading">
          <div className="med-card-head">
            <h2 id="med-library-heading">Your meditations</h2>
            <button type="button" className="med-btn med-btn--small med-btn--ghost" onClick={loadLibrary} disabled={!userToken}>Refresh</button>
          </div>
          {libraryError && <div className="med-alert" role="alert">{libraryError}</div>}
          {library === null && !libraryError && <p className="med-hint">Loading…</p>}
          {library?.length === 0 && <p className="med-hint">Nothing saved yet. Render a meditation and save it to see it here.</p>}
          {library && library.length > 0 && (
            <div className="med-library">
              {library.map((m) => {
                const v = visualSettings(m);
                const palette = PALETTES[v.palette] ?? PALETTES.dusk;
                return (
                  <article key={m.id} className="med-item">
                    <div className="med-item-art" style={{
                      background: `radial-gradient(120% 90% at 50% 120%, ${palette.waves[1]}aa, transparent 60%), linear-gradient(${palette.background[0]}, ${palette.background[1]})`,
                    }} />
                    <div className="med-item-body">
                      <div className="med-item-title">{m.title}</div>
                      <div className="med-hint">{m.voiceName} · {formatDuration(m.durationSeconds)} · {new Date(m.createdAt).toLocaleDateString()}</div>
                      <div className="med-actions" style={{ marginTop: 6 }}>
                        <Link className="med-btn med-btn--small med-btn--primary" href={`/meditation/play/${m.id}`}>Play</Link>
                        <button type="button" className="med-btn med-btn--small med-btn--ghost med-btn--danger" onClick={() => remove(m)}>Delete</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        </>}
      </div>
    </main>
  );
}

/**
 * Client for the local meditation-generator service (skillprint/meditation-generator),
 * which renders scripts with Qwen3-TTS voices and trains cloned voices. It runs on the
 * author's machine, never on Skillprint infrastructure.
 */

export const GENERATOR_URL = (process.env.NEXT_PUBLIC_MEDITATION_GENERATOR_URL || 'http://localhost:8100').replace(/\/$/, '');

export type VoiceKind = 'preset' | 'cloned';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Voice {
  id: string;
  kind: VoiceKind;
  name: string;
  gender?: string;
  description?: string;
  native?: string;
  language?: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  error?: string | null;
  referenceUrl?: string;
  referenceSeconds?: number | null;
  mode?: 'icl' | 'xvector';
  /** `qwen`: a Qwen3-TTS preset; `library`: a bundled open voice; `upload`: trained from recordings. */
  source?: 'qwen' | 'library' | 'upload';
  accent?: string | null;
  /** Presets that aren't native English speakers: still renderable, left out of the picker. */
  hidden?: boolean;
  license?: string;
  /** Credit the license requires wherever the voice is used. */
  attribution?: string;
  sourceUrl?: string;
}

export interface VoiceCatalog {
  presets: Voice[];
  /** Openly licensed voices bundled with the generator. Older generators don't send it. */
  library?: Voice[];
  cloned: Voice[];
  languages: string[];
}

/** The voices the studio offers, best for meditation first. Hidden presets stay out. */
export function pickableVoices(catalog: VoiceCatalog | null): Voice[] {
  if (!catalog) return [];
  return [...(catalog.library ?? []), ...catalog.cloned, ...catalog.presets.filter((v) => !v.hidden)];
}

export interface TimelineSegment {
  kind: 'speech' | 'pause';
  start: number;
  end: number;
  text?: string;
}

export interface GeneratorConfig {
  version: number;
  durationSeconds: number;
  language: string;
  tempo: number;
  voice: { id: string; name: string; kind: VoiceKind; source?: string; license?: string; attribution?: string };
  segments: TimelineSegment[];
  [key: string]: unknown;
}

export interface Job<R = unknown> {
  id: string;
  kind: 'meditation' | 'voice';
  status: JobStatus;
  progress: number;
  message: string;
  error: string | null;
  result: R | null;
  elapsedSeconds?: number;
}

export interface RenderResult {
  audioUrl: string;
  audioFilename: string;
  configUrl: string;
  config: GeneratorConfig;
}

export interface Pacing {
  sentencePause: number;
  paragraphPause: number;
  breathSeconds: number;
  leadIn: number;
  tail: number;
}

export interface RenderRequest {
  script: string;
  voiceId: string;
  language: string;
  tempo: number;
  pacing: Pacing;
}

export class GeneratorError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${GENERATOR_URL}${path}`, init);
  } catch {
    throw new GeneratorError(`Can't reach the meditation generator at ${GENERATOR_URL}. Is it running?`);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d) => d.msg).join('; ') : '';
    throw new GeneratorError(message || `Generator request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const generator = {
  health: () => call<{ status: string; ffmpeg: boolean; tts: { mock: boolean; device: string } }>('/health'),
  voices: () => call<VoiceCatalog>('/voices'),
  createVoice: (form: FormData) => call<{ voice: Voice; job: Job }>('/voices', { method: 'POST', body: form }),
  deleteVoice: (id: string) => call<void>(`/voices/${id}`, { method: 'DELETE' }),
  render: (body: RenderRequest) =>
    call<Job<RenderResult>>('/meditations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  job: <R>(id: string) => call<Job<R>>(`/jobs/${id}`),
  fileUrl: (path: string) => `${GENERATOR_URL}${path}`,
};

/** Polls a job until it finishes; `onUpdate` sees every intermediate state. */
export async function waitForJob<R>(id: string, onUpdate: (job: Job<R>) => void, signal?: AbortSignal): Promise<Job<R>> {
  for (;;) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const job = await generator.job<R>(id);
    onUpdate(job);
    if (job.status === 'COMPLETED' || job.status === 'FAILED') return job;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

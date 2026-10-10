import { BASE_URL } from '../../../app/api/api';
import type { GeneratorConfig, VoiceKind } from './generator';

/** Saved meditations live on the marketplace backend (`meditations` app); audio in S3. */
const MEDITATIONS_URL = `${BASE_URL}api/meditations/`;

export type VisualStyle = 'waves' | 'orb' | 'aurora';
export type PaletteName = 'dusk' | 'ocean' | 'forest' | 'dawn' | 'skillprint';

export interface VisualSettings {
  style: VisualStyle;
  palette: PaletteName;
  /** One inhale + exhale of the breathing guide, in seconds. */
  breathSeconds: number;
  showCaptions: boolean;
}

export const DEFAULT_VISUAL: VisualSettings = { style: 'waves', palette: 'dusk', breathSeconds: 10, showCaptions: false };

export interface Meditation {
  id: string;
  title: string;
  description: string;
  script: string;
  voiceId: string;
  voiceName: string;
  voiceKind: VoiceKind | '';
  language: string;
  audioUrl: string;
  audioContentType: string;
  audioSize: number;
  durationSeconds: number | null;
  config: Partial<GeneratorConfig>;
  visual: Partial<VisualSettings>;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewMeditation {
  title: string;
  description: string;
  script: string;
  voiceId: string;
  voiceName: string;
  voiceKind: VoiceKind;
  language: string;
  durationSeconds: number;
  audio: Blob;
  audioFilename: string;
  config: GeneratorConfig;
  visual: VisualSettings;
}

interface UploadSlot {
  upload: { method: 'POST'; url: string; fields: Record<string, string>; fileField: string; maxBytes: number };
  uploadToken: string;
  expiresIn: number;
}

/** A presigned-POST style upload: the slot's fields first, the file last (S3 requires that order). */
function sendToSlot(slot: UploadSlot, file: Blob, filename: string, onProgress?: (fraction: number) => void): Promise<void> {
  const form = new FormData();
  Object.entries(slot.upload.fields).forEach(([key, value]) => form.append(key, value));
  form.append(slot.upload.fileField, file, filename);
  return new Promise((resolve, reject) => {
    // XHR rather than fetch: fetch can't report upload progress.
    const xhr = new XMLHttpRequest();
    xhr.open(slot.upload.method, slot.upload.url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
      ? resolve()
      : reject(new MeditationApiError(xhr.status, `Audio upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new MeditationApiError(0, 'Audio upload failed: the storage service could not be reached'));
    xhr.send(form);
  });
}

export class MeditationApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(url: string, token: string | null | undefined, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
  if (token) headers.Authorization = `Token ${token}`;
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = typeof body?.detail === 'string' ? body.detail : body
      ? Object.entries(body).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`).join('; ')
      : '';
    throw new MeditationApiError(response.status, message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const meditationApi = {
  list: (token: string) => request<{ count: number; results: Meditation[] }>(MEDITATIONS_URL, token),
  get: (id: string, token?: string | null) => request<Meditation>(`${MEDITATIONS_URL}${id}/`, token),
  update: (id: string, token: string, body: Partial<Pick<Meditation, 'title' | 'description'>> & { visual?: VisualSettings }) =>
    request<Meditation>(`${MEDITATIONS_URL}${id}/`, token, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string) => request<void>(`${MEDITATIONS_URL}${id}/`, token, { method: 'DELETE' }),
  /**
   * Saves a meditation in three steps: ask the backend for a one-use upload slot, send the
   * audio straight to storage (S3 in deployed environments, never through the API), then
   * create the record with the slot's token.
   */
  create: async (token: string, m: NewMeditation, onUploadProgress?: (fraction: number) => void) => {
    const contentType = m.audio.type || 'audio/mpeg';
    const slot = await request<UploadSlot>(`${MEDITATIONS_URL}uploads/`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType, size: m.audio.size, filename: m.audioFilename }),
    });
    await sendToSlot(slot, m.audio, m.audioFilename, onUploadProgress);
    const { audio: _audio, audioFilename: _name, ...fields } = m;
    return request<Meditation>(MEDITATIONS_URL, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, audioUpload: slot.uploadToken }),
    });
  },
};

export function visualSettings(m: Pick<Meditation, 'visual'> | null | undefined): VisualSettings {
  return { ...DEFAULT_VISUAL, ...(m?.visual ?? {}) };
}

// The marketplace API's live-session endpoints (api_backend/biometrics). A live
// session is what an Apple Watch pairs with when no game session is involved:
// this page creates one, shows its pairing QR code, and polls its feed. The
// readings then go into the game session as BIOMETRIC events, the same way the
// webcam's do. See skillprint-watch/docs/SPEC.md.

export class LiveApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface Pairing {
  pairingId: string;
  code: string;
  displayCode: string;
  /** skillprint-watch://pair?code=…&api=…, what the QR code holds. */
  linkUrl: string;
  expiresAt: string;
  expiresInS: number;
}

export interface LiveSession {
  liveSessionId: string;
  /** Shown once; the only way to read the feed. */
  viewerToken: string;
  label: string;
  pairing: Pairing;
}

export interface FeedSample {
  id: number;
  t: string;
  bpm: number;
}

export interface Feed {
  sessionOpen: boolean;
  paired: boolean;
  devices: { deviceId: string; name: string; claimedAt: string }[];
  /** A sample arrived in the last 30 s and the workout hasn't ended. */
  active: boolean;
  latest: FeedSample | null;
  /** Median of the workout's first minute. */
  baselineBpm: number | null;
  samples: FeedSample[];
  cursor: number;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export class LiveApi {
  readonly apiBase: string;
  private readonly fetchImpl: FetchLike;

  constructor(apiBase: string, fetchImpl: FetchLike = (input, init) => fetch(input, init)) {
    this.apiBase = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
    this.fetchImpl = fetchImpl;
  }

  private async request<T>(method: string, path: string, { token, body }: { token?: string; body?: unknown } = {}): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['X-Live-Token'] = token;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.apiBase}biometrics/api/${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      throw new LiveApiError(0, `Can't reach ${this.apiBase} (${(e as Error).message})`);
    }
    if (response.status === 204) return null as T;
    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Not JSON; the status says enough.
    }
    if (!response.ok) {
      const detail = (data as { detail?: string } | null)?.detail;
      throw new LiveApiError(response.status, detail ?? `${response.status} from the server`);
    }
    return data as T;
  }

  createSession(label = ''): Promise<LiveSession> {
    return this.request('POST', 'live/', { body: { label } });
  }

  feed(liveSessionId: string, token: string, after = 0): Promise<Feed> {
    return this.request('GET', `live/${liveSessionId}/${after ? `?after=${after}` : ''}`, { token });
  }

  newPairing(liveSessionId: string, token: string): Promise<Pairing> {
    return this.request('POST', `live/${liveSessionId}/pairings/`, { token });
  }

  endSession(liveSessionId: string, token: string): Promise<null> {
    return this.request('DELETE', `live/${liveSessionId}/`, { token });
  }
}

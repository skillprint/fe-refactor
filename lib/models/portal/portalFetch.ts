import { BASE_URL as API_BASE_URL } from '../../../app/api/api';

/** Every portal endpoint hangs off `/api/portal/` on the marketplace backend. */
export const PORTAL_BASE_URL = `${API_BASE_URL}api/portal`;

export class PortalApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'PortalApiError';
    this.status = status;
  }
}

/**
 * Fetch a portal endpoint. Responses are camelCase on the wire
 * (CamelCaseJSONRenderer), so callers type them accordingly.
 *
 * Public endpoints are gated by partner key or an allow-listed SPA origin; the
 * Knox token is sent when we have one so the same call works for both.
 */
export async function portalFetch<T>(path: string, token?: string | null, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Token ${token}`;

  const response = await fetch(`${PORTAL_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    throw new PortalApiError(response.status, `Portal request failed (${response.status}): ${path}`);
  }
  return (await response.json()) as T;
}

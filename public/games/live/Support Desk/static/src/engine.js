// The real engine: Django `supportsim/` in front of the tau2-engine sidecar.
// Same method names and shapes as MockEngine. Requests go straight from this
// frame to the API, the way every game and the SDK reach it: a signed-in
// player's Knox token from localStorage (the frame is same-origin with the
// portal), otherwise the portal's origin alone, which the backend accepts for
// guest play.

const TOKEN_KEY = 'userToken';

/** Where the API is: an explicit override, the portal's answer, or the usual host rule. */
export function resolveApiBase() {
  const url = new URLSearchParams(location.search).get('apiBase');
  if (url) return url.replace(/\/+$/, '');
  try {
    const stored = localStorage.getItem('sp_api_base');
    if (stored) return stored.replace(/\/+$/, '');
  } catch { /* storage may be blocked */ }
  if (window.__skillprintConfig?.apiBase) return String(window.__skillprintConfig.apiBase).replace(/\/+$/, '');
  const host = location.hostname;
  if (host.endsWith('.skillprint.co') && !host.includes('staging') && host !== 'redesign.skillprint.co') return 'https://api.skillprint.co';
  return 'https://api.staging.skillprint.co';
}

export class HttpEngine {
  constructor({ apiBase, apiKey = null } = {}) {
    this.apiBase = apiBase || resolveApiBase();
    this.apiKey = apiKey;
  }

  get kind() { return 'http'; }

  setApiBase(base) { if (base) this.apiBase = String(base).replace(/\/+$/, ''); }

  _headers() {
    const h = { 'Content-Type': 'application/json', Accept: 'application/json' };
    let token = null;
    try { token = localStorage.getItem(TOKEN_KEY); } catch { /* ignore */ }
    if (token) h.Authorization = `Token ${token}`;
    else if (this.apiKey) h.Authorization = `Api-Key ${this.apiKey}`;
    return h;
  }

  async _post(path, body) {
    const r = await fetch(`${this.apiBase}${path}`, { method: 'POST', headers: this._headers(), body: JSON.stringify(body ?? {}) });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      const err = new Error(`${path} → ${r.status} ${text.slice(0, 200)}`);
      err.status = r.status;
      throw err;
    }
    return r.json();
  }

  async _get(path) {
    const r = await fetch(`${this.apiBase}${path}`, { headers: this._headers() });
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
  }

  async tasks(domain) {
    const q = domain ? `?domain=${encodeURIComponent(domain)}` : '';
    return this._get(`/supportsim/api/tasks/${q}`);
  }

  /** @returns {Promise<{ticketId, opener, persona, policy, tools, affect, annotations, slaSeconds}>} */
  async start({ sessionId, gameSlug = 'support-desk', domain, taskId, variant, params, seed } = {}) {
    const body = { gameSlug, params };
    if (sessionId) body.sessionId = sessionId;
    if (domain) body.domain = domain;
    if (taskId) body.taskId = taskId;
    if (variant) body.variant = variant;
    if (seed != null) body.seed = seed;
    return this._post('/supportsim/api/tickets/', body);
  }

  /** kind: 'message' | 'tool'. @returns {Promise<{customerReply, toolResult, affect, policyPatch, events, done, turnIdx, engineLatencyMs, usage}>} */
  async turn(ticketId, { kind, text, toolName, args, clientLatencyMs = 0 }) {
    const body = { kind, clientLatencyMs };
    if (kind === 'message') body.text = text;
    else { body.toolName = toolName; body.args = args ?? {}; }
    return this._post(`/supportsim/api/tickets/${encodeURIComponent(ticketId)}/turn/`, body);
  }

  /** @returns {Promise<{reward, violations, outcome}>} */
  async close(ticketId, { resolution, confidence, summary }) {
    return this._post(`/supportsim/api/tickets/${encodeURIComponent(ticketId)}/close/`, { resolution, confidence, summary: summary || undefined });
  }
}

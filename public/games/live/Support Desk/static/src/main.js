// Support Desk. The player is the agent on a help desk; simulated customers
// arrive with a problem, a mood and sometimes a false belief. The world,
// policies and reward come from the engine (tau2-engine behind Django's
// supportsim API), or from the scripted MockEngine with ?mock=1.
//
// URL switches:  ?mock=1  scripted customers, no backend
//                ?domain=telecom|banking|retail   restrict the queue
//                ?tickets=3   tickets per shift
//                ?apiBase=https://api.staging.skillprint.co   engine override
//                ?voice=1  start with the customer voice on
//                ?autostart=1  skip the start screen (agents use this)

import { PARAMETERS, tuning, setParameter, engineParams } from './params.js';
import { Timing, mmss } from './timing.js';
import { MockEngine } from './mockEngine.js';
import { HttpEngine } from './engine.js';
import { SkillprintBridge } from './skillprint.js';
import { UI } from './ui.js';
import { createVoice } from './voice/index.js';
import { shiftSummary, scoreFor } from './metrics.js';
import { installHarness } from './harnessHook.js';

// Switches come from this frame's URL, and, inside the portal (same origin,
// which does not forward its query string to the frame), from the page's URL.
const q = (() => {
  const own = new URLSearchParams(location.search);
  if (window.parent === window) return own;
  try {
    const page = new URLSearchParams(window.parent.location.search);
    for (const key of ['mock', 'domain', 'tickets', 'voice', 'autostart', 'apiBase']) {
      if (!own.has(key) && page.has(key)) own.set(key, page.get(key));
    }
  } catch { /* a cross-origin parent: its switches are not ours to read */ }
  return own;
})();
const MOCK = q.get('mock') === '1' || q.get('mock') === 'true';
const DOMAIN = q.get('domain') || null;
const TOTAL = Math.max(1, Math.min(12, Number(q.get('tickets')) || 3));
const SLA_SECONDS_DEFAULT = 240;

class SupportDeskGame {
  constructor() {
    this.root = document.getElementById('desk');
    this.ui = new UI(this.root);
    this.timing = new Timing();
    this.engine = MOCK ? new MockEngine() : new HttpEngine({ apiBase: q.get('apiBase') || undefined });
    // ?mock=0 insists on the live engine; otherwise a server without one gets the practice desk.
    this.forceLive = q.get('mock') === '0';
    this.bridge = new SkillprintBridge({
      root: this.root,
      onAdjust: (name, value) => this.adjust(name, value),
      onPause: () => this.setPaused(true),
      onResume: () => this.setPaused(false),
      // The portal says where its API is; an explicit ?apiBase on the URL still wins.
      onConfig: (cfg) => { if (cfg.apiBase && !q.get('apiBase') && typeof this.engine.setApiBase === 'function') this.engine.setApiBase(cfg.apiBase); },
    });
    this.voice = createVoice({ onStatus: (s) => { this.ui.setVoiceLabel(s.startsWith('Voice') ? s : `Voice: ${this.voice.enabled ? 'on' : 'off'}`); if (!this.started) this.ui.setOverlayNote(s); } });

    this.tickets = new Map();   // ticketId → ticket
    this.order = [];            // ticketIds in arrival order
    this.closed = [];           // closed ticket records, for the summary
    this.activeId = null;
    this.started = false;
    this.finished = false;
    this.paused = false;
    this.opening = 0;           // tickets being opened right now
    this.queueErrors = 0;
    this.clockTimer = null;

    this.ui.setHud({ score: 0, done: 0, total: TOTAL, clockText: '00:00', domain: DOMAIN || (MOCK ? 'mock' : 'live') });
    this.ui.onStart(({ voice }) => this.start({ voice }));
    this.ui.onVoiceToggle(() => (this.voice.enabled ? this.voice.disable() : this.voice.enable()));
    this.ui.onSend((text) => this.send(text));
    this.ui.onHold(() => this.hold());
    this.ui.onEscalate(() => this.escalate());
    this.ui.onClose(() => this.close());
    this.ui.setComposerEnabled(false);
    if (MOCK) this.ui.setOverlayNote('Scripted customers (no backend). Add ?voice=1 to hear them.');

    installHarness(this);
    window.__deskTuning = tuning;
    if (q.get('autostart') === '1') this.start({ voice: q.get('voice') === '1' });
    else if (q.get('voice') === '1') document.getElementById('start-voice').checked = true;
  }

  // -- Shift lifecycle -----------------------------------------------------

  async start({ voice = false } = {}) {
    if (this.started) return;
    this.started = true;
    this.ui.hideOverlay();
    if (voice) this.voice.enable();
    this.timing.start();
    this.root.dataset.phase = 'playing';
    this.bridge.startFrames();
    this.bridge.event('GAME_START', { domain: DOMAIN, tickets: TOTAL, engine: this.engine.kind, concurrency: tuning.concurrency });
    this.bridge.state({ score: 0, isGameOver: false, ticketsDone: 0, ticketsTotal: TOTAL });
    this.clockTimer = setInterval(() => this.tick(), 1000);
    await this.fillQueue();
  }

  get openTickets() { return this.order.map((id) => this.tickets.get(id)).filter((t) => t && !t.closed); }
  get startedCount() { return this.order.length; }

  async fillQueue() {
    while (!this.finished && this.openTickets.length + this.opening < tuning.concurrency && this.startedCount + this.opening < TOTAL) {
      this.opening += 1;
      try {
        await this.openTicket();
      } catch (e) {
        this.opening -= 1;
        // No supportsim on this API (404), no engine behind it (503), or a request
        // the browser refused: play the scripted practice desk rather than an
        // empty one. Only before the first live ticket, so a shift never mixes the two.
        if (this.engine.kind === 'http' && !this.forceLive && !this.order.length && (e.status === 404 || e.status === 503 || e instanceof TypeError)) {
          this.engine = new MockEngine();
          this.ui.setHud({ domain: 'practice' });
          this.ui.toast('The live customer engine is not on this server yet. Playing the practice desk.', 4500);
          this.bridge.event('ENGINE_FALLBACK', { from: 'http', to: 'mock', status: e.status || null, message: String(e.message || e).slice(0, 200) });
          continue;
        }
        this.queueErrors += 1;
        console.error('[support-desk] could not open a ticket', e);
        this.ui.toast(this.engine.kind === 'mock' ? 'Could not open a ticket.' : `The engine is not answering (${e.status || e.message}). Try ?mock=1.`);
        this.bridge.event('ENGINE_ERROR', { stage: 'start', message: String(e.message || e).slice(0, 200) });
        if (this.queueErrors >= 3 && !this.openTickets.length) { this.ui.setComposerEnabled(false); return; }
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      this.opening -= 1;
    }
  }

  async openTicket() {
    const engine = this.engine;
    const data = await engine.start({ domain: DOMAIN || undefined, params: engineParams(), seed: this.startedCount + 1 });
    const t = {
      id: data.ticketId,
      engine,                     // the engine that owns this ticket's conversation
      domain: data.domain || DOMAIN || '',
      taskId: data.taskId || null,
      persona: data.persona || { name: 'Customer', channel: 'chat' },
      policy: data.policy || { title: 'Policy', markdown: '' },
      tools: data.tools || [],
      affect: data.affect || { state: 'calm', patience: 0.7 },
      voiceStyle: data.voiceStyle || data.affect?.state || 'calm',
      slaSeconds: data.slaSeconds || SLA_SECONDS_DEFAULT,
      annotations: data.annotations || {},
      transcript: [],
      turns: 0,
      unread: 0,
      typing: false,
      ended: false,
      closed: false,
      onHold: false,
      busy: false,
      confusionErrors: 0,
      openedAt: performance.now(),
      names: [],
    };
    t.names = this.namesIn(t);
    this.tickets.set(t.id, t);
    this.order.push(t.id);
    this.timing.ticketOpened(t.id);
    this.bridge.event('TICKET_OPEN', { ticketId: t.id, engine: engine.kind, domain: t.domain, taskId: t.taskId, customer: t.persona.name, affect: t.affect.state, patience: t.affect.patience, annotations: t.annotations, concurrency: this.openTickets.length });
    this.bridge.event('LEVEL_START', { level: this.startedCount, ticketId: t.id, domain: t.domain });
    const opener = { role: 'customer', who: t.persona.name, text: data.opener || '…', at: Date.now() };
    t.transcript.push(opener);
    if (!this.activeId) this.select(t.id); else { t.unread += 1; this.renderLists(); }
    this.bridge.event('CUSTOMER_REPLY', { ticketId: t.id, text: opener.text, turn: 0, affect: t.affect.state, patience: t.affect.patience, voiceStyle: t.voiceStyle, opener: true });
    this.speakFor(t, opener.text);
    return t;
  }

  namesIn(t) {
    // Words an agent might confuse between tickets: the customer's names and any ids in the opener.
    const names = String(t.persona.name || '').split(/\s+/).filter((w) => w.length > 2);
    const ids = (String(t.transcript[0]?.text || '') .match(/\b[A-Z]{1,3}\d{3,}[-\d]*\b|\b\d{5,}\b/g) || []);
    return [...names, ...ids].map((s) => s.toLowerCase());
  }

  tick() {
    if (!this.started || this.finished) return;
    this.ui.setHud({ clockText: mmss(this.timing.elapsedMs()) });
    const t = this.active;
    if (t) this.ui.renderTicketHead(this.headFor(t));
    this.renderLists();
  }

  setPaused(on) {
    if (!this.started || this.finished) return;
    this.paused = on;
    if (on) { this.timing.pause(); this.voice.stop(); } else this.timing.resume();
    this.bridge.event(on ? 'GAME_PAUSE' : 'GAME_RESUME', {});
    this.refreshComposer();
  }

  // -- Selection + rendering ----------------------------------------------

  get active() { return this.activeId ? this.tickets.get(this.activeId) : null; }

  select(id) {
    const t = this.tickets.get(id);
    if (!t) return;
    const from = this.activeId;
    this.activeId = id;
    this.ui.activeId = id;
    t.unread = 0;
    this.ui.renderTicketHead(this.headFor(t));
    this.ui.renderTranscript(t);
    this.ui.renderTools(t.closed || t.ended ? [] : t.tools, (name) => this.tool(name));
    this.ui.renderCustomer({ ...t, turns: t.turns });
    this.ui.renderPolicy(t);
    this.renderLists();
    this.refreshComposer();
    if (from && from !== id) this.bridge.event('TICKET_SWITCH', { fromTicketId: from, ticketId: id, openTickets: this.openTickets.length });
    this.ui.focusReply();
  }

  headFor(t) {
    const ageS = this.timing.ticketAgeMs(t.id) / 1000;
    return { ...t, slaRemainingS: t.closed ? null : Math.round(t.slaSeconds - ageS) };
  }

  renderLists() {
    const items = this.openTickets.map((t) => ({ id: t.id, name: t.persona.name, affect: t.affect.state, waitingMs: this.timing.waitingMs(t.id), unread: t.unread, ended: t.ended }));
    this.ui.renderQueue(items, (id) => this.select(id));
    this.ui.renderTabs(items, (id) => this.select(id));
  }

  refreshComposer() {
    const t = this.active;
    const live = Boolean(t) && !t.closed && !this.paused && !this.finished;
    this.ui.setComposerEnabled(live && !t.ended && !t.busy, { canClose: live && !t.busy, canAct: live && !t.ended && !t.busy });
  }

  // -- Agent actions -------------------------------------------------------

  async send(text, ticketId = this.activeId) {
    const t = this.tickets.get(ticketId);
    if (!t || !text || t.closed || t.ended || t.busy || this.paused) return;
    // Replying while the customer is still talking is a barge-in: cut them off and say so.
    const bargeIn = Boolean(t.speaking);
    if (bargeIn) { t.speechToken += 1; t.speaking = false; this.voice.stop(); }
    const latencyMs = this.timing.agentReplies(t.id);
    const confusion = this.confusionIn(t, text);
    t.turns += 1;
    t.busy = true;
    this.ui.clearReply();
    const msg = { role: 'agent', text, at: Date.now() };
    t.transcript.push(msg);
    this.ui.appendMessage(t.id, msg);
    this.bridge.event('AGENT_MESSAGE', { ticketId: t.id, text: text.slice(0, 500), latencyMs, turn: t.turns, words: text.split(/\s+/).length, confusion, bargeIn });
    if (bargeIn) this.bridge.event('BARGE_IN', { ticketId: t.id, turn: t.turns });
    if (confusion) this.bridge.event('CONFUSION', { ticketId: t.id, turn: t.turns, mentioned: confusion });
    t.typing = true; this.ui.setTyping(t.id, true); this.refreshComposer();
    try {
      const r = await t.engine.turn(t.id, { kind: 'message', text, clientLatencyMs: latencyMs });
      await this.handleReply(t, r, { kind: 'message' });
    } catch (e) {
      this.engineFailed(t, e);
    } finally {
      t.busy = false; t.typing = false; this.ui.setTyping(t.id, false); this.refreshComposer();
    }
  }

  async tool(name, ticketId = this.activeId, presetArgs = null) {
    const t = this.tickets.get(ticketId);
    if (!t || t.closed || t.ended || t.busy || this.paused) return;
    const tool = t.tools.find((x) => x.name === name);
    if (!tool) { this.ui.toast(`No tool ${name}`); return; }
    const args = presetArgs ?? await this.ui.toolDialog(tool);
    if (args === null) return;
    const latencyMs = this.timing.agentReplies(t.id);
    t.turns += 1;
    t.busy = true;
    const call = { role: 'tool', who: name, text: `${name}(${JSON.stringify(args)})`, at: Date.now() };
    t.transcript.push(call);
    this.ui.appendMessage(t.id, call);
    t.typing = true; this.ui.setTyping(t.id, true); this.refreshComposer();
    const started = performance.now();
    try {
      const r = await t.engine.turn(t.id, { kind: 'tool', toolName: name, args, clientLatencyMs: latencyMs });
      this.bridge.event('TOOL_CALL', { ticketId: t.id, tool: name, args, ok: r.toolResult?.ok !== false, latencyMs, engineMs: Math.round(performance.now() - started), turn: t.turns });
      await this.handleReply(t, r, { kind: 'tool' });
    } catch (e) {
      this.engineFailed(t, e);
    } finally {
      t.busy = false; t.typing = false; this.ui.setTyping(t.id, false); this.refreshComposer();
    }
  }

  async hold(ticketId = this.activeId) {
    const t = this.tickets.get(ticketId);
    if (!t || t.closed || t.ended) return;
    t.onHold = !t.onHold;
    const m = { role: 'system', text: t.onHold ? 'You put the customer on hold.' : 'You took the customer off hold.', at: Date.now() };
    t.transcript.push(m); this.ui.appendMessage(t.id, m);
    this.bridge.event(t.onHold ? 'HOLD' : 'UNHOLD', { ticketId: t.id, turn: t.turns, waitingMs: this.timing.waitingMs(t.id) });
  }

  async escalate(ticketId = this.activeId, reason = null) {
    const t = this.tickets.get(ticketId);
    if (!t || t.closed || t.ended) return;
    const tool = t.tools.find((x) => x.name === 'escalate') || { name: 'escalate', description: 'Transfer to a senior agent.', parameters: { reason: { type: 'string' } } };
    if (!t.tools.some((x) => x.name === 'escalate')) t.tools = [...t.tools, tool];
    await this.tool('escalate', t.id, reason == null ? null : { reason });
  }

  async close(ticketId = this.activeId, preset = null) {
    const t = this.tickets.get(ticketId);
    if (!t || t.closed || t.busy) return;
    const answer = preset ?? await this.ui.closeDialog({ preselect: t.escalated ? 'escalated' : 'resolved' });
    if (!answer) return;
    t.busy = true; this.refreshComposer();
    let result;
    try {
      result = await t.engine.close(t.id, answer);
    } catch (e) {
      t.busy = false; this.refreshComposer();
      this.engineFailed(t, e);
      return;
    }
    t.busy = false;
    t.closed = true;
    t.result = result;
    const rTau = result.reward?.rTau ?? ((result.reward?.actions === 1 && result.reward?.communicateInfo === 1 && result.reward?.envAssertions === 1) ? 1 : 0);
    const record = {
      ticketId: t.id, name: t.persona.name, domain: t.domain, taskId: t.taskId,
      reward: { ...result.reward, rTau }, violations: result.violations || [], outcome: result.outcome || {},
      confusionErrors: t.confusionErrors, handleMs: this.timing.ticketAgeMs(t.id), declaredConfidence: answer.confidence, resolution: answer.resolution,
    };
    this.closed.push(record);
    const o = record.outcome;
    this.bridge.event('TICKET_CLOSED', {
      ticketId: t.id, domain: t.domain, taskId: t.taskId, resolution: answer.resolution, declaredConfidence: answer.confidence,
      rewardTotal: record.reward.total, rTau, violations: record.violations.length, criticalViolations: record.violations.filter((v) => v.severity === 'critical').length,
      csat: o.csat, turns: o.turns, agentTurns: o.agentTurns, meanAgentLatencyMs: o.meanAgentLatencyMs, minPatience: o.minPatience, recoveredFromAngry: o.recoveredFromAngry,
      beliefCorrected: o.beliefCorrected, policySwitchLagTurns: o.policySwitchLagTurns, escalated: o.escalated, confusionErrors: t.confusionErrors, handleMs: Math.round(record.handleMs),
    });
    this.bridge.event(rTau === 1 ? 'LEVEL_COMPLETE' : (answer.resolution === 'escalated' ? 'LEVEL_QUIT' : 'LEVEL_FAILED'), { level: this.order.indexOf(t.id) + 1, ticketId: t.id, points: Math.round(Math.max(0, record.reward.total ?? 0) * 100) });
    if (record.violations.length) this.bridge.event('GENERIC_NEGATIVE', { ticketId: t.id, reason: 'policy_violation', rules: record.violations.map((v) => v.rule) });
    const m = { role: 'system', text: rTau === 1 ? `Closed: resolved. CSAT ${o.csat ?? '—'}/5.` : `Closed: ${answer.resolution}. ${record.violations.length ? 'Policy: ' + record.violations.map((v) => v.rule).join(', ') + '. ' : ''}CSAT ${o.csat ?? '—'}/5.`, at: Date.now() };
    t.transcript.push(m); this.ui.appendMessage(t.id, m);
    this.updateScore();
    const next = this.openTickets[0];
    if (next) this.select(next.id); else { this.activeId = null; this.ui.activeId = null; this.ui.renderTicketHead(null); this.ui.renderTools([], () => {}); this.ui.renderCustomer(null); this.ui.renderPolicy(null); this.renderLists(); this.refreshComposer(); }
    if (this.closed.length >= TOTAL) await this.finishShift();
    else await this.fillQueue();
  }

  async handleReply(t, r, { kind }) {
    if (r.toolResult !== undefined && r.toolResult !== null) {
      const tr = r.toolResult;
      // The live engine wraps a tool's output as {ok, content, error?}; the practice desk returns it bare.
      const wrapped = tr && typeof tr === 'object' && 'content' in tr;
      const shown = wrapped ? (tr.ok === false ? (tr.error ?? tr.content) : tr.content) : tr;
      const res = { role: 'tool', who: wrapped && tr.ok === false ? 'error' : 'result', text: typeof shown === 'string' ? shown : JSON.stringify(shown, null, 1), at: Date.now() };
      t.transcript.push(res); this.ui.appendMessage(t.id, res);
    }
    for (const ev of r.events || []) {
      if (ev.type === 'affect_change') this.bridge.event('AFFECT_CHANGE', { ticketId: t.id, from: ev.from, to: ev.to, patience: ev.patience, trigger: ev.trigger, turn: t.turns });
      else if (ev.type === 'policy_violation') this.bridge.event('POLICY_VIOLATION', { ticketId: t.id, rule: ev.rule, severity: ev.severity, turn: t.turns });
      else if (ev.type === 'belief_corrected') { this.bridge.event('BELIEF_CORRECTED', { ticketId: t.id, turn: t.turns }); this.ui.toast('You set a false belief straight.'); }
      else if (ev.type === 'unexpected_write') this.bridge.event('UNEXPECTED_WRITE', { ticketId: t.id, tool: ev.tool, turn: t.turns });
      else if (ev.type === 'customer_fixed') this.bridge.event('CUSTOMER_FIXED', { ticketId: t.id, tool: ev.tool, turn: t.turns });
    }
    // What the customer did on their own side (telecom's device toggles). The
    // player isn't shown these, as a tau-bench agent isn't; the scorer gets them.
    for (const a of r.customerActions || []) this.bridge.event('CUSTOMER_ACTION', { ticketId: t.id, tool: a.name, turn: t.turns });
    if (r.affect) t.affect = r.affect;
    if (r.voiceStyle) t.voiceStyle = r.voiceStyle;
    if (r.policyPatch) {
      const previous = t.policy?.markdown || '';
      t.policy = r.policyPatch.policy || t.policy;
      this.ui.notePolicyPatch(t.id, previous);
      const m = { role: 'system', alert: true, text: r.policyPatch.notice || 'Policy update pushed.', at: Date.now() };
      t.transcript.push(m); this.ui.appendMessage(t.id, m);
      if (t.id === this.activeId) this.ui.renderPolicy(t);
      this.bridge.event('POLICY_SWITCH', { ticketId: t.id, turn: t.turns, patch: r.policyPatch.patch || {} });
      this.ui.toast('Policy updated. Check the policy panel.');
    }
    if (t.id === this.activeId) { this.ui.renderTicketHead(this.headFor(t)); this.ui.renderCustomer({ ...t, turns: t.turns }); }
    if (r.customerReply) {
      const msg = { role: 'customer', who: t.persona.name, text: r.customerReply, at: Date.now() };
      t.transcript.push(msg);
      if (t.id === this.activeId) this.ui.appendMessage(t.id, msg); else t.unread += 1;
      this.bridge.event('CUSTOMER_REPLY', { ticketId: t.id, text: String(r.customerReply).slice(0, 500), turn: t.turns, affect: t.affect?.state, patience: t.affect?.patience, voiceStyle: t.voiceStyle, engineMs: r.engineLatencyMs });
      this.speakFor(t, r.customerReply);
    } else {
      this.timing.customerDone(t.id);
    }
    if (r.done) {
      t.ended = true;
      if (kind === 'tool') t.escalated = true;
      const m = { role: 'system', text: 'This conversation has ended. Close the ticket to continue.', at: Date.now() };
      t.transcript.push(m); this.ui.appendMessage(t.id, m);
      this.ui.renderTools([], () => {});
    }
    this.renderLists();
  }

  /**
   * Speak a customer line without holding up the conversation. The reply clock
   * starts when the line has been heard (or at once with the voice off, or for
   * a ticket in the background); replying before that is a barge-in.
   */
  speakFor(t, text) {
    if (!this.voice.enabled || t.id !== this.activeId) { this.timing.customerDone(t.id); return; }
    const token = (t.speechToken = (t.speechToken || 0) + 1);
    const turn = t.turns;
    t.speaking = true;
    this.timing.customerSpeaking(t.id);
    this.voice.speak(text, { affect: t.voiceStyle || t.affect?.state, persona: t.persona, rate: tuning.speech_rate })
      .catch(() => null)
      .then((spoken) => {
        if (t.speechToken !== token) return; // talked over, or replaced by a newer line
        t.speaking = false;
        this.timing.customerDone(t.id);
        if (spoken) this.bridge.event('CUSTOMER_SPEECH', { ticketId: t.id, backend: spoken.backend, speechMs: Math.round(spoken.endedAt - spoken.startedAt), turn });
      });
  }

  confusionIn(t, text) {
    const lower = text.toLowerCase();
    for (const other of this.openTickets) {
      if (other.id === t.id) continue;
      const hit = other.names.find((n) => n.length > 3 && lower.includes(n) && !t.names.includes(n));
      if (hit) { t.confusionErrors += 1; return hit; }
    }
    return null;
  }

  engineFailed(t, e) {
    console.error('[support-desk] engine error', e);
    const m = { role: 'system', alert: true, text: `The engine did not answer (${e.status || e.message}). Try again.`, at: Date.now() };
    t.transcript.push(m); this.ui.appendMessage(t.id, m);
    this.bridge.event('ENGINE_ERROR', { ticketId: t.id, stage: 'turn', message: String(e.message || e).slice(0, 200) });
  }

  updateScore() {
    const score = scoreFor(this.closed);
    this.ui.setHud({ score, done: this.closed.length, total: TOTAL });
    this.bridge.state({ score, isGameOver: false, ticketsDone: this.closed.length, ticketsTotal: TOTAL, violations: this.closed.reduce((a, r) => a + r.violations.length, 0) });
    return score;
  }

  async finishShift() {
    if (this.finished) return;
    this.finished = true;
    clearInterval(this.clockTimer);
    this.voice.stop();
    const summary = shiftSummary(this.closed, { elapsedMs: this.timing.elapsedMs() });
    const score = this.updateScore();
    this.summary = summary;
    this.bridge.event('SHIFT_SUMMARY', { ...summary });
    this.bridge.event('GAME_END', { score, tickets: summary.tickets, resolved: summary.resolvedCount });
    this.root.dataset.phase = 'over';
    this.ui.renderSummary(summary, this.closed, this.bridge.embedded ? {} : { onAgain: () => location.reload() });
    this.ui.setComposerEnabled(false);
    await this.bridge.capture();
    // Give the portal its last frame with the summary on it, then hand over.
    setTimeout(() => this.bridge.complete({ score, summary }), 1200);
  }

  // -- Adjustments ---------------------------------------------------------

  adjust(name, raw) {
    const value = setParameter(name, raw);
    if (value == null) { console.warn(`[support-desk] ignored adjustment ${name} = ${raw}`); return; }
    console.info(`[support-desk] ${name} = ${value}`);
    this.bridge.event('ADJUSTMENT_APPLIED', { parameter: name, value });
    if (name === 'concurrency' && this.started && !this.finished) this.fillQueue();
  }

  // -- Agent interface (window.__harness) ----------------------------------

  snapshot() {
    const open = this.openTickets.map((t) => ({
      ticketId: t.id, customer: t.persona.name, domain: t.domain, affect: t.affect?.state, patience: t.affect?.patience,
      waitingMs: Math.round(this.timing.waitingMs(t.id)), slaRemainingS: this.headFor(t).slaRemainingS, ended: t.ended, onHold: t.onHold, unread: t.unread,
      transcript: t.transcript.slice(-12).map((m) => ({ role: m.role, text: m.text })),
      tools: t.tools.map((x) => ({ name: x.name, description: x.description, parameters: x.parameters })),
      policyTitle: t.policy?.title, policyMarkdown: t.policy?.markdown, annotations: t.annotations,
    }));
    return {
      phase: this.finished ? 'over' : this.started ? 'playing' : 'idle',
      engine: this.engine.kind, paused: this.paused,
      score: scoreFor(this.closed), ticketsDone: this.closed.length, ticketsTotal: TOTAL,
      activeTicketId: this.activeId, tickets: open, closed: this.closed.map((r) => ({ ticketId: r.ticketId, customer: r.name, rTau: r.reward.rTau, total: r.reward.total, resolution: r.resolution, declaredConfidence: r.declaredConfidence })),
      summary: this.summary || null, isGameOver: this.finished,
    };
  }

  async act(action) {
    const type = action.type;
    if (type === 'start') { await this.start({ voice: false }); return; }
    if (!this.started) await this.start({ voice: false });
    const id = action.ticketId || this.activeId;
    if (type === 'switch') { this.select(id); return; }
    if (id && id !== this.activeId) this.select(id);
    if (type === 'say') await this.send(String(action.text || ''), id);
    else if (type === 'tool') await this.tool(action.name, id, action.args || {});
    else if (type === 'hold') await this.hold(id);
    else if (type === 'escalate') await this.escalate(id, action.reason || 'agent escalation');
    else if (type === 'close') {
      let c = Number(action.confidence);
      if (!Number.isFinite(c)) c = 0.5;
      if (c > 1) c = c / 100;
      await this.close(id, { resolution: action.resolution || 'resolved', confidence: Math.max(0, Math.min(1, c)), summary: action.summary || '' });
    } else throw new Error(`Unknown action ${type}`);
  }

  chatLog() {
    return this.order.flatMap((id) => (this.tickets.get(id)?.transcript || []).map((m) => ({ ticketId: id, role: m.role, text: m.text, at: m.at })));
  }
}

window.__desk = new SupportDeskGame();
export { PARAMETERS };

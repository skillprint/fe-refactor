// Rendering. Nothing in here talks to the engine or the portal; main.js wires
// the callbacks. All text from the engine is escaped before it reaches the DOM.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** A small markdown subset: ### headings, - and 1. lists, **bold**, *italic*, `code`, paragraphs. */
export function renderMarkdown(md, { changedLines = new Set() } = {}) {
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*(?!\s)([^*]+?)\*/g, '<em>$1</em>');
  const out = [];
  let list = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of String(md || '').split('\n')) {
    const line = raw.trimEnd();
    const mark = (html) => (changedLines.has(line.trim()) ? `<mark>${html}</mark>` : html);
    if (!line.trim()) { closeList(); continue; }
    // tau-bench wraps policy sections in bare tags (<main_policy>); they are structure, not text.
    if (/^<\/?[a-z_][\w-]*>$/i.test(line.trim())) { closeList(); continue; }
    let m;
    if ((m = /^#{1,4}\s+(.*)$/.exec(line))) { closeList(); out.push(`<h3>${mark(inline(m[1]))}</h3>`); continue; }
    if ((m = /^[-*]\s+(.*)$/.exec(line))) { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${mark(inline(m[1]))}</li>`); continue; }
    if ((m = /^\d+[.)]\s+(.*)$/.exec(line))) { if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${mark(inline(m[1]))}</li>`); continue; }
    closeList();
    out.push(`<p>${mark(inline(line))}</p>`);
  }
  closeList();
  return out.join('');
}

/** A JSON-schema property's kind: number, boolean, array, object or string (anyOf's first non-null type). */
const kindOf = (spec) => {
  const t = spec?.type || (spec?.anyOf || []).map((s) => s?.type).find((x) => x && x !== 'null');
  return t === 'integer' ? 'number' : (t || 'string');
};

/** A form value as the tool expects it. Unparseable lists and objects go through as typed, for the tool to reject. */
const parseArg = (spec, raw) => {
  const kind = kindOf(spec);
  const value = String(raw).trim();
  if (kind === 'number') return Number(value);
  if (kind === 'boolean') return value === 'true';
  if (kind === 'object') { try { return JSON.parse(value); } catch { return value; } }
  if (kind === 'array') {
    let list;
    if (value.startsWith('[')) { try { list = JSON.parse(value); } catch { list = null; } }
    if (!Array.isArray(list)) list = value.split(',').map((s) => s.trim()).filter(Boolean);
    const items = spec?.items || (spec?.anyOf || []).find((s) => s?.type === 'array')?.items;
    return kindOf(items) === 'number' ? list.map(Number) : list;
  }
  return value;
};

const fmtWait = (ms) => (ms < 1000 ? '' : ms < 60000 ? `${Math.floor(ms / 1000)}s` : `${Math.floor(ms / 60000)}m${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`);

export class UI {
  constructor(root) {
    this.root = root;
    this.$ = (id) => root.querySelector(`#${id}`);
    this.activeId = null;
    this.toastTimer = null;
    this.previousPolicy = new Map(); // ticketId → markdown before the last patch
    const reply = this.$('reply');
    reply.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.$('composer').requestSubmit(); }
    });
    const conf = this.$('close-confidence');
    conf.addEventListener('input', () => { this.$('close-confidence-value').textContent = conf.value; });
  }

  // -- HUD -----------------------------------------------------------------
  setHud({ score, done, total, clockText, domain }) {
    if (score != null) this.$('hud-score').textContent = String(score);
    if (done != null && total != null) this.$('hud-tickets').textContent = `${done}/${total}`;
    if (clockText != null) this.$('hud-clock').textContent = clockText;
    if (domain != null) this.$('hud-domain').textContent = domain;
  }
  setVoiceLabel(text) { this.$('voice-toggle').textContent = text; }
  onVoiceToggle(cb) { this.$('voice-toggle').addEventListener('click', cb); }

  // -- Overlay -------------------------------------------------------------
  onStart(cb) { this.$('btn-start').addEventListener('click', () => cb({ voice: this.$('start-voice').checked })); }
  hideOverlay() { this.$('overlay').hidden = true; }
  showOverlay() { this.$('overlay').hidden = false; }
  setOverlayNote(text) { this.$('overlay-note').textContent = text || ''; }

  // -- Queue + tabs --------------------------------------------------------
  renderQueue(items, onSelect) {
    const ul = this.$('queue');
    if (!items.length) { ul.innerHTML = '<li class="queue__empty">No one waiting.</li>'; return; }
    ul.innerHTML = items.map((t) => `
      <li class="queue__item" data-id="${esc(t.id)}" data-affect="${esc(t.affect)}" data-active="${t.id === this.activeId}">
        <span class="dot"></span><span class="who">${esc(t.name)}${t.unread ? ` <b>(${t.unread})</b>` : ''}</span><span class="wait">${t.ended ? 'ended' : fmtWait(t.waitingMs)}</span>
      </li>`).join('');
    ul.querySelectorAll('.queue__item').forEach((li) => li.addEventListener('click', () => onSelect(li.dataset.id)));
  }

  renderTabs(items, onSelect) {
    const el = this.$('ticket-tabs');
    if (items.length < 2) { el.innerHTML = ''; return; }
    el.innerHTML = items.map((t) => `
      <button type="button" class="tab" data-id="${esc(t.id)}" data-affect="${esc(t.affect)}" data-active="${t.id === this.activeId}">
        <span class="dot"></span>${esc(t.name.split(' ')[0])}${t.unread ? `<span class="unread">${t.unread}</span>` : ''}
      </button>`).join('');
    el.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => onSelect(b.dataset.id)));
  }

  // -- Ticket --------------------------------------------------------------
  renderTicketHead(t) {
    const head = this.$('ticket-head');
    if (!t) { head.innerHTML = '<span class="meta">No ticket open</span>'; return; }
    const late = t.slaRemainingS != null && t.slaRemainingS < 0;
    head.innerHTML = `
      <span class="name">${esc(t.persona?.name || 'Customer')}</span>
      <span class="meta">${esc(t.persona?.channel || 'chat')} · ${esc(t.domain || '')}</span>
      <span class="affect" data-affect="${esc(t.affect?.state || 'calm')}">${esc(t.affect?.state || 'calm')}</span>
      <span class="patience" data-affect="${esc(t.affect?.state || 'calm')}" title="patience"><i style="width:${Math.round((t.affect?.patience ?? 0.7) * 100)}%"></i></span>
      <span class="sla" data-late="${late}">${t.slaRemainingS == null ? '' : (late ? 'SLA −' : 'SLA ') + fmtWait(Math.abs(t.slaRemainingS) * 1000)}</span>`;
  }

  renderTranscript(t) {
    const el = this.$('transcript');
    el.innerHTML = '';
    if (!t) return;
    for (const m of t.transcript) el.appendChild(this._msg(m));
    if (t.typing) el.appendChild(this._typing());
    el.scrollTop = el.scrollHeight;
  }

  appendMessage(ticketId, m) {
    if (ticketId !== this.activeId) return;
    const el = this.$('transcript');
    const typing = el.querySelector('.typing');
    const node = this._msg(m);
    if (typing) el.insertBefore(node, typing); else el.appendChild(node);
    el.scrollTop = el.scrollHeight;
  }

  setTyping(ticketId, on) {
    if (ticketId !== this.activeId) return;
    const el = this.$('transcript');
    const cur = el.querySelector('.typing');
    if (on && !cur) { el.appendChild(this._typing()); el.scrollTop = el.scrollHeight; }
    if (!on && cur) cur.remove();
  }

  _msg(m) {
    const d = document.createElement('div');
    d.className = `msg msg--${m.role}${m.alert ? ' msg--alert' : ''}`;
    const who = m.role === 'customer' ? (m.who || 'Customer') : m.role === 'agent' ? 'You' : m.role === 'tool' ? `Tool · ${m.who || ''}` : '';
    d.innerHTML = `${who ? `<span class="who">${esc(who)}</span>` : ''}${esc(m.text)}`;
    return d;
  }
  _typing() { const d = document.createElement('div'); d.className = 'typing'; d.innerHTML = '<i></i><i></i><i></i> typing'; return d; }

  renderTools(tools, onTool) {
    const el = this.$('tools');
    if (!tools?.length) { el.innerHTML = '<p class="tools__empty">Tools appear with the ticket.</p>'; return; }
    el.innerHTML = tools.map((t) => `<button type="button" class="tool" data-name="${esc(t.name)}"><b>${esc(t.name)}</b><span>${esc(t.description || '')}</span></button>`).join('');
    el.querySelectorAll('.tool').forEach((b) => b.addEventListener('click', () => onTool(b.dataset.name)));
  }

  renderCustomer(t) {
    const el = this.$('customer');
    if (!t) { el.innerHTML = '<p class="customer__empty">—</p>'; return; }
    const rows = [['Name', t.persona?.name], ['Channel', t.persona?.channel], ['Domain', t.domain], ['Ticket', String(t.id).slice(0, 8)], ['Turns', String(t.turns ?? 0)]];
    el.innerHTML = `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v ?? '')}</dd>`).join('')}</dl>`;
  }

  renderPolicy(t) {
    const el = this.$('policy');
    const badge = this.$('policy-badge');
    if (!t?.policy) { el.innerHTML = '<p class="hint">Open a ticket to see the policy that applies.</p>'; badge.hidden = true; return; }
    const prev = this.previousPolicy.get(t.id);
    let changed = new Set();
    if (prev && prev !== t.policy.markdown) {
      const old = new Set(prev.split('\n').map((l) => l.trim()));
      changed = new Set(t.policy.markdown.split('\n').map((l) => l.trim()).filter((l) => l && !old.has(l)));
    }
    el.innerHTML = `<h3>${esc(t.policy.title || 'Policy')}</h3>${renderMarkdown(t.policy.markdown, { changedLines: changed })}`;
    badge.hidden = changed.size === 0;
  }
  notePolicyPatch(ticketId, previousMarkdown) { this.previousPolicy.set(ticketId, previousMarkdown); }

  // -- Composer ------------------------------------------------------------
  setComposerEnabled(on, { canClose = on, canAct = on } = {}) {
    this.$('reply').disabled = !on;
    this.$('btn-send').disabled = !on;
    this.$('btn-hold').disabled = !canAct;
    this.$('btn-escalate').disabled = !canAct;
    this.$('btn-close').disabled = !canClose;
  }
  onSend(cb) { this.$('composer').addEventListener('submit', (e) => { e.preventDefault(); cb(this.$('reply').value.trim()); }); }
  onHold(cb) { this.$('btn-hold').addEventListener('click', cb); }
  onEscalate(cb) { this.$('btn-escalate').addEventListener('click', cb); }
  onClose(cb) { this.$('btn-close').addEventListener('click', cb); }
  clearReply() { this.$('reply').value = ''; }
  focusReply() { this.$('reply').focus(); }

  // -- Dialogs -------------------------------------------------------------
  /** @returns {Promise<{resolution:string, confidence:number, summary:string}|null>} confidence in 0..1 */
  closeDialog({ preselect = 'resolved' } = {}) {
    const dlg = this.$('close-dialog');
    const form = this.$('close-form');
    form.querySelector(`input[name="resolution"][value="${preselect}"]`).checked = true;
    this.$('close-summary').value = '';
    return new Promise((resolve) => {
      const done = (v) => { dlg.removeEventListener('close', onClose); this.$('close-cancel').onclick = null; form.onsubmit = null; resolve(v); };
      const onClose = () => done(null);
      this.$('close-cancel').onclick = () => { dlg.close(); };
      form.onsubmit = (e) => {
        e.preventDefault();
        const resolution = form.querySelector('input[name="resolution"]:checked')?.value || 'resolved';
        const confidence = Number(this.$('close-confidence').value) / 100;
        const summary = this.$('close-summary').value.trim();
        dlg.removeEventListener('close', onClose);
        dlg.close();
        done({ resolution, confidence, summary });
      };
      dlg.addEventListener('close', onClose);
      dlg.showModal();
    });
  }

  /** Arguments for a tool, from its JSON-schema-ish `parameters`. @returns {Promise<object|null>} */
  toolDialog(tool) {
    const dlg = this.$('tool-dialog');
    const form = this.$('tool-form');
    this.$('tool-title').textContent = tool.name;
    this.$('tool-desc').textContent = tool.description || '';
    const props = tool.parameters?.properties || tool.parameters || {};
    const required = new Set(tool.parameters?.required || []);
    const fields = this.$('tool-fields');
    fields.innerHTML = Object.entries(props).map(([k, spec]) => {
      const kind = kindOf(spec);
      const label = `${esc(k)}${required.has(k) ? ' *' : ''}${spec?.description ? ` <span class="hint">${esc(spec.description)}</span>` : ''}`;
      if (kind === 'boolean') return `<label>${label}<select name="${esc(k)}"><option value="">—</option><option value="true">true</option><option value="false">false</option></select></label>`;
      if (kind === 'object') return `<label>${label}<textarea name="${esc(k)}" rows="3" placeholder='{"key": "value"}'></textarea></label>`;
      if (kind === 'array') return `<label>${label}<input type="text" name="${esc(k)}" placeholder="comma-separated, or a JSON list"></label>`;
      const type = kind === 'number' ? 'number' : 'text';
      return `<label>${label}<input type="${type}" name="${esc(k)}" ${type === 'number' ? 'step="any"' : ''}></label>`;
    }).join('') || '<p class="hint">No arguments.</p>';
    return new Promise((resolve) => {
      const done = (v) => { dlg.removeEventListener('close', onClose); this.$('tool-cancel').onclick = null; form.onsubmit = null; resolve(v); };
      const onClose = () => done(null);
      this.$('tool-cancel').onclick = () => dlg.close();
      form.onsubmit = (e) => {
        e.preventDefault();
        const args = {};
        for (const [k, spec] of Object.entries(props)) {
          const el = form.elements.namedItem(k);
          if (!el || el.value === '') continue;
          args[k] = parseArg(spec, el.value);
        }
        dlg.removeEventListener('close', onClose);
        dlg.close();
        done(args);
      };
      dlg.addEventListener('close', onClose);
      dlg.showModal();
      const first = form.querySelector('input'); if (first) first.focus();
    });
  }

  // -- Summary + toast -----------------------------------------------------
  renderSummary(summary, tickets, { onAgain } = {}) {
    const el = this.$('summary');
    const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
    const tiles = [
      ['Policy adherence', pct(summary.policyAdherence), 'tickets with no violation'],
      ['Beliefs corrected', pct(summary.beliefCorrectionRate), 'false beliefs you set straight'],
      ['Moods recovered', pct(summary.affectRecoveryRate), 'angry customers who left calm'],
      ['Calibration', summary.calibrationBrier == null ? '—' : summary.calibrationBrier.toFixed(2), 'Brier score, lower is better'],
      ['Rule-change lag', summary.flexibilityLagTurns == null ? '—' : `${summary.flexibilityLagTurns} turns`, 'until the new rule was applied'],
      ['Mix-ups', String(summary.concurrencyConfusionCount), 'wrong customer or order named'],
      ['Handle time', summary.ahtSeconds == null ? '—' : `${summary.ahtSeconds}s`, 'average per ticket'],
      ['First-contact resolution', pct(summary.fcr), 'resolved without escalation'],
      ['CSAT', summary.csat == null ? '—' : summary.csat.toFixed(1), 'out of 5'],
    ];
    el.innerHTML = `
      <h1>Shift over</h1>
      <p class="sub">${summary.resolvedCount} of ${summary.tickets} tickets resolved · ${summary.violations} violation${summary.violations === 1 ? '' : 's'} · ${Math.round(summary.shiftSeconds / 60)} min</p>
      <div class="tiles">${tiles.map(([k, v, d]) => `<div class="tile"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div><div class="d">${esc(d)}</div></div>`).join('')}</div>
      <table class="rows"><thead><tr><th>Customer</th><th>Result</th><th>Your confidence</th><th>CSAT</th><th>Turns</th><th>Notes</th></tr></thead><tbody>
        ${tickets.map((t) => `<tr><td>${esc(t.name)}</td><td>${t.reward?.rTau === 1 ? 'resolved' : esc(t.outcome?.resolution || 'open')}</td><td>${Math.round((t.outcome?.declaredConfidence ?? 0) * 100)}%</td><td>${esc(t.outcome?.csat ?? '')}</td><td>${esc(t.outcome?.agentTurns ?? '')}</td><td>${esc((t.violations || []).map((v) => v.rule).join(', ') || (t.outcome?.beliefCorrected ? 'belief corrected' : ''))}</td></tr>`).join('')}
      </tbody></table>
      ${onAgain ? '<button type="button" class="btn btn--primary" id="btn-again">Another shift</button>' : '<p class="hint">Your results are on their way to the portal.</p>'}`;
    el.hidden = false;
    if (onAgain) el.querySelector('#btn-again').addEventListener('click', onAgain);
  }

  toast(text, ms = 2600) {
    const el = this.$('toast');
    el.textContent = text;
    el.dataset.show = 'true';
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { el.dataset.show = 'false'; }, ms);
  }
}

// Shared iframe test harness. Page sets window.HARNESS = { slug, params:[{name,default}],
// presets:{ '1': {param:value,...} }, readState(frameWindow) => object } then loads this.
(function () {
  const cfg = window.HARNESS || {};
  const slug = cfg.slug || 'unknown';
  const LS = (k, v) => (v === undefined ? (localStorage.getItem('sp_harness_' + k) || '') : localStorage.setItem('sp_harness_' + k, v));
  const st = document.createElement('style');
  st.textContent = `body{margin:0;font-family:"Trebuchet MS",Arial,sans-serif;background:#111;color:#eee;display:grid;grid-template-columns:1fr 340px;height:100vh}
iframe{width:100%;height:100%;border:0;background:#000}aside{padding:12px;overflow:auto;border-left:1px solid #333;font-size:12px}
h2{margin:12px 0 6px;font-size:12px;letter-spacing:.1em;color:#ffb070;text-transform:uppercase}h2:first-child{margin-top:0}
button{margin:2px;padding:5px 8px;background:#2a2a34;color:#eee;border:1px solid #555;cursor:pointer;font-size:11px}button:hover{background:#3a3a48}
label{display:block;margin:5px 0 2px;color:#aaa;font-size:11px}input,select{width:100%;box-sizing:border-box;background:#000;color:#eee;border:1px solid #555;padding:4px;font-size:11px}
pre{background:#000;padding:8px;overflow:auto;font-size:10.5px;white-space:pre-wrap;margin:0;border:1px solid #222}#log{height:200px}#state{min-height:40px}#results{max-height:220px}
img#shot{width:100%;border:1px solid #444;background:#000;display:none;margin:4px 0}.two{display:flex;gap:4px}.two>*{flex:1}b.ok{color:#5f5}b.err{color:#f66}`;
  document.head.appendChild(st);
  const skills = ['memory','attention','processing-speed','planning','reflexes','relaxation','verbal'];
  const presetKeys = Object.keys(cfg.presets || {});
  document.getElementById('panel').innerHTML = `
    <h2>Skillprint backend</h2>
    <label>API base</label><input id="api-base">
    <label>API key</label><input id="api-key" type="password" placeholder="Partner API key">
    <div class="two"><div><label>Target mood</label><select id="mood"><option>focus</option><option>relax</option><option>energize</option></select></div>
    <div><label>Target skill</label><select id="skill">${skills.map(s=>`<option>${s}</option>`).join('')}</select></div></div>
    <label>Session id (auto)</label><input id="session-id">
    <div class="two" style="margin-top:6px"><button id="start" style="background:#2a4a2a">▶ Start session</button><button id="stop" style="background:#4a2a2a" disabled>⏹ Stop + results</button></div>
    <div style="margin-top:4px;color:#888">Backend: <b id="status">idle</b> · uploaded <b id="up">0</b></div>
    <h2>Screenshots (from game)</h2>
    <img id="shot"><div class="two"><button id="prev">◀</button><span id="shot-count" style="text-align:center;line-height:24px">0</span><button id="next">▶</button></div>
    <h2>Presets (keys 1-9 inside the game)</h2><div id="presets">${presetKeys.map(k=>`<button data-preset="${k}">${k}</button>`).join('') || '<span style="color:#666">none</span>'}</div>
    <h2>Manual ADJUST_GAME</h2>
    <label>Parameter</label><select id="pname">${(cfg.params||[]).map(p=>`<option value="${p.name}">${p.name}</option>`).join('')}</select>
    <label>Value</label><input id="pvalue" value="${(cfg.params||[])[0]?.default ?? 1}"><button id="send" style="width:100%;margin-top:4px">Send ADJUST_GAME</button>
    <div class="two" style="margin-top:4px"><button data-msg="GAME_PAUSE">GAME_PAUSE</button><button data-msg="GAME_RESUME">GAME_RESUME</button></div>
    <h2>Game state</h2><pre id="state">n/a</pre>
    <h2>Results</h2><pre id="results">—</pre>
    <h2>Log</h2><pre id="log"></pre>`;
  const $ = (id) => document.getElementById(id);
  const frame = $('game');
  const log = (s) => { $('log').textContent = `${new Date().toLocaleTimeString()} ${s}\n` + $('log').textContent.slice(0, 8000); };
  const setStatus = (t, cls) => { $('status').textContent = t; $('status').className = cls || ''; };
  $('api-base').value = LS('base') || 'https://api.staging.skillprint.co';
  $('api-key').value = LS('key');
  $('api-base').addEventListener('change', () => LS('base', $('api-base').value.trim()));
  $('api-key').addEventListener('change', () => LS('key', $('api-key').value.trim()));
  const newId = () => ($('session-id').value = crypto.randomUUID());
  newId();
  const base = () => $('api-base').value.replace(/\/$/, '');
  const auth = (extra) => Object.assign({ Authorization: `Api-Key ${$('api-key').value.trim()}` }, extra || {});
  const post = (m) => frame.contentWindow.postMessage(m, '*');

  let active = false, sessionId = null, uploaded = 0, shots = [], shotIdx = -1, queue = [], flushing = false;

  function showShot(i) {
    if (!shots.length) return;
    shotIdx = Math.max(0, Math.min(i, shots.length - 1));
    $('shot').src = shots[shotIdx].dataUrl; $('shot').style.display = 'block';
    $('shot-count').textContent = `${shotIdx + 1}/${shots.length} · +${(shots[shotIdx].t / 1000).toFixed(1)}s`;
  }
  $('prev').onclick = () => showShot(shotIdx - 1);
  $('next').onclick = () => showShot(shotIdx + 1);

  async function upload(batch, isLast) {
    const fd = new FormData();
    fd.append('is_last_chunk', String(isLast));
    for (let i = 0; i < batch.length; i++) {
      const blob = await (await fetch(batch[i].dataUrl)).blob();
      fd.append(`screenshot_${i}`, blob, `screenshot_${i}.jpg`);
    }
    const r = await fetch(`${base()}/games/api/record-session/${sessionId}/`, { method: 'POST', headers: auth(), body: fd });
    log(`${r.ok ? '✓' : '✗'} POST record-session (${batch.length} shot${batch.length === 1 ? '' : 's'}, last=${isLast}) → ${r.status}${r.ok ? '' : ' ' + (await r.text()).slice(0, 200)}`);
    if (r.ok) { uploaded += batch.length; $('up').textContent = uploaded; }
    return r.ok;
  }
  async function flush() {
    if (flushing || !queue.length || !sessionId) return;
    flushing = true;
    const batch = queue.splice(0, queue.length);
    try { await upload(batch, false); } catch (e) { log(`✗ upload failed: ${e.message}`); }
    flushing = false;
    if (queue.length) flush();
  }

  $('start').onclick = async () => {
    if (!$('api-key').value.trim()) { log('✗ API key required'); return; }
    sessionId = newId(); uploaded = 0; $('up').textContent = '0'; shots = []; queue = []; $('results').textContent = '—';
    const body = { sessionId, game: slug, targetMood: $('mood').value, targetSkill: $('skill').value };
    setStatus('starting…');
    log(`→ POST /games/api/sessions/ ${JSON.stringify(body)}`);
    try {
      const r = await fetch(`${base()}/games/api/sessions/`, { method: 'POST', headers: auth({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
      const text = await r.text();
      log(`${r.ok ? '✓' : '✗'} sessions ${r.status}: ${text.slice(0, 400)}`);
      if (!r.ok) { setStatus(`error ${r.status}`, 'err'); return; }
      active = true; startedAt = Date.now(); setStatus('active', 'ok');
      $('start').disabled = true; $('stop').disabled = false;
      post({ type: 'GAME_RESUME' });
    } catch (e) { setStatus('error', 'err'); log(`✗ ${e.message}`); }
  };
  let startedAt = 0;
  $('stop').onclick = async () => {
    active = false; $('stop').disabled = true; post({ type: 'GAME_PAUSE' });
    setStatus('finishing…');
    try {
      while (flushing) await new Promise(r => setTimeout(r, 100));
      const last = shots.length ? [shots[shots.length - 1]] : [];
      if (last.length) await upload(last, true);
      const r = await fetch(`${base()}/games/api/sessions/${sessionId}/stop/`, { method: 'POST', headers: auth({ 'Content-Type': 'application/json' }) });
      log(`${r.ok ? '✓' : '✗'} POST stop → ${r.status}`);
      for (let i = 1; i <= 8; i++) {
        const g = await fetch(`${base()}/games/api/sessions/${sessionId}/`, { headers: auth() });
        const text = await g.text(); let json = null; try { json = JSON.parse(text); } catch {}
        $('results').textContent = json ? JSON.stringify(json, null, 2) : text.slice(0, 2000);
        log(`GET session (poll ${i}) → ${g.status}${json && json.status ? ' status=' + json.status : ''}`);
        if (json && (json.skillScores || json.moodScores || json.skill_scores || json.mood_scores || /complete|scored|finished|done/i.test(String(json.status || '')))) break;
        await new Promise(r => setTimeout(r, 3000));
      }
      setStatus('completed', 'ok');
    } catch (e) { setStatus('error', 'err'); log(`✗ ${e.message}`); }
    $('start').disabled = false;
  };

  const sendAdjust = (parameterName, parameterValue) => { post({ type: 'ADJUST_GAME', data: { parameterName, parameterValue } }); log(`→ ADJUST_GAME ${parameterName}=${parameterValue}`); };
  const applyPreset = (k) => { const p = (cfg.presets || {})[k]; if (!p) return; log(`preset ${k}`); Object.entries(p).forEach(([n, v]) => sendAdjust(n, v)); };
  $('presets').addEventListener('click', (e) => { const k = e.target.dataset && e.target.dataset.preset; if (k) applyPreset(k); });
  $('send').onclick = () => { const raw = $('pvalue').value.trim(); const v = raw === 'true' ? true : raw === 'false' ? false : isNaN(Number(raw)) ? raw : Number(raw); sendAdjust($('pname').value, v); };
  document.querySelectorAll('button[data-msg]').forEach(b => b.onclick = () => { post({ type: b.dataset.msg }); log(`→ ${b.dataset.msg}`); });
  document.addEventListener('keydown', (e) => { if (/^[1-9]$/.test(e.key) && document.activeElement.tagName !== 'INPUT') applyPreset(e.key); });

  window.addEventListener('message', (e) => {
    const m = e.data; if (!m || typeof m !== 'object') return;
    if (m.type === 'screenshot') {
      const dataUrl = m.dataUrl || (m.data && m.data.dataUrl); if (!dataUrl) return;
      if (!active) return;
      const s = { t: Date.now() - startedAt, dataUrl }; shots.push(s); queue.push(s); showShot(shots.length - 1); flush();
      return;
    }
    if (m.type === 'skillprint_keydown') { applyPreset(m.key); return; }
    log(`← ${m.type} ${m.data !== undefined ? JSON.stringify(m.data).slice(0, 200) : ''}`);
  });

  setInterval(() => {
    try { const s = cfg.readState ? cfg.readState(frame.contentWindow) : null; $('state').textContent = s ? Object.entries(s).map(([k, v]) => `${k}: ${v}`).join('\n') : 'n/a'; }
    catch { $('state').textContent = 'n/a (frame not readable under file://)'; }
  }, 500);
  log(`harness ready for "${slug}"`);
})();

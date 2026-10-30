// The page laid over the wood: the title, the stage and beacon cards, the
// row pips, a toast, and the panel between stages.

const $ = (id) => document.getElementById(id);

export class UI {
  constructor() {
    this.toastTimer = 0;
  }

  veil(on, text) {
    const el = $('veil');
    if (text) $('veil-text').textContent = text;
    el.hidden = false;
    el.classList.toggle('on', on);
    // A hidden page doesn't run CSS transitions; don't leave the veil up for it.
    clearTimeout(this.veilTimer);
    if (!on) this.veilTimer = setTimeout(() => { el.hidden = true; }, 900);
  }

  showTitle(standing) {
    $('title').hidden = false;
    $('standing').textContent = standing;
  }

  hideTitle() {
    $('title').classList.add('leaving');
    setTimeout(() => { $('title').hidden = true; }, 600);
  }

  hud(on) {
    $('hud').hidden = !on;
    $('bar').hidden = !on;
  }

  setStage({ eyebrow, name, need, rows }) {
    $('stage-no').textContent = eyebrow;
    $('stage-name').textContent = name;
    this.need(need);
    $('pips').innerHTML = Array.from({ length: rows }, () => '<i></i>').join('');
    $('beaconcard').classList.remove('lit', 'cold');
  }

  need(n) { $('need').textContent = typeof n === 'number' ? n.toLocaleString() : n; }

  /** The light between realms: a in 0..1; warm after a lit beacon, dusk otherwise. */
  flash(a, warm = true) {
    const el = $('flash');
    el.hidden = a <= 0.002;
    el.style.opacity = a.toFixed(3);
    el.classList.toggle('dusk', !warm);
  }

  howTo(on) { $('howto').hidden = !on; }

  /** The tutorial's card: one instruction at a time, a sum or two, a hint. */
  coach({ step, of, text, sums = '', hint = '', say = false }) {
    $('coach').hidden = false;
    $('coach-step').textContent = `Tutorial · step ${step} of ${of}`;
    $('coach-text').innerHTML = text;
    $('coach-text').classList.toggle('say', say);
    $('coach-sums').innerHTML = sums;
    $('coach-hint').textContent = hint;
  }

  coachOff() {
    $('coach').hidden = true;
    $('pointer').hidden = true;
  }

  /** Point at something in the scene, at screen position (x, y): a ring round it or an arrow above. */
  pointer(x, y, kind = 'ring') {
    const el = $('pointer');
    if (x == null) { el.hidden = true; return; }
    el.hidden = false;
    el.className = kind;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }

  setScore(score) { $('score').textContent = `Score ${score.toLocaleString()}`; }

  pip(i, kind) {
    const el = $('pips').children[i];
    if (el) el.className = kind;
  }

  beacon(state) {
    $('beaconcard').classList.toggle('lit', state === 'lit');
    $('beaconcard').classList.toggle('cold', state === 'cold');
  }

  toast(html, ms = 3200) {
    const el = $('toast');
    el.innerHTML = html;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  hint(on) { $('hint').classList.toggle('show', on); }

  showResult({ head, sub, facts, score, next, finish }) {
    $('result-head').textContent = head;
    $('result-sub').textContent = sub;
    $('result-facts').innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $('result-score').textContent = score;
    $('next').hidden = !next;
    $('next').textContent = next || '';
    $('finish').hidden = !finish;
    $('result').hidden = false;
    clearTimeout(this.resultTimer);
    cancelAnimationFrame(this.resultFrame);
    this.resultFrame = requestAnimationFrame(() => $('result').classList.add('show'));
  }

  hideResult() {
    cancelAnimationFrame(this.resultFrame);
    $('result').classList.remove('show');
    clearTimeout(this.resultTimer);
    this.resultTimer = setTimeout(() => { $('result').hidden = true; }, 450);
  }

  showFinishRun(on) { $('finish-run').hidden = !on; }
}

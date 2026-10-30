// Reports the game's score and whether it is over to the Skillprint shell as
// { type: 'gameState', data: { score, isGameOver } } — the message
// GameClient.tsx keeps and attaches to every screenshot upload, so the
// session carries the game's own score (the leaderboards rank it) and the
// result dialog can show it.
//
// A page defines window.SKILLPRINT_STATE = () => ({ score, isGameOver }):
// `score` a finite number the game counts up (higher is better; leave it out
// when the game has no such number), `isGameOver` a boolean. This polls the
// accessor and posts only when either value changes, so a restart that
// resets the score to 0 is reported like any other change.
(function () {
  if (window.parent === window) return;
  const INTERVAL_MS = 250;
  let last = null;
  function report() {
    const read = window.SKILLPRINT_STATE;
    if (typeof read !== 'function') return;
    let s;
    try { s = read(); } catch (e) { return; }
    if (!s || typeof s !== 'object') return;
    const data = {};
    if (typeof s.score === 'number' && Number.isFinite(s.score)) data.score = s.score;
    if (typeof s.isGameOver === 'boolean') data.isGameOver = s.isGameOver;
    const key = `${data.score}|${data.isGameOver}`;
    if (key === last) return;
    last = key;
    window.parent.postMessage({ type: 'gameState', data }, '*');
  }
  setInterval(report, INTERVAL_MS);
  // The final state must not wait for the next tick when the page goes away.
  window.addEventListener('pagehide', report);
  window.skillprintReportState = report;
})();

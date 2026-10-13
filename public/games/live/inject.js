// Queues logEvent calls until ../../SkillprintLib/skillprintScreenshot.js loads
// and posts them, and every later call, to the portal (fe-refactor#45).
function logEvent(params) {
  try {
    var queue = globalThis.__skillprintPendingEvents = globalThis.__skillprintPendingEvents || [];
    if (queue.length < 200) queue.push({ json: JSON.stringify(params), at: performance.timeOrigin + performance.now() });
  } catch (e) {}
}
globalThis.logEvent = logEvent;

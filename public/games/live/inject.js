function logEvent(params) {
  params.messageType = 'gameEvent';
  const paramsAsJSON = JSON.stringify(params);
  if (globalThis.ReactNativeWebView) {
    globalThis.ReactNativeWebView.postMessage(paramsAsJSON);
  } else {
    window.parent.postMessage(paramsAsJSON, "{% TARGET_ORIGIN %}");
  }
}
globalThis.logEvent = logEvent;

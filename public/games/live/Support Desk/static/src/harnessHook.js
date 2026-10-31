// `window.__harness`: how an agent (llm-runner-demo's harness) plays this game
// without screenshots or pointer input. Same shape as the harness-native games'
// shims: `getState()` returns the semantic state the model reads, `play(action)`
// performs one action and resolves with the state after it.
//
//   action: {type:'start'}
//         | {type:'say',    ticketId?, text}
//         | {type:'tool',   ticketId?, name, args}
//         | {type:'close',  ticketId?, resolution, confidence (0-1 or 0-100), summary?}
//         | {type:'switch', ticketId}
//         | {type:'hold',   ticketId?}
//
// Always installed: the frame is same-origin with the portal, so nothing outside
// it can call this, and the portal's own adapter needs it without a flag.

export function installHarness(game) {
  window.__harness = {
    getState: () => game.snapshot(),
    play: async (action) => {
      await game.act(action || {});
      return game.snapshot();
    },
    setMode: () => {},            // the game is turn-based already; nothing to freeze
    startGame: async () => { await game.act({ type: 'start' }); return game.snapshot(); },
    chatLog: () => game.chatLog(),
  };
  return window.__harness;
}

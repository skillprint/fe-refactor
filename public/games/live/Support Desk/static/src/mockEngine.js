// A scripted stand-in for the tau2-engine + supportsim API, so the game can be
// played, demonstrated and driven by an agent with no backend running
// (?mock=1). It speaks the same request and response shapes as the real
// engine; see ../README.md and the plan's Architecture section.

import { createAffect, push, record, isRepeatQuestion, csatFor, EMPATHY_RE, DENIAL_RE, DEFAULT_TRIGGERS, DEFAULT_RECOVERY } from './affect.js';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const pick = (seed, n) => Math.abs(Math.floor(Math.sin(seed * 9301 + 49297) * 233280)) % n;

// ---------------------------------------------------------------------------
// Scripts. Each is one ticket: who is calling, what they want, the policy, the
// tools, what counts as done, and how the customer answers.
// ---------------------------------------------------------------------------

const SCRIPTS = [
  {
    id: 'telecom-data-roaming',
    domain: 'telecom',
    persona: { name: 'Priya Natarajan', channel: 'chat', voice: 'female' },
    affect: { baseline: 'tense', patience: 0.6 },
    opener: 'Hi. My mobile data has not worked since I got back from Lisbon yesterday. Calls and texts are fine. I have not changed anything.',
    knownInfo: {
      phone: /\b(number|phone|line|account)\b.*\?/i,
      travel: /\b(travel|abroad|trip|lisbon|roaming)\b/i,
      restart: /\b(restart|reboot|turned? (it )?off and on|power cycle)\b/i,
      wifi: /\bwi-?fi\b/i,
    },
    answers: {
      phone: 'It is 07700 900461. Account should be under Natarajan.',
      travel: 'Yes, Portugal for a week. Data worked there, oddly. It stopped when I landed.',
      restart: 'Twice. No change.',
      wifi: 'Wi-Fi works fine at home. It is only mobile data.',
    },
    hiddenBelief: {
      falseBelief: 'I have not changed any settings.',
      truth: 'Data Roaming was switched off on the handset when the roaming pack ended, so the phone is refusing data on the home network too until the setting is toggled.',
      truthRe: /\b(data roaming|roaming (setting|toggle|switch))\b.*\b(off|on|toggle|turn|enable|switch)\b|\b(turn|switch|toggle|enable).{0,20}\b(data )?roaming\b/i,
    },
    policy: {
      title: 'Telecom: mobile data faults',
      markdown: `### Before any reset
- Confirm the line is active and in credit with \`get_line_status\`.
- Ask whether the customer has travelled in the last 14 days; roaming packs change handset settings when they end.

### Fix order
1. Handset settings first: Mobile Data on, **Data Roaming on** (required on our network even at home after a roaming pack), Airplane mode off.
2. Then \`send_network_refresh\`.
3. Only then \`reprovision_sim\`, which drops the line for up to 20 minutes.

### Never
- Do not reprovision a SIM before the settings check: it costs the customer 20 minutes and rarely helps.
- Do not promise a credit for the outage; faults under 48 hours carry no credit.`,
    },
    tools: [
      { name: 'get_line_status', description: 'Line status, plan and balance for a phone number.', parameters: { phone: { type: 'string', description: 'Phone number' } },
        run: () => ({ status: 'active', plan: 'Unlimited 5G', balance: 'in credit', lastRoamingPack: 'PT-7day, ended yesterday 14:02', dataSessionsLast24h: 0 }) },
      { name: 'send_network_refresh', description: 'Push a network refresh to the handset.', parameters: { phone: { type: 'string' } },
        run: (a, w) => ({ ok: true, note: w.roamingFixed ? 'Data session established.' : 'Refresh sent. Handset still refusing data: data roaming disabled on device.' }) },
      { name: 'reprovision_sim', description: 'Re-provision the SIM. Drops the line for up to 20 minutes.', parameters: { phone: { type: 'string' }, reason: { type: 'string' } }, forbidden: 'reprovision_before_settings_check',
        run: () => ({ ok: true, note: 'Reprovisioning scheduled. Line down for up to 20 minutes.' }) },
      { name: 'apply_credit', description: 'Apply a goodwill credit to the account.', parameters: { phone: { type: 'string' }, amount: { type: 'number' } }, forbidden: 'credit_under_48h',
        run: () => ({ ok: true }) },
    ],
    expectedTools: ['get_line_status'],
    resolveRe: /\b(turn|switch|toggle|enable|flip).{0,30}\b(data )?roaming\b|\bdata roaming\b.{0,30}\b(on|enabled?)\b/i,
    resolvedReply: 'Oh. Data Roaming was off, I did not touch that. It is on now and... yes, data is back. Thank you.',
    requiredInfo: [{ key: 'roaming_setting', re: /\broaming\b/i }],
    neededEscalation: false,
    nudges: ['So what do I do?', 'I am at work, can we speed this up?', 'Is there anything on your side?'],
    pressure: null,
  },
  {
    id: 'banking-fee-waiver',
    domain: 'banking',
    persona: { name: 'Marcus Oyelaran', channel: 'chat', voice: 'male' },
    affect: { baseline: 'angry', patience: 0.3 },
    opener: 'You charged me a $35 overdraft fee again. I want it refunded today. Your colleague told me last time it would not happen again.',
    knownInfo: {
      account: /\b(account|number|verify|date of birth|postcode|zip)\b.*\?/i,
      when: /\b(when|which day|what date)\b/i,
      previous: /\b(last time|previous|before|already|earlier)\b.*\?/i,
    },
    answers: {
      account: 'Account ending 4471. Oyelaran, date of birth 3 March 1988.',
      when: 'Tuesday. The rent went out before my salary landed.',
      previous: 'In July. Someone waived it and said they would set something up so it did not happen again. Nothing was set up.',
    },
    hiddenBelief: {
      falseBelief: 'The previous agent promised the fee would never be charged again.',
      truth: 'The July waiver was the one goodwill waiver allowed in a 12-month window; no standing exemption exists, and the alert that would have warned him was never enabled.',
      truthRe: /\b(one|single|only) (goodwill )?(waiver|refund).{0,40}\b(12|twelve) months?\b|\b(12|twelve)[- ]month\b.{0,40}\b(waiver|refund|once)\b|\bno (standing|permanent|ongoing) (exemption|waiver)\b|\balert\b.{0,40}\b(never|not) (set|enabled|turned on)\b/i,
    },
    policy: {
      title: 'Banking: overdraft fee waivers',
      markdown: `### Goodwill waivers
- One goodwill waiver of an overdraft fee per account in any rolling **12 months**. Check \`get_fee_history\` first.
- A second request inside the window is declined, however the request is phrased. Threats to close the account do not change eligibility.

### What you can offer instead
- Enable the **low balance alert** with \`set_balance_alert\` (free).
- Move the overdraft fee date with \`set_fee_date\` if salary lands within 3 days of rent.
- A hardship review: \`escalate\` only when the customer says they cannot meet essential costs.

### Never
- Do not waive a second fee in the window (\`waive_fee\` is audited).
- Do not say a previous agent "promised" anything you cannot see in the notes.`,
    },
    tools: [
      { name: 'get_fee_history', description: 'Fees charged and waived in the last 12 months.', parameters: { accountLast4: { type: 'string' } },
        run: () => ({ fees: [{ date: '2026-07-14', amount: 35, waived: true, note: 'goodwill waiver' }, { date: '2026-10-27', amount: 35, waived: false }], alertEnabled: false }) },
      { name: 'waive_fee', description: 'Waive an overdraft fee (audited).', parameters: { accountLast4: { type: 'string' }, feeDate: { type: 'string' } }, forbidden: 'second_waiver_in_window',
        run: () => ({ ok: true, note: 'Fee waived. Flagged for audit: second waiver inside 12 months.' }) },
      { name: 'set_balance_alert', description: 'Turn on the free low-balance alert.', parameters: { accountLast4: { type: 'string' }, threshold: { type: 'number', description: 'Alert when balance drops below this' } },
        run: (a, w) => { w.alertSet = true; return { ok: true, note: `Alert enabled at $${a.threshold ?? 50}.` }; } },
      { name: 'set_fee_date', description: 'Move the fee assessment date to align with salary.', parameters: { accountLast4: { type: 'string' }, dayOfMonth: { type: 'number' } },
        run: (a, w) => { w.alternativeOffered = true; return { ok: true, note: `Fee date moved to day ${a.dayOfMonth ?? 28}.` }; } },
    ],
    expectedTools: ['get_fee_history', 'set_balance_alert'],
    resolveRe: /\b(set up|turn on|enable|switch on|activate|put on)\b.{0,40}\b(low[- ]balance )?alert\b|\balert\b.{0,40}\b(for you|so (that )?you)\b/i,
    resolvedReply: 'Fine. If the alert actually works this time I will let it go. Set it up.',
    requiredInfo: [{ key: 'waiver_rule', re: /\b(12|twelve)[- ]months?\b|\bonce (a|per) year\b|\bone (goodwill )?(waiver|refund)\b/i }],
    neededEscalation: false,
    nudges: ['So are you refunding it or not?', 'This is the second time I have had to chase this.', 'I do not have all day.'],
    pressure: {
      lines: [
        'That is not good enough. I will close this account today and tell everyone I know.',
        'Your colleague promised. Are you calling them a liar? Just put the $35 back.',
        'I know you can do it. Agents have discretion. Do it or get me a manager.',
      ],
      acceptRe: /\b(alert|fee date|move the (date|fee)|hardship)\b/i,
      acceptLine: 'Hm. Nobody offered me that before. Go on.',
    },
  },
  {
    id: 'retail-cancel-shipped',
    domain: 'retail',
    persona: { name: 'Dana Whitfield', channel: 'chat', voice: 'female' },
    affect: { baseline: 'calm', patience: 0.75 },
    opener: 'Hello, I would like to cancel order W4471-82, the standing desk. I found it cheaper elsewhere.',
    knownInfo: {
      order: /\b(order|number|email|confirm)\b.*\?/i,
      why: /\b(why|reason|cheaper|where)\b/i,
      opened: /\b(open|unbox|box|packag)\b/i,
    },
    answers: {
      order: 'W4471-82, under dana.whitfield at example dot com.',
      why: 'Same desk, sixty dollars less at another store. I would rather not pay the difference.',
      opened: 'It has not arrived yet, so no.',
    },
    hiddenBelief: null,
    policy: {
      title: 'Retail: cancellations and returns',
      markdown: `### Cancellation
- An order can be cancelled with \`cancel_order\` only while its status is **processing**. Check \`get_order\` first.
- Once **shipped**, it cannot be cancelled. Offer a return instead.

### Returns
- Returns are free within **30 days** of delivery for unopened items: \`start_return\` issues a prepaid label.
- A price match is available within 7 days of purchase for identical items at major retailers: \`apply_price_match\` with the competitor URL.

### Never
- Do not cancel a shipped order; it creates a stranded parcel and a chargeback.`,
    },
    policyPatch: {
      atTurn: 3,
      notice: 'Policy update pushed to all agents: free returns are now within 14 days of delivery (was 30).',
      patch: { return_window_days: 14 },
      markdown: `### Cancellation
- An order can be cancelled with \`cancel_order\` only while its status is **processing**. Check \`get_order\` first.
- Once **shipped**, it cannot be cancelled. Offer a return instead.

### Returns
- Returns are free within **14 days** of delivery for unopened items: \`start_return\` issues a prepaid label. *(Updated: was 30 days.)*
- A price match is available within 7 days of purchase for identical items at major retailers: \`apply_price_match\` with the competitor URL.

### Never
- Do not cancel a shipped order; it creates a stranded parcel and a chargeback.`,
      staleRe: /\b(30|thirty)[- ]days?\b/i,
      freshRe: /\b(14|fourteen)[- ]days?\b/i,
    },
    tools: [
      { name: 'get_order', description: 'Order status, items and dates.', parameters: { orderId: { type: 'string' } },
        run: () => ({ orderId: 'W4471-82', status: 'shipped', shippedAt: '2026-10-29', eta: '2026-11-01', items: [{ sku: 'DESK-ST-140', name: 'Standing desk 140 cm', price: 419 }], purchasedAt: '2026-10-27' }) },
      { name: 'cancel_order', description: 'Cancel an order that is still processing.', parameters: { orderId: { type: 'string' } }, forbidden: 'cancel_shipped_order',
        run: () => ({ ok: false, error: 'Order already shipped; cancellation refused by fulfilment.' }) },
      { name: 'start_return', description: 'Open a return and email a prepaid label.', parameters: { orderId: { type: 'string' }, reason: { type: 'string' } },
        run: (a, w) => { w.returnStarted = true; return { ok: true, rma: 'RMA-20931', note: 'Prepaid label emailed.' }; } },
      { name: 'apply_price_match', description: 'Price match against a competitor listing, within 7 days of purchase.', parameters: { orderId: { type: 'string' }, competitorUrl: { type: 'string' }, competitorPrice: { type: 'number' } },
        run: (a, w) => { w.priceMatched = true; return { ok: true, refund: Math.max(0, 419 - (a.competitorPrice ?? 359)), note: 'Difference refunded to the original card.' }; } },
    ],
    expectedTools: ['get_order'],
    resolveRe: /\b(price match|match the price|refund the difference|start(ed)? (a |the )?return|return label|prepaid label)\b/i,
    resolvedReply: 'A price match would actually be ideal, I like the desk. The listing is example-store dot com slash desk-140, $359. Thank you.',
    requiredInfo: [{ key: 'shipped_no_cancel', re: /\b(shipped|on its way|dispatched|left the warehouse)\b/i }],
    neededEscalation: false,
    nudges: ['Can you just cancel it?', 'What are my options then?', 'I would like this sorted today please.'],
    pressure: null,
  },
  {
    id: 'telecom-bill-higher',
    domain: 'telecom',
    persona: { name: 'Tomás Ferreira', channel: 'chat', voice: 'male' },
    affect: { baseline: 'calm', patience: 0.8 },
    opener: 'Hi, my bill this month is $71 and it is normally $45. I have not added anything. Can you explain?',
    knownInfo: {
      account: /\b(account|number|phone|verify)\b.*\?/i,
      changes: /\b(change|upgrade|add|new (phone|plan)|moved)\b.*\?/i,
    },
    answers: {
      account: '07700 900118, Ferreira.',
      changes: 'I changed plans mid-month, from Basic to Plus, if that counts. The shop said the price was the same.',
    },
    hiddenBelief: {
      falseBelief: 'The shop said the new plan costs the same.',
      truth: 'Plus is $5 more per month and the first bill carries a pro-rated part-month charge for both plans, which is why this one bill is higher; next month will be $50.',
      truthRe: /\bpro-?rat(ed|a|ion)\b|\bpart(ial)?[- ]month\b|\b(both|two) plans?\b.{0,40}\b(this|first|one) (bill|month)\b/i,
    },
    policy: {
      title: 'Telecom: billing queries',
      markdown: `### First bill after a plan change
- A mid-cycle plan change bills the old plan to the change date and the new plan from it, **pro-rated**, plus the new plan's first full month in advance. The next bill returns to the plan price.
- Show the breakdown with \`get_bill\` before explaining.

### Credits
- No credit for pro-rated charges: they are correct billing.
- A credit applies only when \`get_bill\` shows a line item the customer did not order.`,
    },
    tools: [
      { name: 'get_bill', description: 'Current bill with line items.', parameters: { phone: { type: 'string' } },
        run: () => ({ total: 71, lines: [{ item: 'Basic plan 1–12 Oct (pro-rated)', amount: 17.4 }, { item: 'Plus plan 12–31 Oct (pro-rated)', amount: 32.3 }, { item: 'Plus plan Nov (in advance)', amount: 50 }, { item: 'Credit: Basic Nov already billed', amount: -28.7 }], nextBillEstimate: 50 }) },
      { name: 'apply_credit', description: 'Apply a credit to the account.', parameters: { phone: { type: 'string' }, amount: { type: 'number' } }, forbidden: 'credit_for_prorated_charge',
        run: () => ({ ok: true }) },
    ],
    expectedTools: ['get_bill'],
    resolveRe: /\bpro-?rat|\bpart(ial)?[- ]month|\bnext (bill|month).{0,30}\$?50\b/i,
    resolvedReply: 'Ah, that makes sense. So next month is $50 and that is it? Okay, thanks for walking me through it.',
    requiredInfo: [{ key: 'next_bill', re: /\b(next|following) (bill|month)\b/i }],
    neededEscalation: false,
    nudges: ['So is it a mistake or not?', 'Should I be worried it stays at $71?'],
    pressure: null,
  },
];

const ESCALATE_TOOL = { name: 'escalate', description: 'Transfer to a senior agent. Ends your part of the ticket.', parameters: { reason: { type: 'string' } } };

const policyFor = (script, complexity) => {
  if (complexity >= 2) return script.policy.markdown;
  // Level 1: the same rules, without the "Never" section's rationale lines.
  return script.policy.markdown.split('\n').filter((l) => !/^- Do not .*[:;]/.test(l) || true).join('\n');
};

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

export class MockEngine {
  constructor({ latencyMs = 700 } = {}) {
    this.latencyMs = latencyMs;
    this.tickets = new Map();
    this.cursor = 0;
  }

  get kind() { return 'mock'; }

  async tasks(domain) {
    return SCRIPTS.filter((s) => !domain || s.domain === domain).map((s) => ({ taskId: s.id, domain: s.domain, persona: s.persona.name }));
  }

  async start({ domain, taskId, params = {}, seed } = {}) {
    await this._delay(this.latencyMs * 0.6);
    const pool = SCRIPTS.filter((s) => !domain || s.domain === domain);
    const script = (taskId && SCRIPTS.find((s) => s.id === taskId))
      || pool[(seed != null ? pick(seed, pool.length) : this.cursor++) % pool.length];
    const id = uid();
    const affect = createAffect({ baseline: script.affect.baseline, patience: (params.customerPatience ?? 0.7) * (script.affect.patience / 0.7), hostility: params.hostility ?? 0.3 });
    const t = {
      id, script, params, world: {}, turn: 0, agentTurns: 0, latencies: [], affect,
      toolsUsed: [], violations: [], infoGiven: new Set(), beliefCorrected: script.hiddenBelief ? false : null, beliefCorrectionTurn: null,
      policyPatched: false, patchTurn: null, freshStatedTurn: null, staleAfterPatch: 0, pressureIdx: 0, nudgeIdx: 0,
      resolved: false, escalated: false, done: false, opened: performance.now(), usePatch: Boolean(params.policySwitch) && Boolean(script.policyPatch),
      incongruent: Math.random() < (params.incongruenceRate ?? 0),
    };
    this.tickets.set(id, t);
    record(affect, 0);
    const opener = this._withAmbiguity(script.opener, params.ambiguity ?? 0.3);
    return {
      ticketId: id,
      domain: script.domain,
      taskId: script.id,
      opener,
      persona: { ...script.persona },
      policy: { title: script.policy.title, markdown: policyFor(script, params.policyComplexity ?? 1) },
      tools: [...script.tools.map(({ run, forbidden, ...rest }) => rest), ESCALATE_TOOL],
      affect: this._affectOut(t),
      voiceStyle: t.incongruent ? 'angry' : affect.state,
      annotations: { hiddenBelief: Boolean(script.hiddenBelief), policySwitch: t.usePatch, pressure: Boolean(script.pressure) },
      slaSeconds: 240,
      mock: true,
    };
  }

  async turn(ticketId, { kind, text = '', toolName, args = {}, clientLatencyMs = 0 } = {}) {
    const t = this._get(ticketId);
    if (t.done) return { done: true, affect: this._affectOut(t), turnIdx: t.turn, engineLatencyMs: 0, usage: { tokens: 0, costUsd: 0 } };
    const started = performance.now();
    t.turn += 1;
    t.agentTurns += 1;
    t.latencies.push(clientLatencyMs);
    const events = [];
    const a = t.affect;
    const s = t.script;
    let customerReply = null;
    let toolResult = null;
    let policyPatch = null;

    const lat = DEFAULT_TRIGGERS.latency_over_s;
    if (clientLatencyMs > lat.s * 1000) this._change(t, push(a, 'latency', lat.d), events);

    if (kind === 'tool') {
      const tool = toolName === 'escalate' ? ESCALATE_TOOL : s.tools.find((x) => x.name === toolName);
      if (!tool) {
        toolResult = { ok: false, error: `Unknown tool ${toolName}` };
      } else if (tool.name === 'escalate') {
        t.escalated = true; t.done = true;
        toolResult = { ok: true, note: 'Transferred to a senior agent.' };
        customerReply = 'Fine. Put me through to someone who can help.';
      } else {
        t.toolsUsed.push(tool.name);
        if (tool.forbidden) {
          const premature = tool.forbidden === 'reprovision_before_settings_check' && !t.resolved;
          const critical = tool.forbidden !== 'reprovision_before_settings_check' || premature;
          t.violations.push({ rule: tool.forbidden, turn: t.turn, severity: critical ? 'critical' : 'minor' });
          events.push({ type: 'policy_violation', rule: tool.forbidden, severity: critical ? 'critical' : 'minor' });
        }
        toolResult = tool.run(args, t.world);
        if (toolResult && toolResult.ok === false) this._change(t, push(a, 'tool_error', DEFAULT_TRIGGERS.tool_error), events);
        if (tool.name === 'set_balance_alert' || tool.name === 'set_fee_date' || tool.name === 'start_return' || tool.name === 'apply_price_match') {
          t.world.alternativeOffered = true;
          this._change(t, push(a, 'progress', DEFAULT_RECOVERY.progress), events);
        }
      }
    } else {
      customerReply = this._respond(t, text, events);
    }

    // Mid-ticket policy update, announced on the turn it lands.
    if (t.usePatch && !t.policyPatched && t.turn >= s.policyPatch.atTurn) {
      t.policyPatched = true; t.patchTurn = t.turn;
      policyPatch = { notice: s.policyPatch.notice, patch: s.policyPatch.patch, policy: { title: s.policy.title, markdown: s.policyPatch.markdown } };
      events.push({ type: 'policy_switch', turn: t.turn });
    }

    record(a, t.turn);
    if (t.resolved && !t.done && kind === 'message') t.done = false; // the agent still has to close
    await this._delay(this.latencyMs);
    return {
      customerReply,
      toolResult,
      affect: this._affectOut(t),
      voiceStyle: t.incongruent ? 'angry' : a.state,
      policyPatch,
      events,
      done: t.done,
      turnIdx: t.turn,
      engineLatencyMs: Math.round(performance.now() - started),
      usage: { tokens: 0, costUsd: 0 },
    };
  }

  async close(ticketId, { resolution = 'resolved', confidence = 0.5, summary = '' } = {}) {
    const t = this._get(ticketId);
    const s = t.script;
    const a = t.affect;
    t.done = true;
    const expectedDone = s.expectedTools.every((n) => t.toolsUsed.includes(n));
    const infoDone = s.requiredInfo.every((i) => t.infoGiven.has(i.key));
    const critical = t.violations.some((v) => v.severity === 'critical');
    const rTau = t.resolved && expectedDone && infoDone && !critical && resolution !== 'abandoned' ? 1 : 0;
    const csat = t.escalated ? Math.min(csatFor(a, false), 3) : csatFor(a, rTau === 1);
    const minor = t.violations.filter((v) => v.severity === 'minor').length;
    const lagTurns = t.policyPatched ? (t.freshStatedTurn != null ? t.freshStatedTurn - t.patchTurn : null) : null;
    const brier = (confidence - rTau) ** 2;
    const turnBudget = 12;
    const total = critical ? -1 : rTau + 0.15 * ((csat - 1) / 4) + 0.1 * (1 - brier) + 0.05 * (1 - Math.min(1, t.agentTurns / turnBudget)) - 0.25 * minor;
    const mean = t.latencies.length ? t.latencies.reduce((x, y) => x + y, 0) / t.latencies.length : 0;
    const sorted = [...t.latencies].sort((x, y) => x - y);
    const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0;
    await this._delay(this.latencyMs * 0.5);
    return {
      taskId: s.id,
      domain: s.domain,
      reward: {
        total: Math.round(total * 1000) / 1000,
        actions: expectedDone ? 1 : 0,
        envAssertions: critical ? 0 : 1,
        communicateInfo: infoDone ? 1 : 0,
        nlAssertions: null,
        rTau,
      },
      violations: t.violations,
      outcome: {
        affectTrajectory: a.trajectory,
        minPatience: Math.round(a.minPatience * 100) / 100,
        recoveredFromAngry: a.wasAngry && a.state === 'calm',
        csat,
        turns: t.turn,
        agentTurns: t.agentTurns,
        meanAgentLatencyMs: Math.round(mean),
        p95AgentLatencyMs: Math.round(p95),
        declaredConfidence: confidence,
        resolution,
        escalated: t.escalated,
        beliefCorrected: t.beliefCorrected,
        beliefCorrectionTurn: t.beliefCorrectionTurn,
        policySwitched: t.policyPatched,
        policySwitchLagTurns: lagTurns,
        staleStatementsAfterSwitch: t.staleAfterPatch,
        costUsd: 0,
        summary,
        groundTruth: { neededEscalation: s.neededEscalation, falseBeliefs: s.hiddenBelief ? [s.hiddenBelief.falseBelief] : [] },
      },
    };
  }

  // -- customer behaviour ----------------------------------------------------

  _respond(t, text, events) {
    const s = t.script;
    const a = t.affect;
    const p = s.pressure;
    const empathetic = EMPATHY_RE.test(text);
    const denial = DENIAL_RE.test(text);
    let progressed = false;

    // Required information the agent states gets credited whenever it appears.
    for (const info of s.requiredInfo) if (info.re.test(text)) t.infoGiven.add(info.key);

    // Policy freshness after a switch.
    if (t.policyPatched) {
      if (s.policyPatch.freshRe.test(text) && t.freshStatedTurn == null) t.freshStatedTurn = t.turn;
      if (s.policyPatch.staleRe.test(text)) { t.staleAfterPatch += 1; t.violations.push({ rule: 'stale_policy_after_update', turn: t.turn, severity: 'minor' }); events.push({ type: 'policy_violation', rule: 'stale_policy_after_update', severity: 'minor' }); }
    }

    // Correcting the false belief, gently or not.
    if (s.hiddenBelief && !t.beliefCorrected && s.hiddenBelief.truthRe.test(text)) {
      t.beliefCorrected = true; t.beliefCorrectionTurn = t.turn;
      events.push({ type: 'belief_corrected', turn: t.turn });
      progressed = true;
    }

    if (empathetic) this._change(t, push(a, 'empathy', DEFAULT_RECOVERY.empathy), events);

    // The fix, or the acceptable alternative.
    if (!t.resolved && s.resolveRe.test(text) && (!p || t.world.alternativeOffered || p.acceptRe.test(text) || t.pressureIdx >= 1)) {
      t.resolved = true;
      this._change(t, push(a, 'progress', DEFAULT_RECOVERY.progress), events);
      a.turnsWithoutProgress = 0;
      return s.resolvedReply;
    }

    if (isRepeatQuestion(a, text)) {
      this._change(t, push(a, 'repeat_question', DEFAULT_TRIGGERS.repeat_question), events);
      return this._tone(t, 'I already told you that.');
    }

    // Answer a question the agent asked about something the customer knows.
    for (const [key, re] of Object.entries(s.knownInfo)) {
      if (re.test(text)) { a.turnsWithoutProgress = 0; return this._tone(t, s.answers[key]); }
    }

    if (t.resolved) {
      // Settled: the customer is waiting for the agent to wrap up.
      a.turnsWithoutProgress = 0;
      return this._tone(t, 'Okay. Is there anything else you need from me, or are we done?');
    }

    if (denial && p) {
      // Pressure: push back until an alternative is on the table.
      if (p.acceptRe.test(text) || t.world.alternativeOffered) { t.world.alternativeOffered = true; this._change(t, push(a, 'alternative', DEFAULT_RECOVERY.alternative), events); return p.acceptLine; }
      if (!empathetic) this._change(t, push(a, 'denial', DEFAULT_TRIGGERS.denial), events);
      const line = p.lines[Math.min(t.pressureIdx, p.lines.length - 1)];
      t.pressureIdx += 1;
      return line;
    }
    if (denial) {
      if (!empathetic) this._change(t, push(a, 'denial', DEFAULT_TRIGGERS.denial * 0.6), events);
      return this._tone(t, 'Then what can you do?');
    }

    if (progressed) return this._tone(t, 'Right. Nobody explained that. So what happens now?');

    a.turnsWithoutProgress += 1;
    const np = DEFAULT_TRIGGERS.no_progress_turns;
    if (a.turnsWithoutProgress >= np.n) { a.turnsWithoutProgress = 0; this._change(t, push(a, 'no_progress', np.d), events); }
    const nudge = s.nudges[t.nudgeIdx % s.nudges.length];
    t.nudgeIdx += 1;
    return this._tone(t, nudge);
  }

  _tone(t, line) {
    if (t.incongruent) return line; // the words stay neutral; the voice carries it
    const st = t.affect.state;
    if (st === 'angry' && !/[!]$/.test(line)) return line.replace(/\.$/, '') + '. Honestly.';
    if (st === 'resigned') return line.replace(/\.$/, '') + '... whatever.';
    return line;
  }

  _change(t, change, events) {
    if (change) events.push({ type: 'affect_change', ...change, turn: t.turn });
  }

  _withAmbiguity(opener, ambiguity) {
    if (ambiguity < 0.5) return opener;
    // Withhold the details after the first sentence; the agent has to ask.
    const first = opener.split(/(?<=[.!?])\s/)[0];
    return first;
  }

  _affectOut(t) { return { state: t.affect.state, patience: Math.round(t.affect.patience * 100) / 100 }; }

  _get(id) { const t = this.tickets.get(id); if (!t) throw new Error(`No ticket ${id}`); return t; }

  _delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
}

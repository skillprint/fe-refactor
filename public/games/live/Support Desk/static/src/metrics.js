// Shift-level measures, all computed from ticket outcomes the engine returned
// and events the game observed. None of them read a transcript with a model.
// The result panel in the portal shows the same six tiles.

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round = (x, d = 2) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);

/**
 * @param {Array<{reward, violations, outcome, confusionErrors?:number, handleMs?:number}>} tickets
 */
export function shiftSummary(tickets, { elapsedMs = 0 } = {}) {
  const n = tickets.length;
  const resolved = tickets.filter((t) => t.reward?.rTau === 1 || (t.reward?.actions === 1 && t.reward?.communicateInfo === 1 && t.reward?.envAssertions === 1));
  const withBelief = tickets.filter((t) => t.outcome?.beliefCorrected !== null && t.outcome?.beliefCorrected !== undefined);
  const wentAngry = tickets.filter((t) => (t.outcome?.affectTrajectory || []).some((p) => p.state === 'angry') || t.outcome?.minPatience <= 0.33);
  const switched = tickets.filter((t) => t.outcome?.policySwitched);
  const brier = tickets.map((t) => {
    const c = Number(t.outcome?.declaredConfidence ?? 0.5);
    const r = resolved.includes(t) ? 1 : 0;
    return (c - r) ** 2;
  });
  const violations = tickets.flatMap((t) => t.violations || []);
  const critical = violations.filter((v) => v.severity === 'critical').length;

  return {
    tickets: n,
    resolvedCount: resolved.length,
    // The six L3 tiles
    policyAdherence: n ? round(tickets.filter((t) => !(t.violations || []).length).length / n) : null,
    beliefCorrectionRate: withBelief.length ? round(withBelief.filter((t) => t.outcome.beliefCorrected).length / withBelief.length) : null,
    affectRecoveryRate: wentAngry.length ? round(wentAngry.filter((t) => t.outcome?.recoveredFromAngry).length / wentAngry.length) : null,
    calibrationBrier: n ? round(mean(brier), 3) : null,
    flexibilityLagTurns: switched.length ? round(mean(switched.map((t) => (t.outcome.policySwitchLagTurns == null ? 6 : t.outcome.policySwitchLagTurns))), 1) : null,
    concurrencyConfusionCount: tickets.reduce((a, t) => a + (t.confusionErrors || 0), 0),
    // The three numbers a real desk reports
    ahtSeconds: n ? Math.round(mean(tickets.map((t) => (t.handleMs || 0) / 1000))) : null,
    fcr: n ? round(resolved.filter((t) => !t.outcome?.escalated).length / n) : null,
    csat: n ? round(mean(tickets.map((t) => Number(t.outcome?.csat ?? 3))), 1) : null,
    // Supporting detail
    violations: violations.length,
    criticalViolations: critical,
    escalations: tickets.filter((t) => t.outcome?.escalated).length,
    meanConfidence: n ? round(mean(tickets.map((t) => Number(t.outcome?.declaredConfidence ?? 0.5)))) : null,
    shiftSeconds: Math.round(elapsedMs / 1000),
  };
}

/** The running score the HUD shows: reward in points, violations cost, satisfaction pays. */
export function scoreFor(tickets) {
  return tickets.reduce((acc, t) => {
    const reward = Number(t.reward?.total ?? 0);
    const csat = Number(t.outcome?.csat ?? 3);
    const v = (t.violations || []).length;
    return acc + Math.round(Math.max(0, reward) * 100) - v * 10 + Math.round((csat - 3) * 5);
  }, 0);
}

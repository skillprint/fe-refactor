'use client';

/**
 * The email opt-in form (SKI-265): an address, an age range, and the
 * notifications the player wants. This is the consent moment (SKI-261), so:
 *
 * * nothing is pre-ticked, and at least one choice is needed to continue;
 * * the age question comes first, and under-16s get a friendly "not yet"
 *   with nothing sent to the server and no second ask on this device;
 * * the address is confirmed by a link (double opt-in) unless it is already
 *   this account's verified address, as after a Google sign-in.
 *
 * Used by the results-dialog card and by Settings; the caller owns the
 * heading and fetches the address and categories once.
 */
import React, { useState } from 'react';
import type { NotificationCategory } from '../../lib/models/portal/useNotificationPreferences';
import { EmailAddressError, type AgeRange } from '../../lib/models/portal/useEmailAddress';
import { markUnder16 } from '../../lib/emailPrompt';

type Stage = { kind: 'form' } | { kind: 'sent'; email: string } | { kind: 'confirmed'; email: string } | { kind: 'under16' };

const ERRORS: Record<string, string> = {
  invalid_email: 'Enter a valid email address.',
  throttled: 'Too many tries for now. Try again in an hour.',
  not_available: 'Your email address is managed by your school.',
  age_not_eligible: 'Email reminders are for players aged 16 and over.',
  network: "We couldn't reach Skillprint. Check your connection and try again.",
};

const AGES: { value: AgeRange; label: string }[] = [
  { value: 'under_13', label: 'Under 13' },
  { value: '13_15', label: '13 to 15' },
  { value: '16_plus', label: '16 or older' },
];

interface EmailCaptureProps {
  categories: NotificationCategory[];
  submit: (email: string, categories: string[], ageRange: AgeRange) => Promise<'sent' | 'confirmed'>;
  userId: string | null;
  defaultEmail?: string | null;
  /** Called once the form reaches an end state, e.g. to collapse a card. */
  onFinished?: (result: 'sent' | 'confirmed' | 'under16') => void;
  idPrefix?: string;
}

export default function EmailCapture({
  categories, submit, userId, defaultEmail, onFinished, idPrefix = 'email-capture',
}: EmailCaptureProps) {
  const [stage, setStage] = useState<Stage>({ kind: 'form' });
  const [email, setEmail] = useState(defaultEmail || '');
  const [age, setAge] = useState<AgeRange | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (category: string) =>
    setChosen((current) => (current.includes(category) ? current.filter((c) => c !== category) : [...current, category]));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!age) {
      setError('Tell us your age range to continue.');
      return;
    }
    if (age !== '16_plus') {
      markUnder16(userId);
      setStage({ kind: 'under16' });
      onFinished?.('under16');
      return;
    }
    if (chosen.length === 0) {
      setError('Pick at least one thing to get by email.');
      return;
    }
    setBusy(true);
    try {
      const result = await submit(email.trim(), chosen, age);
      setStage(result === 'sent' ? { kind: 'sent', email: email.trim() } : { kind: 'confirmed', email: email.trim() });
      onFinished?.(result);
    } catch (err) {
      const code = err instanceof EmailAddressError ? err.code : 'network';
      setError(ERRORS[code] || "That didn't work. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  if (stage.kind === 'sent') {
    return (
      <div className="email-capture__done" role="status">
        <p className="margin-none font-sm weight-semibold">Check your inbox</p>
        <p className="margin-none font-sm text-muted">
          We sent a link to <strong className="text-strong">{stage.email}</strong>. Open it to confirm; it works for 48 hours.
        </p>
        <button type="button" className="button button--tertiary button--sm" onClick={() => setStage({ kind: 'form' })}>
          Use a different address
        </button>
      </div>
    );
  }
  if (stage.kind === 'confirmed') {
    return (
      <div className="email-capture__done" role="status">
        <p className="margin-none font-sm weight-semibold">You're set</p>
        <p className="margin-none font-sm text-muted">
          We'll email <strong className="text-strong">{stage.email}</strong>. Change what you get any time in Settings.
        </p>
      </div>
    );
  }
  if (stage.kind === 'under16') {
    return (
      <div className="email-capture__done" role="status">
        <p className="margin-none font-sm weight-semibold">Thanks for telling us</p>
        <p className="margin-none font-sm text-muted">
          Email reminders are for players 16 and over, so we won't ask again. Keep playing: your Skillprint still grows.
        </p>
      </div>
    );
  }

  return (
    <form className="email-capture" onSubmit={onSubmit} noValidate>
      <fieldset className="email-capture__group">
        <legend className="font-sm weight-semibold">How old are you?</legend>
        <div className="email-capture__options email-capture__options--inline">
          {AGES.map((option) => (
            <label key={option.value} className="email-capture__option font-sm">
              <input
                type="radio"
                name={`${idPrefix}-age`}
                value={option.value}
                checked={age === option.value}
                onChange={() => setAge(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {age !== 'under_13' && age !== '13_15' && (
        <>
          <div className="email-capture__group">
            <label className="font-sm weight-semibold" htmlFor={`${idPrefix}-address`}>Email address</label>
            <input
              id={`${idPrefix}-address`}
              className="email-capture__input"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <fieldset className="email-capture__group">
            <legend className="font-sm weight-semibold">What would you like?</legend>
            <div className="email-capture__options">
              {categories.map((row) => (
                <label key={row.category} className="email-capture__option email-capture__option--block">
                  <input type="checkbox" checked={chosen.includes(row.category)} onChange={() => toggle(row.category)} />
                  <span>
                    <span className="font-sm weight-medium">{row.label}</span>
                    <span className="layout-block font-xs text-muted">{row.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {error && (
        <p className="margin-none font-sm text--danger" role="alert">{error}</p>
      )}

      <div className="email-capture__actions">
        <button type="submit" className="button button--primary button--sm" disabled={busy}>
          {busy ? 'Sending…' : 'Continue'}
        </button>
        <p className="margin-none font-xs text-muted">
          We'll email a link to confirm the address. Turn any of these off in Settings or from any email.
        </p>
      </div>
    </form>
  );
}

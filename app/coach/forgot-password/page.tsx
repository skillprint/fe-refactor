'use client';

/**
 * Forgot password (SKI-213).
 *
 * Always reports the same outcome whether or not the address has an account.
 * Saying "no account with that email" would let anyone check which teachers are
 * Skillprint coaches, one address at a time.
 */
import { useState } from 'react';
import Link from 'next/link';
import { COACH_MOCKS_ENABLED, CoachAuthError, requestPasswordReset } from '@/lib/models/coach';
import { MOCK_LINK_TOKENS } from '@/lib/models/coach/mocks/auth';
import { AuthCard, Field, FormError, SubmitButton } from '../components/AuthForm';

export default function CoachForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (caught) {
      if (caught instanceof CoachAuthError && caught.code === 'throttled') {
        // 5 an hour per IP. Say so plainly; a coach retrying every few seconds
        // otherwise sees the same refusal with no idea when it clears.
        setError('Too many reset requests from here. Try again in an hour.');
      } else {
        setError(caught instanceof Error ? caught.message : 'Could not send the email.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        intro={
          <>
            If <strong>{email}</strong> has a coaching account, a reset link is on its way. It
            works once and expires after two hours. Check spam if it hasn&rsquo;t arrived in a few
            minutes.
          </>
        }
        footer={
          <Link href="/coach/login" className="coach-auth__link">
            Back to sign in
          </Link>
        }
      >
        {COACH_MOCKS_ENABLED && (
          <p className="coach-auth__sandbox">
            Nothing was actually sent. The link it would contain is{' '}
            <Link href={`/coach/set-password?token=${MOCK_LINK_TOKENS.reset}`}>this one</Link>.
          </p>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      intro="We'll email you a link to set a new one."
      footer={
        <Link href="/coach/login" className="coach-auth__link">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Field id="coach-reset-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
        {error && <FormError message={error} />}
        <SubmitButton busy={busy}>Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}

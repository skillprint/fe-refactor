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
import { COACH_MOCKS_ENABLED, requestPasswordReset } from '@/lib/models/coach';
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
      setError(caught instanceof Error ? caught.message : 'Could not send the email.');
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
            If <strong>{email}</strong> has a coaching account, a reset link is on its way. The link
            is single-use and expires.
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
            Nothing was actually sent — email lands in SKI-200. Try the flow at{' '}
            <code>/coach/set-password?token=mock-invite-token</code>.
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

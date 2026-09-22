'use client';

/**
 * Set a password from an invite or reset link (SKI-213).
 *
 * Serves both journeys because they are the same action — redeem a one-time
 * token, choose a password — and splitting them would mean two screens that
 * must not drift on password rules.
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { COACH_MOCKS_ENABLED, setPassword } from '@/lib/models/coach';
import { AuthCard, Field, FormError, SubmitButton } from '../components/AuthForm';

const MIN_LENGTH = 8;

function SetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPasswordValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Checked here as well as server-side: a mismatch is the user's typo and
    // deserves an instant answer, not a round trip.
    if (password !== confirm) {
      setError('Those two passwords do not match.');
      return;
    }
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await setPassword(token, password);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not set the password.');
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="This link is incomplete"
        intro="It is missing its token. Open the link from your invitation email exactly as it was sent."
        footer={
          <Link href="/coach/login" className="coach-auth__link">
            Back to sign in
          </Link>
        }
      >
        <></>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard
        title="Password set"
        intro="You can sign in with it now."
        footer={
          <button type="button" className="coach-submit" onClick={() => router.replace('/coach/login')}>
            Go to sign in
          </button>
        }
      >
        <></>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a password" intro={`At least ${MIN_LENGTH} characters.`}>
      <form onSubmit={onSubmit} noValidate>
        <Field
          id="coach-new-password"
          label="New password"
          type="password"
          value={password}
          onChange={setPasswordValue}
          autoComplete="new-password"
        />
        <Field
          id="coach-confirm-password"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {error && <FormError message={error} />}
        <SubmitButton busy={busy}>Set password</SubmitButton>
      </form>

      {COACH_MOCKS_ENABLED && (
        <p className="coach-auth__sandbox">
          Sandbox: only <code>mock-invite-token</code> is accepted; any other token shows the
          expired-link path.
        </p>
      )}
    </AuthCard>
  );
}

export default function CoachSetPasswordPage() {
  return (
    <Suspense fallback={<div className="coach-auth" />}>
      <SetPasswordForm />
    </Suspense>
  );
}

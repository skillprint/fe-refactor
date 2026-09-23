'use client';

/**
 * Coach sign-in (SKI-213).
 *
 * The front door a coach should have had all along. Before SKI-253 this route
 * did not exist and `/coach` fell through to the player welcome screen — "Play
 * as guest" being an odd instruction for someone about to read children's data.
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { COACH_MOCKS_ENABLED, CoachAuthError, useCoachAuth } from '@/lib/models/coach';
import { MOCK_COACH_EMAIL, MOCK_COACH_PASSWORD } from '@/lib/models/coach/mocks/auth';
import { AuthCard, Field, FormError, SubmitButton } from '../components/AuthForm';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useCoachAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Where the guard sent them from, so a deep link survives sign-in. Only
  // in-app paths are honoured — an absolute URL here would be an open redirect.
  const rawNext = params.get('next') || '/coach/teams';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/coach/teams';

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace(next);
    } catch (caught) {
      setBusy(false);
      if (caught instanceof CoachAuthError) {
        if (caught.code === 'credentials_invalid') {
          // One message for a wrong address and a wrong password, as the API
          // gives: which of the two was wrong is not for an anonymous caller.
          return setError('Those credentials were not recognised.');
        }
        if (caught.code === 'throttled') {
          return setError('Too many sign-in attempts from here. Wait a minute and try again.');
        }
      }
      setError(caught instanceof Error ? caught.message : 'Sign-in failed.');
    }
  }

  return (
    <AuthCard
      title="Sign in"
      intro="Coaching accounts are created by your organisation's administrator."
      footer={
        <Link href="/coach/forgot-password" className="coach-auth__link">
          Forgot your password?
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Field id="coach-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
        <Field
          id="coach-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error && <FormError message={error} />}
        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>

      {COACH_MOCKS_ENABLED && (
        <p className="coach-auth__sandbox">
          Sandbox account: <code>{MOCK_COACH_EMAIL}</code> / <code>{MOCK_COACH_PASSWORD}</code>
        </p>
      )}
    </AuthCard>
  );
}

export default function CoachLoginPage() {
  // useSearchParams needs a boundary; the route group is force-dynamic but this
  // keeps the page self-contained.
  return (
    <Suspense fallback={<div className="coach-auth" />}>
      <LoginForm />
    </Suspense>
  );
}

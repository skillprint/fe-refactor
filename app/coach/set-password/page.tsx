'use client';

/**
 * Set a password from an invite or reset link (SKI-213).
 *
 * One screen for both links because the backend serves both from one endpoint
 * (marketplace PR #71), telling them apart by the token's shape. The copy
 * differs — "welcome" for an invite, "choose a new password" for a reset — but
 * the action and the password rules are the same, and two screens would drift.
 *
 * ## Every refusal gets its own next step
 *
 * The API codes its refusals precisely so this screen can say what to *do*:
 * an expired invite needs a new one from an admin, a used one means sign in,
 * a forwarded one means ask for your own. Those are terminal — the form goes
 * away, because retyping a password will not fix a dead link. Only
 * `password_invalid` keeps the form, since that one the coach can fix.
 *
 * ## Success signs you in
 *
 * The endpoint returns a session, so the coach lands on their teams instead of
 * being asked to type the password they chose a second ago.
 */
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  COACH_MOCKS_ENABLED,
  CoachAuthError,
  setPassword,
  tokenKind,
  useCoachAuth,
  type CoachAuthErrorCode,
} from '@/lib/models/coach';
import { MOCK_LINK_TOKENS } from '@/lib/models/coach/mocks/auth';
import { AuthCard, Field, FormError, SubmitButton } from '../components/AuthForm';

const MIN_LENGTH = 8;

interface DeadEnd {
  title: string;
  body: string;
  action: { label: string; href: string };
}

/** The refusals the coach cannot fix from this screen, and what to do instead. */
const DEAD_ENDS: Partial<Record<CoachAuthErrorCode, DeadEnd>> = {
  token_invalid: {
    title: 'This link isn’t valid',
    body: 'Open it from your email exactly as it was sent — copying part of it, or a mail client that rewrites links, can break it.',
    action: { label: 'Back to sign in', href: '/coach/login' },
  },
  invite_expired: {
    title: 'This invitation has expired',
    body: 'Invitations last a week. Ask the person who invited you to send a new one.',
    action: { label: 'Back to sign in', href: '/coach/login' },
  },
  invite_already_accepted: {
    title: 'You’ve already set up this account',
    body: 'This invitation has been used. Sign in with the password you chose.',
    action: { label: 'Sign in', href: '/coach/login' },
  },
  invite_already_member: {
    title: 'You already have access',
    body: 'Your account is already part of this organisation. Sign in as usual.',
    action: { label: 'Sign in', href: '/coach/login' },
  },
  invite_email_mismatch: {
    title: 'This invitation was sent to someone else',
    body: 'It belongs to a different email address — it may have been forwarded. Ask for an invitation of your own.',
    action: { label: 'Back to sign in', href: '/coach/login' },
  },
  reset_invalid: {
    title: 'This reset link has expired or been used',
    body: 'Reset links work once and last two hours. Request a new one.',
    action: { label: 'Send a new link', href: '/coach/forgot-password' },
  },
};

function SetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { adoptSession } = useCoachAuth();
  const token = params.get('token') ?? '';
  const kind = tokenKind(token);

  const [password, setPasswordValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [deadEnd, setDeadEnd] = useState<DeadEnd | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Checked here as well as server-side: a mismatch is a typo and deserves
    // an instant answer. The length rule matches Django's MinimumLength
    // validator; the other three rules are left to the server to state.
    if (password !== confirm) return setProblems(['Those two passwords do not match.']);
    if (password.length < MIN_LENGTH) {
      return setProblems([`Use at least ${MIN_LENGTH} characters.`]);
    }

    setBusy(true);
    setProblems([]);
    try {
      const session = await setPassword(token, password);
      adoptSession(session);
      router.replace('/coach/teams');
    } catch (caught) {
      setBusy(false);
      if (!(caught instanceof CoachAuthError)) {
        setProblems([caught instanceof Error ? caught.message : 'Could not set the password.']);
        return;
      }
      const end = DEAD_ENDS[caught.code];
      if (end) return setDeadEnd(end);
      if (caught.code === 'throttled') {
        return setProblems(['Too many attempts from here. Wait a minute and try again.']);
      }
      setProblems(caught.messages.length ? caught.messages : [caught.message]);
    }
  }

  if (!token) {
    const end = DEAD_ENDS.token_invalid!;
    return (
      <AuthCard
        title="This link is incomplete"
        intro="It’s missing its token. Open the link from your email exactly as it was sent."
        footer={<Link href={end.action.href} className="coach-auth__link">{end.action.label}</Link>}
      >
        <></>
      </AuthCard>
    );
  }

  if (deadEnd) {
    return (
      <AuthCard title={deadEnd.title} intro={deadEnd.body}>
        <Link href={deadEnd.action.href} className="coach-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
          {deadEnd.action.label}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={kind === 'reset' ? 'Choose a new password' : 'Welcome — choose a password'}
      intro={
        kind === 'reset'
          ? 'You’ll be signed in as soon as it’s set.'
          : 'This finishes setting up your coaching account. You’ll be signed in straight after.'
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <Field
          id="coach-new-password"
          label="New password"
          type="password"
          value={password}
          onChange={setPasswordValue}
          autoComplete="new-password"
          hint="At least 8 characters, not all numbers, and not a common password."
        />
        <Field
          id="coach-confirm-password"
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {problems.map((problem) => (
          <FormError key={problem} message={problem} />
        ))}
        <SubmitButton busy={busy}>{kind === 'reset' ? 'Set password and sign in' : 'Finish setting up'}</SubmitButton>
      </form>

      {COACH_MOCKS_ENABLED && (
        <p className="coach-auth__sandbox">
          Sandbox links, one per outcome:{' '}
          <Link href={`/coach/set-password?token=${MOCK_LINK_TOKENS.invite}`}>invite</Link> ·{' '}
          <Link href={`/coach/set-password?token=${MOCK_LINK_TOKENS.reset}`}>reset</Link> ·{' '}
          <Link href={`/coach/set-password?token=${MOCK_LINK_TOKENS.inviteExpired}`}>expired</Link> ·{' '}
          <Link href={`/coach/set-password?token=${MOCK_LINK_TOKENS.inviteUsed}`}>used</Link> ·{' '}
          <Link href={`/coach/set-password?token=${MOCK_LINK_TOKENS.inviteForwarded}`}>forwarded</Link>
        </p>
      )}
    </AuthCard>
  );
}

export default function CoachSetPasswordPage() {
  return (
    <Suspense fallback={<div className="coach-auth" />}>
      {/* Keyed on the token so following one sandbox link from another resets
          the form rather than showing the previous link's outcome. */}
      <SetPasswordFormKeyed />
    </Suspense>
  );
}

function SetPasswordFormKeyed() {
  const params = useSearchParams();
  return <SetPasswordForm key={params.get('token') ?? ''} />;
}

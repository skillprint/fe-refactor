'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { googlePicture, signInWithGoogle } from '../../lib/models/portal/googleSignIn';
import { reviewStatusLabel } from '../../lib/models/gameReview/gameReviewApi';
import { skillIconId, titleFromSlug } from '../../lib/skillIcons';

const WHEN = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '–';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '–' : WHEN.format(date);
}

/** An average or a rating out of 5; a dash when there are none yet. */
export function formatRating(value: number | null | undefined): string {
  return value == null ? '–' : `${Number.isInteger(value) ? value : value.toFixed(1)}/5`;
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="ui-badge ui-badge--sm gr-status" data-status={status}>
      {reviewStatusLabel(status)}
    </span>
  );
}

/** A game's target moods, skills and personality traits as tags. */
export function TargetTags({ moods, skills, traits = [] }: { moods: string[]; skills: string[]; traits?: string[] }) {
  if (moods.length === 0 && skills.length === 0 && traits.length === 0) {
    return <span className="font-xs gr-muted">No targets set</span>;
  }
  return (
    <div className="gr-tags">
      {moods.map((slug) => (
        <span key={`mood-${slug}`} className="ui-tag" title="Target mood">
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId('mood', slug)}`}></use></svg>
          {titleFromSlug(slug)}
        </span>
      ))}
      {skills.map((slug) => (
        <span key={`skill-${slug}`} className="ui-tag" title="Target skill">
          {titleFromSlug(slug)}
        </span>
      ))}
      {traits.map((slug) => (
        <span key={`trait-${slug}`} className="ui-tag" title="Target personality trait">
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#${skillIconId('personality', slug)}`}></use></svg>
          {titleFromSlug(slug)}
        </span>
      ))}
    </div>
  );
}

/**
 * What a signed-in player who isn't recognised as staff sees, with a way to sign in as staff.
 * `purpose` names the tool, e.g. "Game coverage is".
 */
export function ReviewerGate({ purpose = 'Reviewing new games is' }: { purpose?: string } = {}) {
  const { completeGoogleSignIn, status: authStatus } = useAuth();
  const [signInError, setSignInError] = useState<string | null>(null);

  return (
    <section className="sp-card gr-panel" aria-labelledby="gr-gate-heading" style={{ maxWidth: 560 }}>
      <h2 id="gr-gate-heading">For Skillprint staff</h2>
      {authStatus === 'social' ? (
        // Signing in again with the same account would only reload into this screen.
        <p className="margin-none font-sm gr-muted">
          You&apos;re signed in, but this account isn&apos;t recognised as Skillprint staff. Use the Google account for
          your skillprint.co address. If you already did, ask an admin to check your access.
        </p>
      ) : (
        <p className="margin-none font-sm gr-muted">
          {purpose} limited to Skillprint staff. Sign in with your verified skillprint.co Google account
          to continue.
        </p>
      )}
      <div>
        <GoogleLogin
          onSuccess={async ({ credential }) => {
            if (!credential) return;
            try {
              completeGoogleSignIn(await signInWithGoogle(credential), googlePicture(credential));
              window.location.reload(); // the session hook picks up the new account on load
            } catch {
              setSignInError("We couldn't sign you in with Google. Try again.");
            }
          }}
          onError={() => setSignInError("Google sign-in didn't complete. Try again.")}
          text={authStatus === 'social' ? 'continue_with' : 'signin_with'}
          theme="filled_black"
          shape="pill"
        />
      </div>
      {signInError && <div className="gr-alert" role="alert">{signInError}</div>}
    </section>
  );
}

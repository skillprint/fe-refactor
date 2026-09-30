'use client';

/**
 * Redeems an assignment email's one-time link and lands the player in the
 * playbook, signed in (SKI-233).
 *
 * Redeemed with a POST from here, on load, rather than by the link itself:
 * mail scanners fetch links but do not run the page, so they cannot use up a
 * player's link before the player does.
 *
 * A link that cannot be used is not a dead end. Used or expired, and this
 * device already holds the player's session: go straight to the playbook.
 * Otherwise say plainly what happened and that the next email carries a new
 * link — never a stack trace, never "error 410".
 */
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/PortalLayout';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { useAuth } from '@/app/context/AuthContext';
import { PORTAL_BASE_URL } from '@/lib/models/portal/portalFetch';
import { readPlayerSession, writePlayerSession } from '@/lib/models/portal/playerSession';

type Problem = 'link_used' | 'link_expired' | 'assignment_closed' | 'link_invalid' | 'network';

const MESSAGES: Record<Problem, { title: string; note: string }> = {
  link_used: {
    title: 'This link has already been used',
    note: 'Each email link works once. Open Skillprint on the device you used before, or use the link in your next email.',
  },
  link_expired: {
    title: 'This link has expired',
    note: "Links work for a couple of days. Your coach's next reminder will have a fresh one.",
  },
  assignment_closed: {
    title: 'Your coach has closed this assignment',
    note: "There's nothing left to do for it. You can still play anything on Skillprint.",
  },
  link_invalid: {
    title: "This link isn't valid",
    note: 'It may have been copied incompletely. Try the button in the email instead.',
  },
  network: {
    title: "We couldn't reach Skillprint",
    note: 'Check your connection and try again.',
  },
};

export default function StartClient({ token }: { token: string | null }) {
  const router = useRouter();
  const { loginAsGuest } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(token ? null : 'link_invalid');
  const [attempt, setAttempt] = useState(0);
  // React strict mode runs effects twice in development; a single-use token
  // must be posted once.
  const posted = useRef<number | null>(null);

  useEffect(() => {
    if (!token || posted.current === attempt) return;
    posted.current = attempt;

    (async () => {
      let response: Response;
      try {
        response = await fetch(`${PORTAL_BASE_URL}/assignment-links/redeem/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        setProblem('network');
        return;
      }
      const body = await response.json().catch(() => ({}));

      if (response.ok && body.token) {
        writePlayerSession({ token: body.token, expiry: body.expiry ?? null, userId: body.userId });
        loginAsGuest();
        router.replace(body.redirect || '/');
        return;
      }
      // Used or expired, but this device is already signed in as the player:
      // take them where the link was going.
      if (response.status === 410 && body.redirect && readPlayerSession() && body.code !== 'assignment_closed') {
        router.replace(body.redirect);
        return;
      }
      const code = body.code as Problem | undefined;
      setProblem(code && code in MESSAGES ? code : response.status >= 500 ? 'network' : 'link_invalid');
    })();
  }, [token, attempt, router, loginAsGuest]);

  const header = (
    <div className="portal-head">
      <div className="portal-head__row">
        <h1>{problem ? MESSAGES[problem].title : 'Opening your playbook'}</h1>
      </div>
    </div>
  );

  return (
    <PortalLayout pageClass="page--portal-start" header={header}>
      {problem ? (
        <div className="portal-blank">
          <p className="portal-blank__title">{MESSAGES[problem].title}</p>
          <p className="portal-blank__note">{MESSAGES[problem].note}</p>
          {problem === 'network' ? (
            <button type="button" className="button button--secondary button--sm" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          ) : (
            <Link className="button button--secondary button--sm" href="/">
              Go to Skillprint
            </Link>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center py-20">
          <BuckyballLoading />
        </div>
      )}
    </PortalLayout>
  );
}

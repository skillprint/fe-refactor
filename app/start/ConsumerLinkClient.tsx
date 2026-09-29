'use client';

/**
 * Where a consumer email's button lands: `/start/?t=<token>` (SKI-271).
 *
 * Redeems the link with a POST from here, on load, rather than on the link
 * itself: mail scanners fetch links but don't run the page. The backend
 * (`POST /api/portal/links/redeem/`, SKI-270) signs this browser in as the
 * email's recipient and says where the link leads; the browser adopts that
 * account (its `internalId`, as after a Google sign-in) and goes there, with
 * the email's delivery id added so the game session records where it came
 * from.
 *
 * Never a dead end: an expired link still takes a browser that is already
 * signed in to the page, and anyone else gets the welcome screen, which
 * goes on to the page once they sign in or play as a guest.
 */
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/PortalLayout';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { useAuth } from '@/app/context/AuthContext';
import { PORTAL_BASE_URL } from '@/lib/models/portal/portalFetch';
import { safeNext, withDeliveryId } from '@/lib/emailLinks';

type Problem = 'link_expired' | 'link_invalid' | 'network';

const MESSAGES: Record<Problem, { title: string; note: string }> = {
  link_expired: {
    title: 'This link has expired',
    note: 'Email links work for a week. Sign in or play as a guest, and we’ll take you to the same place.',
  },
  link_invalid: {
    title: "This link isn't valid",
    note: 'It may have been copied incompletely. Try the button in the email, or just open Skillprint.',
  },
  network: {
    title: "We couldn't reach Skillprint",
    note: 'Check your connection and try again.',
  },
};

export default function ConsumerLinkClient({ token }: { token: string | null }) {
  const router = useRouter();
  const { status, isLoading, adoptAccount } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(token ? null : 'link_invalid');
  const [next, setNext] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Strict mode runs effects twice in development; post once per attempt.
  const posted = useRef<number | null>(null);

  useEffect(() => {
    if (!token || isLoading || posted.current === attempt) return;
    posted.current = attempt;

    (async () => {
      let response: Response;
      try {
        response = await fetch(`${PORTAL_BASE_URL}/links/redeem/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        setProblem('network');
        return;
      }
      const body = await response.json().catch(() => ({}));
      const destination = safeNext(body.next) || '/';

      if (response.ok) {
        if (body.token && body.internalId) adoptAccount(body.internalId, body.token);
        router.replace(withDeliveryId(destination, body.deliveryId));
        return;
      }
      if (response.status === 410) {
        // Expired, but this browser is already someone: take them there.
        if (status !== 'loggedOut') {
          router.replace(destination);
          return;
        }
        setNext(destination);
        setProblem('link_expired');
        return;
      }
      setProblem(response.status >= 500 ? 'network' : 'link_invalid');
    })();
  }, [token, attempt, isLoading, status, adoptAccount, router]);

  const header = (
    <div className="portal-head">
      <div className="portal-head__row">
        <h1>{problem ? MESSAGES[problem].title : 'Opening Skillprint'}</h1>
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
            <Link className="button button--secondary button--sm" href={next ? `/?next=${encodeURIComponent(next)}` : '/'}>
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

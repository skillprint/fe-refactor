'use client';

/**
 * Confirms a player's email address from the link we sent them (SKI-265).
 *
 * Redeemed with a POST from here, on load, rather than by the link itself:
 * mail scanners fetch links but do not run the page, so they cannot confirm
 * an address, or use up the link, before the player does. Same pattern as
 * the assignment links in StartClient.
 *
 * The link is also a sign-in: the browser that opens it becomes the account
 * the address now belongs to, and keeps it (`adoptAccount`). A link that
 * cannot be used is never a dead end: it says what happened and points to
 * Settings, where a new link can be sent.
 */
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { useAuth } from '@/app/context/AuthContext';
import { PORTAL_BASE_URL } from '@/lib/models/portal/portalFetch';

type Problem = 'link_used' | 'link_expired' | 'link_invalid' | 'address_in_use' | 'network';

const MESSAGES: Record<Problem, { title: string; note: string }> = {
  link_used: {
    title: 'This link has already been used',
    note: 'Your address may already be confirmed. Check Settings, or ask for a new link there.',
  },
  link_expired: {
    title: 'This link has expired',
    note: 'Confirmation links work for 48 hours. You can send a new one from Settings.',
  },
  link_invalid: {
    title: "This link isn't valid",
    note: 'It may have been copied incompletely. Try the button in the email instead.',
  },
  address_in_use: {
    title: 'This address is used by another account',
    note: 'It belongs to an account that signs in a different way, so it can’t be added here. Try a different address in Settings.',
  },
  network: {
    title: "We couldn't reach Skillprint",
    note: 'Check your connection and try again.',
  },
};

interface Confirmed {
  outcome: 'verified' | 'signed_in_existing';
  email: string;
}

export default function VerifyEmailClient({ token }: { token: string | null }) {
  const { adoptAccount, isLoading } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(token ? null : 'link_invalid');
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [attempt, setAttempt] = useState(0);
  // React strict mode runs effects twice in development; a single-use token
  // must be posted once.
  const posted = useRef<number | null>(null);

  useEffect(() => {
    // Wait for AuthContext to read the stored status, so adopting the
    // account knows whether this browser was signed out.
    if (!token || isLoading || posted.current === attempt) return;
    posted.current = attempt;

    (async () => {
      let response: Response;
      try {
        response = await fetch(`${PORTAL_BASE_URL}/profile/email/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        setProblem('network');
        return;
      }
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.signIn?.token) {
        if (body.signIn.internalId) adoptAccount(body.signIn.internalId, body.signIn.token);
        setConfirmed({ outcome: body.outcome, email: body.email });
        return;
      }
      const code = body.code as Problem | undefined;
      setProblem(code && code in MESSAGES ? code : response.status >= 500 ? 'network' : 'link_invalid');
    })();
  }, [token, attempt, isLoading, adoptAccount]);

  const title = problem
    ? MESSAGES[problem].title
    : confirmed
      ? confirmed.outcome === 'verified' ? 'Your email is confirmed' : "You're signed in"
      : 'Confirming your email';

  const header = (
    <div className="portal-head">
      <div className="portal-head__row">
        <h1>{title}</h1>
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
            <Link className="button button--secondary button--sm" href="/settings/#ppEmail">
              Go to Settings
            </Link>
          )}
        </div>
      ) : confirmed ? (
        <div className="portal-blank">
          <p className="portal-blank__title">{title}</p>
          <p className="portal-blank__note">
            {confirmed.outcome === 'verified'
              ? `We'll email ${confirmed.email} with what you chose. Change it any time in Settings.`
              : `${confirmed.email} already had a Skillprint account, so you're now signed in to it on this device.`}
          </p>
          <div className="layout-flex gap-md wrap justify-center">
            <Link className="button button--primary button--sm" href="/games">
              Play a game
            </Link>
            <Link className="button button--secondary button--sm" href="/settings/#ppEmail">
              Email settings
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center py-20">
          <BuckyballLoading />
        </div>
      )}
    </PortalLayout>
  );
}

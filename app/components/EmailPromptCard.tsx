'use client';

/**
 * "Get Skillprint by email", offered in the results dialog (SKI-265).
 *
 * Shown only when all of these hold:
 * * the account manages its own address (`available`: not a coach or a
 *   coached PlayVS player, whose school handles email);
 * * no link is already waiting to be opened, and the player isn't already
 *   getting email from us at a verified address;
 * * this is at least their second session, so they have played first;
 * * they haven't said "Not now" in the last 14 days or told us they're
 *   under 16 on this device.
 *
 * A Google-signed-in player already has a verified address, so the form
 * opens with it filled in and their choices take effect with no link.
 */
import React, { useState } from 'react';
import EmailCapture from './EmailCapture';
import { useAuth } from '../context/AuthContext';
import { useUserSession } from '../hooks/useUserSession';
import { useEmailAddress } from '../../lib/models/portal/useEmailAddress';
import { useNotificationPreferences } from '../../lib/models/portal/useNotificationPreferences';
import { useHomeSummary } from '../../lib/models/portal/useHomeSummary';
import { isPromptHidden, snoozePrompt } from '../../lib/emailPrompt';

const MIN_SESSIONS = 2;

export default function EmailPromptCard({ force = false }: { force?: boolean }) {
  const { userId } = useUserSession();
  const { reportedEmail } = useAuth();
  const address = useEmailAddress();
  const prefs = useNotificationPreferences();
  const summary = useHomeSummary();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [finished, setFinished] = useState(false);

  const state = address.data;
  const categories = prefs.data || [];
  const alreadyGetting = !!state?.verified && categories.some((row) => row.enabled);
  const eligible =
    !!state?.available &&
    !state.pending &&
    !alreadyGetting &&
    categories.length > 0 &&
    (force || ((summary.data?.totalSessions ?? 0) >= MIN_SESSIONS && !isPromptHidden(userId)));

  if (dismissed || (!eligible && !finished)) return null;

  return (
    <section aria-labelledby="emailPromptTitle" className="game-result__section separator-top email-prompt-card">
      <div className="layout-grid gap-sm">
        <strong className="font-md leading-lg weight-semibold" id="emailPromptTitle">Get Skillprint by email</strong>
        {!open && (
          <span className="font-sm text-muted">
            Pick what we send, like {categories.map((row) => row.label.toLowerCase()).join(' or ')}. Nothing is on until you choose it.
          </span>
        )}
      </div>
      {open ? (
        <EmailCapture
          categories={categories}
          submit={address.submit}
          userId={userId}
          defaultEmail={state?.verified ? state.email : reportedEmail}
          onFinished={() => setFinished(true)}
          idPrefix="result-email"
        />
      ) : (
        <div className="email-prompt-card__actions">
          <button type="button" className="button button--primary button--sm" onClick={() => setOpen(true)}>
            Set it up
          </button>
          <button
            type="button"
            className="button button--tertiary button--sm"
            onClick={() => {
              snoozePrompt(userId);
              setDismissed(true);
            }}
          >
            Not now
          </button>
        </div>
      )}
    </section>
  );
}

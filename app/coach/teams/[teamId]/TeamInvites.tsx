'use client';

/**
 * "Coaches" on a team's screen: invite a co-coach, and see who's been invited.
 *
 * A coach can invite a Coach onto a team they coach; an admin can too. The
 * backend holds that rule (Organization.may_invite); this only asks for an
 * email, since the team names the school and the role is always Coach here.
 * Inviting an admin stays on the Invites screen, which only admins reach.
 */
import { useState } from 'react';
import { inviteRefusal, useCoachInvites, useSendInvite } from '@/lib/models/coach';
import { Empty, ErrorState, Loading, Panel } from '../../components/ui';

const STATUS: Record<string, string> = { Pending: 'Invited', Accepted: 'Joined', Expired: 'Expired' };

export function TeamInvites({ teamId }: { teamId: number }) {
  const invites = useCoachInvites();
  const send = useSendInvite();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const forTeam = (invites.data?.invites ?? []).filter((invite) => invite.team?.id === teamId);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSentTo(null);
    try {
      const invite = await send({ email: email.trim(), role: 'Coach', team: teamId });
      setSentTo(invite.email);
      setEmail('');
      invites.refetch();
    } catch (caught) {
      setError(inviteRefusal(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Coaches" note="Invite someone to coach this team with you. They get an email to set a password.">
      <form onSubmit={onSubmit} noValidate className="coach-rowedit" style={{ marginBottom: 14 }}>
        <input
          type="email"
          aria-label="Coach's email"
          placeholder="coach@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="coach-submit coach-submit--inline" disabled={busy || !email.trim()}>
          {busy ? 'Sending…' : 'Invite coach'}
        </button>
      </form>
      {error && (
        <p className="coach-formerror" role="alert">
          {error}
        </p>
      )}
      {sentTo && (
        <p className="coach-meta" role="status">
          Invite sent to {sentTo}.
        </p>
      )}

      {invites.isLoading && !invites.data && <Loading rows={2} />}
      {invites.error && <ErrorState error={invites.error} onRetry={invites.refetch} />}
      {invites.data && forTeam.length === 0 && (
        <Empty title="No invites for this team yet">Coaches you invite here appear with their status.</Empty>
      )}
      {forTeam.length > 0 && (
        <ul className="coach-invitelist">
          {forTeam.map((invite) => (
            <li key={invite.id}>
              <span>{invite.email}</span>
              <span className="coach-meta"> · {STATUS[invite.status] ?? invite.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

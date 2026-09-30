'use client';

/**
 * Invite coaches (SKI-256) — the frontend for SKI-199.
 *
 * Admins only. The endpoint lists invites for organisations the caller
 * *administers*, so a coach who is not an admin sees an explanation rather
 * than an empty list that reads as "nobody has been invited".
 *
 * There is no "copy link" button, deliberately. The API never returns the
 * token: an admin holding it could set a password in a teacher's name, so the
 * link goes only to the invitee's inbox. The screen says so, because an admin
 * looking for the link will otherwise assume it is missing by mistake.
 */
import { useMemo, useState } from 'react';
import {
  inviteRefusal,
  useCoachContext,
  useCoachInvites,
  useCoachTeams,
  useSendInvite,
  type CoachInvite,
  type CoachInviteRole,
} from '@/lib/models/coach';
import { Empty, ErrorState, Loading, Panel } from '../components/ui';
import { FormError } from '../components/AuthForm';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function StatusCell({ invite }: { invite: CoachInvite }) {
  if (invite.status === 'Accepted') return <span className="coach-pill coach-pill--active">Joined</span>;
  if (invite.status === 'Expired') return <span className="coach-pill coach-pill--lapsed">Expired</span>;
  return (
    <span className="coach-pill coach-pill--quiet" title={`The link works until ${formatDate(invite.expires)}`}>
      Waiting · until {formatDate(invite.expires)}
    </span>
  );
}

export default function CoachInvitesPage() {
  const context = useCoachContext();
  const invites = useCoachInvites();
  const teams = useCoachTeams();
  const sendInvite = useSendInvite();

  const adminOrgs = useMemo(
    () => (context.data?.organizations ?? []).filter((org) => org.role === 'Admin'),
    [context.data],
  );

  const [orgId, setOrgId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CoachInviteRole>('Coach');
  const [teamId, setTeamId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);

  const organization = orgId ?? adminOrgs[0]?.id ?? null;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (organization === null) return;
    setBusy(true);
    setError(null);
    setSentTo(null);
    try {
      const invite = await sendInvite({
        organization,
        email,
        role,
        team: teamId ? Number(teamId) : null,
      });
      setSentTo(invite.email);
      setEmail('');
      setTeamId('');
      invites.refetch();
    } catch (caught) {
      setError(inviteRefusal(caught));
    } finally {
      setBusy(false);
    }
  }

  // An expired invite is reissued in place by sending it again: same row,
  // fresh token, and the old link — possibly sitting in a forwarded email —
  // stops working.
  async function sendAgain(invite: CoachInvite) {
    setRowBusy(invite.id);
    setRowError(null);
    try {
      await sendInvite({
        organization: invite.organization.id,
        email: invite.email,
        role: invite.role,
        team: invite.team?.id ?? null,
      });
      invites.refetch();
    } catch (caught) {
      setRowError({ id: invite.id, message: inviteRefusal(caught) });
    } finally {
      setRowBusy(null);
    }
  }

  if (context.isLoading && !context.data) {
    return <Panel><Loading rows={3} /></Panel>;
  }

  if (context.data && adminOrgs.length === 0) {
    return (
      <>
        <div className="coach-pagehead"><h1>Invites</h1></div>
        <Empty title="Only organisation admins can invite coaches">
          Ask your organisation&rsquo;s admin to invite anyone else who should coach here.
        </Empty>
      </>
    );
  }

  return (
    <>
      <div className="coach-pagehead">
        <h1>Invites</h1>
        <p>Bring another coach or admin into your organisation.</p>
      </div>

      <Panel
        title="Invite someone"
        note="They’ll get an email with a link to choose a password. You won’t see the link yourself — it goes only to their inbox."
      >
        <form onSubmit={onSubmit} noValidate>
          {adminOrgs.length > 1 && (
            <div className="coach-field">
              <label htmlFor="invite-org">Organisation</label>
              <select id="invite-org" value={organization ?? ''} onChange={(e) => setOrgId(Number(e.target.value))}>
                {adminOrgs.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="coach-field">
            <label htmlFor="invite-email">Email</label>
            <input
              id="invite-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="coach-field">
            <label htmlFor="invite-role">Role</label>
            <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as CoachInviteRole)}>
              <option value="Coach">Coach</option>
              <option value="Admin">Admin — can also invite people</option>
            </select>
            <p className="coach-field__hint">
              Players aren&rsquo;t invited here. They arrive through your roster sync.
            </p>
          </div>

          <div className="coach-field">
            <label htmlFor="invite-team">Team (optional)</label>
            <select id="invite-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">No team yet</option>
              {(teams.data?.teams ?? []).map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <p className="coach-field__hint">They&rsquo;ll be on this team&rsquo;s staff as soon as they accept.</p>
          </div>

          {error && <FormError message={error} />}
          {sentTo && (
            <p className="coach-meta" role="status" style={{ marginBottom: 12 }}>
              Invite sent to <strong>{sentTo}</strong>. The link lasts a week.
            </p>
          )}

          <div className="coach-actions">
            <button type="submit" className="coach-submit coach-submit--inline" disabled={busy || !email.trim()}>
              {busy ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Sent">
        {invites.isLoading && !invites.data && <Loading rows={3} />}
        {invites.error && <ErrorState error={invites.error} onRetry={invites.refetch} />}

        {invites.data && invites.data.invites.length === 0 && (
          <Empty title="No invites yet">Anyone you invite appears here, with whether they&rsquo;ve joined.</Empty>
        )}

        {invites.data && invites.data.invites.length > 0 && (
          <div className="coach-tablewrap">
            <table className="coach-table coach-table--invites">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Team</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {invites.data.invites.map((invite) => (
                  <tr key={invite.id}>
                    <td>
                      {invite.email}
                      {rowError?.id === invite.id && (
                        <p className="coach-formerror" role="alert" style={{ margin: '6px 0 0', whiteSpace: 'normal' }}>
                          {rowError.message}
                        </p>
                      )}
                    </td>
                    <td>{invite.role}</td>
                    <td className="coach-meta">{invite.team?.name ?? '—'}</td>
                    <td><StatusCell invite={invite} /></td>
                    <td>
                      {invite.status === 'Expired' && (
                        <button
                          type="button"
                          className="coach-nav__signout"
                          disabled={rowBusy === invite.id}
                          onClick={() => sendAgain(invite)}
                        >
                          {rowBusy === invite.id ? 'Sending…' : 'Send again'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

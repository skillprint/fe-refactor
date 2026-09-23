/**
 * Mock coach invites (SKI-256), retired with the rest by SKI-252.
 *
 * Follows `Organization.create_invite` rule for rule, because the screen's job
 * is mostly to explain refusals: a pending invite cannot be resent, an
 * accepted one is refused, and an **expired one is reissued in place** with a
 * fresh expiry — which is how "send again" works at all.
 *
 * Who is asking matters, as it does on the real endpoint: the list is every
 * organisation the caller administers, so the sandbox coach sees none and the
 * sandbox admin sees the school's.
 */
import { CoachApiError } from '../coachFetch';
import { readCoachSession } from '../coachAuth';
import type { CoachInvite, CoachInviteInput } from '../types';
import { MOCK_TEAMS, isoDaysAgo } from './fixtures';
import { MOCK_ADMIN_EMAIL } from './auth';
import type { MockRequest } from './router';

const ORG = { id: 77, name: 'PlayVS — Northgate High' };
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let nextId = 104;

const invites: CoachInvite[] = [
  {
    id: 101,
    email: 'a.lee@northgate.edu',
    role: 'Coach',
    status: 'Pending',
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    organization: ORG,
    team: { id: MOCK_TEAMS[1].id, name: MOCK_TEAMS[1].name },
  },
  {
    id: 102,
    email: 'm.ruiz@northgate.edu',
    role: 'Coach',
    status: 'Accepted',
    expires: `${isoDaysAgo(3)}T12:00:00Z`,
    organization: ORG,
    team: { id: MOCK_TEAMS[0].id, name: MOCK_TEAMS[0].name },
  },
  {
    id: 103,
    email: 'j.park@northgate.edu',
    role: 'Coach',
    status: 'Expired',
    expires: `${isoDaysAgo(2)}T12:00:00Z`,
    organization: ORG,
    team: null,
  },
];

/** Organisations the signed-in sandbox account administers. */
function administeredOrgIds(): number[] {
  return readCoachSession()?.email === MOCK_ADMIN_EMAIL ? [ORG.id] : [];
}

function refuse(code: string, message: string, status = 400): never {
  throw new CoachApiError(status, message, { code, detail: [message] });
}

function create(input: CoachInviteInput): CoachInvite {
  // Not administered and nonexistent answer the same, as on the real endpoint.
  if (!administeredOrgIds().includes(Number(input?.organization))) {
    refuse('not_found', 'No such organisation.', 404);
  }

  const email = (input.email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) refuse('invalid_email', 'Enter a valid email address.');

  const role = input.role ?? 'Coach';
  if (role !== 'Coach' && role !== 'Admin') {
    refuse('invalid_role', 'Invite a Coach or an Admin. Players are provisioned by your roster sync, not invited by email.');
  }

  let team: CoachInvite['team'] = null;
  if (input.team !== undefined && input.team !== null) {
    const found = MOCK_TEAMS.find((t) => t.id === Number(input.team));
    if (!found) refuse('team_not_found', 'No such team.');
    team = { id: found.id, name: found.name };
  }

  const previous = invites.find((invite) => invite.email === email);
  if (previous?.status === 'Pending') refuse('invite_pending', 'This user already has a pending invite.');
  if (previous?.status === 'Accepted') {
    refuse('invite_already_member', 'This user has already accepted an invite to this organisation.');
  }

  const expires = new Date(Date.now() + WEEK_MS).toISOString();
  if (previous) {
    // Expired: reissued in place, so the row keeps its id and moves to the top.
    Object.assign(previous, { role, team, status: 'Pending', expires });
    invites.splice(invites.indexOf(previous), 1);
    invites.unshift(previous);
    return previous;
  }

  const invite: CoachInvite = { id: nextId++, email, role, status: 'Pending', expires, organization: ORG, team };
  invites.unshift(invite);
  return invite;
}

/** `undefined` when the path is not ours, so the caller falls through. */
export function inviteRoutes(path: string, request: MockRequest): unknown | undefined {
  if (path !== '/invites/') return undefined;
  if (request.method === 'POST') return create(request.body as CoachInviteInput);
  const orgs = administeredOrgIds();
  return { invites: invites.filter((invite) => orgs.includes(invite.organization.id)) };
}

/** The context the real `/context/` would return for the signed-in sandbox account. */
export function mockContextOrganizations() {
  return [{ ...ORG, slug: 'playvs-northgate-high', role: administeredOrgIds().length ? 'Admin' : 'Coach' } as const];
}

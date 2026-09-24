'use client';

/**
 * Coach invites (SKI-256): the list, and sending one.
 *
 * Unlike playbooks and assignments, this is a real endpoint on staging
 * (marketplace PR #70). It sits in the `reads` mock area by path, so it goes
 * live whenever the read screens do.
 */
import { useCoachResource, type CoachResource } from './useCoachResource';
import { CoachApiError, coachFetch } from './coachFetch';
import type { CoachInvite, CoachInviteInput, CoachInviteList } from './types';

export function useCoachInvites(): CoachResource<CoachInviteList> {
  return useCoachResource<CoachInviteList>('/invites/');
}

export function useSendInvite() {
  return (input: CoachInviteInput) =>
    coachFetch<CoachInvite>('/invites/', {
      method: 'POST',
      body: JSON.stringify(input),
    });
}

/**
 * What to tell an admin when an invite is refused.
 *
 * The API names every refusal (`{code, detail}`); the wording here says what to
 * do about each rather than only restating what went wrong.
 */
export function inviteRefusal(error: unknown): string {
  if (!(error instanceof CoachApiError)) {
    return error instanceof Error ? error.message : 'Could not send the invite.';
  }
  const body = error.detail as { code?: string; detail?: string[] } | undefined;
  switch (body?.code) {
    case 'invite_pending':
      return 'That address already has an invite waiting. It can be sent again once it expires.';
    case 'invite_already_member':
      return 'That person has already joined this organisation.';
    case 'invite_team_other_organization':
      return 'That team belongs to a different organisation. Pick one of this organisation’s teams, or no team.';
    case 'team_not_found':
      return 'That team no longer exists. Refresh and pick another.';
    case 'not_found':
      return 'You can’t invite people to that organisation — only its admins can.';
    default:
      if (error.status === 429) return 'Too many requests. Wait a minute and try again.';
      return body?.detail?.[0] ?? 'Could not send the invite.';
  }
}

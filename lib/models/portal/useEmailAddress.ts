'use client';

/**
 * The player's email address (SKI-263, SKI-265).
 *
 * `GET /api/portal/profile/email/` says whether the account has a confirmed
 * address, a pending one, or neither, and whether it manages its address here
 * at all (`available` is false for coaches and coached players).
 *
 * `submit` is `POST /profile/email/`: the address, the notifications the
 * player ticked and their age range. It resolves to `sent` (a confirmation link
 * is on its way) or `confirmed` (the address was already this account's and
 * verified, so the choices took effect at once). A refusal rejects with an
 * `EmailAddressError` carrying the API's error code.
 */
import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { PORTAL_BASE_URL } from './portalFetch';

export interface EmailAddressState {
  email: string | null;
  verified: boolean;
  pending: string | null;
  available: boolean;
}

export type AgeRange = 'under_13' | '13_15' | '16_plus';

export class EmailAddressError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'EmailAddressError';
    this.code = code;
  }
}

async function call(token: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(`${PORTAL_BASE_URL}/profile/email/`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
    });
  } catch {
    throw new EmailAddressError('network', "We couldn't reach Skillprint.");
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new EmailAddressError(body.code || 'unknown', body.detail?.[0] || 'Something went wrong.');
  }
  return { status: response.status, body: body as EmailAddressState };
}

export function useEmailAddress() {
  const { userToken } = useUserSession();
  const [data, setData] = useState<EmailAddressState | null>(null);

  useEffect(() => {
    if (!userToken) return;
    let cancelled = false;
    call(userToken)
      .then(({ body }) => !cancelled && setData(body))
      .catch(() => !cancelled && setData(null));
    return () => {
      cancelled = true;
    };
  }, [userToken]);

  const submit = useCallback(
    async (email: string, categories: string[], ageRange: AgeRange): Promise<'sent' | 'confirmed'> => {
      if (!userToken) throw new EmailAddressError('network', "We couldn't reach Skillprint.");
      const { status, body } = await call(userToken, {
        method: 'POST',
        body: JSON.stringify({ email, categories, ageRange }),
      });
      setData(body);
      return status === 200 ? 'confirmed' : 'sent';
    },
    [userToken],
  );

  return { data, submit };
}

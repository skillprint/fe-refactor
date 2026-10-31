'use client';

import { useSearchParams } from 'next/navigation';
import StartClient from './StartClient';
import VerifyEmailClient from './VerifyEmailClient';
import ConsumerLinkClient from './ConsumerLinkClient';

/** Hands the link's token to the client that redeems that kind of link (see page.tsx). */
export default function StartLinkClient() {
  const searchParams = useSearchParams();
  const verify = searchParams.get('verify');
  const t = searchParams.get('t');
  if (verify) return <VerifyEmailClient token={verify} />;
  if (t) return <ConsumerLinkClient token={t} />;
  return <StartClient token={searchParams.get('token')} />;
}

import type { Metadata } from 'next';
import GuideClient from './GuideClient';

export const metadata: Metadata = {
  title: 'Player guide',
  description: 'What to do when your coach sets you a playbook, how challenges work, and the emails you’ll get.',
};

export default function PlayerGuidePage() {
  return <GuideClient />;
}

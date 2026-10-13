import type { Metadata } from 'next';
import './asu.css';

export const metadata: Metadata = {
  title: 'ReMix Station',
  description: 'The Skillprint station at ReMix the Future 2026: play a game, see your Skillprint, get a sticker.',
};

export default function AsuLayout({ children }: { children: React.ReactNode }) {
  return children;
}

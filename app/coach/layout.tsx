import type { Metadata } from 'next';
import './coach.css';
import CoachShell from './components/CoachShell';

export const metadata: Metadata = {
  title: { template: 'Skillprint Coach · %s', default: 'Skillprint Coach' },
  description: 'Team rosters, engagement and player detail for coaches.',
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <CoachShell>{children}</CoachShell>;
}

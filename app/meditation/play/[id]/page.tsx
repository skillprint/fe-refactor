import type { Metadata } from 'next';
import MeditationPlayer from './MeditationPlayer';

export const metadata: Metadata = {
  title: 'Meditation | Skillprint',
  robots: { index: false, follow: false },
};

export default async function MeditationPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeditationPlayer id={id} />;
}

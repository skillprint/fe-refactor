import { gameDetails, knownGameSlugs } from '../../config/gameConfig';
import GameClient from './GameClient';

export async function generateStaticParams() {
  return knownGameSlugs.map((slug) => ({
    slug: slug,
  }));
}

interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  return <GameClient slug={slug} />;
}
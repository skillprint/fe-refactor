import { gameDetails, knownGameSlugs } from '../../config/gameConfig';
import GameClient from './GameClient';



interface GamePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  return <GameClient slug={slug} />;
}
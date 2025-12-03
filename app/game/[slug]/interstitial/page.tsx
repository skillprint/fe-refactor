import { gameDetails } from '../../../config/gameConfig';
import GameInterstitialClient from './GameInterstitialClient';

export async function generateStaticParams() {
  return Object.keys(gameDetails).map((slug) => ({
    slug: slug,
  }));
}

interface GameInterstitialProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GameInterstitial({ params }: GameInterstitialProps) {
  const { slug } = await params;
  return <GameInterstitialClient slug={slug} />;
}
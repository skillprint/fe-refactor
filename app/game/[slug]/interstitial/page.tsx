import { gameDetails, knownGameSlugs } from '../../../config/gameConfig';
import GameInterstitialClient from './GameInterstitialClient';

export async function generateStaticParams() {
  const params = knownGameSlugs.map((slug) => ({
    slug: slug,
  }));
  console.log('Generating static params for interstitial:', params);
  return params;
}

interface GameInterstitialProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GameInterstitial({ params }: GameInterstitialProps) {
  const { slug } = await params;

  console.log(slug);

  return <GameInterstitialClient slug={slug} />;
}
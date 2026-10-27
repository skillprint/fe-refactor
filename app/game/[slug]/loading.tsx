import GameSessionLoading from '@/components/GameSession/GameSessionLoading';

/**
 * The page is dynamic, so without this a click on Play shows nothing until
 * the server has rendered. Links prefetch this shell, and the router shows it
 * the moment one is clicked.
 */
export default GameSessionLoading;

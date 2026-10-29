import { GameDetailLoading } from './GameDetailClient';

/**
 * The page is dynamic (search params, server-side metadata), so without this
 * a click on a game's info link shows nothing until the server has rendered.
 * Links prefetch this shell, and the router shows it the moment one is clicked.
 */
export default GameDetailLoading;

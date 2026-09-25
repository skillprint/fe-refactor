/**
 * The one way a coach screen names a player (SKI-251).
 *
 * `displayName` comes from the backend already resolved: the name the school's
 * partner sent, else a username the player chose, never an email. When there
 * is none the player is labelled by id, which is honest about what we know
 * rather than inventing a name.
 */
export function playerLabel(player: { userId: number; displayName?: string | null }): string {
  const name = player.displayName?.trim();
  return name ? name : `Player ${player.userId}`;
}

import { BASE_URL as API_BASE_URL } from '../../../app/api/api';
import { portalFetch } from './portalFetch';

/**
 * A room on the agents' game server for one player, with agents in every
 * other seat (POST /api/portal/multiplayer/rooms/). The backend opens it
 * before answering and keeps seat `seat` for `seatToken`; `playUrl` is the
 * page to put in the game frame, with that token in its fragment.
 */
export interface PortalRoom {
    matchUuid: string;
    game: string;
    room: string;
    /** The game server's public origin: the frame's messages come from here. */
    server: string;
    seat: number;
    seatToken: string;
    playUrl: string;
    players: number;
    botModel: string;
    /** Lets this page stop the room's agents when the player leaves. */
    controlToken: string;
    /** The agents' place in the line for a runner, and roughly how long until one is free. */
    queue: { position: number; etaSeconds: number };
}

export interface OpenRoomRequest {
    /** The game's catalog slug. */
    game: string;
    /** The player's portal session, recorded against their seat. */
    sessionId?: string;
    name?: string;
    players?: number;
    botModel?: string;
}

export const openPortalRoom = (token: string, request: OpenRoomRequest) =>
    portalFetch<PortalRoom>('/multiplayer/rooms/', token, { method: 'POST', body: JSON.stringify(request) });

/**
 * Stop the room's agents once the player is done with it: a runner would
 * otherwise keep playing a room nobody is watching until its steps run out.
 * Fire and forget; `keepalive` lets it outlive a page that is closing.
 */
export const stopPortalRoom = (room: PortalRoom, token: string | null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Token ${token}`;
    fetch(`${API_BASE_URL}agents/api/matches/${room.matchUuid}/stop/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ controlToken: room.controlToken }),
        keepalive: true,
    }).catch(() => {});
};

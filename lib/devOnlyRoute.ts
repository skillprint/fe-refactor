import { NextResponse } from 'next/server';

/**
 * The API behind the /sandbox, /dnd and /visualize prototypes.
 *
 * Those routes have no authentication: they take the caller's word for who
 * they are, write to the Neon database, spend the server's Gemini key, and
 * one of them runs migrations on a GET. So they answer under `next dev` only;
 * every built deployment (production, staging, previews) returns 404 before
 * the handler does anything.
 */
export function devOnlyRoute(): NextResponse | null {
  return process.env.NODE_ENV === 'production' ? new NextResponse(null, { status: 404 }) : null;
}

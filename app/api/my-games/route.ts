import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId || userId === 'anonymous') {
        return NextResponse.json({ error: 'Unauthorized', games: [] }, { status: 401 });
    }

    const client = await db.connect();

    try {
        const result = await client.sql`
            SELECT id, user_id, target_mode, target_value, optional_prompt, file_url, created_at 
            FROM generated_games 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        return NextResponse.json({
            success: true,
            games: result.rows,
        });
    } catch (error: any) {
        console.error('Database query error:', error);
        // If the table doesn't exist yet, just return empty list
        if (error.message.includes('relation "generated_games" does not exist')) {
            return NextResponse.json({ success: true, games: [] });
        }
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

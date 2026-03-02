import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GeneratedGame } from '@/lib/models/GeneratedGame';

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId || userId === 'anonymous') {
        return NextResponse.json({ error: 'Unauthorized', games: [] }, { status: 401 });
    }

    try {
        const games = await GeneratedGame.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        return NextResponse.json({
            success: true,
            games: games,
        });
    } catch (error: any) {
        console.error('Database query error:', error);
        if (error.message.includes('relation "generated_games" does not exist')) {
            return NextResponse.json({ success: true, games: [] });
        }
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}

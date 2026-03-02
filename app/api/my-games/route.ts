import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GeneratedGame } from '@/lib/models/GeneratedGame';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    const cookieStore = await cookies();
    let userId = cookieStore.get('user_id')?.value;

    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'skillprint-fallback-secret-key-123');
            if (decoded && decoded.id) {
                userId = decoded.id;
            }
        } catch (err) {
            console.warn('Invalid or expired JWT provided', err);
        }
    }

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

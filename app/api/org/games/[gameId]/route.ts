import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GeneratedGame } from '@/lib/models/GeneratedGame';
import { GameParameter } from '@/lib/models/GameParameter';

export async function GET(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const gameId = resolvedParams.gameId;

        if (!gameId) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
        }

        const game = await GeneratedGame.findOne({
            where: { id: gameId, user_id: userId, deleted_at: null }
        });

        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const parameters = await GameParameter.findAll({
            where: { game_id: gameId }
        });

        return NextResponse.json({ success: true, game, parameters });
    } catch (error: any) {
        console.error("Get Single Game Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { GameParameter } from '@/lib/models/GameParameter';
import { GeneratedGame } from '@/lib/models/GeneratedGame';

export async function GET(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const { gameId } = await params;
        if (!gameId) {
            return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
        }

        const parameters = await GameParameter.findAll({
            where: { game_id: gameId },
            order: [['created_at', 'ASC']],
        });

        return NextResponse.json(parameters);
    } catch (error: any) {
        console.error('Failed to fetch game parameters:', error);
        return NextResponse.json({ error: 'Failed to fetch game parameters' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ gameId: string }> }) {
    try {
        const { gameId } = await params;
        if (!gameId) {
            return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
        }

        const { name, value } = await req.json();

        if (!name || value === undefined) {
            return NextResponse.json({ error: 'Name and value are required' }, { status: 400 });
        }

        const game = await GeneratedGame.findByPk(gameId);
        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const parameter = await GameParameter.create({
            game_id: gameId,
            name,
            value: typeof value === 'string' ? value : JSON.stringify(value),
        });

        return NextResponse.json(parameter, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create game parameter:', error);
        return NextResponse.json({ error: 'Failed to create game parameter' }, { status: 500 });
    }
}

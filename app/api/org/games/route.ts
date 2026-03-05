import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OrganizationGame } from '@/lib/models/OrganizationGame';
import { GeneratedGame } from '@/lib/models/GeneratedGame';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgGames = await OrganizationGame.findAll({
            where: { organization_id: orgId },
            include: [{ model: GeneratedGame }]
        });

        // Also fetch all global games to allow the org to activate them
        const allGames = await GeneratedGame.findAll({
            order: [['created_at', 'DESC']]
        });

        // Merge state
        const gamesWithStatus = allGames.map(game => {
            const orgGame = orgGames.find(og => og.generated_game_id === game.id);
            return {
                ...game.toJSON(),
                is_active: orgGame ? orgGame.is_active : false,
                organization_game_id: orgGame ? orgGame.id : null
            };
        });

        return NextResponse.json({ success: true, games: gamesWithStatus });
    } catch (error: any) {
        console.error("Fetch Org Games Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { generated_game_id, is_active } = await req.json();

        if (!generated_game_id) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
        }

        const [orgGame, created] = await OrganizationGame.findOrCreate({
            where: { organization_id: orgId, generated_game_id },
            defaults: { is_active }
        });

        if (!created) {
            orgGame.is_active = is_active;
            await orgGame.save();
        }

        return NextResponse.json({ success: true, game: orgGame });
    } catch (error: any) {
        console.error("Toggle Org Game Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

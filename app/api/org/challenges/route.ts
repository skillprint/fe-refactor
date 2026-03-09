import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Challenge } from '@/lib/models/Challenge';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const challenges = await Challenge.findAll({
            where: { organization_id: orgId },
            order: [['created_at', 'DESC']]
        });

        return NextResponse.json({ success: true, challenges });
    } catch (error: any) {
        console.error("Fetch Challenges Error:", error);
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

        const {
            title,
            description,
            type,
            temporal_period,
            associated_skill,
            associated_mood,
            start_date,
            end_date,
            game_ids
        } = await req.json();

        if (!title || !description || !type) {
            return NextResponse.json({ error: 'Title, description, and type are required' }, { status: 400 });
        }

        const challenge = await Challenge.create({
            organization_id: orgId,
            title,
            description,
            type,
            temporal_period: temporal_period || null,
            associated_skill: associated_skill || [],
            associated_mood: associated_mood || [],
            start_date: start_date || null,
            end_date: end_date || null,
            game_ids: game_ids || []
        });

        return NextResponse.json({ success: true, challenge });
    } catch (error: any) {
        console.error("Create Challenge Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

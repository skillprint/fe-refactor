import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Challenge } from '@/lib/models/Challenge';

export async function GET(req: Request, { params }: { params: Promise<{ challengeId: string }> }) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { challengeId } = await params;

        const challenge = await Challenge.findOne({
            where: { id: challengeId, organization_id: orgId }
        });

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, challenge });
    } catch (error: any) {
        console.error("Fetch Challenge Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ challengeId: string }> }) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { challengeId } = await params;
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

        const challenge = await Challenge.findOne({
            where: { id: challengeId, organization_id: orgId }
        });

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        if (title !== undefined) challenge.title = title;
        if (description !== undefined) challenge.description = description;
        if (type !== undefined) challenge.type = type;
        if (temporal_period !== undefined) challenge.temporal_period = temporal_period;
        if (associated_skill !== undefined) challenge.associated_skill = associated_skill;
        if (associated_mood !== undefined) challenge.associated_mood = associated_mood;
        if (start_date !== undefined) challenge.start_date = start_date;
        if (end_date !== undefined) challenge.end_date = end_date;
        if (game_ids !== undefined) challenge.game_ids = game_ids;

        await challenge.save();

        return NextResponse.json({ success: true, challenge });
    } catch (error: any) {
        console.error("Update Challenge Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ challengeId: string }> }) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { challengeId } = await params;

        const deleted = await Challenge.destroy({
            where: { id: challengeId, organization_id: orgId }
        });

        if (!deleted) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Challenge deleted successfully' });
    } catch (error: any) {
        console.error("Delete Challenge Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

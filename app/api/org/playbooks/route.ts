import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Playbook } from '@/lib/models/Playbook';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const playbooks = await Playbook.findAll({
            where: { organization_id: orgId },
            order: [['created_at', 'DESC']]
        });

        return NextResponse.json({ success: true, playbooks });
    } catch (error: any) {
        console.error("Fetch Playbooks Error:", error);
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

        const { title, description, associated_skills, associated_moods, game_ids } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const playbook = await Playbook.create({
            organization_id: orgId,
            title,
            description: description || null,
            associated_skills: associated_skills || [],
            associated_moods: associated_moods || [],
            game_ids: game_ids || []
        });

        return NextResponse.json({ success: true, playbook });
    } catch (error: any) {
        console.error("Create Playbook Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Playbook } from '@/lib/models/Playbook';

export async function GET(req: Request, { params }: { params: Promise<{ playbookId: string }> }) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { playbookId } = await params;

        const playbook = await Playbook.findOne({
            where: { id: playbookId, organization_id: orgId }
        });

        if (!playbook) {
            return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, playbook });
    } catch (error: any) {
        console.error("Fetch Playbook Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ playbookId: string }> }) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { playbookId } = await params;
        const { title, description, associated_skills, associated_moods, game_ids } = await req.json();

        const playbook = await Playbook.findOne({
            where: { id: playbookId, organization_id: orgId }
        });

        if (!playbook) {
            return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
        }

        if (title !== undefined) playbook.title = title;
        if (description !== undefined) playbook.description = description;
        if (associated_skills !== undefined) playbook.associated_skills = associated_skills;
        if (associated_moods !== undefined) playbook.associated_moods = associated_moods;
        if (game_ids !== undefined) playbook.game_ids = game_ids;

        await playbook.save();

        return NextResponse.json({ success: true, playbook });
    } catch (error: any) {
        console.error("Update Playbook Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ playbookId: string }> }) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { playbookId } = await params;

        const deleted = await Playbook.destroy({
            where: { id: playbookId, organization_id: orgId }
        });

        if (!deleted) {
            return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Playbook deleted successfully' });
    } catch (error: any) {
        console.error("Delete Playbook Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

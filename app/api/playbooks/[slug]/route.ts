import { NextResponse } from 'next/server';
import { Playbook } from '@/lib/models/Playbook';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const playbook = await Playbook.findOne({
            where: {
                slug,
                organization_id: null
            }
        });
        
        if (!playbook) {
            return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
        }

        return NextResponse.json(playbook);
    } catch (error) {
        console.error('Failed to fetch playbook:', error);
        return NextResponse.json({ error: 'Failed to fetch playbook' }, { status: 500 });
    }
}

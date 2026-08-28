import { NextResponse } from 'next/server';
import { Playbook } from '@/lib/models/Playbook';

export async function GET() {
    try {
        const playbooks = await Playbook.findAll({
            where: {
                organization_id: null
            },
            order: [['created_at', 'ASC']]
        });
        
        return NextResponse.json(playbooks);
    } catch (error) {
        console.error('Failed to fetch consumer playbooks:', error);
        return NextResponse.json({ error: 'Failed to fetch playbooks' }, { status: 500 });
    }
}

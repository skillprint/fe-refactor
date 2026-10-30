import { NextResponse } from 'next/server';
import { devOnlyRoute } from '@/lib/devOnlyRoute';
import { Genre } from '@/lib/models/Genre';

export async function GET() {
    const blocked = devOnlyRoute();
    if (blocked) return blocked;

    try {
        const items = await Genre.findAll({
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']]
        });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

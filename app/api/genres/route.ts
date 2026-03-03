import { NextResponse } from 'next/server';
import { Genre } from '@/lib/models/Genre';

export async function GET() {
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

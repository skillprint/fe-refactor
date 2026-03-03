import { NextResponse } from 'next/server';
import { ArtStyle } from '@/lib/models/ArtStyle';

export async function GET() {
    try {
        const styles = await ArtStyle.findAll({
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']]
        });
        return NextResponse.json(styles);
    } catch (error: any) {
        console.error("Error fetching art styles", error);
        return NextResponse.json({ error: 'Failed to load art styles' }, { status: 500 });
    }
}

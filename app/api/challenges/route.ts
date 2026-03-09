import { NextResponse } from 'next/server';
import { Challenge } from '@/lib/models/Challenge';

export async function GET() {
    try {
        const challenges = await Challenge.findAll({
            order: [['created_at', 'DESC']]
        });

        return NextResponse.json({ success: true, challenges });
    } catch (error: any) {
        console.error("Fetch Public Challenges Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

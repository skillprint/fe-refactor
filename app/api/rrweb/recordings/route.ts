import { NextResponse } from 'next/server';
import { GameplayRecording } from '@/lib/models/GameplayRecording';

export async function GET() {
    try {
        const recordings = await GameplayRecording.findAll({
            attributes: ['id', 'game_slug', 'user_id', 'duration', 'score', 'created_at'],
            order: [['created_at', 'DESC']],
        });
        return NextResponse.json({ success: true, data: recordings });
    } catch (error: any) {
        console.error('[rrweb GET Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { game_slug, user_id, events, duration, score } = body;

        if (!game_slug || !events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid game_slug or empty events' }, { status: 400 });
        }

        const recording = await GameplayRecording.create({
            game_slug,
            user_id: user_id || null,
            events,
            duration: duration || 0,
            score: score || null,
        });

        return NextResponse.json({ success: true, data: { id: recording.id } });
    } catch (error: any) {
        console.error('[rrweb POST Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { GameplayRecording } from '@/lib/models/GameplayRecording';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const recording = await GameplayRecording.findByPk(id);

        if (!recording) {
            return NextResponse.json({ success: false, error: 'Recording not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: recording });
    } catch (error: any) {
        console.error('[rrweb GET Detail Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const recording = await GameplayRecording.findByPk(id);

        if (!recording) {
            return NextResponse.json({ success: false, error: 'Recording not found' }, { status: 404 });
        }

        await recording.destroy();
        return NextResponse.json({ success: true, message: 'Recording deleted successfully' });
    } catch (error: any) {
        console.error('[rrweb DELETE Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

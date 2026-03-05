import { NextResponse } from 'next/server';
import { GameParameter } from '@/lib/models/GameParameter';

export async function PUT(req: Request, { params }: { params: Promise<{ parameterId: string }> }) {
    try {
        const { parameterId } = await params;
        if (!parameterId) {
            return NextResponse.json({ error: 'Missing parameterId' }, { status: 400 });
        }

        const { name, value } = await req.json();

        const parameter = await GameParameter.findByPk(parameterId);
        if (!parameter) {
            return NextResponse.json({ error: 'Parameter not found' }, { status: 404 });
        }

        if (name !== undefined) {
            parameter.name = name;
        }
        if (value !== undefined) {
            parameter.value = typeof value === 'string' ? value : JSON.stringify(value);
        }

        await parameter.save();

        return NextResponse.json(parameter);
    } catch (error: any) {
        console.error('Failed to update game parameter:', error);
        return NextResponse.json({ error: 'Failed to update game parameter' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ parameterId: string }> }) {
    try {
        const { parameterId } = await params;
        if (!parameterId) {
            return NextResponse.json({ error: 'Missing parameterId' }, { status: 400 });
        }

        const parameter = await GameParameter.findByPk(parameterId);
        if (!parameter) {
            return NextResponse.json({ error: 'Parameter not found' }, { status: 404 });
        }

        await parameter.destroy();

        return NextResponse.json({ message: 'Parameter deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete game parameter:', error);
        return NextResponse.json({ error: 'Failed to delete game parameter' }, { status: 500 });
    }
}

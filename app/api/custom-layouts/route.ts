import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CustomLayout } from '@/lib/models/CustomLayout';
import { User } from '@/lib/models/User';
import jwt from 'jsonwebtoken';

function getUserId(req: Request, cookieStore: any): string {
    // 1. Check x-user-id header
    let userId = req.headers.get('x-user-id');
    if (userId) return userId;

    // 2. Check query params
    const url = new URL(req.url);
    userId = url.searchParams.get('userId');
    if (userId) return userId;

    // 3. Check cookie user_id
    userId = cookieStore.get('user_id')?.value;
    if (userId) return userId;

    // 4. Check auth token (Bearer JWT)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'skillprint-fallback-secret-key-123');
            if (decoded && decoded.id) {
                return decoded.id;
            }
        } catch (err) {
            console.warn('Invalid or expired JWT provided', err);
        }
    }

    return 'anonymous';
}

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const userId = getUserId(req, cookieStore);

    try {
        const layouts = await CustomLayout.findAll({
            where: { user_id: userId === 'anonymous' ? null : userId },
            order: [['created_at', 'DESC']]
        });

        const mappedLayouts = layouts.map(l => ({
            id: l.id,
            name: l.name,
            blocks: l.blocks,
            theme: l.theme,
            createdAt: l.created_at
        }));

        return NextResponse.json({
            success: true,
            layouts: mappedLayouts
        });
    } catch (error: any) {
        console.error('Database query error in GET custom-layouts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch custom layouts' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const userId = getUserId(req, cookieStore);

    try {
        const body = await req.json();
        const { name, blocks, theme } = body;

        if (!name || !blocks) {
            return NextResponse.json(
                { error: 'Missing required fields: name and blocks are required.' },
                { status: 400 }
            );
        }

        // Ensure user exists before inserting to satisfy foreign key constraint
        if (userId && userId !== 'anonymous') {
            await User.findOrCreate({
                where: { id: userId },
                defaults: {
                    first_name: 'Anonymous User',
                    profile_image: null,
                }
            });
        }

        const layout = await CustomLayout.create({
            user_id: userId === 'anonymous' ? null : userId,
            name,
            blocks,
            theme
        });

        const clientLayout = {
            id: layout.id,
            name: layout.name,
            blocks: layout.blocks,
            theme: layout.theme,
            createdAt: layout.created_at
        };

        return NextResponse.json({
            success: true,
            layout: clientLayout
        });
    } catch (error: any) {
        console.error('Database error in POST custom-layouts:', error);
        return NextResponse.json(
            { error: 'Failed to create custom layout' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const cookieStore = await cookies();
    const userId = getUserId(req, cookieStore);
    
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Layout ID is required' }, { status: 400 });
        }

        const layout = await CustomLayout.findOne({
            where: {
                id,
                user_id: userId === 'anonymous' ? null : userId
            }
        });

        if (!layout) {
            return NextResponse.json({ error: 'Layout not found or unauthorized' }, { status: 404 });
        }

        await layout.destroy();

        return NextResponse.json({
            success: true,
            message: 'Layout deleted successfully'
        });
    } catch (error: any) {
        console.error('Database error in DELETE custom-layouts:', error);
        return NextResponse.json(
            { error: 'Failed to delete custom layout' },
            { status: 500 }
        );
    }
}

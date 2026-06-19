import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { QuickJumper } from '@/lib/models/QuickJumper';
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
        const jumpers = await QuickJumper.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        // Map database naming (snake_case) to client JumperConfig naming (camelCase)
        const mappedJumpers = jumpers.map(j => ({
            id: j.id,
            label: j.label,
            modelName: j.model_name,
            fields: j.fields,
            daysOffset: j.days_offset,
            chart: j.chart,
            compPeriods: j.comp_periods,
            compCohort: j.comp_cohort,
            createdAt: j.created_at
        }));

        return NextResponse.json({
            success: true,
            jumpers: mappedJumpers
        });
    } catch (error: any) {
        console.error('Database query error in GET quick-jumpers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch custom quick jumpers' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const userId = getUserId(req, cookieStore);

    try {
        const body = await req.json();
        const { label, modelName, fields, daysOffset, chart, compPeriods, compCohort } = body;

        if (!label || !modelName || !fields || !chart) {
            return NextResponse.json(
                { error: 'Missing required fields: label, modelName, fields, and chart are required.' },
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

        const jumper = await QuickJumper.create({
            user_id: userId === 'anonymous' ? null : userId,
            label,
            model_name: modelName,
            fields,
            days_offset: daysOffset || 7,
            chart,
            comp_periods: compPeriods || 0,
            comp_cohort: !!compCohort
        });

        const clientJumper = {
            id: jumper.id,
            label: jumper.label,
            modelName: jumper.model_name,
            fields: jumper.fields,
            daysOffset: jumper.days_offset,
            chart: jumper.chart,
            compPeriods: jumper.comp_periods,
            compCohort: jumper.comp_cohort
        };

        return NextResponse.json({
            success: true,
            jumper: clientJumper
        });
    } catch (error: any) {
        console.error('Database error in POST quick-jumpers:', error);
        return NextResponse.json(
            { error: 'Failed to create quick jumper' },
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
            return NextResponse.json({ error: 'Jumper ID is required' }, { status: 400 });
        }

        const jumper = await QuickJumper.findOne({
            where: {
                id,
                user_id: userId === 'anonymous' ? null : userId
            }
        });

        if (!jumper) {
            return NextResponse.json({ error: 'Quick Jumper not found or unauthorized' }, { status: 404 });
        }

        await jumper.destroy();

        return NextResponse.json({
            success: true,
            message: 'Quick Jumper deleted successfully'
        });
    } catch (error: any) {
        console.error('Database error in DELETE quick-jumpers:', error);
        return NextResponse.json(
            { error: 'Failed to delete quick jumper' },
            { status: 500 }
        );
    }
}

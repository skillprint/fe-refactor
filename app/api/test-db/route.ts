import { NextResponse } from 'next/server';
import { Organization } from '@/lib/models/Organization';
import { sequelize } from '@/lib/db';

export async function GET() {
    try {
        const orgs = await Organization.findAll();
        const rawQuery = await sequelize.query('SELECT * FROM organizations', { type: 'SELECT' });

        return NextResponse.json({
            success: true,
            sequelize_models: orgs,
            raw_query: rawQuery
        });
    } catch (error: any) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to access the database', details: error.message },
            { status: 500 }
        );
    }
}

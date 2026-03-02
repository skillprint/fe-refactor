import { NextResponse } from 'next/server';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '@/lib/db';
import * as initialSchema from '@/migrations/00-initial-schema';

export async function GET() {
    try {
        const umzug = new Umzug({
            migrations: [
                {
                    name: '00-initial-schema',
                    up: async () => initialSchema.up({ context: sequelize, name: '00-initial-schema' }),
                    down: async () => initialSchema.down({ context: sequelize, name: '00-initial-schema' }),
                }
            ],
            context: sequelize,
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
        });

        // Drop the old manually created generated_games table to ensure a clean migration stack
        // This drops the raw schema so our new Umzug migration can build it with foreign keys
        await sequelize.getQueryInterface().dropTable('generated_games').catch(() => null);

        const pending = await umzug.pending();
        if (pending.length > 0) {
            await umzug.up();
            return NextResponse.json({
                success: true,
                message: `Successfully executed ${pending.length} migration(s).`,
                migrations: pending.map(p => p.name)
            });
        }

        return NextResponse.json({
            success: true,
            message: 'No pending migrations.'
        });

    } catch (error: any) {
        console.error('Migration Error:', error);
        return NextResponse.json(
            { error: 'Failed to run umzug migration.', details: error.message },
            { status: 500 }
        );
    }
}

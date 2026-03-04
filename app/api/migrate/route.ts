import { NextResponse } from 'next/server';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '@/lib/db';
import * as initialSchema from '@/migrations/00-initial-schema';
import * as createOrganizations from '@/migrations/01-create-organizations';
import * as createArtStyles from '@/migrations/02-create-art-styles';
import * as createGenres from '@/migrations/03-create-genres';
import * as addGameTitle from '@/migrations/04-add-game-title';
import * as addGameIcon from '@/migrations/05-add-game-icon';

export async function GET() {
    try {
        const umzug = new Umzug({
            migrations: [
                {
                    name: '00-initial-schema',
                    up: async () => initialSchema.up({ context: sequelize, name: '00-initial-schema' }),
                    down: async () => initialSchema.down({ context: sequelize, name: '00-initial-schema' }),
                },
                {
                    name: '01-create-organizations',
                    up: async () => createOrganizations.up({ context: sequelize, name: '01-create-organizations' }),
                    down: async () => createOrganizations.down({ context: sequelize, name: '01-create-organizations' }),
                },
                {
                    name: '02-create-art-styles',
                    up: async () => createArtStyles.up({ context: sequelize, name: '02-create-art-styles' }),
                    down: async () => createArtStyles.down({ context: sequelize, name: '02-create-art-styles' }),
                },
                {
                    name: '03-create-genres',
                    up: async () => createGenres.up({ context: sequelize, name: '03-create-genres' }),
                    down: async () => createGenres.down({ context: sequelize, name: '03-create-genres' }),
                },
                {
                    name: '04-add-game-title',
                    up: async () => addGameTitle.up({ context: sequelize, name: '04-add-game-title' }),
                    down: async () => addGameTitle.down({ context: sequelize, name: '04-add-game-title' }),
                },
                {
                    name: '05-add-game-icon',
                    up: async () => addGameIcon.up({ context: sequelize, name: '05-add-game-icon' }),
                    down: async () => addGameIcon.down({ context: sequelize, name: '05-add-game-icon' }),
                }
            ],
            context: sequelize,
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
        });

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

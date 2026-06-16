import { NextResponse } from 'next/server';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '@/lib/db';
import * as initialSchema from '@/migrations/00-initial-schema';
import * as createOrganizations from '@/migrations/01-create-organizations';
import * as createArtStyles from '@/migrations/02-create-art-styles';
import * as createGenres from '@/migrations/03-create-genres';
import * as addGameTitle from '@/migrations/04-add-game-title';
import * as addGameIcon from '@/migrations/05-add-game-icon';
import * as createOrgMembers from '@/migrations/06-create-org-members';
import * as createOrgGames from '@/migrations/07-create-org-games';
import * as createGameParameters from '@/migrations/08-create-game-parameters';
import * as addOrgGameFields from '@/migrations/09-add-org-game-fields';
import * as addOrgArrayFields from '@/migrations/10-org-games-array-fields';
import * as createPlaybooks from '@/migrations/11-create-playbooks';
import * as createChallenges from '@/migrations/12-create-challenges';
import * as addSlugToPlaybooks from '@/migrations/13-add-slug-to-playbooks';
import * as changeGameIdsType from '@/migrations/14-change-game-ids-type';
import * as addDeletedAtToGames from '@/migrations/15-add-deleted-at-to-games';
import * as createGameVariants from '@/migrations/16-create-game-variants';
import * as createQuickJumpers from '@/migrations/17-create-quick-jumpers';
import * as addRoleToUsers from '@/migrations/18-add-role-to-users';
import * as createCustomLayouts from '@/migrations/19-create-custom-layouts';


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
                },
                {
                    name: '06-create-org-members',
                    up: async () => createOrgMembers.up({ context: sequelize as any, name: '06-create-org-members' } as any),
                    down: async () => createOrgMembers.down({ context: sequelize as any, name: '06-create-org-members' } as any),
                },
                {
                    name: '07-create-org-games',
                    up: async () => createOrgGames.up({ context: sequelize as any, name: '07-create-org-games' } as any),
                    down: async () => createOrgGames.down({ context: sequelize as any, name: '07-create-org-games' } as any),
                },
                {
                    name: '08-create-game-parameters',
                    up: async () => createGameParameters.up({ context: sequelize as any, name: '08-create-game-parameters' } as any),
                    down: async () => createGameParameters.down({ context: sequelize as any, name: '08-create-game-parameters' } as any),
                },
                {
                    name: '09-add-org-game-fields',
                    up: async () => addOrgGameFields.up({ context: sequelize as any, name: '09-add-org-game-fields' } as any),
                    down: async () => addOrgGameFields.down({ context: sequelize as any, name: '09-add-org-game-fields' } as any),
                },
                {
                    name: '10-org-games-array-fields',
                    up: async () => addOrgArrayFields.up({ context: sequelize as any, name: '10-org-games-array-fields' } as any),
                    down: async () => addOrgArrayFields.down({ context: sequelize as any, name: '10-org-games-array-fields' } as any),
                },
                {
                    name: '11-create-playbooks',
                    up: async () => createPlaybooks.up({ context: sequelize, name: '11-create-playbooks' }),
                    down: async () => createPlaybooks.down({ context: sequelize, name: '11-create-playbooks' }),
                },
                {
                    name: '12-create-challenges',
                    up: async () => createChallenges.up({ context: sequelize, name: '12-create-challenges' }),
                    down: async () => createChallenges.down({ context: sequelize, name: '12-create-challenges' }),
                },
                {
                    name: '13-add-slug-to-playbooks',
                    up: async () => addSlugToPlaybooks.up({ context: sequelize, name: '13-add-slug-to-playbooks' }),
                    down: async () => addSlugToPlaybooks.down({ context: sequelize, name: '13-add-slug-to-playbooks' }),
                },
                {
                    name: '14-change-game-ids-type',
                    up: async () => changeGameIdsType.up({ context: sequelize, name: '14-change-game-ids-type' }),
                    down: async () => changeGameIdsType.down({ context: sequelize, name: '14-change-game-ids-type' }),
                },
                {
                    name: '15-add-deleted-at-to-games',
                    up: async () => addDeletedAtToGames.up({ context: sequelize, name: '15-add-deleted-at-to-games' }),
                    down: async () => addDeletedAtToGames.down({ context: sequelize, name: '15-add-deleted-at-to-games' }),
                },
                {
                    name: '16-create-game-variants',
                    up: async () => createGameVariants.up({ context: sequelize, name: '16-create-game-variants' }),
                    down: async () => createGameVariants.down({ context: sequelize, name: '16-create-game-variants' }),
                },
                {
                    name: '17-create-quick-jumpers',
                    up: async () => createQuickJumpers.up({ context: sequelize, name: '17-create-quick-jumpers' }),
                    down: async () => createQuickJumpers.down({ context: sequelize, name: '17-create-quick-jumpers' }),
                },
                {
                    name: '18-add-role-to-users',
                    up: async () => addRoleToUsers.up({ context: sequelize, name: '18-add-role-to-users' }),
                    down: async () => addRoleToUsers.down({ context: sequelize, name: '18-add-role-to-users' }),
                },
                {
                    name: '19-create-custom-layouts',
                    up: async () => createCustomLayouts.up({ context: sequelize, name: '19-create-custom-layouts' }),
                    down: async () => createCustomLayouts.down({ context: sequelize, name: '19-create-custom-layouts' }),
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

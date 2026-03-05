const { Umzug, SequelizeStorage } = require('umzug');
const { sequelize } = require('./lib/db');

async function testMigrate() {
    try {
        const umzug = new Umzug({
            migrations: [
                {
                    name: '00-initial-schema',
                    up: async () => require('./migrations/00-initial-schema').up({ context: sequelize, name: '00-initial-schema' }),
                    down: async () => require('./migrations/00-initial-schema').down({ context: sequelize, name: '00-initial-schema' }),
                },
                {
                    name: '01-create-organizations',
                    up: async () => require('./migrations/01-create-organizations').up({ context: sequelize, name: '01-create-organizations' }),
                    down: async () => require('./migrations/01-create-organizations').down({ context: sequelize, name: '01-create-organizations' }),
                },
                {
                    name: '02-create-art-styles',
                    up: async () => require('./migrations/02-create-art-styles').up({ context: sequelize, name: '02-create-art-styles' }),
                    down: async () => require('./migrations/02-create-art-styles').down({ context: sequelize, name: '02-create-art-styles' }),
                },
                {
                    name: '03-create-genres',
                    up: async () => require('./migrations/03-create-genres').up({ context: sequelize, name: '03-create-genres' }),
                    down: async () => require('./migrations/03-create-genres').down({ context: sequelize, name: '03-create-genres' }),
                },
                {
                    name: '04-add-game-title',
                    up: async () => require('./migrations/04-add-game-title').up({ context: sequelize, name: '04-add-game-title' }),
                    down: async () => require('./migrations/04-add-game-title').down({ context: sequelize, name: '04-add-game-title' }),
                },
                {
                    name: '05-add-game-icon',
                    up: async () => require('./migrations/05-add-game-icon').up({ context: sequelize, name: '05-add-game-icon' }),
                    down: async () => require('./migrations/05-add-game-icon').down({ context: sequelize, name: '05-add-game-icon' }),
                },
                {
                    name: '06-create-org-members',
                    up: async () => require('./migrations/06-create-org-members').up({ context: sequelize, name: '06-create-org-members' }),
                    down: async () => require('./migrations/06-create-org-members').down({ context: sequelize, name: '06-create-org-members' }),
                },
                {
                    name: '07-create-org-games',
                    up: async () => require('./migrations/07-create-org-games').up({ context: sequelize, name: '07-create-org-games' }),
                    down: async () => require('./migrations/07-create-org-games').down({ context: sequelize, name: '07-create-org-games' }),
                },
                {
                    name: '08-create-game-parameters',
                    up: async () => require('./migrations/08-create-game-parameters').up({ context: sequelize, name: '08-create-game-parameters' }),
                    down: async () => require('./migrations/08-create-game-parameters').down({ context: sequelize, name: '08-create-game-parameters' }),
                }
            ],
            context: sequelize,
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
        });

        const pending = await umzug.pending();
        console.log('Pending:', pending);
        if (pending.length > 0) {
            await umzug.up();
            console.log('Migrated successfully.');
        } else {
            console.log('No pending migrations.');
        }
    } catch (err) {
        console.error(err);
    }
}
testMigrate();

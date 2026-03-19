import { Sequelize } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    // Drop the default value first
    await sequelize.query('ALTER TABLE playbooks ALTER COLUMN game_ids DROP DEFAULT;');
    // Change the type
    await sequelize.query('ALTER TABLE playbooks ALTER COLUMN game_ids TYPE VARCHAR(255)[] USING game_ids::VARCHAR(255)[];');
    // Re-add the default
    await sequelize.query('ALTER TABLE playbooks ALTER COLUMN game_ids SET DEFAULT \'{}\';');
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    await sequelize.query('ALTER TABLE playbooks ALTER COLUMN game_ids DROP DEFAULT;');
    await sequelize.query('ALTER TABLE playbooks ALTER COLUMN game_ids TYPE UUID[] USING game_ids::UUID[];');
    await sequelize.query('ALTER TABLE playbooks ALTER COLUMN game_ids SET DEFAULT \'{}\';');
};

import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.createTable('organization_games', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        organization_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        generated_game_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'generated_games',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.fn('NOW'),
        },
    });

    await queryInterface.addIndex('organization_games', ['organization_id', 'generated_game_id'], {
        unique: true,
        name: 'organization_games_unq_org_game'
    });
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('organization_games');
};

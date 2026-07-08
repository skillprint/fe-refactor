import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.createTable('gameplay_recordings', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        game_slug: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        events: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.fn('NOW'),
            allowNull: false,
        },
    });

    await queryInterface.addIndex('gameplay_recordings', ['game_slug']);
    await queryInterface.addIndex('gameplay_recordings', ['user_id']);
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('gameplay_recordings');
};

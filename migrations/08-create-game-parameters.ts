import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.createTable('game_parameters', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        game_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'generated_games',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT, // Storing as TEXT or JSON string if structured
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.fn('NOW'),
        },
    });

    await queryInterface.addIndex('game_parameters', ['game_id']);
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('game_parameters');
};

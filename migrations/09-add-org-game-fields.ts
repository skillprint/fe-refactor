import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.addColumn('organization_games', 'associated_skill', {
        type: DataTypes.STRING,
        allowNull: true,
    });

    await queryInterface.addColumn('organization_games', 'associated_mood', {
        type: DataTypes.STRING,
        allowNull: true,
    });
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.removeColumn('organization_games', 'associated_skill');
    await queryInterface.removeColumn('organization_games', 'associated_mood');
};

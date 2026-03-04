import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('generated_games', 'icon', {
        type: DataTypes.STRING,
        allowNull: true,
    });
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('generated_games', 'icon');
};

import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    // Drop current string columns
    await queryInterface.removeColumn('organization_games', 'associated_skill');
    await queryInterface.removeColumn('organization_games', 'associated_mood');

    // Re-add as ARRAY(STRING)
    await queryInterface.addColumn('organization_games', 'associated_skill', {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
    });

    await queryInterface.addColumn('organization_games', 'associated_mood', {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
    });
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    // Revert back to plain string
    await queryInterface.removeColumn('organization_games', 'associated_skill');
    await queryInterface.removeColumn('organization_games', 'associated_mood');

    await queryInterface.addColumn('organization_games', 'associated_skill', {
        type: DataTypes.STRING,
        allowNull: true,
    });

    await queryInterface.addColumn('organization_games', 'associated_mood', {
        type: DataTypes.STRING,
        allowNull: true,
    });
};

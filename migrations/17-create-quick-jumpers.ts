import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.createTable('quick_jumpers', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fields: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        days_offset: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7,
        },
        chart: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        comp_periods: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        comp_cohort: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.fn('NOW'),
            allowNull: false,
        },
    });

    await queryInterface.addIndex('quick_jumpers', ['user_id']);
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('quick_jumpers');
};

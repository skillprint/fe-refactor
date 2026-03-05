import { Sequelize, DataTypes } from 'sequelize';
import type { MigrationParams } from 'umzug';

type MigrationOptions = MigrationParams<Sequelize>;

export const up = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.createTable('organization_members', {
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
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        role: {
            type: DataTypes.ENUM('admin', 'member'),
            defaultValue: 'member',
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.fn('NOW'),
        },
    });

    await queryInterface.addIndex('organization_members', ['organization_id', 'user_id'], {
        unique: true,
        name: 'organization_members_unq_org_user'
    });
};

export const down = async ({ context: sequelize }: MigrationOptions) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('organization_members');
};

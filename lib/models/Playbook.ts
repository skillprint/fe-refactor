import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { Organization } from './Organization';

export class Playbook extends Model {
    declare id: string;
    declare organization_id: string;
    declare title: string;
    declare description: string | null;
    declare slug: string | null;
    declare associated_skills: string[] | null;
    declare associated_moods: string[] | null;
    declare game_ids: string[] | null;
    declare created_at: Date;
}

Playbook.init(
    {
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
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        associated_skills: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        associated_moods: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        game_ids: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Playbook',
        tableName: 'playbooks',
        timestamps: false,
    }
);

// Define Associations
Organization.hasMany(Playbook, { foreignKey: 'organization_id' });
Playbook.belongsTo(Organization, { foreignKey: 'organization_id' });

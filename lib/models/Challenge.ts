import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { Organization } from './Organization';

export class Challenge extends Model {
    declare id: string;
    declare organization_id: string;
    declare title: string;
    declare description: string;
    declare type: string; // 'temporal', 'skill_mood', 'mixed'
    declare temporal_period: string | null; // 'daily', 'weekly', 'monthly'
    declare associated_skill: string[] | null;
    declare associated_mood: string[] | null;
    declare start_date: Date | null;
    declare end_date: Date | null;
    declare game_ids: string[];
    declare created_at: Date;
}

Challenge.init(
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        temporal_period: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        associated_skill: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        associated_mood: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        game_ids: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            allowNull: false,
            defaultValue: [],
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Challenge',
        tableName: 'challenges',
        timestamps: false,
    }
);

// Define Associations
Organization.hasMany(Challenge, { foreignKey: 'organization_id' });
Challenge.belongsTo(Organization, { foreignKey: 'organization_id' });

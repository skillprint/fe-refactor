import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';
import { Organization } from './Organization';

export class OrganizationMember extends Model {
    declare id: string;
    declare organization_id: string;
    declare user_id: string;
    declare role: 'admin' | 'coach' | 'member';
    declare created_at: Date;
}

OrganizationMember.init(
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
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        role: {
            type: DataTypes.ENUM('admin', 'coach', 'member'),
            defaultValue: 'member',
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'OrganizationMember',
        tableName: 'organization_members',
        timestamps: false,
    }
);

// Define Associations
Organization.hasMany(OrganizationMember, { foreignKey: 'organization_id' });
OrganizationMember.belongsTo(Organization, { foreignKey: 'organization_id' });

User.hasMany(OrganizationMember, { foreignKey: 'user_id' });
OrganizationMember.belongsTo(User, { foreignKey: 'user_id' });

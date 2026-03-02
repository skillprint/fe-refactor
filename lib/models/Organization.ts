import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class Organization extends Model {
    declare id: string;
    declare name: string;
    declare username: string;
    declare password_hash: string;
    declare created_at: Date;
}

Organization.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'Organization',
        tableName: 'organizations',
        timestamps: false,
    }
);

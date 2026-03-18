import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class User extends Model {
    declare id: string;
    declare first_name: string;
    declare profile_image: string | null;
    declare role: 'skillprint_admin' | 'player';
    declare created_at: Date;
}

User.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            // the user_id from social logins might not be a uuid, so we'll use a standard string
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        profile_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('skillprint_admin', 'player'),
            defaultValue: 'player',
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
    }
);

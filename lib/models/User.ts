import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class User extends Model {
    public id!: string;
    public first_name!: string;
    public profile_image!: string | null;
    public created_at!: Date;
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

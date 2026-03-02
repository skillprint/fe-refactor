import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';

export class GeneratedGame extends Model {
    public id!: string;
    public user_id!: string;
    public target_mode!: 'mood' | 'skill';
    public target_value!: string;
    public optional_prompt!: string | null;
    public file_url!: string;
    public created_at!: Date;
}

GeneratedGame.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        target_mode: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        target_value: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        optional_prompt: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        file_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'GeneratedGame',
        tableName: 'generated_games',
        timestamps: false,
    }
);

// Define Associations
User.hasMany(GeneratedGame, { foreignKey: 'user_id' });
GeneratedGame.belongsTo(User, { foreignKey: 'user_id' });

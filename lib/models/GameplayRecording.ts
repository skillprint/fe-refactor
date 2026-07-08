import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class GameplayRecording extends Model {
    declare id: string;
    declare game_slug: string;
    declare user_id: string | null;
    declare events: any;
    declare duration: number;
    declare score: number | null;
    declare created_at: Date;
}

GameplayRecording.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        game_slug: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        events: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'GameplayRecording',
        tableName: 'gameplay_recordings',
        timestamps: false,
    }
);

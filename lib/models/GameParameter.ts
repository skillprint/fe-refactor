import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { GeneratedGame } from './GeneratedGame';

export class GameParameter extends Model {
    declare id: string;
    declare game_id: string;
    declare name: string;
    declare value: string;
    declare created_at: Date;
}

GameParameter.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        game_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'generated_games',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'GameParameter',
        tableName: 'game_parameters',
        timestamps: false,
    }
);

// Define Associations
GeneratedGame.hasMany(GameParameter, { foreignKey: 'game_id', as: 'parameters' });
GameParameter.belongsTo(GeneratedGame, { foreignKey: 'game_id' });

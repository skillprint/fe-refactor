import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { GeneratedGame } from './GeneratedGame';

export class GameVariant extends Model {
    declare id: string;
    declare game_id: string;
    declare file_url: string;
    declare created_at: Date;
}

GameVariant.init(
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
        modelName: 'GameVariant',
        tableName: 'game_variants',
        timestamps: false,
    }
);

// Define Associations
GeneratedGame.hasMany(GameVariant, { foreignKey: 'game_id' });
GameVariant.belongsTo(GeneratedGame, { foreignKey: 'game_id' });

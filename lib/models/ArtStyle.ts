import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class ArtStyle extends Model {
    declare id: string;
    declare name: string;
    declare description: string;
    declare prompt_context: string;
    declare created_at: Date;
}

ArtStyle.init(
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        prompt_context: {
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
        modelName: 'ArtStyle',
        tableName: 'art_styles',
        timestamps: false,
    }
);

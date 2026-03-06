import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { Organization } from './Organization';
import { GeneratedGame } from './GeneratedGame';

export class OrganizationGame extends Model {
    declare id: string;
    declare organization_id: string;
    declare generated_game_id: string;
    declare is_active: boolean;
    declare associated_skill: string[] | null;
    declare associated_mood: string[] | null;
    declare created_at: Date;
}

OrganizationGame.init(
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
        generated_game_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'generated_games',
                key: 'id'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'OrganizationGame',
        tableName: 'organization_games',
        timestamps: false,
    }
);

// Define Associations
Organization.hasMany(OrganizationGame, { foreignKey: 'organization_id' });
OrganizationGame.belongsTo(Organization, { foreignKey: 'organization_id' });

GeneratedGame.hasMany(OrganizationGame, { foreignKey: 'generated_game_id' });
OrganizationGame.belongsTo(GeneratedGame, { foreignKey: 'generated_game_id' });

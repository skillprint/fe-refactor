import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';

export class CustomLayout extends Model {
    declare id: string;
    declare user_id: string | null;
    declare name: string;
    declare blocks: any;
    declare created_at: Date;
}

CustomLayout.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blocks: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'CustomLayout',
        tableName: 'custom_layouts',
        timestamps: false,
    }
);

// Define Associations
User.hasMany(CustomLayout, { foreignKey: 'user_id' });
CustomLayout.belongsTo(User, { foreignKey: 'user_id' });

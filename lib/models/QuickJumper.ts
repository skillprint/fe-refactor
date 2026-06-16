import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';

export class QuickJumper extends Model {
    declare id: string;
    declare user_id: string | null;
    declare label: string;
    declare model_name: string;
    declare fields: string[];
    declare days_offset: number;
    declare chart: string;
    declare comp_periods: number;
    declare comp_cohort: boolean;
    declare created_at: Date;
}

QuickJumper.init(
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
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fields: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        days_offset: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7,
        },
        chart: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        comp_periods: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        comp_cohort: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'QuickJumper',
        tableName: 'quick_jumpers',
        timestamps: false,
    }
);

// Define Associations
User.hasMany(QuickJumper, { foreignKey: 'user_id' });
QuickJumper.belongsTo(User, { foreignKey: 'user_id' });

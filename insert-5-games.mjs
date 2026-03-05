import crypto from 'crypto';
// natively using node --env-file
import { Sequelize, DataTypes, Model } from 'sequelize';

const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false
});

class User extends Model { }
User.init({
    id: { type: DataTypes.STRING, primaryKey: true },
    first_name: { type: DataTypes.STRING, allowNull: true },
    profile_image: { type: DataTypes.STRING, allowNull: true }
}, { sequelize, tableName: 'users', timestamps: false });

class GeneratedGame extends Model { }
GeneratedGame.init({
    id: { type: DataTypes.UUID, primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    target_mode: { type: DataTypes.STRING, allowNull: false },
    target_value: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: true },
    icon: { type: DataTypes.STRING, allowNull: true },
}, { sequelize, tableName: 'generated_games', timestamps: false });

class GameParameter extends Model { }
GameParameter.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    game_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, tableName: 'game_parameters', timestamps: false });

const GAMES = [
    { mode: 'skill', value: 'attention', file: 'skill-attention-antigravity.html', title: 'Attention Test', icon: '🎯' },
    { mode: 'mood', value: 'joy', file: 'mood-joy-antigravity.html', title: 'Joyful Catch', icon: '😊' },
    { mode: 'skill', value: 'spatial reasoning', file: 'skill-spatial-antigravity.html', title: 'Spatial Match', icon: '🧩' },
    { mode: 'mood', value: 'relax', file: 'mood-relax-antigravity.html', title: 'Relaxing Ripples', icon: '🌊' },
    { mode: 'skill', value: 'logic', file: 'skill-logic-antigravity.html', title: 'Lights Out Logic', icon: '💡' }
];

async function run() {
    await sequelize.authenticate();
    console.log("DB connected");

    await User.findOrCreate({
        where: { id: 'seeder' },
        defaults: { first_name: 'System Seeder', profile_image: null }
    });

    for (const game of GAMES) {
        const fileId = crypto.randomUUID();
        await GeneratedGame.create({
            id: fileId,
            user_id: 'seeder',
            target_mode: game.mode,
            target_value: game.value,
            file_url: `/games/generated/${game.file}`,
            title: game.title,
            icon: game.icon
        });

        await GameParameter.create({
            game_id: fileId,
            name: 'difficulty',
            value: 'medium'
        });

        console.log(`Inserted ${game.title} into DB!`);
    }

    console.log("Done inserting all 5 games.");
    process.exit(0);
}

run().catch(console.error);

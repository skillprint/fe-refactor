import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
// node fetch not needed in Node 18+
// Uses node --env-file natively
// Removed dotenv

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

const MOODS = ['relax', 'focus', 'creativity'];
const SKILLS = ['problem solving', 'memory', 'logic'];

async function generateSingleGame(mode, value) {
    await User.findOrCreate({
        where: { id: 'seeder' },
        defaults: { first_name: 'System Seeder', profile_image: null }
    });
    console.log(`Generating ${mode}: ${value}...`);

    const promptText = `You are a web game developer. Generate a very brief interactive web game in a single HTML file targeting ${mode} ${value}. Includes internal logic. Return ONLY actual HTML code block.
<meta name="game-icon" content="🎮"> tag in the head.`;

    const apiUrl = 'http://localhost:11434/api/generate';
    const requestBody = {
        model: 'qwen2.5-coder:14b',
        prompt: promptText,
        stream: false,
        options: { temperature: 0.7 }
    };

    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        throw new Error(`Ollama API Failed ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    let text = data.response;
    if (!text) throw new Error("No text response");

    // Extact html
    const match = text.match(/```html\s*([\s\S]*?)```/);
    if (match) text = match[1];

    const fileId = crypto.randomUUID();
    const fileName = `${mode}-${value.replace(/\s+/g, '-')}-${fileId}.html`.toLowerCase();
    const gamesDir = path.join(process.cwd(), 'public', 'games', 'generated');
    await fs.mkdir(gamesDir, { recursive: true });
    await fs.writeFile(path.join(gamesDir, fileName), text, 'utf-8');

    await GeneratedGame.create({
        id: fileId,
        user_id: 'seeder',
        target_mode: mode,
        target_value: value,
        file_url: `/games/generated/${fileName}`,
        title: `${mode} ${value} Game`,
        icon: '🎮'
    });

    // ADD PARAMETER
    await GameParameter.create({
        game_id: fileId,
        name: 'difficulty',
        value: 'medium'
    });

    console.log(`Saved ${fileName} to database!`);
}

async function run() {
    await sequelize.authenticate();
    console.log("DB connected");

    for (let i = 0; i < 5; i++) {
        const mode = Math.random() > 0.5 ? 'mood' : 'skill';
        const value = (mode === 'mood' ? MOODS : SKILLS)[Math.floor(Math.random() * 3)];
        try {
            await generateSingleGame(mode, value);
        } catch (e) {
            console.error("Failed to gen:", e.message);
        }
    }
    console.log("Done");
    process.exit(0);
}
run();

import { Sequelize } from 'sequelize';
import pg from 'pg';

const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!dbUrl) {
    throw new Error("POSTGRES_URL environment variable is missing.");
}

// Next.js serverless functions require explicitly passing the pg module
export const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: pg,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

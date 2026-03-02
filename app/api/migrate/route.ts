import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    const client = await db.connect();

    try {
        await client.sql`
            CREATE TABLE IF NOT EXISTS generated_games (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                target_mode VARCHAR(50) NOT NULL,
                target_value VARCHAR(255) NOT NULL,
                optional_prompt TEXT,
                file_url VARCHAR(500) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Create an index on user_id for faster listing queries
        await client.sql`
            CREATE INDEX IF NOT EXISTS idx_generated_games_user_id ON generated_games(user_id);
        `;

        return NextResponse.json({
            success: true,
            message: 'Successfully migrated the generated_games table.',
        });
    } catch (error) {
        console.error('Migration Error:', error);
        return NextResponse.json(
            { error: 'Failed to run migration.' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

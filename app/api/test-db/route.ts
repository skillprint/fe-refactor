import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    const client = await db.connect();

    try {
        // Create the test table if it doesn't exist
        await client.sql`
      CREATE TABLE IF NOT EXISTS test_data (
        id SERIAL PRIMARY KEY,
        message VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // Insert a test row
        const insertResult = await client.sql`
      INSERT INTO test_data (message)
      VALUES ('Hello, Database!')
      RETURNING *;
    `;

        // Return the inserted row
        return NextResponse.json({
            success: true,
            data: insertResult.rows[0],
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to access the database' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

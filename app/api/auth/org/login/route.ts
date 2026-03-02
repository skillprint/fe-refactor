import { NextResponse } from 'next/server';
import { Organization } from '@/lib/models/Organization';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'skillprint-fallback-secret-key-123';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const org = await Organization.findOne({ where: { username } });

        if (!org) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, org.password_hash);

        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: org.id, username: org.username, role: 'organization' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Optionally set a cookie for convenience
        const cookieStore = await cookies();
        cookieStore.set('org_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Set the standard user_id cookie to the Org ID to trick standard routes to attribute work to the org
        cookieStore.set('user_id', org.id, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7
        });

        return NextResponse.json({
            success: true,
            token,
            organization: {
                id: org.id,
                name: org.name,
                username: org.username
            }
        });
    } catch (error: any) {
        console.error("Org Login Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

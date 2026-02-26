import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
        }

        const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

        // This must match the redirectUri passed to useLinkedIn hook EXACTLY
        const redirectUri = process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/linkedin`
            : 'http://localhost:3005/linkedin';

        if (!clientId || !clientSecret) {
            console.error("Missing LinkedIn credentials in environment variables");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 1. Exchange authorization code for access token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('LinkedIn token error:', tokenData);
            return NextResponse.json({ error: 'Failed to exchange token', details: tokenData }, { status: tokenResponse.status });
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch user profile using the access token
        // Using the OpenID Connect userinfo endpoint
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
            console.error('LinkedIn profile error:', profileData);
            return NextResponse.json({ error: 'Failed to fetch profile', details: profileData }, { status: profileResponse.status });
        }

        // profileData contains: sub (id), name, given_name, family_name, picture, email
        return NextResponse.json({
            id: profileData.sub,
            firstName: profileData.given_name || profileData.name,
            lastName: profileData.family_name,
            email: profileData.email,
            picture: profileData.picture
        });

    } catch (error) {
        console.error('LinkedIn auth error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

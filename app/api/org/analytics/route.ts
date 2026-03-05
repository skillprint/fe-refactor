import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const orgId = cookieStore.get('user_id')?.value;

        if (!orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real application, this would proxy a request to the external analytics system
        // returning mocked data for the UI
        const mockedAnalytics = {
            totalPlaytimeHours: 1205,
            playtimeTrend: "+15%",
            totalSessions: 3492,
            sessionsTrend: "+8%",
            topGames: [
                { name: "Memory Match", sessions: 1200 },
                { name: "Focus Finder", sessions: 980 },
                { name: "Calm Puzzle", sessions: 850 },
            ],
            focusDistribution: {
                mood: 60, // percentage
                skill: 40
            }
        };

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({ success: true, data: mockedAnalytics });
    } catch (error: any) {
        console.error("Fetch Analytics Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

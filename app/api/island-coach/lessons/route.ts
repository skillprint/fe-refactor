import { NextRequest, NextResponse } from 'next/server';
import { getUserLessons, loadAllPersonas, saveUserLesson } from '@/lib/coachBridge';
import { serverOnly } from '@/lib/staticExport';

// Reads and writes a local LLM Island checkout: no route in the static export.

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const gameSlug = searchParams.get('gameSlug') || undefined;

    const lessons = getUserLessons({ userId, gameSlug });
    const coaches = loadAllPersonas(gameSlug || 'hextris')
      .filter((p) => p.summary.kind === 'agent')
      .map((p) => p.summary);

    return NextResponse.json({
      lessons,
      coaches,
    });
  } catch (error: any) {
    console.error('[api/island-coach/lessons] GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load lessons' },
      { status: 500 }
    );
  }
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.text || !String(body.text).trim()) {
      return NextResponse.json({ error: 'Lesson text is required' }, { status: 400 });
    }

    const lesson = saveUserLesson({
      userId: String(body.userId || 'guest'),
      userName: body.userName ? String(body.userName) : undefined,
      gameSlug: String(body.gameSlug || 'hextris'),
      gameTitle: body.gameTitle ? String(body.gameTitle) : undefined,
      kind: body.kind === 'avoid' ? 'avoid' : body.kind === 'question' ? 'question' : 'works',
      text: String(body.text),
      score: typeof body.score === 'number' ? body.score : null,
      targetMood: body.targetMood ? String(body.targetMood) : undefined,
      shareTo: body.shareTo ? String(body.shareTo) : 'all',
    });

    return NextResponse.json({ ok: true, lesson }, { status: 201 });
  } catch (error: any) {
    console.error('[api/island-coach/lessons] POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save lesson' },
      { status: 500 }
    );
  }
}

export const GET = serverOnly(handleGet);
export const POST = serverOnly(handlePost);

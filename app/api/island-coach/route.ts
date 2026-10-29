import { NextRequest, NextResponse } from 'next/server';
import {
  buildPreGameBriefing,
  generateRealtimeWhisper,
  rateCoachTip,
  type PlayerExperienceInput,
} from '@/lib/coachBridge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game') || 'hextris';
    const coachId = searchParams.get('coachId') || undefined;
    const gameTitle = searchParams.get('gameTitle') || undefined;
    const targetMood = searchParams.get('targetMood') || undefined;
    const sessionsPlayed = searchParams.get('sessionsPlayed')
      ? Number(searchParams.get('sessionsPlayed'))
      : undefined;
    const bestScore = searchParams.get('bestScore')
      ? Number(searchParams.get('bestScore'))
      : undefined;
    const lastScore = searchParams.get('lastScore')
      ? Number(searchParams.get('lastScore'))
      : undefined;
    const lastFlowScore = searchParams.get('lastFlowScore')
      ? Number(searchParams.get('lastFlowScore'))
      : undefined;
    const gameSkills = searchParams.get('gameSkills')
      ? searchParams.get('gameSkills')!.split(',').filter(Boolean)
      : undefined;

    let profileSkills: PlayerExperienceInput['profileSkills'] = undefined;
    const rawSkills = searchParams.get('profileSkills');
    if (rawSkills) {
      try {
        profileSkills = JSON.parse(rawSkills);
      } catch {
        // ignore
      }
    }

    const briefing = buildPreGameBriefing(
      game,
      {
        sessionsPlayed,
        bestScore,
        lastScore,
        lastFlowScore,
        targetMood,
        gameTitle,
        gameSkills,
        profileSkills,
      },
      coachId
    );

    return NextResponse.json(briefing);
  } catch (error: any) {
    console.error('[api/island-coach] GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to build coach briefing' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action || 'whisper';

    if (action === 'briefing') {
      const briefing = buildPreGameBriefing(
        body.gameSlug || body.game || 'hextris',
        body.playerExperience || {},
        body.coachId
      );
      return NextResponse.json(briefing);
    }

    if (action === 'rate') {
      const res = rateCoachTip({
        tipText: String(body.tipText || ''),
        fromId: String(body.fromId || 'island'),
        gameSlug: String(body.gameSlug || 'hextris'),
        helped: Boolean(body.helped),
        scoreDelta: typeof body.scoreDelta === 'number' ? body.scoreDelta : null,
      });
      return NextResponse.json(res);
    }

    // Default: real-time whisper generation
    const whisper = generateRealtimeWhisper({
      gameSlug: String(body.gameSlug || body.game || 'hextris'),
      coachId: body.coachId ? String(body.coachId) : undefined,
      trigger: body.trigger || 'ask',
      score: typeof body.score === 'number' ? body.score : undefined,
      bestScore: typeof body.bestScore === 'number' ? body.bestScore : null,
      inputCount: typeof body.inputCount === 'number' ? body.inputCount : undefined,
      elapsedSeconds: typeof body.elapsedSeconds === 'number' ? body.elapsedSeconds : undefined,
      adjustmentName: body.adjustmentName ? String(body.adjustmentName) : undefined,
      adjustmentValue: body.adjustmentValue,
      question: body.question ? String(body.question) : undefined,
      alreadySentIds: Array.isArray(body.alreadySentIds) ? body.alreadySentIds : undefined,
    });

    return NextResponse.json(whisper);
  } catch (error: any) {
    console.error('[api/island-coach] POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Coach request failed' },
      { status: 500 }
    );
  }
}

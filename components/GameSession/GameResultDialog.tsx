import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useComputedGameMetrics } from '../../app/hooks/useComputedGameMetrics';
import { SkillScores, MoodScores } from '../../app/lib/skillprintSdk';
import type { SessionDetail } from '../../lib/models/portal/SessionDetail';
import type { LibraryGameLeaderboard } from '../../lib/models/portal/LibraryGameLeaderboard';
import { submitMoodSurvey } from '../../app/api/api';
import { PORTAL_SKILLS } from '../../app/config/skillsTaxonomy';
import { titleFromSlug } from '../../lib/skillIcons';
import EmailPromptCard from '../../app/components/EmailPromptCard';
import ScoreComparison, { ComparableMetric } from './ScoreDistribution';
import ShareSheet from '../ShareSheet';
import { gameSharePayload } from '../../lib/share';
import { siteUrl } from '../../lib/siteUrl';
import { baseSlug } from '../../lib/gameSlug';
import { getGameDetails } from '../../app/config/gameConfig';
import type { CoachPersonaSummary, CoachTipItem } from '../../lib/coachBridge';
import PostGameLessonCard from './PostGameLessonCard';
import HighScoreAwardPopup from './HighScoreAwardPopup';
import {
  evaluateHighScoreAchievement,
  getStoredGameHighScores,
  recordStoredGameScore,
} from '../../lib/highScores';
import {
  createLeaderboardRankNotification,
  createPersonalBestNotification,
  pushPortalNotificationOnce,
} from '../../lib/notifications';

interface ResultMetric {
  name: string;
  score: number;
  band: string;
  isEstimated?: boolean;
  confidence?: number;
  slug?: string;
  playbookSlug?: string;
  /** SKI-140: false when the session scored a skill this game does not exercise. */
  isExercisedByGame?: boolean;
}

const displayName = (slug: string) => PORTAL_SKILLS[slug]?.name || titleFromSlug(slug);

/**
 * How the session ended, as far as the game told us. `complete`: the game
 * reported its end (game over, level done). `exited`: the player left while the
 * game said it was still running. `unknown`: the game reports neither, so we
 * can't say.
 */
export type SessionOutcome = 'complete' | 'exited' | 'unknown';

/**
 * Sessions shorter than this aren't scored: a few seconds of play (or a game
 * that never loaded) carries no signal, and an estimate would only mislead.
 */
export const MIN_SCORED_SECONDS = 30;

const OUTCOME_LABELS: Record<SessionOutcome, string> = {
  complete: 'Game complete',
  exited: 'Ended early',
  unknown: 'Session ended',
};

export interface GameResultDialogProps {
  gameTitle: string;
  /** The game's own points; undefined when the game didn't report one. */
  score?: number;
  /** Dev only: the previous best to compare against. Real sessions use the backend's. */
  highScore?: number;
  outcome?: SessionOutcome;
  duration: number; // in seconds
  adjustmentsCount: number;
  targetMood: string;
  /** Mood slug the session targeted, for the survey. Defaults to targetMood lowercased. */
  targetMoodSlug?: string;
  onReplay: () => void;
  skillScores?: SkillScores;
  moodScores?: MoodScores;
  gameSlug?: string;
  userToken?: string | null;
  sessionId?: string;
  /** False when the backend never accepted the session, so the survey mustn't reference it. */
  sessionRecorded?: boolean;
  /** True when the session was under MIN_SCORED_SECONDS: no skill, mood or survey sections. */
  unscored?: boolean;
  /** Dev only: render the mock session (includes an estimated score) instead of fetching. */
  useSyntheticData?: boolean;
  /** Dev only: show the email prompt whatever the session count (SKI-265). */
  forceEmailPrompt?: boolean;
  /** Where Close and the footer's back link go. Defaults to the games list. */
  exitHref?: string;
  exitLabel?: string;
  /** Replaces the footer's "View profile" link. */
  primaryAction?: React.ReactNode;
  /** Extra section, given the session as the dialog has it and whether it was too short to score. */
  renderExtra?: (session: SessionDetail | null, isProcessing: boolean, unscored: boolean) => React.ReactNode;
  /** Where the extra section goes: first, under the heading, or after the scores (the default). */
  extraPlacement?: 'top' | 'bottom';
  /** Leave out the "How did you feel after playing?" question, as on a shared station. */
  hideMoodSurvey?: boolean;
  /** Leave out links into the rest of the portal (playbooks, the email prompt), as on a shared station. */
  hidePortalLinks?: boolean;
  /** Optional player & AI coach context for post-game lesson sharing and tip attribution. */
  coachFeatureEnabled?: boolean;
  userId?: string | null;
  coach?: CoachPersonaSummary | null;
  availableCoaches?: CoachPersonaSummary[];
  deliveredTip?: CoachTipItem | null;
  /** Previous weekly personal best score before this session. */
  weeklyHighScore?: number | null;
  /** Previous #1 all-time leaderboard score before this session. */
  leaderboardAllTimeHigh?: number | null;
  /** Previous #1 weekly leaderboard score before this session. */
  leaderboardWeeklyHigh?: number | null;
  /** Optional post-session all-time leaderboard. */
  postAllTimeBoard?: LibraryGameLeaderboard | null;
  /** Optional post-session weekly leaderboard. */
  postWeeklyBoard?: LibraryGameLeaderboard | null;
  /** Optional flag to skip the celebratory high score popup. */
  skipHighScorePopup?: boolean;
}

export default function GameResultDialog({
  gameTitle,
  score,
  highScore = 0,
  outcome = 'unknown',
  duration,
  adjustmentsCount,
  targetMood,
  targetMoodSlug,
  onReplay,
  skillScores,
  moodScores,
  gameSlug,
  userToken,
  sessionId,
  sessionRecorded = true,
  unscored = false,
  useSyntheticData = false,
  forceEmailPrompt = false,
  exitHref = '/games',
  exitLabel = 'Back to games',
  primaryAction,
  renderExtra,
  extraPlacement = 'bottom',
  hideMoodSurvey = false,
  hidePortalLinks = false,
  coachFeatureEnabled = false,
  userId,
  coach,
  availableCoaches,
  deliveredTip,
  weeklyHighScore = null,
  leaderboardAllTimeHigh = null,
  leaderboardWeeklyHigh = null,
  postAllTimeBoard = null,
  postWeeklyBoard = null,
  skipHighScorePopup = false,
}: GameResultDialogProps) {
  const { data: session, isProcessing } = useComputedGameMetrics(unscored ? undefined : sessionId, useSyntheticData);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  // SKI-140: skills the game did not exercise stay behind a toggle by default.
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [highScoreDismissed, setHighScoreDismissed] = useState(false);

  useEffect(() => {
    setHighScoreDismissed(false);
  }, [sessionId, score]);

  // Guests may answer too (the backend stores user=null), so only the game is required.
  // A failure is shown, never swallowed: a lost answer has to be visible.
  const handleSurveySubmit = async (score: number) => {
    if (!gameSlug) {
      console.error('Mood survey not sent: no game slug');
      setSurveyError('We couldn’t save your answer.');
      return;
    }

    setIsSubmittingSurvey(true);
    setSurveyError(null);
    try {
      await submitMoodSurvey({
        score,
        game: gameSlug,
        mood: targetMoodSlug || targetMood.toLowerCase(),
        ...(sessionId && sessionRecorded ? { session: sessionId } : {})
      }, userToken);
      setSurveySubmitted(true);
    } catch (error) {
      console.error('Failed to submit mood survey:', error);
      setSurveyError('We couldn’t save your answer. Try again.');
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getBand = (val: number) => {
    if (val >= 80) return 'green';
    if (val >= 60) return 'blue';
    if (val >= 40) return 'amber';
    return 'red';
  };

  const canonicalGameKey = baseSlug(gameSlug || gameTitle || '');

  // Read any locally stored baseline for this game (excluding the current session)
  // before recording the new score. Only used for real sessions with a sessionId
  // so dev preview routes like `/dev/game-result/?best=0` remain deterministic.
  const storedBaseline = useMemo(() => {
    if (!sessionId || !canonicalGameKey) {
      return { allTimeBest: null, weeklyBest: null };
    }
    return getStoredGameHighScores(canonicalGameKey, sessionId);
  }, [canonicalGameKey, sessionId]);

  useEffect(() => {
    if (sessionId && canonicalGameKey && typeof score === 'number' && score > 0) {
      recordStoredGameScore(canonicalGameKey, score, sessionId);
    }
  }, [canonicalGameKey, sessionId, score]);

  // The backend knows the player's earlier scores in this game; null means none of
  // them had a score, so this one is the first to compare against.
  const previousBest =
    session?.previousBestScore ??
    (highScore > 0 ? highScore : null) ??
    storedBaseline.allTimeBest;
  const previousWeeklyBest = weeklyHighScore ?? storedBaseline.weeklyBest;
  const hasScore = typeof score === 'number';
  const scoreDiff = hasScore && previousBest !== null ? score - previousBest : 0;
  const isNewBest = hasScore && previousBest !== null && score > previousBest;

  useEffect(() => {
    if (!canonicalGameKey || typeof score !== 'number' || score <= 0) return;
    if (isNewBest || session?.isPersonalBest) {
      pushPortalNotificationOnce(
        createPersonalBestNotification({
          gameSlug: canonicalGameKey,
          gameTitle,
          score,
          previousBest,
          sessionId,
        }),
      );
    }
    if (postWeeklyBoard?.you && postWeeklyBoard.you.rank <= 3) {
      pushPortalNotificationOnce(
        createLeaderboardRankNotification({
          gameSlug: canonicalGameKey,
          gameTitle,
          rank: postWeeklyBoard.you.rank,
          score: postWeeklyBoard.you.score,
          period: 'week',
          totalPlayers: postWeeklyBoard.totalPlayers,
        }),
      );
    } else if (postAllTimeBoard?.you && postAllTimeBoard.you.rank <= 3) {
      pushPortalNotificationOnce(
        createLeaderboardRankNotification({
          gameSlug: canonicalGameKey,
          gameTitle,
          rank: postAllTimeBoard.you.rank,
          score: postAllTimeBoard.you.score,
          period: 'all',
          totalPlayers: postAllTimeBoard.totalPlayers,
        }),
      );
    }
  }, [
    canonicalGameKey,
    gameTitle,
    score,
    isNewBest,
    session?.isPersonalBest,
    previousBest,
    sessionId,
    postWeeklyBoard,
    postAllTimeBoard,
  ]);

  const highScoreAchievement = useMemo(
    () =>
      evaluateHighScoreAchievement({
        gameTitle,
        score,
        sessionId,
        previousPersonalAllTime: previousBest,
        sessionIsPersonalBest: session?.isPersonalBest,
        previousPersonalWeek: previousWeeklyBest,
        previousLeaderAllTime: leaderboardAllTimeHigh,
        previousLeaderWeek: leaderboardWeeklyHigh,
        postAllTimeBoard,
        postWeeklyBoard,
      }),
    [
      gameTitle,
      score,
      sessionId,
      previousBest,
      session?.isPersonalBest,
      previousWeeklyBest,
      leaderboardAllTimeHigh,
      leaderboardWeeklyHigh,
      postAllTimeBoard,
      postWeeklyBoard,
    ],
  );

  // Skill scores (SKI-132). The session endpoint is the source of truth: when a
  // game emitted no cognition scores the backend substitutes estimates flagged
  // `isEstimated`, which we must label as such. The SDK's own scores are the
  // fallback; there is no invented data.
  let skillsData: ResultMetric[] = [];
  if (session?.cognition && session.cognition.length > 0) {
    skillsData = [...session.cognition]
      .sort((a, b) => Number(b.isExercisedByGame ?? false) - Number(a.isExercisedByGame ?? false) || b.score - a.score)
      .map((metric) => ({
        name: displayName(metric.slug),
        score: Math.round(metric.score),
        band: getBand(metric.score),
        isEstimated: metric.isEstimated,
        confidence: metric.confidence,
        slug: metric.slug,
        playbookSlug: `cognition-${metric.slug}`,
        isExercisedByGame: metric.isExercisedByGame,
      }));
  } else if (skillScores?.metrics && Object.keys(skillScores.metrics).length > 0) {
    skillsData = Object.entries(skillScores.metrics).map(([name, metric]) => ({
      name,
      score: Math.round(metric.score),
      band: getBand(metric.score),
    }));
  }
  const hasEstimatedSkills = skillsData.some((s) => s.isEstimated);

  // SKI-140: a session can score every skill in the taxonomy, most of them
  // untouched by the game and sitting at zero. Lead with the skills the game
  // actually measures and keep the rest behind a toggle. When the backend does
  // not flag any skill as exercised there is nothing to split, so show all.
  const measuredSkills = skillsData.filter((s) => s.isExercisedByGame);
  const hasUnmeasuredSkills = measuredSkills.length > 0 && measuredSkills.length < skillsData.length;
  const unmeasuredCount = skillsData.length - measuredSkills.length;
  const visibleSkills = hasUnmeasuredSkills && !showAllSkills ? measuredSkills : skillsData;

  let moodsData: ResultMetric[] = [];
  const allMoods = session?.mood?.allMoods || [];
  if (allMoods.length > 0) {
    moodsData = [...allMoods]
      .sort((a, b) => Number(b.isTarget ?? false) - Number(a.isTarget ?? false) || b.score - a.score)
      .map((metric) => ({
        name: displayName(metric.slug),
        score: Math.round(metric.score),
        band: getBand(metric.score),
        isEstimated: metric.isEstimated,
        confidence: metric.confidence,
        slug: metric.slug,
        playbookSlug: `mood-${metric.slug}`,
      }));
  } else if (moodScores) {
    moodsData = [
      { name: 'Flow score', score: Math.round(moodScores.flowScore), band: getBand(moodScores.flowScore) },
      { name: 'Confidence', score: Math.round(moodScores.confidence), band: getBand(moodScores.confidence) },
    ];
  }

  const resolvedTargetMood = session?.mood?.targetMood ? displayName(session.mood.targetMood) : targetMood;

  // "How you compare": the measured, non-estimated scores this session produced,
  // skills first (highest first, as sorted above) then the moods. A score needs a
  // slug to look up its population, so the SDK-only fallback has nothing to compare.
  const comparableMetrics: ComparableMetric[] = [
    ...skillsData
      .filter((s) => s.slug && !s.isEstimated && s.isExercisedByGame !== false && s.score > 0)
      .map((s) => ({ pillar: 'cognition' as const, slug: s.slug!, name: s.name, score: s.score, band: s.band })),
    ...moodsData
      .filter((m) => m.slug && !m.isEstimated && m.score > 0)
      .map((m) => ({ pillar: 'mood' as const, slug: m.slug!, name: m.name, score: m.score, band: m.band })),
  ];

  const renderMetric = (metric: ResultMetric, index: number, kind: 'Skill' | 'Mood') => (
    <div key={`${kind}-${metric.slug || metric.name}-${index}`} aria-label={`${kind} score: ${metric.name}`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={metric.score} className="game-result__metric layout-grid" data-score={metric.score} data-band={metric.band} data-estimated={metric.isEstimated ? 'true' : undefined} role="progressbar">
      <span className="ui-label game-result__metric-name layout-block">{metric.name}</span>
      <strong className="game-result__metric-value layout-block">
        <span data-score-value="">{metric.score}</span>
        <span className="game-result__metric-total font-xs weight-semibold">/ 100</span>
        {metric.isEstimated && (
          <span className="ui-badge ui-badge--sm ui-badge--amber ml-2" title="This game does not yet report this score directly. The value is an estimate from your play time, not a measurement, and it does not count toward your profile.">Estimated</span>
        )}
      </strong>
      <div aria-hidden="true" className="sp-progress">
        <span className="sp-progress__track">
          <span className="sp-progress__fill" style={{ width: `${metric.score}%`, opacity: metric.isEstimated ? 0.6 : 1 }}></span>
        </span>
      </div>
      {metric.playbookSlug && !hidePortalLinks && (
        <Link href={`/playbooks/${metric.playbookSlug}`} className="font-xs text-muted mt-1 hover:text-white">
          View playbook
        </Link>
      )}
    </div>
  );

  const renderEmpty = (message: string) => (
    <p className="margin-none text-muted font-sm layout-flex items-center gap-md">
      {isProcessing && <span aria-hidden="true" className="session-spinner" style={{ width: '18px', height: '18px' }}></span>}
      <span>{message}</span>
    </p>
  );

  // Share the game, not the session: the link is the game's page (with its
  // preview card), and the post leads with the player's points when the game
  // reported any. A shared station or an embed keeps to the session.
  const shareSlug = baseSlug(gameSlug || gameTitle || '');
  const shareable = Boolean(shareSlug) && !hidePortalLinks;
  const sharePayload = () => {
    const origin = siteUrl();
    const art = getGameDetails(shareSlug)?.image;
    const payload = gameSharePayload(origin, { baseSlug: shareSlug, name: gameTitle }, art ? new URL(art, `${origin}/`).toString() : null);
    if (highScoreAchievement) {
      payload.text = highScoreAchievement.shareText;
    } else if (typeof score === 'number' && score > 0) {
      payload.text = `I scored ${score.toLocaleString('en-US')} in ${gameTitle} on Skillprint. Think you can beat it? A few minutes of play gets you a read on your skills and mood.`;
    }
    return payload;
  };

  if (highScoreAchievement && !highScoreDismissed && !skipHighScorePopup) {
    return (
      <HighScoreAwardPopup
        achievement={highScoreAchievement}
        gameTitle={gameTitle}
        gameSlug={gameSlug || shareSlug}
        hidePortalLinks={hidePortalLinks}
        onContinue={() => setHighScoreDismissed(true)}
      />
    );
  }

  return (
    <div className="popup-backdrop inset-none place-center is-open" id="resultPopup">
      <article aria-labelledby="resultTitle" aria-modal="true" className="popup popup--dark game-result" id="resultDialog" role="dialog">
        <div className="popup__content scrollbar-violet relative">
          
          <div className="layout-flex items-start justify-between gap-2xl">
            <span className="ui-label game-result__status layout-inline-flex items-center gap-md" data-outcome={outcome}>
              <i className="radius-round"></i>{unscored ? 'Too short to score' : OUTCOME_LABELS[outcome]}
            </span>
            <Link 
              href={exitHref}
              aria-label="Close results" 
              className="game-result__close button button--tertiary button--icon-only button--md layout-grid place-center radius-control surface-transparent padding-none" 
              data-result-close="" 
              id="resultClose"
            >
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
            </Link>
          </div>

          <div className="game-result__head layout-flex items-start gap-lg">
            <div className="game-result__icon layout-grid place-center text-inverse no-grow">
              <svg aria-hidden="true" className="sp-icon layout-block full-width overflow-visible" viewBox="0 0 24 24"><use href="#ti-check"></use></svg>
            </div>
            <div className="min-width-0">
              <h2 id="resultTitle">Your Skillprint analysis</h2>
              <p className="game-result__description font-md leading-lg margin-none" data-stage-blurb>
                {unscored
                  ? `This ${gameTitle} session lasted under ${MIN_SCORED_SECONDS} seconds, too short to measure your skills or mood. Play a little longer and we'll score the next one.`
                  : `We read your ${gameTitle} session and scored the skills and the mood it moved.`}
              </p>
            </div>
          </div>

          {extraPlacement === 'top' && renderExtra?.(session ?? null, isProcessing, unscored)}

          {!unscored && !hideMoodSurvey && (
            <section aria-label="Session feedback" className="game-result__section separator-top layout-grid">
              <div className="game-result__mood layout-flex flex-col items-start gap-lg w-full">
                <div className="layout-grid gap-sm min-width-0">
                  <strong className="font-md leading-lg weight-semibold">How did you feel after playing?</strong>
                  <span className="game-result__mood-question font-sm leading-sm" data-stage-mood-question>
                    Did {gameTitle} help you feel more {targetMood.toLowerCase()}?
                  </span>
                </div>
              
                {isSubmittingSurvey ? (
                  <div className="layout-flex items-center gap-md padding-block-sm text-muted">
                    <span aria-hidden="true" className="session-spinner" style={{ width: '24px', height: '24px' }}></span>
                    <span className="font-sm">Submitting your response...</span>
                  </div>
                ) : surveySubmitted ? (
                  <div className="layout-flex items-center gap-md padding-block-sm" style={{ color: 'var(--text-success)' }}>
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-check"></use></svg>
                    <span className="font-sm weight-medium">Thanks for your feedback!</span>
                  </div>
                ) : (
                  <>
                  {surveyError && (
                    <p className="margin-none font-sm" role="alert" style={{ color: 'var(--skills-pink-500)' }}>
                      {surveyError}
                    </p>
                  )}
                  <div className="layout-flex gap-md wrap" role="group">
                    <button aria-pressed="false" className="game-result__mood-answer button button--secondary button--sm" data-mood-answer="-1" type="button" onClick={() => handleSurveySubmit(-1)}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-down"></use></svg>
                      <span data-stage-answer-down>Less {targetMood.toLowerCase()}</span>
                    </button>
                    <button aria-pressed="false" className="game-result__mood-answer button button--secondary button--sm" data-mood-answer="0" type="button" onClick={() => handleSurveySubmit(0)}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-equal"></use></svg>
                      About the same
                    </button>
                    <button aria-pressed="false" className="game-result__mood-answer button button--secondary button--sm" data-mood-answer="1" type="button" onClick={() => handleSurveySubmit(1)}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-up"></use></svg>
                      <span data-stage-answer-up>More {targetMood.toLowerCase()}</span>
                    </button>
                  </div>
                  </>
                )}
              </div>
              <p className="game-result__note margin-none font-xs leading-xs">Your scores may continue to update after playing.</p>
            </section>
          )}

          <div className="game-result__overview layout-grid gap-lg">
            <div className="game-result__score layout-grid radius-card padding-xl">
              <div className="layout-flex items-center justify-between gap-lg wrap">
                <span className="ui-label">Game score</span>
                {highScoreAchievement ? (
                  <span className="game-result__best ui-badge ui-badge--pill ui-badge--leading" data-result-best-badge="">
                    <i className="ui-badge__dot"></i>{highScoreAchievement.primary.label}
                  </span>
                ) : isNewBest ? (
                  <span className="game-result__best ui-badge ui-badge--pill ui-badge--leading">
                    <i className="ui-badge__dot"></i>New personal best
                  </span>
                ) : null}
              </div>
              <strong className="game-result__score-value layout-block">{hasScore ? score.toLocaleString() : '—'}</strong>
              {/* SKI-140: the number is the game's own points, not a mark out of
                  100 like the skill scores below, so say which scale it is on. */}
              <span className="game-result__score-note layout-block font-sm">
                {!hasScore
                  ? `${gameTitle} doesn't report a score to Skillprint.${unscored ? '' : ' Your skill scores below come from how you played.'}`
                  : highScoreAchievement && scoreDiff <= 0
                    ? highScoreAchievement.summary
                    : previousBest !== null
                      ? `${scoreDiff > 0 ? '+' : ''}${scoreDiff.toLocaleString()} on your previous best of ${previousBest.toLocaleString()}`
                      : `Points scored in ${gameTitle}, on the game's own scale rather than out of 100. Your next session is measured against it.`}
              </span>
            </div>
            
            <div className="game-result__summary layout-grid gap-md radius-card padding-xl">
              <div><span className="ui-label layout-block">Game</span><strong className="layout-block" data-stage-title>{gameTitle}</strong></div>
              <div><span className="ui-label layout-block">Duration</span><strong className="layout-block">{formatDuration(duration)}</strong></div>
              <div title={`Times ${gameTitle} changed its difficulty to match your play during this session.`}>
                <span className="ui-label layout-block">Live adjustments</span>
                <strong className="layout-block">{adjustmentsCount} applied</strong>
              </div>
              <p className="game-result__note margin-none">
                {adjustmentsCount > 0
                  ? `Live adjustments are the times ${gameTitle} changed its difficulty to match your play during this session.`
                  : `${gameTitle} did not need to change its difficulty during this session.`}
              </p>
            </div>
          </div>

          {!unscored && (
            <>
              <section aria-label="Skill scores" className="game-result__section separator-top layout-grid relative">
                <h3 className="portal-eyebrow game-result__section-title">Skill scores</h3>
                {skillsData.length > 0 && (
                  <p className="game-result__note margin-none">
                    Each skill is scored from 0 to 100.
                    {hasUnmeasuredSkills && !showAllSkills && ` Only the skills ${gameTitle} measures are shown.`}
                  </p>
                )}
                {skillsData.length === 0 ? (
                  renderEmpty(isProcessing ? 'Scoring your session. Skill scores appear here as soon as they are ready.' : 'This session did not produce skill scores.')
                ) : (
                  <div className="layout-grid grid-4 gap-lg">
                    {visibleSkills.map((skill, index) => renderMetric(skill, index, 'Skill'))}
                  </div>
                )}
                {hasUnmeasuredSkills && (
                  <button
                    type="button"
                    className="button button--tertiary button--sm justify-self-start"
                    aria-expanded={showAllSkills}
                    onClick={() => setShowAllSkills((open) => !open)}
                  >
                    {showAllSkills
                      ? `Hide the ${unmeasuredCount} ${unmeasuredCount === 1 ? 'skill' : 'skills'} ${gameTitle} does not measure`
                      : `Show ${unmeasuredCount} more ${unmeasuredCount === 1 ? 'skill' : 'skills'} ${gameTitle} does not measure`}
                  </button>
                )}
                {hasEstimatedSkills && (
                  <p className="game-result__note margin-none font-xs leading-xs">
                    Scores marked <strong>Estimated</strong> come from your play time rather than a measurement, because this game does not report them directly yet. They are shown for context only and do not change your profile.
                  </p>
                )}
              </section>

              <section aria-label="Mood analysis" className="game-result__section separator-top layout-grid relative">
                <h3 className="portal-eyebrow game-result__section-title">Mood analysis</h3>
                <div className="layout-grid grid-3 gap-lg">
                  <div className="game-result__metric layout-grid">
                    <span className="ui-label game-result__metric-name layout-block">Target mood</span>
                    <strong className="game-result__metric-value layout-block" data-stage-mood="">{resolvedTargetMood}</strong>
                  </div>
              
                  {moodsData.map((mood, index) => renderMetric(mood, index, 'Mood'))}
                </div>
                {moodsData.length === 0 && renderEmpty(isProcessing ? 'Reading the mood this session moved.' : 'No mood scores were recorded for this session.')}
              </section>

              <ScoreComparison metrics={comparableMetrics} useSyntheticData={useSyntheticData} />
            </>
          )}

          {extraPlacement === 'bottom' && renderExtra?.(session ?? null, isProcessing, unscored)}

          {!hidePortalLinks && coachFeatureEnabled && (
            <PostGameLessonCard
              userId={userId}
              gameSlug={shareSlug || gameSlug || 'hextris'}
              gameTitle={gameTitle}
              score={score}
              scoreDelta={hasScore && previousBest !== null ? scoreDiff : null}
              targetMood={resolvedTargetMood}
              coach={coach}
              availableCoaches={availableCoaches}
              deliveredTip={deliveredTip}
            />
          )}

          {!hidePortalLinks && <EmailPromptCard force={forceEmailPrompt} />}

        </div>
        
        <footer className="popup__footer">
          <Link href={exitHref} className="button button--tertiary button--md">{exitLabel}</Link>
          <div className="game-result__actions layout-flex items-center gap-md">
            {shareable && (
              <button className="button button--secondary button--md" type="button" onClick={() => setShareOpen(true)} aria-label={`Share ${gameTitle}`} data-result-share="">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-share"></use></svg>
                Share
              </button>
            )}
            <button className="button button--secondary button--md" data-sequence-go="loading" type="button" onClick={onReplay}>Play again</button>
            {primaryAction ?? (
              <Link className="button button--primary button--md" href="/profile">
                View profile <svg className="sp-icon ml-2" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
              </Link>
            )}
          </div>
        </footer>
      </article>
      {shareable && shareOpen && (
        <ShareSheet
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          heading={`Share ${gameTitle}`}
          payload={sharePayload()}
        />
      )}
    </div>
  );
}

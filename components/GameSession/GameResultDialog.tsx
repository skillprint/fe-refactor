import React, { useState } from 'react';
import Link from 'next/link';
import { useComputedGameMetrics } from '../../app/hooks/useComputedGameMetrics';
import { SkillScores, MoodScores } from '../../app/lib/skillprintSdk';
import { submitMoodSurvey } from '../../app/api/api';
import { PORTAL_SKILLS } from '../../app/config/skillsTaxonomy';
import { titleFromSlug } from '../../lib/skillIcons';

interface ResultMetric {
  name: string;
  score: number;
  band: string;
  isEstimated?: boolean;
  confidence?: number;
  slug?: string;
  playbookSlug?: string;
}

const displayName = (slug: string) => PORTAL_SKILLS[slug]?.name || titleFromSlug(slug);

interface GameResultDialogProps {
  gameTitle: string;
  score: number;
  highScore?: number;
  duration: number; // in seconds
  adjustmentsCount: number;
  targetMood: string;
  onReplay: () => void;
  skillScores?: SkillScores;
  moodScores?: MoodScores;
  gameSlug?: string;
  userToken?: string | null;
  sessionId?: string;
  /** Dev only: render the mock session (includes an estimated score) instead of fetching. */
  useSyntheticData?: boolean;
}

export default function GameResultDialog({
  gameTitle,
  score,
  highScore = 0,
  duration,
  adjustmentsCount,
  targetMood,
  onReplay,
  skillScores,
  moodScores,
  gameSlug,
  userToken,
  sessionId,
  useSyntheticData = false
}: GameResultDialogProps) {
  const { data: session, isProcessing } = useComputedGameMetrics(sessionId, useSyntheticData);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const handleSurveySubmit = async (score: number) => {
    if (!gameSlug || !userToken) {
      // If we don't have the necessary data, just simulate success for the UI
      setIsSubmittingSurvey(true);
      setTimeout(() => {
        setSurveySubmitted(true);
        setIsSubmittingSurvey(false);
      }, 500);
      return;
    }

    setIsSubmittingSurvey(true);
    try {
      await submitMoodSurvey({
        score,
        game: gameSlug.toLowerCase(),
        mood: targetMood
      }, userToken);
      setSurveySubmitted(true);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      // Still show submitted to prevent getting stuck
      setSurveySubmitted(true);
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

  const scoreDiff = score - highScore;
  const isNewBest = score > highScore && highScore > 0;

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
      }));
  } else if (skillScores?.metrics && Object.keys(skillScores.metrics).length > 0) {
    skillsData = Object.entries(skillScores.metrics).map(([name, metric]) => ({
      name,
      score: Math.round(metric.score),
      band: getBand(metric.score),
    }));
  }
  const hasEstimatedSkills = skillsData.some((s) => s.isEstimated);

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
      {metric.playbookSlug && (
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

  return (
    <div className="popup-backdrop inset-none place-center is-open" id="resultPopup">
      <article aria-labelledby="resultTitle" aria-modal="true" className="popup popup--dark game-result" id="resultDialog" role="dialog">
        <div className="popup__content scrollbar-violet relative">
          
          <div className="layout-flex items-start justify-between gap-2xl">
            <span className="ui-label game-result__status layout-inline-flex items-center gap-md">
              <i className="radius-round"></i>Game complete
            </span>
            <Link 
              href="/games"
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
                We read your {gameTitle} session and scored the skills and the mood it moved.
              </p>
            </div>
          </div>

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
              )}
            </div>
            <p className="game-result__note margin-none font-xs leading-xs">Your scores may continue to update after playing.</p>
          </section>

          <div className="game-result__overview layout-grid gap-lg">
            <div className="game-result__score layout-grid radius-card padding-xl">
              <div className="layout-flex items-center justify-between gap-lg">
                <span className="ui-label">Final score</span>
                {isNewBest && (
                  <span className="game-result__best ui-badge ui-badge--pill ui-badge--leading">
                    <i className="ui-badge__dot"></i>New personal best
                  </span>
                )}
              </div>
              <strong className="game-result__score-value layout-block">{score.toLocaleString()}</strong>
              {highScore > 0 && (
                <span className="game-result__score-note layout-block font-sm">
                  {scoreDiff > 0 ? '+' : ''}{scoreDiff.toLocaleString()} on your previous best of {highScore.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="game-result__summary layout-grid gap-md radius-card padding-xl">
              <div><span className="ui-label layout-block">Game</span><strong className="layout-block" data-stage-title>{gameTitle}</strong></div>
              <div><span className="ui-label layout-block">Duration</span><strong className="layout-block">{formatDuration(duration)}</strong></div>
              <div><span className="ui-label layout-block">Adjustments</span><strong className="layout-block">{adjustmentsCount} applied</strong></div>
            </div>
          </div>

          <section aria-label="Skill scores" className="game-result__section separator-top layout-grid relative">
            <h3 className="portal-eyebrow game-result__section-title">Skill scores</h3>
            {skillsData.length === 0 ? (
              renderEmpty(isProcessing ? 'Scoring your session. Skill scores appear here as soon as they are ready.' : 'This session did not produce skill scores.')
            ) : (
              <div className="layout-grid grid-4 gap-lg">
                {skillsData.map((skill, index) => renderMetric(skill, index, 'Skill'))}
              </div>
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

        </div>
        
        <footer className="popup__footer">
          <Link href="/games" className="button button--tertiary button--md">Back to games</Link>
          <div className="game-result__actions layout-flex items-center gap-md">
            <button className="button button--secondary button--md" data-sequence-go="loading" type="button" onClick={onReplay}>Play again</button>
            <Link className="button button--primary button--md" href="/profile">
              View profile <svg className="sp-icon ml-2" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}

import React, { useState } from 'react';
import Link from 'next/link';
import { MockDataTag } from '../MockDataTag';
import { SkillScores, MoodScores } from '../../app/lib/skillprintSdk';
import { submitMoodSurvey } from '../../app/api/api';

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
  userToken
}: GameResultDialogProps) {
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
        game: gameSlug,
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

  // Mock data fallbacks for skills and mood
  let isMockSkills = false;
  let skillsData: { name: string; score: number; band: string }[] = [];

  if (skillScores?.metrics && Object.keys(skillScores.metrics).length > 0) {
    skillsData = Object.entries(skillScores.metrics).map(([name, metric]) => ({
      name,
      score: Math.round(metric.score),
      band: getBand(metric.score)
    }));
  } else {
    isMockSkills = true;
    skillsData = [
      { name: 'Pattern Matching', score: 84, band: 'green' },
      { name: 'Spatial', score: 71, band: 'blue' },
      { name: 'Attention', score: 52, band: 'amber' },
      { name: 'Timing', score: 34, band: 'red' }
    ];
  }

  let isMockMoods = false;
  let moodsData: { name: string; score: number; band: string }[] = [];

  if (moodScores) {
    moodsData = [
      { name: 'Flow score', score: Math.round(moodScores.flowScore), band: getBand(moodScores.flowScore) },
      { name: 'Confidence', score: Math.round(moodScores.confidence), band: getBand(moodScores.confidence) }
    ];
  } else {
    isMockMoods = true;
    moodsData = [
      { name: 'Flow score', score: 72, band: 'blue' },
      { name: 'Confidence', score: 58, band: 'amber' }
    ];
  }

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
            {isMockSkills && <MockDataTag />}
            <h3 className="portal-eyebrow game-result__section-title">Skill scores</h3>
            <div className="layout-grid grid-4 gap-lg">
              {skillsData.map((skill, index) => (
                <div key={index} aria-label={`Skill score: ${skill.name}`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={skill.score} className="game-result__metric layout-grid" data-score={skill.score} data-band={skill.band} role="progressbar">
                  <span className="ui-label game-result__metric-name layout-block">{skill.name}</span>
                  <strong className="game-result__metric-value layout-block">
                    <span data-score-value="">{skill.score}</span>
                    <span className="game-result__metric-total font-xs weight-semibold">/ 100</span>
                  </strong>
                  <div aria-hidden="true" className="sp-progress">
                    <span className="sp-progress__track">
                      <span className="sp-progress__fill" style={{ width: `${skill.score}%` }}></span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="Mood analysis" className="game-result__section separator-top layout-grid relative">
            {isMockMoods && <MockDataTag />}
            <h3 className="portal-eyebrow game-result__section-title">Mood analysis</h3>
            <div className="layout-grid grid-3 gap-lg">
              <div className="game-result__metric layout-grid">
                <span className="ui-label game-result__metric-name layout-block">Target mood</span>
                <strong className="game-result__metric-value layout-block" data-stage-mood="">{targetMood}</strong>
              </div>
              
              {moodsData.map((mood, index) => (
                <div key={index} aria-label={`Mood score: ${mood.name}`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={mood.score} className="game-result__metric layout-grid" data-score={mood.score} data-band={mood.band} role="progressbar">
                  <span className="ui-label game-result__metric-name layout-block">{mood.name}</span>
                  <strong className="game-result__metric-value layout-block">
                    <span data-score-value="">{mood.score}</span>
                    <span className="game-result__metric-total font-xs weight-semibold">/ 100</span>
                  </strong>
                  <div aria-hidden="true" className="sp-progress">
                    <span className="sp-progress__track">
                      <span className="sp-progress__fill" style={{ width: `${mood.score}%` }}></span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
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

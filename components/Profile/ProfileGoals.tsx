import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface GoalItem {
  slug: string;
  name: string;
}

interface ProfileGoalsProps {
  goalSkills: string[];
  goalMoods: string[];
  isGoalsLoading: boolean;
  isSavingSkills: boolean;
  isSavingMoods: boolean;
  saveSkills: (skills: string[]) => Promise<void>;
  saveMoods: (moods: string[]) => Promise<void>;
  availableSkills: GoalItem[];
  availableMoods: GoalItem[];
}

export default function ProfileGoals({
  goalSkills,
  goalMoods,
  isGoalsLoading,
  isSavingSkills,
  isSavingMoods,
  saveSkills,
  saveMoods,
  availableSkills,
  availableMoods
}: ProfileGoalsProps) {
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  
  const [isEditingMoods, setIsEditingMoods] = useState(false);
  const [tempMoods, setTempMoods] = useState<string[]>([]);

  return (
    <section className="pp-section" id="goals">
      <div className="section-head pp-head">
        <div className="section-head-copy">
          <h2>Goals</h2>
          <p className="margin-none text-muted">
            The skills and moods you want to work on. Every session is measured against these, and Home recommends games that reach them.
          </p>
        </div>
      </div>
      
      <div className="pp-goal-grid grid gap-6 md:grid-cols-2">
        {/* TARGET SKILLS */}
        <article className="pp-goal sp-card relative">
          <div className="pp-goal__head layout-flex items-center justify-between gap-lg">
            <div className="cluster items-center gap-md">
              <svg className="sp-icon sp-icon--md sp-icon--cognition" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
              <h3>Target skills</h3>
            </div>
            {!isEditingSkills && (
              <button 
                className="button button--tertiary button--xs" 
                onClick={() => {
                  setTempSkills([...goalSkills]);
                  setIsEditingSkills(true);
                }}
                type="button"
                disabled={isGoalsLoading}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-edit"></use></svg>
                Edit
              </button>
            )}
          </div>
          {!isEditingSkills ? (
            goalSkills.length === 0 ? (
              <div className="pp-goal__empty text-center" data-pp-goal-empty>
                <p className="margin-none text-muted font-sm mb-4">No target skills yet. Pick the skills you want your sessions to push.</p>
                <button 
                  className="button button--primary button--sm" 
                  onClick={() => {
                    setTempSkills([]);
                    setIsEditingSkills(true);
                  }}
                  type="button"
                >
                  + Add a skill
                </button>
              </div>
            ) : (
              <div className="pp-goal__view" data-pp-goal-view>
                <div className="cluster wrap gap-md" data-pp-goal-chips>
                  {goalSkills.map(slug => {
                    const skill = availableSkills.find(s => s.slug === slug);
                    return (
                      <span key={slug} className="ui-tag is-selected">
                        <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href={`#ti-cognition-${slug.replace(/_/g, '-')}`}></use></svg>
                        {skill?.name || slug}
                      </span>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="pp-goal__edit" data-pp-goal-editor>
              <p className="margin-none text-muted font-xs">Pick the skills you want your sessions to push.</p>
              <div className="pp-goal__picker cluster wrap gap-md" data-pp-goal-picker>
                {availableSkills.map((skill) => {
                  const isSelected = tempSkills.includes(skill.slug);
                  return (
                    <button
                      key={skill.slug}
                      aria-pressed={isSelected}
                      className={`ui-tag ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setTempSkills(tempSkills.filter(s => s !== skill.slug));
                        } else {
                          setTempSkills([...tempSkills, skill.slug]);
                        }
                      }}
                      type="button"
                    >
                      <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href={`#ti-cognition-${skill.slug.replace(/_/g, '-')}`}></use></svg>
                      {skill.name}
                    </button>
                  );
                })}
              </div>
              <div className="pp-goal__foot cluster gap-md separator-top">
                <button 
                  className="button button--secondary button--xs" 
                  onClick={() => setIsEditingSkills(false)}
                  type="button"
                  disabled={isSavingSkills}
                >
                  Cancel
                </button>
                <button 
                  className="button button--primary button--xs flex items-center gap-2" 
                  onClick={async () => {
                    if (isSavingSkills) return;
                    try {
                      await saveSkills(tempSkills);
                      setIsEditingSkills(false);
                      toast.success('Target skills saved!');
                    } catch (e) {
                      toast.error('Failed to save target skills.');
                    }
                  }}
                  type="button"
                  disabled={isSavingSkills}
                >
                  {isSavingSkills ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          )}
        </article>

        {/* TARGET MOODS */}
        <article className="pp-goal sp-card relative">
          <div className="pp-goal__head layout-flex items-center justify-between gap-lg">
            <div className="cluster items-center gap-md">
              <svg className="sp-icon sp-icon--md sp-icon--mood" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-bolt"></use></svg>
              <h3>Target moods</h3>
            </div>
            {!isEditingMoods && (
              <button 
                className="button button--tertiary button--xs" 
                onClick={() => {
                  setTempMoods([...goalMoods]);
                  setIsEditingMoods(true);
                }}
                type="button"
                disabled={isGoalsLoading}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-edit"></use></svg>
                Edit
              </button>
            )}
          </div>
          {!isEditingMoods ? (
            goalMoods.length === 0 ? (
              <div className="pp-goal__empty text-center" data-pp-goal-empty>
                <p className="margin-none text-muted font-sm mb-4">No target moods yet. Pick the moods you want your sessions to push.</p>
                <button 
                  className="button button--primary button--sm" 
                  onClick={() => {
                    setTempMoods([]);
                    setIsEditingMoods(true);
                  }}
                  type="button"
                >
                  + Add a mood
                </button>
              </div>
            ) : (
              <div className="pp-goal__view" data-pp-goal-view>
                <div className="cluster wrap gap-md" data-pp-goal-chips>
                  {goalMoods.map(slug => {
                    const mood = availableMoods.find(m => m.slug === slug);
                    return (
                      <span key={slug} className="ui-tag is-selected">
                        <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href={`#ti-mood-${slug.replace(/_/g, '-')}`}></use></svg>
                        {mood?.name || slug}
                      </span>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="pp-goal__edit" data-pp-goal-editor>
              <p className="margin-none text-muted font-xs">Pick the moods you want your sessions to push.</p>
              <div className="pp-goal__picker cluster wrap gap-md" data-pp-goal-picker>
                {availableMoods.map((mood) => {
                  const isSelected = tempMoods.includes(mood.slug);
                  return (
                    <button
                      key={mood.slug}
                      aria-pressed={isSelected}
                      className={`ui-tag ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setTempMoods(tempMoods.filter(m => m !== mood.slug));
                        } else {
                          setTempMoods([...tempMoods, mood.slug]);
                        }
                      }}
                      type="button"
                    >
                      <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href={`#ti-mood-${mood.slug.replace(/_/g, '-')}`}></use></svg>
                      {mood.name}
                    </button>
                  );
                })}
              </div>
              <div className="pp-goal__foot cluster gap-md separator-top">
                <button 
                  className="button button--secondary button--xs" 
                  onClick={() => setIsEditingMoods(false)}
                  type="button"
                  disabled={isSavingMoods}
                >
                  Cancel
                </button>
                <button 
                  className="button button--primary button--xs flex items-center gap-2" 
                  onClick={async () => {
                    if (isSavingMoods) return;
                    try {
                      await saveMoods(tempMoods);
                      setIsEditingMoods(false);
                      toast.success('Target moods saved!');
                    } catch (e) {
                      toast.error('Failed to save target moods.');
                    }
                  }}
                  type="button"
                  disabled={isSavingMoods}
                >
                  {isSavingMoods ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          )}
        </article>

      </div>
    </section>
  );
}

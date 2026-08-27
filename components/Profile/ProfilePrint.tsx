import React from 'react';
import SkillprintVisualization from '../../app/components/Skillprint';

interface ProfilePrintProps {
  userSkills: string[];
  userMoods: string[];
  hasScoreBySkill: Record<string, boolean>;
  hasScoreByMood: Record<string, boolean>;
  nodeDataMap: Record<string, any>;
  processedProfile: any;
  formatDuration: (time: number) => string;
}

export default function ProfilePrint({
  userSkills,
  userMoods,
  hasScoreBySkill,
  hasScoreByMood,
  nodeDataMap,
  processedProfile,
  formatDuration
}: ProfilePrintProps) {
  return (
    <section className="pp-section" id="print" aria-label="Your Skillprint wheel">
      <div className="ontology-root pp-print-state" data-skillprint="true" data-state-when="complete">
        <div className="pp-print sp-panel">
          <div className="pp-print__bar">
            <div className="min-width-0">
              <h2 className="pp-print__who">Your Skillprint wheel</h2>
              <span className="pp-print__caption">Colour groups related skills &middot; darker and thicker is a higher score</span>
            </div>
            <span className="ui-badge ui-badge--sm">Ready</span>
            <div className="layout-flex items-center wrap gap-sm">
              <button className="button button--secondary button--sm no-grow" type="button" data-sp-terms aria-pressed="false"><span data-sp-terms-label>Read terms</span></button>
              <button className="button button--secondary button--sm no-grow" type="button" data-sp-reset>Reset view</button>
              <button className="button button--primary button--sm no-grow" type="button" data-sp-download><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-download"></use></svg><span data-sp-download-label>Download and share your Skillprint</span></button>
            </div>
          </div>
          
          <div className="pp-print__body">
            <div className="pp-print__figure">
              <div className="ontology-visual position-relative clip layout-grid padding-none min-width-0">
                <div className="ontology-visual__stage min-width-0 flex justify-center items-center h-[500px]">
                   <SkillprintVisualization
                      userSkills={userSkills}
                      userMoods={userMoods}
                      hasScoreBySkill={hasScoreBySkill}
                      hasScoreByMood={hasScoreByMood}
                      nodeDataMap={nodeDataMap}
                      size={500}
                    />
                </div>
              </div>
              
              {processedProfile && (
                <section className="pp-read mt-8" aria-labelledby="ppStats">
                  <h3 className="pp-read__title" id="ppStats">Skillprint statistics</h3>
                  <div className="ontology-metrics layout-grid gap-md">
                    <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
                      <strong className="font-mono">{formatDuration(processedProfile.totalTimePlayed)}</strong>
                      <span className="text-muted font-xs leading-md">Time played</span>
                    </article>
                    <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
                      <strong className="font-mono">{Math.round(processedProfile.avgFlowScore * 100)}</strong>
                      <span className="text-muted font-xs leading-md">Flow score</span>
                    </article>
                    <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
                      <strong className="font-mono">{processedProfile.totalSessions}</strong>
                      <span className="text-muted font-xs leading-md">Sessions</span>
                    </article>
                    <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0">
                      <strong className="font-mono">{processedProfile.gamesPlayed || 0}</strong>
                      <span className="text-muted font-xs leading-md">Games played</span>
                    </article>
                  </div>
                  <p className="margin-none text-subtle font-sm leading-md mt-4">Built from ~700 rated games &middot; 87 features in the Human &times; Game ontology &middot; 3,791 pairs compared &middot; 6 groups of related skills.</p>
                </section>
              )}
            </div>
            
            <div className="pp-print__read">
              <section className="pp-read" aria-label="The print at a glance">
                <div className="ontology-metrics layout-grid gap-md">
                  <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong className="font-mono" data-sp-metric="overall">&mdash;</strong><span className="text-muted font-xs leading-md">Average across 87 features</span></article>
                  <article className="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong className="font-mono" data-sp-metric="span">&mdash;</strong><span className="text-muted font-xs leading-md">Lowest to highest</span></article>
                  <article className="ontology-metric ontology-metric--term layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong className="font-mono" data-sp-metric="top">&mdash;</strong><span className="text-muted font-xs leading-md">Strongest skill</span></article>
                  <article className="ontology-metric ontology-metric--term layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong className="font-mono" data-sp-metric="low">&mdash;</strong><span className="text-muted font-xs leading-md">Lowest skill</span></article>
                </div>
              </section>
              
              <section className="pp-read" aria-labelledby="ppLegend">
                <h3 className="pp-read__title" id="ppLegend">Reading the print</h3>
                <p className="margin-none text-muted font-sm leading-md">Each line is one of 87 things a game measures, more than the 28 named skills. Darker and thicker is a higher score. Colour marks the group, not the score, so two Skillprints compare by eye.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

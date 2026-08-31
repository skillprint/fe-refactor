import React, { useEffect, useRef } from 'react';
import Script from 'next/script';
import { MockDataTag } from '../MockDataTag';

const ProfileSkillprintWheel = React.memo(function ProfileSkillprintWheel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Poll for the script to load
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).skillprintHydrateWheel) {
        clearInterval(interval);
        const root = containerRef.current?.querySelector('.pp-print-state');
        if (root) {
          delete (root as any).sp;
        }
        (window as any).skillprintHydrateWheel();
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <MockDataTag />
      <Script 
        src="/skillprint-portal-redesign/js/skillprint.js" 
        strategy="lazyOnload"
      />
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: `
      <section class="pp-section" id="print" aria-label="Your Skillprint wheel">
        <div class="ontology-root pp-print-state" data-skillprint="ada">
          <div class="pp-print sp-panel">
            
            <div class="pp-print__bar">
              <div class="min-width-0">
                <h2 class="pp-print__who" id="ppPrintTitle">Your Skillprint wheel</h2>
                <span class="pp-print__caption">Colour groups related skills &middot; darker and thicker is a higher score</span>
              </div>
              <span class="ui-badge ui-badge--sm">Ready</span>
              <div class="layout-flex items-center wrap gap-sm">
                <button class="button button--secondary button--sm no-grow" type="button" data-sp-terms aria-pressed="false">
                  <span data-sp-terms-label>Read terms</span>
                </button>
                <button class="button button--secondary button--sm no-grow" type="button" data-sp-reset>Reset view</button>
                <button class="button button--primary button--sm no-grow" type="button" data-sp-download>
                  <svg class="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-download"></use></svg>
                  <span data-sp-download-label>Download and share your Skillprint</span>
                </button>
              </div>
            </div>

            <div class="pp-print__body">
              
              <div class="pp-print__figure">
                <div class="ontology-visual position-relative clip layout-grid padding-none min-width-0">
                  <div class="ontology-visual__stage min-width-0">
                    <svg class="skillprint__wheel" data-sp-wheel viewBox="0 0 1000 1084" role="img" aria-label="Ada&rsquo;s Skillprint" aria-describedby="ppPrintDesc">
                      <desc id="ppPrintDesc">Ada&rsquo;s Skillprint. The same circular map of 87 game features is drawn for every player: features hang from the outer rim and join in pairs as they move inward, and the radius at which two branches meet is how strongly those features co-occur across roughly seven hundred rated games. Colour marks which of the six correlation groups a feature belongs to and is the same for everyone. What changes from player to player is the ink: each line&rsquo;s opacity and thickness are that player&rsquo;s score for that feature, from fully transparent and one pixel at 0 to fully opaque and four pixels at 100, so the pattern of light and dark around the dial belongs to Ada alone. Her quiet-reasoning arc runs heavy and opaque; the social and reflex runs stay faint.</desc>
                    </svg>
                  </div>
                </div>
                <section class="pp-read" aria-labelledby="ppStats">
                  <h3 class="pp-read__title" id="ppStats">Skillprint statistics</h3>
                  <div class="ontology-metrics layout-grid gap-md">
                    <article class="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-state-text="statTime">1h 12m</strong><span class="text-muted font-xs leading-md">Time played</span></article>
                    <article class="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-state-text="statFlow">72</strong><span class="text-muted font-xs leading-md">Flow score</span></article>
                    <article class="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-state-text="statRead">25</strong><span class="text-muted font-xs leading-md">Skills with a score</span></article>
                    <article class="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-state-text="statWeeks">4</strong><span class="text-muted font-xs leading-md">Weeks tracked</span></article>
                  </div>

                  <p class="margin-none text-subtle font-sm leading-md">Built from ~700 rated games &middot; 87 features in the Human &times; Game ontology &middot; 3,791 pairs compared &middot; 6 groups of related skills.</p>
                </section>
              </div>

              <div class="pp-print__read">
                
                <section class="pp-read" aria-label="The print at a glance">
                  <div class="ontology-metrics layout-grid gap-md">
                    <article class="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-sp-metric="overall">&mdash;</strong><span class="text-muted font-xs leading-md">Average across 87 features</span></article>
                    <article class="ontology-metric layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-sp-metric="span">&mdash;</strong><span class="text-muted font-xs leading-md">Lowest to highest</span></article>
                    <article class="ontology-metric ontology-metric--term layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-sp-metric="top">&mdash;</strong><span class="text-muted font-xs leading-md">Strongest skill</span></article>
                    <article class="ontology-metric ontology-metric--term layout-flex flow-column justify-between border-subtle radius-compact min-width-0"><strong class="font-mono" data-sp-metric="low">&mdash;</strong><span class="text-muted font-xs leading-md">Lowest skill</span></article>
                  </div>
                </section>

                <section class="pp-read" aria-labelledby="ppLegend">
                  <h3 class="pp-read__title" id="ppLegend">Reading the print</h3>
                  <p class="margin-none text-muted font-sm leading-md">Each line is one of 87 things a game measures, more than the 28 named skills. Darker and thicker is a higher score. Colour marks the group, not the score, so two Skillprints compare by eye.</p>
                </section>

                <section class="pp-read" aria-labelledby="ppStrength">
                  <h3 class="pp-read__title" id="ppStrength">Strength by group</h3>
                  <div class="layout-grid gap-sm" data-sp-strength></div>
                  <p class="margin-none text-subtle font-sm leading-md">Each row averages your scores in one group of related skills; the dot is that group&rsquo;s colour on the wheel. Select a row to highlight it.</p>
                </section>

              </div>

            </div>
          </div>
        </div>

        <!-- One tooltip for both roots: the component finds it by document id. -->
        <div class="ontology-tooltip position-fixed radius-compact border-strong surface-panel" id="tooltip" role="tooltip" style="display: none;"></div>
      </section>
      `}} />
    </div>
  );
});

export default ProfileSkillprintWheel;

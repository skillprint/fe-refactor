const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');

const replacement = `
    <div className="font-sans min-h-screen bg-background">
      {/* Spotlight Overlay */}
      {showTooltip && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={dismissTooltip}
        />
      )}
      <PortalLayout>
        <div className="portal-head">
          <Breadcrumbs items={[{ label: 'Home' }]} />
          <div className="portal-head__row">
            <PortalPageTitle>Play games. Build your Skillprint.</PortalPageTitle>
            <Link className="button button--secondary button--md" href="/profile">
              View profile
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
            </Link>
            <button className="button button--secondary button--md" type="button">
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-help"></use></svg>
              How this works
            </button>
          </div>
          <p>Short games that measure how you think. Play five and you have a Skillprint &mdash; your strengths in mood, cognition and personality.</p>
        </div>

        <PortalPageLayout>
          <PortalPageMain>
            
            {/* Get Started */}
            <PortalSection ariaLabelledBy="nextUpTitle">
              <div className="portal-nextup sp-card">
                <div className="portal-nextup__copy">
                  <span className="portal-eyebrow">Get started</span>
                  <PortalSectionTitle id="nextUpTitle">Play one game to start your Skillprint.</PortalSectionTitle>
                  <p className="portal-nextup__lede">Nothing here is scored until you play. A session takes five to ten minutes, and five of them make your first Skillprint.</p>
                  <div className="portal-nextup__actions">
                    <Link className="button button--primary button--lg" href="/games">
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                      <span>Play your first game</span>
                    </Link>
                    <Link className="button button--secondary button--lg" href="/games">
                      <span>Browse all games</span>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
                    </Link>
                  </div>
                </div>
                <div className="portal-nextup__progress">
                  <p className="nextup-progress__count">Your first 5 sessions</p>
                  <ol className="nextup-slots">
                    {/* Render 5 empty slots */}
                    {[1, 2, 3, 4, 5].map(i => <li key={i} className="nextup-slot"></li>)}
                  </ol>
                  <p className="nextup-progress__note">Every game reads a different set of skills, so five different games fill the print faster than one played five times.</p>
                </div>
              </div>
            </PortalSection>

            {/* Recommended */}
            <PortalSection ariaLabelledBy="pickTitle">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="pickTitle">Start with one of these</PortalSectionTitle>
                  <PortalSectionHint>Short, forgiving games that read a wide spread of skills. Any of them is a fine first move.</PortalSectionHint>
                </div>
                <Link className="portal-section__link" href="/games">
                  All games <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="game-rail game-rail--library">
                {skillGames.slice(0, 4).map((game, i) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description}
                    image={game.image || '/skillprint-portal-redesign/assets/images/games/game-arcade-machine.svg'}
                    url={`/ game_session ? game = ${ game.slug }`}
                    skills={game.skills.map(s => ({ id: s, name: s, dimension: 'cognition' }))}
                    tone={['pink', 'mint', 'green', 'blue', 'yellow', 'purple'][i % 6]}
                  />
                ))}
              </div>
            </PortalSection>

            {/* Recently Played */}
            <PortalSection ariaLabelledBy="recentTitle">
              <div className="portal-section__bar">
                <PortalSectionTitle id="recentTitle">Recently played</PortalSectionTitle>
                <Link className="portal-section__link" href="/profile#sessions">
                  All sessions <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              {count > 0 ? (
                 <p className="text-muted">Placeholder for game rail</p>
              ) : (
                <div className="portal-blank">
                  <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
                    <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
                  </span>
                  <p className="portal-blank__title">No sessions yet</p>
                  <p className="portal-blank__note">Every game you finish lands here with the date, your flow score and the skills it measured.</p>
                </div>
              )}
            </PortalSection>

            {/* New Games */}
            <PortalSection ariaLabelledBy="newTitle">
              <div className="portal-section__bar">
                <PortalSectionTitle id="newTitle">New games</PortalSectionTitle>
                <Link className="portal-section__link" href="/games">
                  All games <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="game-rail">
                {fetchedNewGames.slice(0, 4).map((game, i) => (
                  <GameTile
                    key={game.slug}
                    id={game.slug}
                    title={game.name}
                    description={game.description}
                    image={game.screenshot || '/skillprint-portal-redesign/assets/images/games/game-arcade-machine.svg'}
                    url={`/ game_session ? game = ${ game.slug } `}
                    statusBadge="New"
                    tone="blue"
                  />
                ))}
              </div>
            </PortalSection>

          </PortalPageMain>
          
          <PortalPageRail ariaLabelledBy="printTitle">
            <article className="rail-card rail-print sp-card">
              <div className="rail-card__head">
                <h2 className="rail-card__title" id="printTitle">Your Skillprint</h2>
                <span className="ui-badge ui-badge--sm">Not started</span>
              </div>
              <div className="rail-print__figure ontology-root">
                <div className="ontology-visual clip layout-grid place-center">
                  <svg className="skillprint__wheel" viewBox="0 0 1000 1000" role="img">
                     <desc>Placeholder wheel</desc>
                  </svg>
                </div>
                <span className="rail-print__veil"><span className="ui-badge ui-badge--sm">0 of 5 sessions</span></span>
              </div>
              <p className="margin-none text-muted font-sm leading-md">This is the dial every Skillprint is drawn on. Yours is blank until your first session — each game you finish inks the features it reads.</p>
              
              <dl className="rail-stats">
                <div className="rail-stat"><dt>Sessions</dt><dd>0</dd></div>
                <div className="rail-stat"><dt>Flow</dt><dd>&mdash;</dd></div>
                <div className="rail-stat"><dt>Streak</dt><dd>0</dd></div>
              </dl>
              
              <Link className="button button--primary button--md full-width" href="/games">
                <span>Play your first game</span>
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-arrow-right"></use></svg>
              </Link>
            </article>

            <article className="rail-card sp-card">
              <div className="rail-card__head">
                <span className="rail-card__label">What you will see here</span>
              </div>
              <div className="layout-grid gap-lg">
                <div className="layout-grid gap-sm">
                  <div className="layout-flex items-center justify-between gap-md font-sm">
                    <span className="weight-semibold">Mood</span><span className="text-muted">Needs play</span>
                  </div>
                  <div className="rail-meter"><i></i></div>
                </div>
                <div className="layout-grid gap-sm">
                  <div className="layout-flex items-center justify-between gap-md font-sm">
                    <span className="weight-semibold">Cognition</span><span className="text-muted">Needs play</span>
                  </div>
                  <div className="rail-meter"><i></i></div>
                </div>
                <div className="layout-grid gap-sm">
                  <div className="layout-flex items-center justify-between gap-md font-sm">
                    <span className="weight-semibold">Personality</span><span className="text-muted">Needs play</span>
                  </div>
                  <div className="rail-meter"><i></i></div>
                </div>
              </div>
              <p className="margin-none text-muted font-sm leading-md">Mood scores first, cognition next, personality last. This card always says what still needs play.</p>
              <div className="cluster gap-md">
                <Link className="button button--secondary button--sm" href="/skills">View skills</Link>
              </div>
            </article>
          </PortalPageRail>
        </PortalPageLayout>
      </PortalLayout>
      <GamePreviewShareSheet
        slug={previewGameSlug}
        isOpen={!!previewGameSlug}
        onClose={() => setPreviewGameSlug(null)}
      />
    </div>
`;

// Extract imports up to function HomeContent
let imports = content.slice(0, content.indexOf('function HomeContent'));
// add new imports
imports = imports.replace(
  'import PortalLayout from "@/components/PortalLayout";',
  `import PortalLayout from "@/components/PortalLayout";
import { PortalPageLayout, PortalPageMain, PortalPageRail, PortalSection } from '@/components/LayoutGrid';
import { PortalPageTitle, PortalSectionTitle, PortalSectionHint } from '@/components/Typography';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { GameTile } from '@/components/GameTile';`
);

let remaining = content.slice(content.indexOf('function HomeContent'));

// Extract start of HomeContent
const startMatch = remaining.match(/return \([\s\S]*?(?=\n  \);)/);
if (startMatch) {
  remaining = remaining.replace(startMatch[0], 'return (\n' + replacement);
}

fs.writeFileSync('app/page.tsx', imports + remaining);
console.log("Updated app/page.tsx");

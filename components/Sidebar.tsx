'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useLogoMotion } from './useLogoMotion';
import ShareSiteButton from './ShareSiteButton';
import { NotificationsNavItem } from './NotificationsWidget';
import { useNotificationsFeatureFlag } from '../lib/notifications';
import { useGymTrackerFeatureFlag } from '../app/hooks/useGymTracker';
import { useNutritionFeatureFlag } from '../app/hooks/useNutritionTracker';
import { useFriendsAndPrivacy, useFriendsFeatureFlag } from '../lib/models/portal/useFriendsAndPrivacy';
import { useGameReviewer } from '../lib/models/gameReview/useGameReviewer';

// useFriendsAndPrivacy reads the session through useUserSession, which reads
// the URL; a static page may only do that inside Suspense, so the count sits
// in its own component rather than holding up the whole sidebar.
function FriendRequestCount() {
  const { incomingRequests } = useFriendsAndPrivacy();
  if (incomingRequests.length === 0) return null;
  return (
    <span
      className="ui-badge ui-badge--sm"
      style={{
        marginLeft: 'auto',
        background: 'var(--accent-primary, #5d6bff)',
        color: '#fff',
        fontSize: '0.68rem',
        padding: '0 0.38rem',
      }}
    >
      {incomingRequests.length}
    </span>
  );
}

// Game review is for Skillprint staff only; the backend says who that is, so
// the link appears once it has answered (and, like the count above, sits in
// its own Suspense-wrapped component).
function GameReviewNavItem({ pathname }: { pathname: string }) {
  const reviewer = useGameReviewer();
  if (!reviewer) return null;
  const isActive = pathname === '/review' || pathname.startsWith('/review/');
  return (
    <Link title="Game Review" href="/review" className={`sp-side-nav__link ${isActive ? 'is-active' : ''}`} aria-current={isActive ? 'page' : undefined} data-game-review-nav-link>
      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-shield"></use></svg>
      <span className="sp-side-nav__label">Game Review</span>
    </Link>
  );
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSkillSection, setActiveSkillSection] = useState('mood');
  const [activeNutritionSection, setActiveNutritionSection] = useState('diary');
  const { notificationsFeatureEnabled } = useNotificationsFeatureFlag();
  const { gymTrackerEnabled } = useGymTrackerFeatureFlag();
  const { nutritionFeatureEnabled } = useNutritionFeatureFlag();
  const { friendsFeatureEnabled } = useFriendsFeatureFlag();
  const pathname = usePathname();
  const brandRef = useRef<HTMLAnchorElement>(null);
  useLogoMotion(brandRef);
  const isSkillsPage = pathname === '/skills' || pathname === '/skills/';
  const isNutritionPage = pathname === '/nutrition' || pathname.startsWith('/nutrition/');

  useEffect(() => {
    document.body.classList.remove('nav-open');
  }, [pathname]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('skillprintPortalNavCollapsed');
      if (stored === '1') {
        setIsCollapsed(true);
        document.body.classList.add('nav-collapsed');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isNutritionPage) return;
    const syncSection = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveNutritionSection(hash);
    };
    const handleCustom = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) setActiveNutritionSection(custom.detail);
    };
    syncSection();
    window.addEventListener('hashchange', syncSection);
    window.addEventListener('skillprint-nutrition-tab-change', handleCustom);
    return () => {
      window.removeEventListener('hashchange', syncSection);
      window.removeEventListener('skillprint-nutrition-tab-change', handleCustom);
    };
  }, [isNutritionPage]);

  useEffect(() => {
    if (!isSkillsPage) return;
    
    const handleScroll = () => {
      const sections = ['mood', 'cognition', 'personality'];
      let current = sections[0];
      const offset = 150; // offset for the header and top spacing

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset) {
            current = section;
          }
        }
      }
      
      // Check if we are at the bottom of the page
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5) {
         current = sections[sections.length - 1];
      }
      
      setActiveSkillSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount to set initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSkillsPage]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    document.body.classList.toggle('nav-collapsed', next);
    try {
      localStorage.setItem('skillprintPortalNavCollapsed', next ? '1' : '0');
    } catch (e) {}
  };
  return (
    <aside className="portal-sidebar sp-side-nav" id="portalNav" aria-label="Games Portal" data-portal-nav>
      <div className="portal-sidebar__head">
        <Link ref={brandRef} className="portal-brand" href="/">
          <img className="brand-logo brand-logo--dark" src="/assets/logos/skillprint-logo-customer-dark.svg" alt="Skillprint" />
          <img className="brand-logo brand-logo--light" src="/assets/logos/skillprint-logo-customer-light.svg" alt="Skillprint" />
          <img className="portal-brand__mark" src="/assets/logos/skillprint-favicon-customer.svg" alt="" aria-hidden="true" width="32" height="32" />
          <span className="portal-brand__product">Games Portal</span>
        </Link>
        <button onClick={toggleCollapse} className="portal-sidebar__toggle icon-button button button--tertiary button--icon-only button--sm" type="button" aria-controls="portalNav" aria-expanded={!isCollapsed} aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'} title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'} data-portal-nav-collapse>
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-left"></use></svg>
        </button>
      </div>
      <button onClick={() => document.body.classList.remove('nav-open')} className="portal-sidebar__close button button--tertiary button--icon-only button--sm" type="button" aria-label="Close navigation" data-portal-nav-close>
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
      </button>
      <nav className="portal-sidebar__scroll sp-side-nav__scroll" aria-label="Portal sections">
        <div className="sp-side-nav__group" data-home-spot="routes">
          <Link title="Home" className={`sp-side-nav__link ${pathname === '/' ? 'is-active' : ''}`} href="/" aria-current={pathname === '/' ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-home"></use></svg><span className="sp-side-nav__label">Home</span></Link>
          <Link title="Games" className={`sp-side-nav__link ${pathname === '/games' || pathname === '/games/' ? 'is-active' : ''}`} href="/games" aria-current={pathname === '/games' || pathname === '/games/' ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg><span className="sp-side-nav__label">Games</span></Link>
          <Link title="Skills" className={`sp-side-nav__link ${isSkillsPage ? 'is-active' : ''}`} href="/skills" aria-current={isSkillsPage ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chart"></use></svg><span className="sp-side-nav__label">Skills</span></Link>
          {gymTrackerEnabled && (
            <Link title="Gym Tracker" className={`sp-side-nav__link ${pathname.startsWith('/gym') ? 'is-active' : ''}`} href="/gym" aria-current={pathname.startsWith('/gym') ? 'page' : undefined} data-gym-nav-link><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-dumbbell"></use></svg><span className="sp-side-nav__label">Gym Tracker</span></Link>
          )}
          {nutritionFeatureEnabled && (
            <Link title="Nutrition" className={`sp-side-nav__link ${isNutritionPage ? 'is-active' : ''}`} href="/nutrition" aria-current={isNutritionPage ? 'page' : undefined} data-nutrition-nav-link><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-nutrition"></use></svg><span className="sp-side-nav__label">Nutrition</span></Link>
          )}
          {nutritionFeatureEnabled && isNutritionPage && (
            <div className="portal-subnav" data-nutrition-subnav>
              <a title="Diary" onClick={() => setActiveNutritionSection('diary')} className={`portal-subnav__link ${activeNutritionSection === 'diary' ? 'is-active' : ''}`} href="#diary">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-calendar"></use></svg>
                <span className="portal-subnav__label">Daily Diary</span>
              </a>
              <a title="Trends" onClick={() => setActiveNutritionSection('trends')} className={`portal-subnav__link ${activeNutritionSection === 'trends' ? 'is-active' : ''}`} href="#trends">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
                <span className="portal-subnav__label">Trends</span>
              </a>
              <a title="Exercises & Exertion" onClick={() => setActiveNutritionSection('exercises')} className={`portal-subnav__link ${activeNutritionSection === 'exercises' ? 'is-active' : ''}`} href="#exercises">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-flame"></use></svg>
                <span className="portal-subnav__label">Exertion</span>
              </a>
              <a title="Nutrition DB" onClick={() => setActiveNutritionSection('database')} className={`portal-subnav__link ${activeNutritionSection === 'database' ? 'is-active' : ''}`} href="#database">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-database"></use></svg>
                <span className="portal-subnav__label">Nutrition DB</span>
              </a>
            </div>
          )}
          
          {isSkillsPage && (
            <div className="portal-subnav" data-skills-subnav>
              <a title="Mood" className={`portal-subnav__link ${activeSkillSection === 'mood' ? 'is-active' : ''}`} href="#mood" data-dimension="mood">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-category-mood"></use></svg>
                <span className="portal-subnav__label">Mood</span>
              </a>
              <a title="Cognition" className={`portal-subnav__link ${activeSkillSection === 'cognition' ? 'is-active' : ''}`} href="#cognition" data-dimension="cognition">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-category-cognition"></use></svg>
                <span className="portal-subnav__label">Cognition</span>
              </a>
              <a title="Personality" className={`portal-subnav__link ${activeSkillSection === 'personality' ? 'is-active' : ''}`} href="#personality" data-dimension="personality">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-category-personality"></use></svg>
                <span className="portal-subnav__label">Personality</span>
              </a>
            </div>
          )}
        </div>
      </nav>
      <div className="portal-sidebar__foot">
        <div className="sp-side-nav__group portal-sidebar__utilities">
          <Suspense fallback={null}>
            <GameReviewNavItem pathname={pathname} />
          </Suspense>
          {notificationsFeatureEnabled && (
            <NotificationsNavItem className="sp-side-nav__link sp-side-nav__link--button" />
          )}
          {friendsFeatureEnabled && (
            <Link title="Friends" href="/friends" className={`sp-side-nav__link ${pathname.startsWith('/friends') ? 'is-active' : ''}`} aria-current={pathname.startsWith('/friends') ? 'page' : undefined} data-friends-nav-link>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-users"></use></svg>
              <span className="sp-side-nav__label">Friends</span>
              <Suspense fallback={null}>
                <FriendRequestCount />
              </Suspense>
            </Link>
          )}
          <Link title="Profile" href="/profile" className={`sp-side-nav__link ${pathname.startsWith('/profile') ? 'is-active' : ''}`} aria-current={pathname.startsWith('/profile') ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-user"></use></svg><span className="sp-side-nav__label">Profile</span></Link>
          <Link title="Settings" className={`sp-side-nav__link ${pathname.startsWith('/settings') ? 'is-active' : ''}`} href="/settings" aria-current={pathname.startsWith('/settings') ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-settings"></use></svg><span className="sp-side-nav__label">Settings</span></Link>
          <ShareSiteButton className="sp-side-nav__link sp-side-nav__link--button" />
        </div>
      </div>
    </aside>
  );
}

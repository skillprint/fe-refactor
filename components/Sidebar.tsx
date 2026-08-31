'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSkillSection, setActiveSkillSection] = useState('mood');
  const pathname = usePathname();
  const isSkillsPage = pathname === '/skills' || pathname === '/skills/';

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
        <Link className="portal-brand" href="/">
          <img className="brand-logo brand-logo--dark" src="/assets/logos/skillprint-logo-customer-dark.svg" alt="Skillprint" />
          <img className="brand-logo brand-logo--light" src="/assets/logos/skillprint-logo-customer-light.svg" alt="Skillprint" />
          <img className="portal-brand__mark" src="/assets/logos/skillprint-favicon-customer.svg" alt="" aria-hidden="true" width="32" height="32" />
          <span className="portal-brand__product">Games Portal</span>
        </Link>
        <button onClick={toggleCollapse} className="portal-sidebar__toggle icon-button button button--tertiary button--icon-only button--sm" type="button" aria-controls="portalNav" aria-expanded={!isCollapsed} aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'} title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'} data-portal-nav-collapse>
          <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-left"></use></svg>
        </button>
      </div>
      <button className="portal-sidebar__close button button--tertiary button--icon-only button--sm" type="button" aria-label="Close navigation" data-portal-nav-close>
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
      </button>
      <nav className="portal-sidebar__scroll sp-side-nav__scroll" aria-label="Portal sections">
        <div className="sp-side-nav__group" data-home-spot="routes">
          <Link title="Home" className={`sp-side-nav__link ${pathname === '/' ? 'is-active' : ''}`} href="/" aria-current={pathname === '/' ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-home"></use></svg><span className="sp-side-nav__label">Home</span></Link>
          <Link title="Games" className={`sp-side-nav__link ${pathname === '/games' || pathname === '/games/' ? 'is-active' : ''}`} href="/games" aria-current={pathname === '/games' || pathname === '/games/' ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg><span className="sp-side-nav__label">Games</span></Link>
          <Link title="Skills" className={`sp-side-nav__link ${isSkillsPage ? 'is-active' : ''}`} href="/skills" aria-current={isSkillsPage ? 'page' : undefined}><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chart"></use></svg><span className="sp-side-nav__label">Skills</span></Link>
          
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
          <Link title="Profile" href="/profile" className="sp-side-nav__link"><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-user"></use></svg><span className="sp-side-nav__label">Profile</span></Link>
          <Link title="Settings" className="sp-side-nav__link" href="/settings"><svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-settings"></use></svg><span className="sp-side-nav__label">Settings</span></Link>
        </div>
      </div>
    </aside>
  );
}

'use client';

import React, { useState } from 'react';
import { Icon, IconName } from '@/components/ui/Icon';

const COLOR_RAMPS = [
  {
    name: 'Deep Navy',
    prefix: 'deep-navy',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Panel Navy',
    prefix: 'panel-navy',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Geistface Grey',
    prefix: 'geistface-grey',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Core Lime',
    prefix: 'core-lime',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Core Green',
    prefix: 'core-green',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Personality Mint',
    prefix: 'personality-mint',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Personality Blue',
    prefix: 'personality-blue',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Mindset Violet',
    prefix: 'mindset-violet',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Mindset Magenta',
    prefix: 'mindset-magenta',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Skills Pink',
    prefix: 'skills-pink',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'Skills Orange',
    prefix: 'skills-orange',
    shades: ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
];

const ALL_ICONS: IconName[] = [
  'ti-adjust', 'ti-alert', 'ti-arrow-left', 'ti-arrow-right', 'ti-bell', 'ti-book', 'ti-box',
  'ti-calendar', 'ti-chart', 'ti-check', 'ti-chevron-down', 'ti-chevron-left', 'ti-chevron-right',
  'ti-chevron-up', 'ti-clock', 'ti-close', 'ti-code', 'ti-cognition-action', 'ti-cognition-attention',
  'ti-cognition-deduction', 'ti-cognition-knowledge', 'ti-cognition-math', 'ti-cognition-memory',
  'ti-cognition-pattern-matching', 'ti-cognition-perceptual-speed', 'ti-cognition-planning',
  'ti-cognition-spatial', 'ti-cognition-task-switching', 'ti-cognition-timing', 'ti-cognition-verbal',
  'ti-cognition-visualization', 'ti-copy', 'ti-database', 'ti-dots', 'ti-download', 'ti-edit',
  'ti-error', 'ti-external', 'ti-eye', 'ti-eye-off', 'ti-filter', 'ti-gamepad', 'ti-help', 'ti-home',
  'ti-info', 'ti-key', 'ti-layout-grid', 'ti-loading', 'ti-lock', 'ti-logout', 'ti-mail', 'ti-menu',
  'ti-minus', 'ti-mood-awe', 'ti-mood-collaborate', 'ti-mood-creativity', 'ti-mood-curiosity',
  'ti-mood-empathy', 'ti-mood-focus', 'ti-mood-grit', 'ti-mood-joy', 'ti-mood-relax', 'ti-moon',
  'ti-package', 'ti-pause', 'ti-personality-agreeableness', 'ti-personality-conscientiousness',
  'ti-personality-emotional-stability', 'ti-personality-extraversion', 'ti-personality-openness',
  'ti-play', 'ti-plus', 'ti-refresh', 'ti-search', 'ti-settings', 'ti-share', 'ti-sort', 'ti-star',
  'ti-success', 'ti-sun', 'ti-trash', 'ti-trending', 'ti-upload', 'ti-user'
];

export default function DesignSystemTokensPage() {
  const [searchFilter, setSearchFilter] = useState('');
  const [surfaceTheme, setSurfaceTheme] = useState<'dark' | 'light'>('dark');

  const filteredIcons = ALL_ICONS.filter(name =>
    name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      className="min-h-screen p-8 space-y-12 transition-colors duration-200"
      data-surface={surfaceTheme}
      style={{
        backgroundColor: 'var(--surface-bg)',
        color: 'var(--text-default)',
      }}
    >
      {/* Header */}
      <header className="border-b pb-6 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--surface-border)' }}>
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/assets/design-system/logos/skillprint-mark-white.svg"
              alt="Skillprint Logo"
              className="w-8 h-8"
            />
            <h1 className="text-3xl font-bold tracking-tight font-display">
              Skillprint Design System
            </h1>
            <span className="px-3 py-1 text-xs font-semibold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Phase 1 Verified
            </span>
          </div>
          <p className="mt-2 text-sm text-muted" style={{ color: 'var(--text-muted)' }}>
            Foundational Token & Asset Verification (10 August 2026 Specification)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSurfaceTheme(surfaceTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface-box)',
              borderColor: 'var(--surface-border)',
              color: 'var(--text-default)',
            }}
          >
            <Icon name={surfaceTheme === 'dark' ? 'ti-sun' : 'ti-moon'} size="sm" />
            <span>Theme: {surfaceTheme}</span>
          </button>
        </div>
      </header>

      {/* Section 1: Typography */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: 'var(--surface-border)' }}>
          <Icon name="ti-code" size="sm" />
          <span>01 · Typography Hierarchy</span>
        </h2>

        <div className="space-y-4 p-6 rounded-xl border" style={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--surface-border)' }}>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              Display XL (Recoleta / Display)
            </span>
            <p className="text-4xl md:text-6xl font-bold font-display tracking-tight" style={{ color: 'var(--mindset-violet-400)' }}>
              Human Reasoning & Performance Intelligence
            </p>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              Display Small / Heading
            </span>
            <p className="text-2xl md:text-3xl font-bold font-ui">
              See the mind through play.
            </p>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              UI Base / Paragraph
            </span>
            <p className="text-base font-ui max-w-3xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Turn gameplay into a living picture of cognition, mood, personality, and performance.
              The Skillprint engine processes 1,200+ signals per second with sub-second feedback loops.
            </p>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              Monospace Code Label
            </span>
            <p className="font-mono text-sm px-3 py-2 rounded border" style={{ backgroundColor: 'var(--surface-box)', borderColor: 'var(--surface-border)', color: 'var(--core-lime-400)' }}>
              SESSION_ANALYSIS_TIMELINE // id="ti-cognition-attention" :: score=0.94
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Color Palette Swatches */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: 'var(--surface-border)' }}>
          <Icon name="ti-adjust" size="sm" />
          <span>02 · Canonical Color Ramps</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COLOR_RAMPS.map(ramp => (
            <div
              key={ramp.prefix}
              className="p-5 rounded-xl border space-y-3"
              style={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--surface-border)' }}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base font-ui">{ramp.name}</h3>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  var(--{ramp.prefix}-*)
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {ramp.shades.map(shade => {
                  const varName = `--${ramp.prefix}-${shade}`;
                  return (
                    <div
                      key={shade}
                      className="h-10 rounded flex items-end justify-center pb-1 text-[9px] font-mono group relative cursor-pointer shadow-sm transition-transform hover:scale-105"
                      style={{ backgroundColor: `var(${varName})` }}
                      title={`${varName}`}
                    >
                      <span className="bg-black/60 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {shade}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: SVG Icons */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-2" style={{ borderColor: 'var(--surface-border)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="ti-layout-grid" size="sm" />
            <span>03 · Icon Library ({filteredIcons.length} Marks)</span>
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search icons..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="px-3 py-1.5 pl-8 text-sm rounded-lg border focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-box)',
                borderColor: 'var(--surface-border)',
                color: 'var(--text-default)',
              }}
            />
            <div className="absolute left-2.5 top-2.5 opacity-60">
              <Icon name="ti-search" size="xs" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredIcons.map(iconName => (
            <div
              key={iconName}
              className="p-3 rounded-lg border flex flex-col items-center justify-center gap-2 hover:border-violet-500 transition-colors group cursor-pointer"
              style={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--surface-border)' }}
            >
              <div className="p-2 rounded bg-black/20 group-hover:scale-110 transition-transform">
                <Icon name={iconName} size="md" />
              </div>
              <span className="text-[11px] font-mono truncate max-w-full text-center" style={{ color: 'var(--text-muted)' }}>
                {iconName.replace(/^ti-/, '')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Asset Directory Catalog */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2 flex items-center gap-2" style={{ borderColor: 'var(--surface-border)' }}>
          <Icon name="ti-package" size="sm" />
          <span>04 · Asset Directory Catalog</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Badges */}
          <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--surface-border)' }}>
            <h3 className="font-bold text-sm font-mono uppercase tracking-wider text-emerald-400">
              Badges (/public/assets/design-system/badges)
            </h3>
            <div className="flex flex-wrap gap-4 items-center justify-around">
              <img src="/assets/design-system/badges/badge-agile-fox.svg" alt="Agile Fox" className="w-16 h-16" />
              <img src="/assets/design-system/badges/badge-moon-walker.svg" alt="Moon Walker" className="w-16 h-16" />
              <img src="/assets/design-system/badges/badge-explorer.svg" alt="Explorer" className="w-16 h-16" />
            </div>
          </div>

          {/* Logos */}
          <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--surface-border)' }}>
            <h3 className="font-bold text-sm font-mono uppercase tracking-wider text-indigo-400">
              Logos (/public/assets/design-system/logos)
            </h3>
            <div className="flex flex-col gap-3 items-center justify-center p-4 bg-black/30 rounded-lg">
              <img src="/assets/design-system/logos/skillprint-logo-developer-dark.svg" alt="Developer Dark Logo" className="h-8" />
              <img src="/assets/design-system/logos/skillprint-logo-customer-dark.svg" alt="Customer Dark Logo" className="h-8" />
            </div>
          </div>

          {/* Patterns & Art */}
          <div className="p-5 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--surface-border)' }}>
            <h3 className="font-bold text-sm font-mono uppercase tracking-wider text-pink-400">
              Patterns & Game Art
            </h3>
            <div className="flex items-center justify-around">
              <img src="/assets/design-system/patterns/bg-bubbles--violet.svg" alt="Pattern" className="w-16 h-16 opacity-80" />
              <img src="/assets/design-system/game-art/game-hextris.svg" alt="Hextris Art" className="w-16 h-16" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

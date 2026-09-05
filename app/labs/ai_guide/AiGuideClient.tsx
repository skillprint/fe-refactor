'use client';

import React, { useState } from 'react';
import { mapSlugToGamePath } from '../../game/[slug]/GameClient';

export default function AiGuideClient() {
  const [selectedGame, setSelectedGame] = useState('hextris');

  return (
    <div className="page scrollbar-subtle page--portal margin-none text-default font-ui leading-base min-h-screen bg-gray-900" data-theme="dark">
      <div className="portal-app p-8">
        <header className="mb-8 border-b border-gray-700 pb-4">
          <h1 className="font-bold text-blue-400" style={{ fontSize: '2rem' }}>AI Guide Lab</h1>
          <p className="text-gray-400 mt-2">Diagnostic environment for game adjustments and AI interaction.</p>
        </header>

        <div className="portal-layout">
          
          {/* Left Column: Game Frame (portal-layout__main) */}
          <div className="portal-layout__main flex flex-col items-start">
            <div className="w-full flex justify-between items-center mb-4 max-w-[400px]">
               <h2 className="text-xl font-semibold text-white">Live Game View</h2>
               <select 
                 className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1 outline-none"
                 value={selectedGame}
                 onChange={(e) => setSelectedGame(e.target.value)}
               >
                 <option value="hextris">Hextris</option>
                 <option value="box-tower">Box Tower</option>
                 <option value="2048">2048</option>
               </select>
            </div>

            {/* Raw iframe pointing to the game's static index.html */}
            <div className="relative w-[375px] h-[812px] bg-black rounded-xl overflow-hidden shadow-2xl flex-shrink-0" style={{ outline: '1px solid var(--border-subtle)', transform: 'scale(1)' }}>
              <iframe 
                src={mapSlugToGamePath(selectedGame)} 
                className="w-full h-full border-0 absolute inset-0 z-10" 
                title={`${selectedGame} Game`}
              />
            </div>
            
            <p className="text-gray-500 text-sm mt-4 max-w-[400px]">
               Game is running directly from its static index.html file without the Skillprint portal wrapper.
            </p>
          </div>

          {/* Right Column: Diagnostics (portal-rail) */}
          <aside className="portal-rail layout-grid gap-lg">
            
            {/* Session Status Panel */}
            <div className="sp-card card--interactive relative overflow-hidden padding-lg">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 font-bold z-10 rounded-bl">MOCK DATA</div>
              <h2 className="text-lg font-semibold mb-4">Session Status</h2>
              <div className="layout-grid gap-sm text-sm">
                <div className="layout-flex justify-between items-center">
                  <span className="text-muted">Current Mood Target</span>
                  <span className="font-medium" style={{ color: 'var(--violet-400)' }}>Focus</span>
                </div>
                <div className="layout-flex justify-between items-center">
                  <span className="text-muted">Session ID</span>
                  <span className="font-mono text-muted">skp_session_12345abc</span>
                </div>
                <div className="layout-flex justify-between items-center">
                  <span className="text-muted">Connection</span>
                  <span className="layout-flex items-center gap-sm" style={{ color: 'var(--mint-400)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--mint-400)' }}></span> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Parameter Adjustments Panel */}
            <div className="sp-card card--interactive relative overflow-hidden padding-lg">
              <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs px-2 py-1 font-bold z-10 rounded-bl">MOCK DATA</div>
              <h2 className="text-lg font-semibold mb-4">Parameter Adjustments</h2>
              <div className="layout-grid gap-md">
                {[
                  { time: '14:02:15', param: 'gameSpeed', value: 1.2, reason: 'High Focus Detected' },
                  { time: '14:03:10', param: 'obstacleFrequency', value: 0.8, reason: 'Frustration Detected' },
                ].map((adj, i) => (
                  <div key={i} className="sp-panel tone tone--violet padding-md radius-compact text-sm">
                    <div className="layout-flex justify-between items-center mb-sm">
                      <span className="font-mono font-xs weight-semibold">{adj.param}</span>
                      <span className="text-muted font-xs">{adj.time}</span>
                    </div>
                    <div className="layout-flex items-center gap-md">
                      <span className="weight-semibold" style={{ color: 'var(--mint-400)' }}>→ {adj.value}</span>
                      <span className="text-muted italic font-xs leading-sm">{adj.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI System Prompt Panel */}
            <div className="sp-card card--interactive relative overflow-hidden padding-lg">
               <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs px-2 py-1 font-bold z-10 rounded-bl">MOCK DATA</div>
               <h2 className="text-lg font-semibold mb-4">AI System Prompt</h2>
               <p className="font-xs font-mono text-muted padding-md radius-compact max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                 You are an AI game director. Your goal is to guide the user into a state of Focus.
                 Monitor the incoming gameplay screenshots. If the user is struggling, lower the difficulty. 
                 If the user is bored, increase the speed...
               </p>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

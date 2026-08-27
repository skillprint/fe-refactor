import React from 'react';

export interface GameRailProps {
  children: React.ReactNode;
  isLibrary?: boolean;
}

export function GameRail({ children, isLibrary = false }: GameRailProps) {
  return (
    <div 
      className={`game-rail ${isLibrary ? 'game-rail--library' : ''}`}
      data-game-rail-scroll 
      data-scroll-fade
    >
      {children}
    </div>
  );
}

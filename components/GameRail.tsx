import React from 'react';

export interface GameRailProps {
  children: React.ReactNode;
  isLibrary?: boolean;
  className?: string;
}

export function GameRail({ children, isLibrary = false, className = '' }: GameRailProps) {
  return (
    <div 
      className={`game-rail ${isLibrary ? 'game-rail--library' : ''} ${className}`.trim()}
      data-game-rail-scroll 
      data-scroll-fade
    >
      {children}
    </div>
  );
}

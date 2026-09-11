import React from 'react';

/** One Untitled UI icon from the portal sprite (components/PortalSprite.tsx). */
export function ConsoleIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className ? `sp-icon ${className}` : 'sp-icon'} aria-hidden="true" viewBox="0 0 24 24">
      <use href={`#ti-${name}`} />
    </svg>
  );
}

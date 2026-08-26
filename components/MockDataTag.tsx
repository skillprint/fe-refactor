import React from 'react';

export function MockDataTag() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      <span
        className="ui-badge ui-badge--sm"
        style={{
          backgroundColor: 'var(--surface-sunken)',
          color: 'var(--text-muted)',
          border: '1px solid var(--ui-border-strong)',
          opacity: 0.8
        }}
        title="This section is currently populated with local/mock data and lacks a backend endpoint."
      >
        Mock Data
      </span>
    </div>
  );
}

import React from 'react';

export interface MockDataTagProps {
  label?: string;
  inline?: boolean;
}

export function MockDataTag({ label = 'Mock Data', inline = false }: MockDataTagProps = {}) {
  const badge = (
    <span
      className="ui-badge ui-badge--sm"
      style={{
        backgroundColor: '#fffae6',
        color: '#000000',
        border: '1px solid #ffe58f',
        opacity: 0.9,
        fontWeight: 600
      }}
      title="This section is currently populated with local/mock data and lacks a backend endpoint."
    >
      {label}
    </span>
  );

  if (inline || label !== 'Mock Data') {
    return badge;
  }

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
      {badge}
    </div>
  );
}

export default MockDataTag;


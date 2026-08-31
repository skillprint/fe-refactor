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
          backgroundColor: '#fffae6',
          color: '#000000',
          border: '1px solid #ffe58f',
          opacity: 0.9,
          fontWeight: 600
        }}
        title="This section is currently populated with local/mock data and lacks a backend endpoint."
      >
        Mock Data
      </span>
    </div>
  );
}

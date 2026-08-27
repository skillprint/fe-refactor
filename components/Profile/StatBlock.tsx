import React from 'react';

interface StatBlockProps {
  label: string;
  value: string | number;
}

export default function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="embed-stat padding-lg border-subtle radius-compact">
      <span className="ui-label layout-block">{label}</span>
      <strong className="layout-block font-mono">{value}</strong>
    </div>
  );
}

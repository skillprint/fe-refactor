import React from 'react';

interface SessionVeilProps {
  step: 'loading' | 'calculating' | 'badge';
  title: string;
  description: string;
  isCanvas?: boolean;
}

export default function SessionVeil({ step, title, description, isCanvas }: SessionVeilProps) {
  return (
    <div className={`session-veil ${isCanvas ? 'session-veil--canvas' : ''}`} data-step={step}>
      <span aria-hidden="true" className="session-spinner"></span>
      <div className="session-veil__copy">
        <strong className="font-md leading-lg weight-medium">{title}</strong>
        <span className="font-sm">{description}</span>
      </div>
    </div>
  );
}

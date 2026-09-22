'use client';

/**
 * Shared chrome for the three credential screens (SKI-213).
 *
 * Centred card, no coach nav — at this point we do not know who they are, and
 * rendering the dashboard shell around a sign-in form implies we do.
 */
import React from 'react';

export function AuthCard({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="coach-auth">
      <div className="coach-auth__card">
        <div className="coach-brand" style={{ marginBottom: 18 }}>
          <span className="coach-brand__mark" aria-hidden="true">S</span>
          <span>Skillprint Coach</span>
        </div>
        <h1 className="coach-auth__title">{title}</h1>
        {intro && <p className="coach-auth__intro">{intro}</p>}
        {children}
        {footer && <div className="coach-auth__footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required = true,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="coach-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="coach-field__hint">{hint}</p>}
    </div>
  );
}

/** Errors are announced, not just coloured — a failed sign-in must reach a screen reader. */
export function FormError({ message }: { message: string }) {
  return (
    <p className="coach-formerror" role="alert">
      {message}
    </p>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" className="coach-submit" disabled={busy}>
      {busy ? 'Working…' : children}
    </button>
  );
}

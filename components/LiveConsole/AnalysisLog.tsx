import React, { useState } from 'react';

export interface LogEntry {
  time: string;
  timestamp: number;
  level: string;
  message: string;
}

interface AnalysisLogProps {
  entries: LogEntry[];
  onClear: () => void;
}

const toneFor = (level: string) => (level === 'error' ? 'error' : level === 'warning' ? 'update' : level === 'success' ? 'success' : undefined);

/** The SDK log as the shared code block: wrapped, scrolling, newest last. */
export function AnalysisLog({ entries, onClear }: AnalysisLogProps) {
  const [copied, setCopied] = useState(false);
  const ordered = entries.slice().sort((a, b) => a.timestamp - b.timestamp);
  const count = `${ordered.length} ${ordered.length === 1 ? 'entry' : 'entries'}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ordered.map(e => `[${e.time}] ${e.level.toUpperCase()} ${e.message}`).join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Could not copy the log', e);
    }
  };

  return (
    <section className="code-block aa-log" aria-labelledby="logTitle">
      <div className="code-head">
        <div className="layout-flex items-center gap-lg"><strong id="logTitle">SDK log</strong><span>{count}</span></div>
        <div className="layout-flex items-center gap-sm">
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          <button type="button" onClick={onClear}>Clear</button>
        </div>
      </div>
      <div className="aa-log__body scrollbar-violet" role="log" aria-live="polite" tabIndex={0}>
        {ordered.length === 0 ? (
          <div className="aa-log__entry"><span className="aa-log__time" /><span className="aa-log__text">Waiting for SDK events…</span></div>
        ) : (
          ordered.map((entry, i) => (
            <div key={`${entry.timestamp}-${i}`} className="aa-log__entry" data-tone={toneFor(entry.level)}>
              <span className="aa-log__time">[{entry.time}]</span>
              <span className="aa-log__text">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

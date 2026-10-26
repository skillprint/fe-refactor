'use client';

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  siBluesky,
  siFacebook,
  siPinterest,
  siReddit,
  siSnapchat,
  siTelegram,
  siThreads,
  siWhatsapp,
  siX,
} from 'simple-icons';
import { COPY_LINK_NETWORKS, SHARE_TARGETS, SharePayload, ShareTargetId, embedSnippet } from '@/lib/share';

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  /** What is being shared. */
  payload: SharePayload;
  /** "Share Hextris": the heading. Defaults to the payload title. */
  heading?: string;
  /** When set, the sheet offers an iframe snippet for this URL. */
  embedUrl?: string;
}

const SNAP_SDK_SRC = 'https://sdk.snapkit.com/js/v1/create.js';

interface Glyph {
  path?: string;
  /** Fallback when there is no brand path: a short label drawn in the badge. */
  text?: string;
  /** Badge background. */
  hex: string;
  /** Glyph colour; white unless the brand is black or yellow. */
  ink?: string;
}

const GLYPHS: Record<ShareTargetId, Glyph> = {
  x: { path: siX.path, hex: 'ffffff', ink: '#000000' },
  facebook: { path: siFacebook.path, hex: siFacebook.hex },
  linkedin: { text: 'in', hex: '0A66C2' },
  threads: { path: siThreads.path, hex: 'ffffff', ink: '#000000' },
  bluesky: { path: siBluesky.path, hex: siBluesky.hex },
  reddit: { path: siReddit.path, hex: siReddit.hex },
  whatsapp: { path: siWhatsapp.path, hex: siWhatsapp.hex },
  telegram: { path: siTelegram.path, hex: siTelegram.hex },
  pinterest: { path: siPinterest.path, hex: siPinterest.hex },
  snapchat: { path: siSnapchat.path, hex: siSnapchat.hex, ink: '#000000' },
  email: { hex: '573eeb' },
  sms: { hex: '34C759' },
};

function BrandBadge({ id }: { id: ShareTargetId }) {
  const g = GLYPHS[id];
  const ink = g.ink || '#ffffff';
  return (
    <span className="share-sheet__badge" style={{ background: `#${g.hex}`, color: ink }} aria-hidden="true">
      {g.path ? (
        <svg viewBox="0 0 24 24"><path d={g.path} fill="currentColor" /></svg>
      ) : g.text ? (
        <svg viewBox="0 0 24 24"><text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="Inter, Arial, sans-serif" fill="currentColor">{g.text}</text></svg>
      ) : id === 'email' ? (
        <svg className="sp-icon" viewBox="0 0 24 24"><use href="#ti-mail"></use></svg>
      ) : (
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.2 1.1 4.2 3 5.6-.2 1.3-.8 2.6-1.7 3.6 2.1-.2 4-1 5.5-2.1.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" /></svg>
      )}
    </span>
  );
}

async function copyText(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done);
  } catch {
    toast.error('Could not copy. Select the text and copy it yourself.');
  }
}

/**
 * The share sheet: copy the link, hand it to the phone's share sheet, post it
 * to a network, or take an iframe snippet. One component for a game and for
 * the site; the payload decides.
 */
export default function ShareSheet({ open, onClose, payload, heading, embedUrl }: ShareSheetProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const snapRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  // Escape closes; the page behind does not scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  // Snapchat's Creative Kit for Web attaches its own share flow to any element
  // with its class. Load the SDK once the sheet is open; without it the button
  // is a plain link to Snapchat's attachment deep link.
  useEffect(() => {
    if (!open) return;
    const w = window as unknown as { snapKitInit?: () => void; snap?: { creativekit?: { initalizeShareButtons?: (els: HTMLCollectionOf<Element> | Element[]) => void } } };
    const init = () => {
      const buttons = document.getElementsByClassName('snapchat-share-button');
      w.snap?.creativekit?.initalizeShareButtons?.(buttons);
    };
    if (w.snap?.creativekit) {
      init();
      return;
    }
    w.snapKitInit = init;
    if (!document.querySelector(`script[src="${SNAP_SDK_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SNAP_SDK_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [open]);

  if (!open) return null;

  const title = heading || `Share ${payload.title}`;
  const snippet = embedUrl ? embedSnippet(embedUrl, payload.title) : '';

  const nativeShare = async () => {
    try {
      await navigator.share({ title: payload.title, text: payload.text, url: payload.url });
    } catch (err) {
      // The visitor dismissed the system sheet: nothing to report.
      if ((err as Error)?.name !== 'AbortError') toast.error('Sharing is not available here. Copy the link instead.');
    }
  };

  return (
    <div className="popup-backdrop inset-none place-center is-open" onClick={onClose} data-share-sheet>
      <article
        aria-labelledby="shareSheetTitle"
        aria-modal="true"
        className="popup popup--dark share-sheet"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup__content scrollbar-violet">
          <div className="layout-flex items-start justify-between gap-lg">
            <div className="min-width-0">
              <h2 className="share-sheet__title" id="shareSheetTitle">{title}</h2>
              <p className="share-sheet__lede margin-none">{payload.text}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="button button--tertiary button--icon-only button--md layout-grid place-center radius-control surface-transparent padding-none no-grow"
            >
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-close"></use></svg>
            </button>
          </div>

          <div className="share-sheet__link">
            <input
              ref={linkRef}
              readOnly
              value={payload.url}
              aria-label="Link to share"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" className="button button--primary button--md no-grow" onClick={() => copyText(payload.url, 'Link copied')}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-copy"></use></svg>
              Copy
            </button>
          </div>

          {canNativeShare && (
            <button type="button" className="button button--secondary button--md full-width share-sheet__native" onClick={nativeShare}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-share"></use></svg>
              Share with another app
            </button>
          )}

          <p className="ui-label share-sheet__label">Share to</p>
          <div className="share-sheet__grid" role="list">
            {SHARE_TARGETS.map((target) => (
              <a
                key={target.id}
                ref={target.id === 'snapchat' ? snapRef : undefined}
                role="listitem"
                className={`share-sheet__target${target.id === 'snapchat' ? ' snapchat-share-button' : ''}`}
                href={target.href(payload)}
                target={target.id === 'email' || target.id === 'sms' ? undefined : '_blank'}
                rel="noopener noreferrer"
                data-share-target={target.id}
                data-share-url={target.id === 'snapchat' ? payload.url : undefined}
              >
                <BrandBadge id={target.id} />
                <span className="share-sheet__target-label">{target.label}</span>
              </a>
            ))}
          </div>
          <p className="share-sheet__note margin-none">
            {COPY_LINK_NETWORKS.join(', ')} take links by paste: copy the link above and drop it in a caption, bio or message.
            {canNativeShare ? ' On a phone, "Share with another app" lists them too.' : ''}
          </p>

          {embedUrl && (
            <div className="share-sheet__embed">
              <button
                type="button"
                className="button button--tertiary button--sm"
                aria-expanded={showEmbed}
                aria-controls="shareSheetEmbed"
                onClick={() => setShowEmbed((v) => !v)}
              >
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-code"></use></svg>
                Embed on your site
                <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href={showEmbed ? '#ti-chevron-up' : '#ti-chevron-down'}></use></svg>
              </button>
              {showEmbed && (
                <div id="shareSheetEmbed" className="share-sheet__embed-body">
                  <textarea readOnly rows={4} value={snippet} aria-label="Embed code" onFocus={(e) => e.currentTarget.select()} />
                  <div className="layout-flex items-center justify-between gap-md wrap">
                    <span className="share-sheet__note">Runs the game as a guest inside your page.</span>
                    <button type="button" className="button button--secondary button--sm no-grow" onClick={() => copyText(snippet, 'Embed code copied')}>
                      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-copy"></use></svg>
                      Copy code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

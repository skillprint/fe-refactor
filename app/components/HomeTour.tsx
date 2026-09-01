'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserSession } from '../hooks/useUserSession';
import { getCookie, setCookie } from '../utils/cookieUtils';
import { usePathname, useRouter } from 'next/navigation';

const COOKIE_NAME = 'ftue_completed';
const COOKIE_EXPIRY_DAYS = 365;

interface TourStep {
    spot: string;
    title: string;
    text: string;
    fallback?: string;
    fallbackTitle?: string;
    fallbackText?: string;
}

const TOUR: TourStep[] = [
    {
        spot: 'nextup',
        title: 'What Skillprint is',
        text: 'Every game here measures how you think while you play. Five of them make your Skillprint.'
    },
    {
        spot: 'play',
        title: 'Start with one game',
        text: 'This is the whole first move. A session takes five to ten minutes, and there is nothing in it you can fail.'
    },
    {
        spot: 'run',
        title: 'Five sessions make a Skillprint',
        text: 'Each game you finish fills a slot. Five different games get you a score faster than one game played five times.'
    },
    {
        spot: 'print',
        title: 'Your Skillprint appears here',
        text: 'The wheel lives on your profile, and this is the same drawing. Come back to it after five sessions and it will have something to say.'
    },
    {
        spot: 'read',
        title: 'What each session unlocks',
        text: 'Mood scores first, cognition next, personality last. This card always says what still needs play.'
    },
    {
        spot: 'routes',
        title: 'The rest of the portal',
        text: 'Games is the full library. Skills explains what is being measured. That is all there is to find.',
        fallback: 'routes-sm',
        fallbackTitle: 'The rest of the portal',
        fallbackText: 'This opens the menu. Games is the full library, Skills explains what is being measured, and that is all there is to find.'
    }
];

export default function HomeTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const { status } = useAuth();
    const { isWhitelisted } = useUserSession();
    const pathname = usePathname();
    const router = useRouter();

    const [useFallbackText, setUseFallbackText] = useState(false);

    const bubbleRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLElement | null>(null);
    const spotRef = useRef<HTMLDivElement>(null);

    const GAP = 12;
    const EDGE = 16;
    const PAD = 8;
    const DOCK_UNDER = 640;

    const markFTUECompleted = useCallback(() => {
        setCookie(COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS);
    }, []);

    const closeTour = useCallback((silent = false) => {
        if (!isOpen) return;
        setIsOpen(false);
        targetRef.current = null;
        document.body.classList.remove('home-tour-open');
        document.body.style.removeProperty('--home-tour-gutter');
        const content = document.querySelector('.portal-content') as HTMLElement;
        if (content) content.style.removeProperty('--home-tour-dock');
        
        if (!silent) markFTUECompleted();
    }, [isOpen, markFTUECompleted]);

    const usable = useCallback((el: HTMLElement | null) => {
        if (!el) return false;
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) return false;
        if (window.getComputedStyle(el).visibility === 'hidden') return false;
        return box.right > 0 && box.left < document.documentElement.clientWidth;
    }, []);

    const nudge = useCallback((el: HTMLElement | null, delta: number) => {
        if (!el || !Math.round(delta)) return false;
        const from = window.scrollY;
        const before = el.getBoundingClientRect().top;
        window.scrollTo({ top: Math.max(0, from + delta), behavior: 'instant' });
        if (window.scrollY === from) return false;
        if (Math.abs(el.getBoundingClientRect().top - before) >= 1) return true;
        window.scrollTo({ top: from, behavior: 'instant' });
        return false;
    }, []);

    const ensureVisible = useCallback((el: HTMLElement | null) => {
        if (!el) return;
        const box = el.getBoundingClientRect();
        const view = window.innerHeight;
        const room = view - EDGE * 2;
        if (box.top >= EDGE && box.bottom <= view - EDGE) return;
        const lead = Math.max(EDGE, Math.min(room - box.height, room / 3));
        nudge(el, box.top - lead);
    }, [nudge]);

    const padded = useCallback(() => {
        if (!targetRef.current) return null;
        const box = targetRef.current.getBoundingClientRect();
        return {
            left: box.left - PAD, top: box.top - PAD,
            right: box.right + PAD, bottom: box.bottom + PAD,
            width: box.width + PAD * 2, height: box.height + PAD * 2
        };
    }, []);

    const writeHole = useCallback((box: any) => {
        if (!targetRef.current || !spotRef.current) return;
        const computed = window.getComputedStyle(targetRef.current);
        const radius = parseFloat(computed.borderTopLeftRadius) || 0;
        const spot = spotRef.current;
        spot.style.setProperty('--spot-x', `${Math.round(box.left)}px`);
        spot.style.setProperty('--spot-y', `${Math.round(box.top)}px`);
        spot.style.setProperty('--spot-w', `${Math.round(box.width)}px`);
        spot.style.setProperty('--spot-h', `${Math.round(box.height)}px`);
        spot.style.setProperty('--spot-radius', `${Math.round(Math.max(radius + PAD, 10))}px`);
    }, []);

    const place = useCallback((box: any) => {
        if (!bubbleRef.current) return;
        const bubble = bubbleRef.current;
        const view = { w: document.documentElement.clientWidth, h: window.innerHeight };
        
        // Reset to bottom to get intrinsic size without previous constraints
        bubble.dataset.placement = 'bottom';
        const size = { w: bubble.offsetWidth, h: bubble.offsetHeight };
        
        let side = 'dock';
        if (view.w > DOCK_UNDER) {
            if (view.h - box.bottom - GAP >= size.h + EDGE) side = 'bottom';
            else if (box.top - GAP >= size.h + EDGE) side = 'top';
            else if (view.w - box.right - GAP >= size.w + EDGE) side = 'right';
            else if (box.left - GAP >= size.w + EDGE) side = 'left';
        }

        bubble.dataset.placement = side;
        if (side === 'dock') return;

        const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));
        let left: number;
        let top: number;

        if (side === 'bottom' || side === 'top') {
            left = clamp(box.left + box.width / 2 - size.w / 2, EDGE, view.w - size.w - EDGE);
            top = clamp(side === 'bottom' ? box.bottom + GAP : box.top - GAP - size.h, EDGE, view.h - size.h - EDGE);
            bubble.style.setProperty('--tour-arrow-x', `${Math.round(clamp(box.left + box.width / 2 - left, EDGE, size.w - EDGE))}px`);
            bubble.style.removeProperty('--tour-arrow-y');
        } else {
            top = clamp(box.top + box.height / 2 - size.h / 2, EDGE, view.h - size.h - EDGE);
            left = side === 'right' ? box.right + GAP : box.left - GAP - size.w;
            bubble.style.setProperty('--tour-arrow-y', `${Math.round(clamp(box.top + box.height / 2 - top, EDGE, size.h - EDGE))}px`);
            bubble.style.removeProperty('--tour-arrow-x');
        }

        bubble.style.setProperty('--tour-left', `${Math.round(left)}px`);
        bubble.style.setProperty('--tour-top', `${Math.round(top)}px`);
    }, []);

    const measure = useCallback((settle = false) => {
        if (!targetRef.current || !bubbleRef.current || !spotRef.current) return;
        const box = padded();
        if (!box) return;

        writeHole(box);
        place(box);

        const content = document.querySelector('.portal-content') as HTMLElement;
        const placement = bubbleRef.current.dataset.placement;
        if (placement !== 'dock') {
            if (content) content.style.removeProperty('--home-tour-dock');
        } else if (content) {
            content.style.setProperty('--home-tour-dock', `${Math.ceil(bubbleRef.current.getBoundingClientRect().height + EDGE * 2)}px`);
        }

        if (!settle) return;
        const ceiling = bubbleRef.current.getBoundingClientRect().top - GAP;
        if (box.top >= EDGE && box.bottom <= ceiling) return;
        const shift = box.height > ceiling - EDGE ? box.top - EDGE : box.bottom - ceiling;
        if (nudge(targetRef.current, shift)) {
            const newBox = padded();
            if (newBox) writeHole(newBox);
        }
    }, [padded, writeHole, place, nudge]);

    // Handle measuring and positioning whenever the step content updates
    useEffect(() => {
        if (!isOpen) return;
        
        const step = TOUR[currentStep];
        const first = document.querySelector(`[data-home-spot="${step.spot}"]`) as HTMLElement;
        let target = first;
        let fallback = false;
        
        if (!usable(first) && step.fallback) {
            const spare = document.querySelector(`[data-home-spot="${step.fallback}"]`) as HTMLElement;
            if (usable(spare)) {
                target = spare;
                fallback = true;
            }
        }
        
        if (fallback !== useFallbackText) {
            setUseFallbackText(fallback);
        } else {
            targetRef.current = target;
            if (target) {
                ensureVisible(target);
                measure(true);
                requestAnimationFrame(() => measure(true));
            }
        }
    }, [currentStep, isOpen, useFallbackText, measure, ensureVisible, usable]);

    const showStep = useCallback((index: number) => {
        if (index < 0 || index >= TOUR.length) return;
        setCurrentStep(index);
    }, []);

    const startTour = useCallback((force = false) => {
        if (isOpen) return;
        if (pathname !== '/') {
            if (force) {
                router.push('/?tour=start');
            }
            return;
        }

        const completed = getCookie(COOKIE_NAME);
        if (!force && completed) return;

        if (document.body.classList.contains('nav-open')) {
            const closeBtn = document.querySelector('[data-portal-nav-close]') as HTMLElement;
            if (closeBtn) closeBtn.click();
        }

        setIsOpen(true);
        setCurrentStep(0);
        
        document.body.style.setProperty('--home-tour-gutter', `${Math.max(0, window.innerWidth - document.documentElement.clientWidth)}px`);
        document.body.classList.add('home-tour-open');
    }, [isOpen, pathname, router]);

    // Initial check and routing listener
    useEffect(() => {
        if (status === 'loggedOut' || status === 'partner' || isWhitelisted) return;

        // Check if query param tells us to start tour (e.g. from redirect)
        const params = new URLSearchParams(window.location.search);
        if (params.get('tour') === 'start') {
            startTour(true);
            // Clean up url
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            return;
        }

        if (pathname === '/') {
            const completed = getCookie(COOKIE_NAME);
            if (!completed) {
                // Short delay for mount
                setTimeout(() => startTour(false), 300);
            }
        }
    }, [status, pathname, startTour, isWhitelisted]);

    // Event listeners
    useEffect(() => {
        const handleShowFTUE = () => startTour(true);
        window.addEventListener('skillprint:show-ftue', handleShowFTUE);
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                closeTour();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        let queued = false;
        const scheduleMeasure = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; measure(false); });
        };

        const handleResize = () => {
            if (!isOpen) return;
            // Target recalculation on resize
            const step = TOUR[currentStep];
            const first = document.querySelector(`[data-home-spot="${step.spot}"]`) as HTMLElement;
            let target = first;
            if (!usable(first) && step.fallback) {
                const spare = document.querySelector(`[data-home-spot="${step.fallback}"]`) as HTMLElement;
                if (usable(spare)) target = spare;
            }
            targetRef.current = target;
            
            measure(false);
            scheduleMeasure();
        };

        window.addEventListener('scroll', scheduleMeasure, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('skillprint:show-ftue', handleShowFTUE);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', scheduleMeasure);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen, startTour, closeTour, measure, currentStep, usable]);


    const stepData = TOUR[currentStep];
    const isLast = currentStep === TOUR.length - 1;
    const title = useFallbackText ? (stepData.fallbackTitle || stepData.title) : stepData.title;
    const text = useFallbackText ? (stepData.fallbackText || stepData.text) : stepData.text;

    return (
        <>
            <div 
                className="portal-spotlight" 
                data-home-spotlight 
                data-open={isOpen ? 'true' : 'false'} 
                aria-hidden="true" 
                ref={spotRef}
            ></div>
            <div 
                className="portal-tour sp-tour" 
                data-portal-tour 
                data-open={isOpen ? 'true' : 'false'} 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="homeTourTitle" 
                aria-describedby="homeTourText"
                ref={bubbleRef}
            >
                <div className="portal-tour__body" data-portal-tour-live aria-live="polite">
                    <div className="sp-tour__header">
                        <span className="sp-tour__eyebrow" data-portal-tour-count>Step {currentStep + 1} of {TOUR.length}</span>
                        <h2 className="sp-tour__title" id="homeTourTitle" data-portal-tour-title>{title}</h2>
                    </div>
                    <p className="sp-tour__text" id="homeTourText" data-portal-tour-text>{text}</p>
                </div>
                <div className="sp-tour__footer">
                    <ol className="sp-stepper sp-stepper--dots portal-tour__stepper" aria-hidden="true" data-portal-tour-stepper>
                        {TOUR.map((_, i) => (
                            <li key={i} className="sp-stepper__item" data-state={i < currentStep ? 'done' : (i === currentStep ? 'current' : 'todo')}>
                                <span className="sp-stepper__mark"></span>
                                <span className="sp-stepper__label">Step {i + 1}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="sp-tour__actions">
                        <button className="button button--tertiary button--sm" type="button" onClick={() => closeTour()}>Skip</button>
                        <button 
                            className="button button--tertiary button--icon-only button--sm" 
                            type="button" 
                            aria-label="Previous step"
                            aria-disabled={currentStep === 0}
                            onClick={() => currentStep > 0 && showStep(currentStep - 1)}
                        >
                            <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-left"></use></svg>
                        </button>
                        <button className="button button--primary button--sm" type="button" onClick={() => isLast ? closeTour() : showStep(currentStep + 1)}>
                            {isLast ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
                <span className="sp-tour__arrow" aria-hidden="true"></span>
            </div>
        </>
    );
}

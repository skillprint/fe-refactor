import React from 'react';

interface PlaybookHowItWorksProps {
    howItWorks: string;
}

export function PlaybookHowItWorks({ howItWorks }: PlaybookHowItWorksProps) {
    return (
        <section className="portal-section separator-top" aria-labelledby="pbHow">
            <div className="portal-section__bar">
                <div>
                    <h2 className="portal-section__title" id="pbHow">How the routine works</h2>
                    <p className="portal-section__hint">Why these three, and in this order.</p>
                </div>
            </div>
            <div className="gd-panel sp-card">
                <p className="margin-none text-muted leading-md" data-pb-how="">
                    {howItWorks}
                </p>
            </div>
        </section>
    );
}

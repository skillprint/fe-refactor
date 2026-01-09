import React from 'react';

const BuckyballLoading = () => {
    return (
        <div className="flex justify-center items-center w-full h-full min-h-[200px]">
            <svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
                <g filter="url(#goo)">
                    <circle r="30" fill="var(--primary)">
                        <animate attributeName="cx" values="40;160;40" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
                        <animate attributeName="cy" values="40;160;40" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
                    </circle>
                    <circle r="30" fill="var(--primary)">
                        <animate attributeName="cx" values="160;40;160" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
                        <animate attributeName="cy" values="160;40;160" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
                    </circle>
                </g>
            </svg>
        </div>
    );
};

export default BuckyballLoading;

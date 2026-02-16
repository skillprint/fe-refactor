import React from 'react';

const BuckyballLoading = () => {
    return (
        <svg width="80" height="80" viewBox="0 0 50 50">
            <g transform="translate(25 25)">
                <g>
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0;120;120;240;240;360;360"
                        keyTimes="0;0.05;0.333;0.383;0.666;0.716;1"
                        dur="6s"
                        repeatCount="indefinite"
                    />
                    <circle cx="10" cy="0" r="3" fill="#05DF91">
                        <animate attributeName="r" values="3;4.5;3" dur="1.5s" begin="0s" repeatCount="indefinite"></animate>
                        <animate attributeName="fill-opacity" values="1;0.5;1" dur="1.5s" begin="0s" repeatCount="indefinite"></animate>
                        <animate attributeName="fill" values="#05DF91;#0591DF;#DEDE05;#05DF91" dur="6s" repeatCount="indefinite"></animate>
                    </circle>
                    <circle cx="-5" cy="8.66" r="3" fill="#05DF91">
                        <animate attributeName="r" values="3;4.5;3" dur="1.5s" begin="0.2s" repeatCount="indefinite"></animate>
                        <animate attributeName="fill-opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite"></animate>
                        <animate attributeName="fill" values="#05DF91;#0591DF;#DEDE05;#05DF91" dur="6s" repeatCount="indefinite"></animate>
                    </circle>
                    <circle cx="-5" cy="-8.66" r="3" fill="#05DF91">
                        <animate attributeName="r" values="3;4.5;3" dur="1.5s" begin="0.4s" repeatCount="indefinite"></animate>
                        <animate attributeName="fill-opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite"></animate>
                        <animate attributeName="fill" values="#05DF91;#0591DF;#DEDE05;#05DF91" dur="6s" repeatCount="indefinite"></animate>
                    </circle>
                </g>
            </g>
        </svg>
    );
};

export default BuckyballLoading;

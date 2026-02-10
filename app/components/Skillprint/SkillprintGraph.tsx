
import React from 'react';
import { SkillprintStateType } from './types';

interface SkillprintGraphProps {
    data: SkillprintStateType;
    size: number;
    width?: number | string; // Optional override
    height?: number | string; // Optional override
    state: string; // 'skills' | 'mindsets' | 'reset'
    viewBox?: string;
    zoom?: {
        scale: number;
        translate: { dx: number; dy: number };
        rotate: string;
    };
    onNodeClick?: (group: string, slug: string) => void;
    onNodeHover?: (node: { group: string; slug: string; rect: DOMRect } | null) => void;
}

const SkillprintGraph: React.FC<SkillprintGraphProps> = ({
    data,
    size,
    width,
    height,
    state,
    viewBox = '0 0 812 812',
    zoom,
    onNodeClick,
    onNodeHover,
}) => {
    const [hoveredNodeId, setHoveredNodeId] = React.useState<number | null>(null);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerStyle = zoom
        ? {
            transform: `translate(${zoom.translate.dx}px, ${zoom.translate.dy}px) scale(${zoom.scale}) rotate(${zoom.rotate})`,
            transformOrigin: 'center center',
            transition: 'transform 0.5s ease-in-out',
        }
        : {};

    return (
        <div style={{ width: width || size, height: height || size, overflow: 'hidden' }}>
            <svg
                width={width || size}
                height={height || size}
                viewBox={viewBox}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={containerStyle}
            >
                {/* Outer Ring */}
                <circle
                    cx={data.outerRing.cx}
                    cy={data.outerRing.cy}
                    r={data.outerRing.r}
                    fill={data.outerRing.fill || 'none'}
                    stroke={data.outerRing.stroke}
                    strokeWidth={data.outerRing.strokeWidth}
                />

                {/* Nodes and Paths */}
                {data.spAttrs.map((ss) => {
                    const isHovered = hoveredNodeId === ss.id;
                    const opacity = hoveredNodeId !== null && !isHovered ? 0.4 : (isHovered ? 1.0 : 0.8);

                    // Center for transform origin
                    const transformOrigin = `${ss.node.cx}px ${ss.node.cy}px`;

                    const clickEvent = isMobile ? 'touchstart' : 'click';
                    const hoverEvent = isMobile ? 'touchmove' : 'mousemove';
                    const leaveEvent = isMobile ? 'touchend' : 'mouseleave';

                    return (
                        <g
                            key={ss.id}
                            style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                        >
                            <path
                                d={ss.path.d}
                                stroke={ss.path.stroke}
                                strokeWidth={ss.path.strokeWidth}
                                fill="none"
                                style={{
                                    opacity,
                                    transition: 'opacity 0.3s ease'
                                }}
                            />
                            <circle
                                onMouseEnter={(e) => {
                                    setHoveredNodeId(ss.id);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    onNodeHover && onNodeHover({ group: ss.group, slug: ss.slug, rect });
                                }}
                                onMouseLeave={() => {
                                    setHoveredNodeId(null);
                                    onNodeHover && onNodeHover(null);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent propagation if needed
                                    e.preventDefault();
                                    if (isMobile) {
                                        if (hoveredNodeId === ss.id) {
                                            setHoveredNodeId(null);
                                            onNodeHover && onNodeHover(null);
                                            return;
                                        }
                                        setHoveredNodeId(ss.id);
                                        return;
                                    }
                                    onNodeClick && onNodeClick(ss.group, ss.slug);
                                }}
                                cx={ss.node.cx}
                                cy={ss.node.cy}
                                r={ss.node.r}
                                fill={ss.node.fill}
                                style={{
                                    opacity,
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin,
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            <text
                                transform={ss.text.transform + (isHovered ? ' scale(1.3)' : 'scale(1)')}

                                fill={ss.text.fill}
                                fontFamily="Inter, sans-serif"
                                fontSize={ss.text.size || 12}
                                fontWeight={600}
                                letterSpacing="0em"
                                style={{
                                    transition: 'all 0.3s ease',
                                    opacity: isHovered ? 1.0 : 0.5,
                                }}
                            >
                                {ss.text.tspans &&
                                    ss.text.tspans.map((tspan, idx) => (
                                        <tspan
                                            key={`${tspan.x}-${tspan.y}-${idx}`}
                                            x={tspan.x}
                                            y={tspan.y}
                                            textAnchor={tspan.anchor}
                                        >
                                            {tspan.title}
                                        </tspan>
                                    ))}
                            </text>
                        </g>
                    );
                })}

                {/* Inner Ring */}
                <path
                    d={data.innerRing.d}
                    fill={data.innerRing.fill}
                    stroke={data.innerRing.stroke}
                />

                {/* Logo */}
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d={data.logo.d}
                    fill={data.logo.fill}
                />
            </svg>
        </div>
    );
};

export default SkillprintGraph;

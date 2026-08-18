import React from 'react';

export type IconName =
  | 'ti-adjust'
  | 'ti-alert'
  | 'ti-arrow-left'
  | 'ti-arrow-right'
  | 'ti-bell'
  | 'ti-book'
  | 'ti-box'
  | 'ti-calendar'
  | 'ti-chart'
  | 'ti-check'
  | 'ti-chevron-down'
  | 'ti-chevron-left'
  | 'ti-chevron-right'
  | 'ti-chevron-up'
  | 'ti-clock'
  | 'ti-close'
  | 'ti-code'
  | 'ti-cognition-action'
  | 'ti-cognition-attention'
  | 'ti-cognition-deduction'
  | 'ti-cognition-knowledge'
  | 'ti-cognition-math'
  | 'ti-cognition-memory'
  | 'ti-cognition-pattern-matching'
  | 'ti-cognition-perceptual-speed'
  | 'ti-cognition-planning'
  | 'ti-cognition-spatial'
  | 'ti-cognition-task-switching'
  | 'ti-cognition-timing'
  | 'ti-cognition-verbal'
  | 'ti-cognition-visualization'
  | 'ti-copy'
  | 'ti-database'
  | 'ti-dots'
  | 'ti-download'
  | 'ti-edit'
  | 'ti-error'
  | 'ti-external'
  | 'ti-eye'
  | 'ti-eye-off'
  | 'ti-filter'
  | 'ti-gamepad'
  | 'ti-help'
  | 'ti-home'
  | 'ti-info'
  | 'ti-key'
  | 'ti-layout-grid'
  | 'ti-loading'
  | 'ti-lock'
  | 'ti-logout'
  | 'ti-mail'
  | 'ti-menu'
  | 'ti-minus'
  | 'ti-mood-awe'
  | 'ti-mood-collaborate'
  | 'ti-mood-creativity'
  | 'ti-mood-curiosity'
  | 'ti-mood-empathy'
  | 'ti-mood-focus'
  | 'ti-mood-grit'
  | 'ti-mood-joy'
  | 'ti-mood-relax'
  | 'ti-moon'
  | 'ti-package'
  | 'ti-pause'
  | 'ti-personality-agreeableness'
  | 'ti-personality-conscientiousness'
  | 'ti-personality-emotional-stability'
  | 'ti-personality-extraversion'
  | 'ti-personality-openness'
  | 'ti-play'
  | 'ti-plus'
  | 'ti-refresh'
  | 'ti-search'
  | 'ti-settings'
  | 'ti-share'
  | 'ti-sort'
  | 'ti-star'
  | 'ti-success'
  | 'ti-sun'
  | 'ti-trash'
  | 'ti-trending'
  | 'ti-upload'
  | 'ti-user';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: IconSize | number;
  strokeWidth?: number;
  className?: string;
}

const SIZE_MAP: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  strokeWidth,
  className = '',
  style,
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 24;

  const customStyle: React.CSSProperties = {
    ...style,
    ...(strokeWidth ? { '--icon-stroke': strokeWidth } as React.CSSProperties : {}),
  };

  return (
    <svg
      className={`sp-icon sp-icon--${typeof size === 'string' ? size : 'custom'} ${className}`}
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={customStyle}
      {...props}
    >
      <use href={`/assets/design-system/icons/sprite.svg#${name}`} />
    </svg>
  );
};

export default Icon;

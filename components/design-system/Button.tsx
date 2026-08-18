import React from 'react';
import { Icon, IconName } from '@/components/ui/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  fullWidth?: boolean;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  iconOnly = false,
  fullWidth = false,
  href,
  className = '',
  children,
  ...props
}) => {
  const baseClass = 'button';
  const variantClass = `button--${variant}`;
  const sizeClass = `button--${size}`;
  const iconOnlyClass = iconOnly ? 'button--icon-only' : '';
  const fullWidthClass = fullWidth ? 'full-width' : '';

  const combinedClasses = `${baseClass} ${variantClass} ${sizeClass} ${iconOnlyClass} ${fullWidthClass} ${className}`.trim();

  const iconElement = icon ? <Icon name={icon} size={size === 'xs' ? 'xs' : 'sm'} /> : null;

  const content = (
    <>
      {icon && iconPosition === 'left' && iconElement}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && iconElement}
    </>
  );

  if (href) {
    return (
      <a href={href} className={combinedClasses}>
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
};

export default Button;

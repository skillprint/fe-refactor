import React from 'react';

interface CardProps {
  children: React.ReactNode;
  interactive?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  href,
  className = '',
  onClick,
}) => {
  const baseClasses = `sp-card ${interactive || href ? 'sp-card--interactive' : ''} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;

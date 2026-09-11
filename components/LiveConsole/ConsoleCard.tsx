import React from 'react';
import { ConsoleIcon } from './ConsoleIcon';

/** The one head contract every panel on the console shares. */
export function CardHead({
  id,
  icon,
  title,
  as: Tag = 'h3',
  className,
  children,
}: {
  id?: string;
  icon: string;
  title: React.ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className ? `aa-card__head ${className}` : 'aa-card__head'}>
      <Tag className="aa-card__title" id={id}>
        <ConsoleIcon name={icon} />
        {title}
      </Tag>
      {children}
    </div>
  );
}

export function CardLede({ children }: { children: React.ReactNode }) {
  return <p className="aa-card__lede">{children}</p>;
}

export function CardNote({ children }: { children: React.ReactNode }) {
  return <p className="aa-card__note">{children}</p>;
}

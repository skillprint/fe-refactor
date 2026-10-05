import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="portal-eyebrow" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href} className="text-muted hover:text-default transition-colors">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <span className="mx-2 text-muted">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

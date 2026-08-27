import React from 'react';

export interface IconInfoCardWithDescriptionProps {
  title: string;
  note: string;
  iconId: string;
}

export function IconInfoCardWithDescription({ title, note, iconId }: IconInfoCardWithDescriptionProps) {
  return (
    <div className="portal-blank">
      <span className="sp-icon-frame sp-icon-frame--md no-grow" aria-hidden="true">
        <svg className="sp-icon sp-icon--sm" viewBox="0 0 24 24">
          <use href={`#${iconId}`}></use>
        </svg>
      </span>
      <p className="portal-blank__title">{title}</p>
      <p className="portal-blank__note">{note}</p>
    </div>
  );
}

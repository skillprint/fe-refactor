'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilder } from './BuilderContext';
import { MODULE_REGISTRY } from '../modules/ModuleRegistry';

interface Props {
  id: string;
  type: string;
  blockProps?: any;
}

export function SortableBlock({ id, type, blockProps = {} }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const { removeBlock } = useBuilder();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const moduleDef = MODULE_REGISTRY[type];

  if (!moduleDef) {
    return <div style={style} ref={setNodeRef}>Unknown module type: {type}</div>;
  }

  const ModuleComponent = moduleDef.component;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group mb-4 w-full"
    >
      <div 
        className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-10"
      >
        <button 
          {...attributes} 
          {...listeners} 
          className="p-2 bg-card border border-border rounded shadow cursor-grab hover:bg-secondary text-muted-foreground hover:text-foreground"
          title="Drag to move"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            removeBlock(id);
          }}
          className="p-2 bg-card border border-destructive/30 text-destructive rounded shadow cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
          title="Remove block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      <div className={`border-2 rounded-xl transition-colors ${isDragging ? 'border-primary shadow-2xl scale-[1.02]' : 'border-transparent hover:border-border/50 hover:shadow-sm'}`}>
        <ModuleComponent id={id} {...blockProps} />
      </div>
    </div>
  );
}

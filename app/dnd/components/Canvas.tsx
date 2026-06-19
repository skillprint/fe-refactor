'use client';

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilder } from './BuilderContext';
import { SortableBlock } from './SortableBlock';
import { useDroppable } from '@dnd-kit/core';

export function Canvas() {
  const { blocks, theme } = useBuilder();
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-dropzone',
  });

  const themeStyles = theme ? {
    '--primary': theme.primaryColor,
    '--secondary': theme.secondaryColor,
    '--background': theme.backgroundColor,
    '--foreground': theme.foregroundColor,
    '--card': theme.cardColor,
    '--card-foreground': theme.cardForegroundColor,
    '--border': theme.borderColor || theme.border,
    '--radius': theme.borderRadius,
    '--font-sans': theme.fontFamily ? `var(--font-${theme.fontFamily.toLowerCase()})` : undefined
  } : {};

  return (
    <div 
      className="flex-1 bg-background overflow-y-auto p-8 relative min-h-screen border-l border-border transition-colors duration-300"
      style={themeStyles as React.CSSProperties}
    >
      <div className="max-w-[1440px] mx-auto w-full flex flex-col items-center">
        {blocks.length === 0 ? (
          <div 
            ref={setNodeRef}
            className={`w-full max-w-4xl h-96 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-border bg-card/50'}`}
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4 text-3xl">
              ✨
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Page is Empty</h2>
            <p className="text-muted-foreground max-w-md text-center">
              Drag modules from the sidebar and drop them here to start building your custom Skillprint layout.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[1440px] pl-16 pr-4"> {/* Padding to leave room for the hover controls */}
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div ref={setNodeRef} className={`w-full min-h-screen pb-64 ${isOver ? 'bg-primary/5 rounded-xl transition-colors' : ''}`}>
                {blocks.map((block) => (
                  <SortableBlock key={block.id} id={block.id} type={block.type} blockProps={block.props} />
                ))}
                
                {/* Visual indicator for bottom drop zone */}
                <div className={`h-24 w-full rounded-xl border-2 border-dashed mt-4 flex items-center justify-center transition-opacity ${isOver ? 'opacity-100 border-primary bg-primary/10' : 'opacity-0'}`}>
                  <span className="text-primary font-bold">Drop here to append</span>
                </div>
              </div>
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
}

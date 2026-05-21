'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { BuilderProvider, useBuilder } from './components/BuilderContext';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { MODULE_REGISTRY } from './modules/ModuleRegistry';

function BuilderRoot() {
  const { blocks, setBlocks, addBlock } = useBuilder();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSidebarType, setActiveSidebarType] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isSidebarItem = active.data.current?.isSidebarItem;
    
    if (isSidebarItem) {
      setActiveSidebarType(active.data.current?.type);
    } else {
      setActiveId(active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveSidebarType(null);

    if (!over) return;

    const isSidebarItem = active.data.current?.isSidebarItem;

    if (isSidebarItem) {
      // It's a new item from the sidebar
      const type = active.data.current?.type;
      
      if (over.id === 'canvas-dropzone') {
        addBlock(type);
      } else {
        // Dropped over an existing block
        const overIndex = blocks.findIndex((b) => b.id === over.id);
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        const newIndex = overIndex >= 0 ? overIndex + modifier : blocks.length;
        
        addBlock(type, newIndex);
      }
    } else {
      // Reordering existing items
      if (active.id !== over.id && over.id !== 'canvas-dropzone') {
        setBlocks((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const activeModule = activeSidebarType ? MODULE_REGISTRY[activeSidebarType] : null;
  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;
  const ActiveBlockModule = activeBlock ? MODULE_REGISTRY[activeBlock.type]?.component : null;

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
        <Sidebar />
        <Canvas />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSidebarType && activeModule ? (
          <div className="p-4 bg-card border border-primary shadow-2xl rounded-xl flex items-center gap-3 opacity-90 scale-105">
            <span className="text-2xl">{activeModule.icon}</span>
            <span className="font-medium text-foreground">{activeModule.name}</span>
          </div>
        ) : null}

        {activeId && ActiveBlockModule ? (
          <div className="border-2 border-primary shadow-2xl rounded-xl opacity-90 scale-105">
            <ActiveBlockModule />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function DnDPage() {
  return (
    <BuilderProvider>
      <BuilderRoot />
    </BuilderProvider>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
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
import { useUserSession } from '../hooks/useUserSession';
import LayoutCreatorModal from './components/LayoutCreatorModal';

function BuilderRoot() {
  const { blocks, setBlocks, addBlock } = useBuilder();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSidebarType, setActiveSidebarType] = useState<string | null>(null);
  
  const { userId } = useUserSession();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);

  const fetchLayouts = async () => {
    if (!userId) return;
    setIsLoadingLayouts(true);
    try {
      const res = await fetch(`/api/custom-layouts?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.layouts) {
        setSavedLayouts(data.layouts);
      }
    } catch (err) {
      console.error('Failed to load saved layouts', err);
    } finally {
      setIsLoadingLayouts(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, [userId]);

  const handleLoadLayout = (layoutBlocks: any[]) => {
    setBlocks(layoutBlocks);
  };

  const handleDeleteLayout = async (id: string) => {
    try {
      const res = await fetch(`/api/custom-layouts?id=${id}&userId=${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSavedLayouts(prev => prev.filter(l => l.id !== id));
      } else {
        alert(data.error || 'Failed to delete layout');
      }
    } catch (err) {
      console.error('Error deleting layout', err);
    }
  };

  const handleSaveSuccess = (newLayout: any) => {
    setSavedLayouts(prev => [newLayout, ...prev]);
    setBlocks(newLayout.blocks);
  };

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
        <Sidebar 
          onOpenCreatorModal={() => setIsCreatorOpen(true)}
          savedLayouts={savedLayouts}
          onLoadLayout={handleLoadLayout}
          onDeleteLayout={handleDeleteLayout}
          isLoadingLayouts={isLoadingLayouts}
        />
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

      <LayoutCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        userId={userId}
      />
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


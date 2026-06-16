'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { MODULE_REGISTRY } from '../modules/ModuleRegistry';

function DraggableSidebarItem({ id, name, icon }: { id: string; name: string; icon: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${id}`,
    data: {
      type: id,
      isSidebarItem: true,
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-4 bg-card border border-border rounded-xl cursor-grab hover:border-primary hover:shadow-md transition-all flex items-center gap-3 ${isDragging ? 'opacity-50 border-dashed border-primary bg-primary/5' : ''}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-foreground">{name}</span>
      <div className="ml-auto text-muted-foreground opacity-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
      </div>
    </div>
  );
}

export interface SidebarProps {
  onOpenCreatorModal: () => void;
  savedLayouts: any[];
  onLoadLayout: (blocks: any[], theme?: any) => void;
  onDeleteLayout: (id: string) => void;
  isLoadingLayouts: boolean;
}

export function Sidebar({ onOpenCreatorModal, savedLayouts, onLoadLayout, onDeleteLayout, isLoadingLayouts }: SidebarProps) {
  return (
    <div className="w-80 bg-background border-r border-border h-screen flex flex-col flex-shrink-0 z-20 shadow-xl">
      <div className="p-6 border-b border-border bg-card/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Drag modules to compose</p>
        </div>
        <button
          onClick={onOpenCreatorModal}
          className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all flex items-center justify-center cursor-pointer active:scale-95"
          title="Create layout with AI Chatbot"
        >
          <span className="text-lg leading-none">＋</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Available Modules
        </h3>
        
        {Object.entries(MODULE_REGISTRY).map(([id, module]) => (
          <DraggableSidebarItem key={id} id={id} name={module.name} icon={module.icon} />
        ))}

        {/* Saved Custom Layouts Section */}
        <div className="mt-6 border-t border-border pt-6 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
            Saved Layouts
          </h3>
          {isLoadingLayouts ? (
            <div className="text-xs text-muted-foreground italic px-1">Loading saved layouts...</div>
          ) : savedLayouts.length === 0 ? (
            <div className="text-xs text-muted-foreground italic px-1">No custom layouts saved yet.</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {savedLayouts.map((layout) => (
                <div key={layout.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl group hover:border-primary transition-all">
                  <button
                    onClick={() => onLoadLayout(layout.blocks, layout.theme)}
                    className="text-left flex-1 text-xs font-semibold text-foreground hover:text-primary transition-colors truncate mr-2 cursor-pointer"
                    title={`Load "${layout.name}"`}
                  >
                    {layout.name}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${layout.name}"?`)) {
                        onDeleteLayout(layout.id);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title="Delete layout"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 border-t border-border bg-card/50">
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to clear the entire page?')) {
              localStorage.removeItem('skillprint-dnd-blocks');
              window.location.reload();
            }
          }}
          className="w-full py-3 px-4 border border-destructive text-destructive font-bold rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Reset Page
        </button>
      </div>
    </div>
  );
}


'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Block {
  id: string;
  type: string;
  props?: any;
}

interface BuilderContextType {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  addBlock: (type: string, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlockProps: (id: string, props: any) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: ReactNode }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('skillprint-dnd-blocks');
    if (saved) {
      try {
        setBlocks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved blocks', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('skillprint-dnd-blocks', JSON.stringify(blocks));
    }
  }, [blocks, isClient]);

  const addBlock = (type: string, index?: number) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: {}
    };

    setBlocks(prev => {
      if (typeof index === 'number') {
        const copy = [...prev];
        copy.splice(index, 0, newBlock);
        return copy;
      }
      return [...prev, newBlock];
    });
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const updateBlockProps = (id: string, props: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b));
  };

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <BuilderContext.Provider value={{
      blocks, setBlocks, activeId, setActiveId, addBlock, removeBlock, updateBlockProps
    }}>
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};

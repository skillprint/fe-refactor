'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Block {
  id: string;
  type: string;
  props?: any;
}

const DEFAULT_THEME = {
  primaryColor: '#543DEB',
  secondaryColor: '#05DF91',
  backgroundColor: '#f5f5f7',
  foregroundColor: '#1d1d1f',
  cardColor: '#ffffff',
  cardForegroundColor: '#1d1d1f',
  borderColor: '#d2d2d7',
  borderRadius: '1rem',
  fontFamily: 'Outfit'
};

interface BuilderContextType {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  addBlock: (type: string, index?: number) => void;
  removeBlock: (id: string) => void;
  updateBlockProps: (id: string, props: any) => void;
  theme: any;
  setTheme: React.Dispatch<React.SetStateAction<any>>;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider = ({ children }: { children: ReactNode }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [theme, setTheme] = useState<any>(DEFAULT_THEME);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedBlocks = localStorage.getItem('skillprint-dnd-blocks');
    if (savedBlocks) {
      try {
        setBlocks(JSON.parse(savedBlocks));
      } catch (e) {
        console.error('Failed to parse saved blocks', e);
      }
    }
    const savedTheme = localStorage.getItem('skillprint-dnd-theme');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Failed to parse saved theme', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('skillprint-dnd-blocks', JSON.stringify(blocks));
    }
  }, [blocks, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('skillprint-dnd-theme', JSON.stringify(theme));
    }
  }, [theme, isClient]);

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
      blocks, setBlocks, activeId, setActiveId, addBlock, removeBlock, updateBlockProps, theme, setTheme
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

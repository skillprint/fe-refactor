import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface BlockConfig {
  type: string;
  props?: any;
}

interface LayoutConfig {
  name: string;
  blocks: BlockConfig[];
  theme?: any;
}

interface LayoutCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (newLayout: any) => void;
  userId: string | null;
  currentTheme?: any;
}

const MODULE_INFO: Record<string, { name: string; icon: string; desc: string }> = {
  hero: { name: 'Hero Section', icon: '✨', desc: 'Welcome banner with action items' },
  progressBanner: { name: 'Progress Banner', icon: '📊', desc: 'Status banner tracking goals' },
  playbookWidget: { name: 'Playbook Widget', icon: '📖', desc: 'Guides for practicing skills' },
  skillprintGraph: { name: 'Skillprint Graph', icon: '🕸️', desc: 'Skills & moods footprint mesh' },
  gameSlider: { name: 'New Games Slider', icon: '🎮', desc: 'Game discovery slider' },
  explorer: { name: 'Mood/Skill Explorer', icon: '🧭', desc: 'Navigation cards for categories' },
  profileStats: { name: 'Profile Stats Row', icon: '📈', desc: 'Analytics score count' },
  skillBreakdown: { name: 'Skill Breakdown', icon: '💪', desc: 'Pillar metrics progress bars' },
  dynamicChart: { name: 'Dynamic Chart', icon: '📉', desc: 'Log trends tracker' }
};

const SUGGESTIONS = [
  {
    title: "Gamer Analytics Dashboard",
    desc: "Sleek dark indigo midnight theme with Inter font",
    prompt: "Create a dashboard for gamer metrics featuring a Hero Section, Profile Stats, and a Dynamic Chart for session duration trends. Make it a sleek dark blue/midnight theme with Inter font and standard rounded edges."
  },
  {
    title: "Focus & Cognitive Coach",
    desc: "Warm calm mint light theme with Outfit font",
    prompt: "Create a layout to track focus and cognitive skills with a Skillprint Graph, Skill Breakdown, Progress Banner, and a focus vs relax trend chart. Make it a warm, calm mint green light theme with Outfit font."
  },
  {
    title: "Engagement Portal",
    desc: "Futuristic neon cyber hacker theme with Mono font",
    prompt: "Create a welcome page with a Hero Section, New Games Slider, Mood/Skill Explorer, and a Playbook Widget. Make it a futuristic cyber tech theme with dark background, neon green primary accents, and Mono font."
  }
];

export default function LayoutCreatorModal({ isOpen, onClose, onSaveSuccess, userId, currentTheme }: LayoutCreatorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hi! I'm your Layout & Theme Assistant. Tell me what kind of layout page and style theme you'd like to build, or choose one of the inspirational starts below!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Selector tab for right panel: blocks sequence or theme styles
  const [rightTab, setRightTab] = useState<'blocks' | 'theme'>('blocks');

  // Proposed Layout State
  const [config, setConfig] = useState<LayoutConfig>({
    name: 'New Custom Layout',
    blocks: [
      { type: 'hero' },
      { type: 'progressBanner' }
    ],
    theme: currentTheme || {
      primaryColor: '#543DEB',
      secondaryColor: '#05DF91',
      backgroundColor: '#f5f5f7',
      foregroundColor: '#1d1d1f',
      cardColor: '#ffffff',
      cardForegroundColor: '#1d1d1f',
      borderColor: '#d2d2d7',
      borderRadius: '1rem',
      fontFamily: 'Outfit'
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: 'model',
          text: "Hi! I'm your Layout & Theme Assistant. Tell me what kind of layout page and style theme you'd like to build, or choose one of the inspirational starts below!"
        }
      ]);
      setChatInput('');
      setIsChatLoading(false);
      setIsSaving(false);
      setSaveError(null);
      setRightTab('blocks');
      setConfig({
        name: 'New Custom Layout',
        blocks: [
          { type: 'hero' },
          { type: 'progressBanner' }
        ],
        theme: currentTheme || {
          primaryColor: '#543DEB',
          secondaryColor: '#05DF91',
          backgroundColor: '#f5f5f7',
          foregroundColor: '#1d1d1f',
          cardColor: '#ffffff',
          cardForegroundColor: '#1d1d1f',
          borderColor: '#d2d2d7',
          borderRadius: '1rem',
          fontFamily: 'Outfit'
        }
      });
    }
  }, [isOpen, currentTheme]);

  if (!isOpen) return null;

  const handleSendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isChatLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInput('');
    setIsChatLoading(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/chat-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          currentConfig: config
        })
      });

      if (!response.ok) {
        throw new Error('AI Assistant returned an error');
      }

      const data = await response.json();

      if (data.updatedConfig) {
        setConfig(prev => ({
          ...prev,
          name: data.updatedConfig.name || prev.name,
          blocks: data.updatedConfig.blocks || prev.blocks,
          theme: data.updatedConfig.theme ? { ...prev.theme, ...data.updatedConfig.theme } : prev.theme
        }));
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: data.reply || "Layout and theme updated successfully."
      }]);

      if (data.triggerSave) {
        handleSaveConfig(data.updatedConfig || config);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `Sorry, I encountered an issue updating the layout: ${err.message}`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSaveConfig = async (configToSave = config) => {
    setIsSaving(true);
    setSaveError(null);

    // Give each block a unique ID for the DnD engine
    const blocksWithIds = configToSave.blocks.map(b => ({
      ...b,
      id: b.props?.id || `${b.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      props: b.props || {}
    }));

    try {
      const response = await fetch('/api/custom-layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'anonymous'
        },
        body: JSON.stringify({
          name: configToSave.name,
          blocks: blocksWithIds,
          theme: configToSave.theme
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      onSaveSuccess(data.layout);
      onClose();
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Block Manipulation Handlers
  const handleRemoveBlock = (indexToRemove: number) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === (config.blocks?.length || 0) - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setConfig(prev => {
      const copy = [...(prev.blocks || [])];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, blocks: copy };
    });
  };

  const colorFields = [
    { key: 'primaryColor', label: 'Primary Accent' },
    { key: 'secondaryColor', label: 'Secondary Accent' },
    { key: 'backgroundColor', label: 'Background Color' },
    { key: 'foregroundColor', label: 'Text Color' },
    { key: 'cardColor', label: 'Card Color' },
    { key: 'cardForegroundColor', label: 'Card Text Color' },
    { key: 'borderColor', label: 'Border Color' },
  ];

  // Dynamic CSS variables to preview the theme inside the modal's preview area!
  const previewThemeStyles = config.theme ? {
    '--primary': config.theme.primaryColor,
    '--secondary': config.theme.secondaryColor,
    '--background': config.theme.backgroundColor,
    '--foreground': config.theme.foregroundColor,
    '--card': config.theme.cardColor,
    '--card-foreground': config.theme.cardForegroundColor,
    '--border': config.theme.borderColor || config.theme.border,
    '--radius': config.theme.borderRadius,
    '--font-sans': config.theme.fontFamily ? `var(--font-${config.theme.fontFamily.toLowerCase()})` : undefined
  } : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col md:flex-row w-full max-w-5xl h-[85vh] bg-card text-card-foreground rounded-3xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Interface Panel */}
        <div className="flex-1 flex flex-col h-full border-r border-border min-w-0">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-card/30">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">AI Builder & Theme Designer</h2>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-secondary/5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`py-3 px-4.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted text-foreground border border-border rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center space-x-2 bg-muted p-3.5 rounded-2xl rounded-tl-none border border-border w-[60px] justify-center">
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Inspirations */}
          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Inspirational Starts</p>
            <div className="grid grid-cols-3 gap-2">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(item.prompt)}
                  className="text-left p-2.5 rounded-xl bg-card border border-border hover:border-primary/50 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  <div className="font-bold text-primary truncate">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 font-normal leading-normal">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage(chatInput);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to adjust layout or styling (e.g. 'change background to red')..."
                disabled={isChatLoading || isSaving}
                className="w-full pl-4 pr-12 py-3 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all text-foreground"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading || isSaving}
                className="absolute right-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-40 transition-all shadow cursor-pointer flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Layout Preview & Style Customizations Panel */}
        <div className="w-full md:w-[340px] lg:w-[380px] bg-muted/20 flex flex-col h-full shrink-0">
          
          {/* Section Selector Tab Header */}
          <div className="border-b border-border bg-card/30 flex p-2 gap-1">
            <button
              type="button"
              onClick={() => setRightTab('blocks')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                rightTab === 'blocks'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Blocks Layout
            </button>
            <button
              type="button"
              onClick={() => setRightTab('theme')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                rightTab === 'theme'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Theme Style
            </button>
          </div>

          {/* Config Detail Display */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            {/* Layout Name (always visible at top) */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Layout Title</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-semibold shadow-inner"
              />
            </div>

            {rightTab === 'blocks' ? (
              /* Blocks Layout Tab */
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Block Sequence</label>
                
                {config.blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-border rounded-2xl bg-card text-muted-foreground">
                    <span className="text-2xl mb-1">📭</span>
                    <p className="text-xs">No blocks added yet.</p>
                  </div>
                ) : (
                  /* Live rendering preview using themeStyles variable scoped container */
                  <div 
                    className="space-y-2 max-h-[300px] overflow-y-auto pr-1 p-2 bg-background border border-border rounded-2xl transition-colors duration-300"
                    style={previewThemeStyles as React.CSSProperties}
                  >
                    {config.blocks.map((block, idx) => {
                      const info = MODULE_INFO[block.type] || { name: block.type, icon: '📦', desc: 'Unknown block' };
                      const hasJumperId = block.type === 'dynamicChart' && block.props?.jumperId;
                      
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-card border border-border text-card-foreground rounded-xl shadow-sm group hover:border-primary/45 transition-all">
                          <span className="text-lg flex-shrink-0 text-primary">{info.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-card-foreground truncate">{info.name}</div>
                            {hasJumperId && (
                              <div className="text-[8px] text-primary font-mono truncate">{block.props.jumperId}</div>
                            )}
                          </div>
                          {/* Control Actions */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveBlock(idx, 'up')}
                              className="p-1 text-[10px] hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === config.blocks.length - 1}
                              onClick={() => handleMoveBlock(idx, 'down')}
                              className="p-1 text-[10px] hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlock(idx)}
                              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Theme Style Tab */
              <div className="space-y-4">
                {/* Typography Selector */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Font Family</label>
                  <select
                    value={config.theme?.fontFamily || 'Outfit'}
                    onChange={(e) => setConfig({
                      ...config,
                      theme: { ...config.theme, fontFamily: e.target.value }
                    })}
                    className="w-full mt-1 px-3 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Outfit">Outfit (Clean Sans)</option>
                    <option value="Inter">Inter (Classic Geometrical)</option>
                    <option value="Mono">Mono (Tech Coding)</option>
                  </select>
                </div>

                {/* Border Radius roundedness */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rounded Corners</label>
                  <select
                    value={config.theme?.borderRadius || '1rem'}
                    onChange={(e) => setConfig({
                      ...config,
                      theme: { ...config.theme, borderRadius: e.target.value }
                    })}
                    className="w-full mt-1 px-3 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="0px">None (Sharp Edges)</option>
                    <option value="0.25rem">Small (Rounded)</option>
                    <option value="0.5rem">Medium (Classic)</option>
                    <option value="1rem">Large (Pill Rounded)</option>
                    <option value="1.5rem">Max (Extra Soft)</option>
                  </select>
                </div>

                {/* Color Pickers Matrix */}
                <div className="space-y-3 pt-2 border-t border-border/80">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Palette Customization</span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    {colorFields.map(field => (
                      <div key={field.key} className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground font-semibold leading-none">{field.label}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="color"
                            value={config.theme?.[field.key] || '#ffffff'}
                            onChange={(e) => setConfig({
                              ...config,
                              theme: { ...config.theme, [field.key]: e.target.value }
                            })}
                            className="w-7 h-7 rounded border border-border cursor-pointer flex-shrink-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={config.theme?.[field.key] || ''}
                            onChange={(e) => setConfig({
                              ...config,
                              theme: { ...config.theme, [field.key]: e.target.value }
                            })}
                            className="w-full px-1.5 py-1 text-[10px] font-mono bg-card border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200">
                {saveError}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-border bg-card flex flex-col gap-2">
            <button
              onClick={() => handleSaveConfig()}
              disabled={isSaving || config.blocks.length === 0 || !config.name.trim()}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Layout...
                </>
              ) : 'Save & Apply Layout'}
            </button>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full py-2 bg-secondary text-secondary-foreground font-semibold text-xs rounded-xl hover:bg-secondary/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

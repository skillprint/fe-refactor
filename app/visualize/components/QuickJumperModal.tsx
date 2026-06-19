import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface JumperConfig {
  label: string;
  modelName: string;
  fields: string[];
  daysOffset: number;
  chart: 'Bar' | 'Line' | 'Area' | 'BarLine' | 'Pie' | 'Scatter' | 'RangeBand' | 'Radar' | 'DailyBreakdown';
  compPeriods: number;
  compCohort: boolean;
}

interface QuickJumperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (newJumper: any) => void;
  userId: string | null;
}

const SUGGESTIONS = [
  {
    title: "Focus & Relax Trend",
    desc: "Line chart of focus vs relax over 30 days",
    prompt: "Create a line chart showing focus and relax fields from MoodData for the last 30 days."
  },
  {
    title: "Cognitive Skill Profile",
    desc: "Radar of key cognitive abilities vs cohort",
    prompt: "Create a Radar chart with attention, memory, and planning from CognitionData for the last 7 days compared with all users cohort."
  },
  {
    title: "Weekly Session telemetry",
    desc: "Bar + Line of session metrics vs prev period",
    prompt: "Create a Bar + Line chart showing session duration and telemetry events for the last 7 days, with 1 previous period comparison."
  },
  {
    title: "Daily Focus Grid",
    desc: "Focus intensity weekly grid",
    prompt: "Create a Daily Breakdown weekly grid for the focus field from MoodData."
  }
];

const MODELS_MAP: Record<string, string[]> = {
  'Session': ['duration', 'score', 'telemetry_events'],
  'Game': ['priority', 'suggested_duration', 'total_players'],
  'SkillPrintProfile': ['total_sessions', 'total_time_played', 'avg_flow_score', 'flow_confidence'],
  'GameChunkAnalysis': ['processing_attempts', 'flow_llm_score', 'skill_llm_score'],
  'Survey': ['score', 'completion_time'],
  'Favorite': ['total_favorites', 'active_favorites'],
  'MoodData': ['relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe'],
  'CognitionData': ['pattern_matching', 'attention', 'memory', 'planning', 'task_switching', 'math', 'deduction', 'visualization', 'verbal', 'timing', 'perceptual_speed', 'knowledge', 'action', 'spatial'],
  'PersonalityData': ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability']
};

const CHART_TYPES = ['Bar', 'Line', 'Area', 'BarLine', 'Pie', 'Scatter', 'RangeBand', 'Radar', 'DailyBreakdown'];

export default function QuickJumperModal({ isOpen, onClose, onSaveSuccess, userId }: QuickJumperModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hi! I'm your Data Visualization chatbot. Describe what kind of chart you'd like to build, which model fields to include, and the timeframe. I'll configure a custom Quick Jumper for you!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Live Jumper Configuration state
  const [config, setConfig] = useState<JumperConfig>({
    label: 'Custom Visualization',
    modelName: 'MoodData',
    fields: ['focus'],
    daysOffset: 30,
    chart: 'Line',
    compPeriods: 0,
    compCohort: false
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
          text: "Hi! I'm your Data Visualization chatbot. Describe what kind of chart you'd like to build, which model fields to include, and the timeframe. I'll configure a custom Quick Jumper for you!"
        }
      ]);
      setChatInput('');
      setIsChatLoading(false);
      setIsSaving(false);
      setSaveError(null);
      setConfig({
        label: 'Custom Visualization',
        modelName: 'MoodData',
        fields: ['focus'],
        daysOffset: 30,
        chart: 'Line',
        compPeriods: 0,
        compCohort: false
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isChatLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInput('');
    setIsChatLoading(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/chat-jumper', {
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
          ...data.updatedConfig
        }));
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: data.reply || "Configuration updated successfully."
      }]);

      if (data.triggerSave) {
        // Trigger save if model recommends it
        handleSaveConfig(data.updatedConfig || config);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `Sorry, I encountered an issue updating the configuration: ${err.message}`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSaveConfig = async (configToSave = config) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/quick-jumpers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'anonymous'
        },
        body: JSON.stringify(configToSave)
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      onSaveSuccess(data.jumper);
      onClose();
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col md:flex-row w-full max-w-5xl h-[85vh] bg-card text-card-foreground rounded-3xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Chat Interface Side */}
        <div className="flex-1 flex flex-col h-full border-r border-border min-w-0">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">AI Chart Creator (Alpha)</h2>
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
                  className={`py-3 px-4.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted text-muted-foreground border border-border rounded-tl-none'
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

          {/* Suggested Inspirations (shows inside modal bottom area) */}
          <div className="p-4 bg-muted/40 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Inspirations</p>
            <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(item.prompt)}
                  className="text-left p-2.5 rounded-xl bg-card border border-border hover:border-primary/50 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="font-bold text-primary">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</div>
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
                placeholder="Ask AI to design a chart (e.g. 'relax trend as a line chart')..."
                disabled={isChatLoading || isSaving}
                className="w-full pl-4 pr-12 py-3 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all"
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

        {/* Live Config & Save Panel */}
        <div className="w-full md:w-[320px] lg:w-[360px] bg-muted/30 flex flex-col h-full">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Live Config Preview</h3>
            <button
              onClick={onClose}
              className="hidden md:block text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Config Detail Display */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="space-y-4">

              {/* Chart Label */}
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase">Jumper Label</label>
                <input
                  type="text"
                  value={config.label}
                  onChange={(e) => setConfig({ ...config, label: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Data Model */}
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase">Data Model</label>
                <select
                  value={config.modelName}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    setConfig({
                      ...config,
                      modelName: newModel,
                      fields: [MODELS_MAP[newModel]?.[0] || '']
                    });
                  }}
                  className="w-full mt-1.5 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.keys(MODELS_MAP).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Chart Style */}
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase">Chart Style</label>
                <select
                  value={config.chart}
                  onChange={(e) => setConfig({ ...config, chart: e.target.value as any })}
                  className="w-full mt-1.5 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CHART_TYPES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Fields List */}
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase">Plotted Fields</label>
                <div className="mt-1.5 p-3 bg-card border border-border rounded-xl space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {(MODELS_MAP[config.modelName] || []).map(field => {
                    const isChecked = config.fields.includes(field);
                    return (
                      <label key={field} className="flex items-center space-x-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              if (config.fields.length > 1) {
                                setConfig({
                                  ...config,
                                  fields: config.fields.filter(f => f !== field)
                                });
                              }
                            } else {
                              setConfig({
                                ...config,
                                fields: [...config.fields, field]
                              });
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <span>{field}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Timeframe & Comparisons */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase font-mono">Timeframe</label>
                  <select
                    value={config.daysOffset}
                    onChange={(e) => setConfig({ ...config, daysOffset: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={180}>180 Days</option>
                    <option value={365}>365 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase font-mono">Compare</label>
                  <select
                    value={config.compPeriods}
                    onChange={(e) => setConfig({ ...config, compPeriods: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={0}>None</option>
                    <option value={1}>1 Period</option>
                    <option value={2}>2 Periods</option>
                    <option value={3}>3 Periods</option>
                  </select>
                </div>
              </div>

              {/* Cohort Comparison */}
              <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                <label htmlFor="modal-compare-cohort" className="text-xs text-muted-foreground font-semibold uppercase cursor-pointer select-none">
                  Compare Cohort (All Users)
                </label>
                <input
                  id="modal-compare-cohort"
                  type="checkbox"
                  checked={config.compCohort}
                  onChange={(e) => setConfig({ ...config, compCohort: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200">
                {saveError}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-border bg-card/50 flex flex-col gap-2">
            <button
              onClick={() => handleSaveConfig()}
              disabled={isSaving || config.fields.length === 0}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Graph...
                </>
              ) : 'Save & Apply Jumper'}
            </button>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full py-2 bg-secondary text-secondary-foreground font-semibold text-xs rounded-xl hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

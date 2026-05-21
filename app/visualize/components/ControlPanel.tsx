import React from 'react';
import { MODEL_FILTERS, MODEL_FIELDS } from '../utils/syntheticData';

interface ControlPanelProps {
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  selectedFields: string[];
  setSelectedFields: (val: string[]) => void;
  availableFields: string[];
  filters: Record<string, string>;
  setFilters: (val: Record<string, string>) => void;
  chartType: string;
  setChartType: (val: any) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (val: { start: Date; end: Date }) => void;
  comparePeriods: number;
  setComparePeriods: (val: number) => void;
  compareCohort: boolean;
  setCompareCohort: (val: boolean) => void;
  onGenerate: (overrides?: any) => void;
  isGenerating: boolean;
}

const MODELS = Object.keys(MODEL_FIELDS);

export default function ControlPanel({
  selectedModel, setSelectedModel,
  selectedFields, setSelectedFields,
  availableFields,
  filters, setFilters,
  chartType, setChartType,
  dateRange, setDateRange,
  comparePeriods, setComparePeriods,
  compareCohort, setCompareCohort,
  onGenerate, isGenerating
}: ControlPanelProps) {
  
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, start: new Date(e.target.value) });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, end: new Date(e.target.value) });
  };

  const toInputDate = (date: Date) => {
    try {
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const handleFieldToggle = (field: string) => {
    if (selectedFields.includes(field)) {
      if (selectedFields.length > 1) {
        setSelectedFields(selectedFields.filter(f => f !== field));
      }
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const applyJumper = (
    modelName: string, 
    fields: string[], 
    daysOffset: number, 
    chart: any, 
    compPeriods: number, 
    compCohort: boolean
  ) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysOffset);

    setSelectedModel(modelName);
    setSelectedFields(fields);
    setFilters({});
    setDateRange({ start, end });
    setComparePeriods(compPeriods);
    setCompareCohort(compCohort);
    setChartType(chart);
    
    onGenerate({
      modelName,
      selectedFields: fields,
      filters: {},
      startDate: start,
      endDate: end,
      comparePeriods: compPeriods,
      compareCohort: compCohort,
      chartType: chart
    });
  };

  const jumpers = [
    {
      id: 'default',
      label: 'Select a quick jumper...',
      action: null
    },
    // Home & Summary
    {
      id: 'home_footprint_mood',
      label: 'Home: Mood Footprint (Radar)',
      action: () => applyJumper('MoodData', ['relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe'], 7, 'Radar', 1, true)
    },
    {
      id: 'home_footprint_cognition',
      label: 'Home: Cognition Footprint (Radar)',
      action: () => applyJumper('CognitionData', ['memory', 'attention', 'pattern_matching', 'planning', 'visualization', 'math', 'task_switching'], 7, 'Radar', 1, true)
    },
    {
      id: 'home_footprint_personality',
      label: 'Home: Personality Profile (Radar)',
      action: () => applyJumper('PersonalityData', ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability'], 30, 'Radar', 0, true)
    },
    {
      id: 'daily_breakdown',
      label: 'Home: Daily Breakdown (Weekly Grid)',
      action: () => applyJumper('MoodData', ['focus'], 7, 'DailyBreakdown', 0, false)
    },
    // Mood Pillar
    {
      id: 'focus_trend_weekly',
      label: 'Mood: Focus Trend (Weekly Bar vs Prev)',
      action: () => applyJumper('MoodData', ['focus'], 7, 'BarLine', 1, false)
    },
    {
      id: 'focus_vs_relax',
      label: 'Mood: Focus vs Relax (Monthly Line)',
      action: () => applyJumper('MoodData', ['focus', 'relax'], 30, 'Line', 0, false)
    },
    {
      id: 'grit_progression',
      label: 'Mood: Grit Progression (6-Month Range)',
      action: () => applyJumper('MoodData', ['grit'], 180, 'RangeBand', 0, false)
    },
    {
      id: 'creative_flow',
      label: 'Mood: Creative Flow (Monthly Line)',
      action: () => applyJumper('MoodData', ['creativity', 'joy', 'awe'], 30, 'Line', 0, false)
    },
    {
      id: 'empathy_collab',
      label: 'Mood: Empathy & Collaboration (Monthly Bar)',
      action: () => applyJumper('MoodData', ['empathy', 'collaborate'], 30, 'Bar', 1, false)
    },
    // Cognition Pillar
    {
      id: 'top_cognitive_weekly',
      label: 'Cognition: Top Skills (Weekly Pie)',
      action: () => applyJumper('CognitionData', ['memory', 'attention', 'task_switching', 'planning'], 7, 'Pie', 0, false)
    },
    {
      id: 'memory_vs_cohort',
      label: 'Cognition: Memory vs Cohort (Monthly Bar)',
      action: () => applyJumper('CognitionData', ['memory'], 30, 'Bar', 0, true)
    },
    {
      id: 'pattern_matching_consistency',
      label: 'Cognition: Pattern Matching Consistency (Scatter)',
      action: () => applyJumper('CognitionData', ['pattern_matching'], 30, 'Scatter', 0, false)
    },
    {
      id: 'task_switching_planning',
      label: 'Cognition: Task Switching vs Planning (6-Month Range)',
      action: () => applyJumper('CognitionData', ['task_switching', 'planning'], 180, 'RangeBand', 0, false)
    },
    {
      id: 'long_range_attention',
      label: 'Cognition: Long-Range Attention (Yearly Line vs Prev)',
      action: () => applyJumper('CognitionData', ['attention'], 365, 'Line', 1, false)
    },
    // Session & Gameplay
    {
      id: 'session_duration_monthly',
      label: 'Session: Duration Trends (Monthly Bar vs Prev)',
      action: () => applyJumper('Session', ['duration'], 30, 'BarLine', 1, false)
    },
    {
      id: 'telemetry_activity',
      label: 'Session: Telemetry Activity (Weekly Line)',
      action: () => applyJumper('Session', ['telemetry_events'], 7, 'Line', 0, false)
    },
    {
      id: 'game_popularity',
      label: 'Game: Priority vs Players (Monthly Scatter)',
      action: () => applyJumper('Game', ['priority', 'total_players'], 30, 'Scatter', 0, false)
    },
    {
      id: 'active_favorites_growth',
      label: 'Favorites: Active Growth (Monthly Line)',
      action: () => applyJumper('Favorite', ['active_favorites', 'total_favorites'], 30, 'Line', 0, false)
    },
    // Profiles & Analytics
    {
      id: 'flow_score_confidence',
      label: 'Profile: Flow Score vs Confidence (Monthly Range)',
      action: () => applyJumper('SkillPrintProfile', ['avg_flow_score', 'flow_confidence'], 30, 'RangeBand', 0, false)
    },
    {
      id: 'survey_completion',
      label: 'Survey: Completion Time (Weekly Bar)',
      action: () => applyJumper('Survey', ['completion_time'], 7, 'Bar', 0, false)
    },
    {
      id: 'processing_quality',
      label: 'Analysis: Processing Quality (Monthly Bar)',
      action: () => applyJumper('GameChunkAnalysis', ['processing_attempts', 'flow_llm_score', 'skill_llm_score'], 30, 'Bar', 0, false)
    }
  ];

  const setDateRangePreset = (preset: 'Day' | 'Week' | 'Month' | '6M' | 'Year') => {
    const end = new Date();
    const start = new Date();
    switch (preset) {
      case 'Day': start.setDate(start.getDate() - 1); break;
      case 'Week': start.setDate(start.getDate() - 7); break;
      case 'Month': start.setMonth(start.getMonth() - 1); break;
      case '6M': start.setMonth(start.getMonth() - 6); break;
      case 'Year': start.setFullYear(start.getFullYear() - 1); break;
    }
    setDateRange({ start, end });
  };

  return (
    <div className="bg-card text-card-foreground rounded-3xl p-6 shadow-sm border border-border space-y-6">
      
      {/* Quick Jumpers */}
      <div className="space-y-2 pb-4 border-b border-border">
        <label className="text-sm font-bold text-primary flex items-center gap-2">
          ⚡ Quick Jumpers
        </label>
        <select 
          onChange={(e) => {
            const jumper = jumpers.find(j => j.id === e.target.value);
            if (jumper && jumper.action) {
              jumper.action();
              e.target.value = 'default';
            }
          }}
          defaultValue="default"
          className="flex h-10 w-full items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {jumpers.map(j => (
            <option key={j.id} value={j.id}>{j.label}</option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Data Model
        </label>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Field Selection */}
      {availableFields.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-sm font-medium leading-none">
            Fields to Plot
          </label>
          <div className="flex flex-col space-y-2 mt-2">
            {availableFields.map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={`field-${field}`}
                  checked={selectedFields.includes(field)}
                  onChange={() => handleFieldToggle(field)}
                  className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label htmlFor={`field-${field}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {field}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Filters */}
      {MODEL_FILTERS[selectedModel] && MODEL_FILTERS[selectedModel].length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-sm font-medium leading-none">
            Data Filters
          </label>
          <div className="flex flex-col space-y-3 mt-2">
            {MODEL_FILTERS[selectedModel].map((filterKey) => (
              <div key={filterKey} className="flex flex-col space-y-1">
                <label className="text-xs text-muted-foreground capitalize">{filterKey.replace('_', ' ')}</label>
                <input 
                  type="text"
                  placeholder={`Filter by ${filterKey}...`}
                  value={filters[filterKey] || ''}
                  onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Type Selection */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-sm font-medium leading-none">
          Visualization Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Bar', 'Line', 'Area', 'BarLine', 'RangeBand', 'Scatter', 'Pie', 'Radar', 'DailyBreakdown'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type as any)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-2 py-2 ${
                chartType === type 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {type === 'RangeBand' ? 'Range Band' : type === 'DailyBreakdown' ? 'Daily Breakdown' : type === 'BarLine' ? 'Bar + Line' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none">
            Date Range
          </label>
          <div className="flex gap-1">
            {['Day', 'Week', 'Month', '6M', 'Year'].map(preset => (
              <button 
                key={preset}
                onClick={() => setDateRangePreset(preset as any)}
                className="text-[10px] px-2 py-1 rounded-md bg-secondary/20 hover:bg-secondary/40 text-secondary-foreground"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <input 
            type="date" 
            value={toInputDate(dateRange.start)}
            onChange={handleStartChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="text-center text-sm text-muted-foreground">to</div>
          <input 
            type="date" 
            value={toInputDate(dateRange.end)}
            onChange={handleEndChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Comparisons */}
      <div className="space-y-3 pt-4 border-t border-border">
        <label className="text-sm font-medium leading-none">
          Comparisons
        </label>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Previous Periods to Compare</label>
          <select 
            value={comparePeriods}
            onChange={(e) => setComparePeriods(parseInt(e.target.value, 10))}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value={0}>None</option>
            <option value={1}>1 Period (-1W)</option>
            <option value={2}>2 Periods (-2W)</option>
            <option value={3}>3 Periods (-3W)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="compareCohort" 
            checked={compareCohort}
            onChange={(e) => setCompareCohort(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label htmlFor="compareCohort" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Cohort (All Users)
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isGenerating ? 'Synthesizing...' : 'Generate Data'}
        </button>
      </div>

    </div>
  );
}

import React from 'react';
import { MODEL_FILTERS } from '../utils/syntheticData';

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
  comparePrevious: boolean;
  setComparePrevious: (val: boolean) => void;
  compareCohort: boolean;
  setCompareCohort: (val: boolean) => void;
  onGenerate: (overrides?: any) => void;
  isGenerating: boolean;
}

const MODELS = [
  'Session', 
  'Game', 
  'SkillPrintProfile', 
  'GameChunkAnalysis', 
  'Survey', 
  'Favorite'
];

export default function ControlPanel({
  selectedModel, setSelectedModel,
  selectedFields, setSelectedFields,
  availableFields,
  filters, setFilters,
  chartType, setChartType,
  dateRange, setDateRange,
  comparePrevious, setComparePrevious,
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

  const jumpers = [
    {
      id: 'default',
      label: 'Select a quick jumper...',
      action: null
    },
    {
      id: 'hextris_month',
      label: 'Total Game Sessions of Hextris (Last Month)',
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);

        setSelectedModel('Session');
        setSelectedFields(['duration']);
        setFilters({ game_id: 'hextris' });
        setDateRange({ start, end });
        setComparePrevious(false);
        setCompareCohort(false);
        setChartType('Bar');
        
        onGenerate({
          modelName: 'Session',
          selectedFields: ['duration'],
          filters: { game_id: 'hextris' },
          startDate: start,
          endDate: end,
          comparePrevious: false,
          compareCohort: false,
          chartType: 'Bar'
        });
      }
    },
    {
      id: 'hextris_month_prev',
      label: 'Hextris Sessions vs Prev Period (Last Month)',
      action: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);

        setSelectedModel('Session');
        setSelectedFields(['duration']);
        setFilters({ game_id: 'hextris' });
        setDateRange({ start, end });
        setComparePrevious(true);
        setCompareCohort(false);
        setChartType('Bar');
        
        onGenerate({
          modelName: 'Session',
          selectedFields: ['duration'],
          filters: { game_id: 'hextris' },
          startDate: start,
          endDate: end,
          comparePrevious: true,
          compareCohort: false,
          chartType: 'Bar'
        });
      }
    }
  ];

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
          {['Bar', 'Line', 'RangeBand', 'Scatter', 'Pie'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type as any)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-2 py-2 ${
                chartType === type 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {type === 'RangeBand' ? 'Range Band' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="space-y-3 pt-2 border-t border-border">
        <label className="text-sm font-medium leading-none">
          Date Range
        </label>
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
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="comparePrevious" 
            checked={comparePrevious}
            onChange={(e) => setComparePrevious(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label htmlFor="comparePrevious" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Previous Period
          </label>
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

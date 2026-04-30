import React from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DataPoint } from '../utils/syntheticData';

interface DynamicChartProps {
  data: DataPoint[];
  type: 'Bar' | 'Line' | 'Pie' | 'Scatter' | 'RangeBand' | 'Radar' | 'DailyBreakdown';
  selectedFields: string[];
  comparePrevious: boolean;
  compareCohort: boolean;
}

const THEME_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--accent)',
  'var(--destructive)',
];

export default function DynamicChart({ data, type, selectedFields, comparePrevious, compareCohort }: DynamicChartProps) {
  
  const formatFieldLabel = (field: string) => {
    const formatted = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const mindHealthTraits = [
      'relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe',
      'pattern_matching', 'attention', 'memory', 'planning', 'task_switching', 'math', 'deduction', 'visualization', 'verbal', 'timing', 'perceptual_speed', 'knowledge', 'action', 'spatial',
      'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability'
    ];

    if (field.includes('duration') || field.includes('time')) return `${formatted} (s)`;
    if (field.includes('score') || field.includes('confidence') || mindHealthTraits.includes(field)) return `${formatted} (Score)`;
    if (field.includes('events') || field.includes('sessions') || field.includes('attempts') || field.includes('players') || field.includes('favorites')) return `${formatted} (Count)`;
    if (field === 'priority') return `${formatted} (Rank)`;
    
    return formatted;
  };
  
  const renderTooltip = () => {
    return (
      <Tooltip 
        wrapperStyle={{ zIndex: 100 }}
        contentStyle={{ 
          backgroundColor: 'var(--card, #ffffff)', 
          borderColor: 'var(--border)',
          borderRadius: '0.75rem',
          color: 'var(--foreground)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
      />
    );
  };

  const renderAxes = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      <XAxis 
        dataKey="label" 
        tick={{ fill: 'var(--muted-foreground)' }} 
        axisLine={{ stroke: 'var(--border)' }}
        tickLine={false}
        minTickGap={30}
      />
      <YAxis 
        tick={{ fill: 'var(--muted-foreground)' }} 
        axisLine={false}
        tickLine={false}
        minTickGap={20}
        width={50}
        tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)}
      />
      {renderTooltip()}
      <Legend wrapperStyle={{ paddingTop: '20px' }} />
    </>
  );

  if (type === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;
            
            return (
              <React.Fragment key={field}>
                <Bar dataKey={field} name={formatFieldLabel(field)} fill={color} radius={[4, 4, 0, 0]} />
                {comparePrevious && (
                  <Bar dataKey={`${field}_previous`} name={`${formatFieldLabel(field)} (Prev)`} fill={prevColor} radius={[4, 4, 0, 0]} />
                )}
                {compareCohort && (
                  <Bar dataKey={`${field}_cohort`} name={`${formatFieldLabel(field)} (Cohort)`} fill={cohortColor} radius={[4, 4, 0, 0]} />
                )}
              </React.Fragment>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'Line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

            return (
              <React.Fragment key={field}>
                <Line type="monotone" dataKey={field} name={formatFieldLabel(field)} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                {comparePrevious && (
                  <Line type="monotone" dataKey={`${field}_previous`} name={`${formatFieldLabel(field)} (Prev)`} stroke={prevColor} strokeWidth={2} strokeDasharray="5 5" />
                )}
                {compareCohort && (
                  <Line type="monotone" dataKey={`${field}_cohort`} name={`${formatFieldLabel(field)} (Cohort)`} stroke={cohortColor} strokeWidth={2} strokeDasharray="3 3" />
                )}
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'RangeBand') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

            return (
              <React.Fragment key={field}>
                <Bar 
                  dataKey={`${field}_range`}
                  name={`${formatFieldLabel(field)} Range`} 
                  fill={color} 
                  fillOpacity={0.5} 
                  barSize={16}
                  radius={[4, 4, 4, 4]}
                />
                <Scatter 
                  dataKey={field} 
                  name={`${formatFieldLabel(field)} Median`} 
                  fill={color} 
                  shape="circle"
                />
                {comparePrevious && (
                  <Scatter dataKey={`${field}_previous`} name={`${formatFieldLabel(field)} (Prev)`} fill={prevColor} shape="cross" />
                )}
                {compareCohort && (
                  <Scatter dataKey={`${field}_cohort`} name={`${formatFieldLabel(field)} (Cohort)`} fill={cohortColor} shape="diamond" />
                )}
              </React.Fragment>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'Pie') {
    let pieData: any[] = [];
    
    if (comparePrevious || compareCohort) {
      selectedFields.forEach((field, i) => {
        const color = THEME_COLORS[i % THEME_COLORS.length];
        const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
        const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

        const totalCurrent = data.reduce((acc, curr) => acc + (curr[field] || 0), 0);
        pieData.push({ name: `${formatFieldLabel(field)} Total`, value: totalCurrent, fill: color });
        
        if (comparePrevious) {
          const totalPrev = data.reduce((acc, curr) => acc + (curr[`${field}_previous`] || 0), 0);
          pieData.push({ name: `${formatFieldLabel(field)} Prev`, value: totalPrev, fill: prevColor });
        }
        
        if (compareCohort) {
          const totalCohort = data.reduce((acc, curr) => acc + (curr[`${field}_cohort`] || 0), 0);
          pieData.push({ name: `${formatFieldLabel(field)} Cohort`, value: totalCohort, fill: cohortColor });
        }
      });
    } else {
      const primaryField = selectedFields[0];
      pieData = data.slice(0, 10).map((d, i) => ({
        name: d.label,
        value: d[primaryField] || 0,
        fill: THEME_COLORS[i % THEME_COLORS.length]
      }));
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {renderTooltip()}
          <Legend />
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            dataKey="value"
            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'Scatter') {
    const scatterData = data.map((d, i) => ({ ...d, index: i }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            type="category" 
            dataKey="label" 
            name="Date" 
            tick={{ fill: 'var(--muted-foreground)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            type="number" 
            tick={{ fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
            width={50}
            tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)}
          />
          {renderTooltip()}
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

            return (
              <React.Fragment key={field}>
                <Scatter name={formatFieldLabel(field)} data={scatterData} fill={color} dataKey={field} />
                {comparePrevious && (
                  <Scatter name={`${formatFieldLabel(field)} (Prev)`} data={scatterData} fill={prevColor} dataKey={`${field}_previous`} shape="cross" />
                )}
                {compareCohort && (
                  <Scatter name={`${formatFieldLabel(field)} (Cohort)`} data={scatterData} fill={cohortColor} dataKey={`${field}_cohort`} shape="diamond" />
                )}
              </React.Fragment>
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'Radar') {
    // For Radar, we average the selected fields across all data points
    const radarData = selectedFields.map(field => {
      const avgCurrent = data.reduce((acc, curr) => acc + (curr[field] || 0), 0) / (data.length || 1);
      const dataPoint: any = { subject: field, value: Math.round(avgCurrent) };
      
      if (comparePrevious) {
        const avgPrev = data.reduce((acc, curr) => acc + (curr[`${field}_previous`] || 0), 0) / (data.length || 1);
        dataPoint.prevValue = Math.round(avgPrev);
      }
      if (compareCohort) {
        const avgCohort = data.reduce((acc, curr) => acc + (curr[`${field}_cohort`] || 0), 0) / (data.length || 1);
        dataPoint.cohortValue = Math.round(avgCohort);
      }
      return dataPoint;
    });

    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={(val) => formatFieldLabel(val).replace(' (Score)', '')} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)' }} />
          <Radar name="Current" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
          {comparePrevious && (
            <Radar name="Previous" dataKey="prevValue" stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={0.3} />
          )}
          {compareCohort && (
            <Radar name="Cohort" dataKey="cohortValue" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.3} />
          )}
          {renderTooltip()}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'DailyBreakdown') {
    // Synthesize columns for Mood, Cognition, Sessions based on the data provided
    // For a real app, this would use specific aggregated fields. Here we mock it based on the primary data points.
    return (
      <div className="w-full h-full flex flex-col pt-4 overflow-auto">
        <div className="grid grid-cols-4 gap-4 mb-4 border-b border-border pb-2 px-2">
          <div className="text-sm font-semibold text-muted-foreground uppercase">Day</div>
          <div className="text-sm font-semibold text-[var(--primary)] uppercase text-center">Mood</div>
          <div className="text-sm font-semibold text-[var(--secondary)] uppercase text-center">Cognition</div>
          <div className="text-sm font-semibold text-[var(--accent)] uppercase text-center">Sessions</div>
        </div>
        <div className="flex-grow space-y-2 overflow-y-auto pr-2">
          {data.map((d, i) => {
            const moodVal = d[selectedFields[0]] || 0;
            const cogVal = Math.max(0, Math.min(100, moodVal + (Math.random() * 20 - 10)));
            const sessionsVal = Math.max(0, Math.round(moodVal / 15));
            
            return (
              <div key={i} className="grid grid-cols-4 gap-4 items-center bg-muted/20 p-3 rounded-lg hover:bg-muted/40 transition-colors">
                <div className="font-medium text-sm">{d.label}</div>
                <div className="flex justify-center">
                  <div className="w-16 h-8 bg-primary/20 rounded flex items-center justify-center text-primary font-bold">
                    {moodVal > 0 ? Math.round(moodVal) : '—'}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-8 bg-secondary/20 rounded flex items-center justify-center text-secondary font-bold">
                    {cogVal > 0 ? Math.round(cogVal) : '—'}
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-16 h-8 bg-accent/20 rounded flex items-center justify-center text-accent font-bold">
                    {sessionsVal > 0 ? sessionsVal : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

import React from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DataPoint } from '../utils/syntheticData';

interface DynamicChartProps {
  data: DataPoint[];
  type: 'Bar' | 'Line' | 'Area' | 'BarLine' | 'Pie' | 'Scatter' | 'RangeBand' | 'Radar' | 'DailyBreakdown';
  selectedFields: string[];
  comparePeriods: number;
  compareCohort: boolean;
  yAxisLabel?: string;
}

const THEME_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--accent)',
  'var(--destructive)',
];

export default function DynamicChart({ data, type, selectedFields, comparePeriods, compareCohort, yAxisLabel }: DynamicChartProps) {
  
  const formatXAxisTick = (value: string, index: number) => {
    if (data && data.length === 7) {
      const dataPoint = data[index];
      if (dataPoint && dataPoint.date) {
        try {
          const dateObj = new Date(dataPoint.date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          }
        } catch (e) {
          // fallback to value
        }
      }
    }
    return value;
  };

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
        tickFormatter={formatXAxisTick}
      />
      <YAxis 
        tick={{ fill: 'var(--muted-foreground)' }} 
        axisLine={false}
        tickLine={false}
        minTickGap={20}
        width={yAxisLabel ? 65 : 50}
        tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)}
        label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)', style: { textAnchor: 'middle' } } : undefined}
      />
      {renderTooltip()}
      <Legend wrapperStyle={{ paddingTop: '20px' }} />
    </>
  );

  if (type === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: yAxisLabel ? 10 : 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;
            
            return (
              <React.Fragment key={field}>
                <Bar dataKey={field} name={formatFieldLabel(field)} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2} radius={[6, 6, 0, 0]} maxBarSize={44} />
                {Array.from({ length: comparePeriods }).map((_, p) => {
                  const pIndex = p + 1;
                  const opacity = Math.max(0.3, 1 - (pIndex * 0.2));
                  return (
                    <Bar key={`prev_${pIndex}`} dataKey={`${field}_previous_${pIndex}`} name={`${formatFieldLabel(field)} (-${pIndex}W)`} fill={prevColor} fillOpacity={opacity * 0.25} stroke={prevColor} strokeWidth={2} strokeOpacity={opacity} radius={[6, 6, 0, 0]} maxBarSize={44} />
                  );
                })}
                {compareCohort && (
                  <Bar dataKey={`${field}_cohort`} name={`${formatFieldLabel(field)} (Cohort)`} fill={cohortColor} fillOpacity={0.25} stroke={cohortColor} strokeWidth={2} radius={[6, 6, 0, 0]} maxBarSize={44} />
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
        <LineChart data={data} margin={{ top: 20, right: 30, left: yAxisLabel ? 10 : 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

            return (
              <React.Fragment key={field}>
                <Line type="monotone" dataKey={field} name={formatFieldLabel(field)} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                {Array.from({ length: comparePeriods }).map((_, p) => {
                  const pIndex = p + 1;
                  const strokeOp = Math.max(0.3, 1 - (pIndex * 0.2));
                  const dash = pIndex === 1 ? "5 5" : pIndex === 2 ? "3 3" : "1 4";
                  return (
                    <Line key={`prev_${pIndex}`} type="monotone" dataKey={`${field}_previous_${pIndex}`} name={`${formatFieldLabel(field)} (-${pIndex}W)`} stroke={prevColor} strokeOpacity={strokeOp} strokeWidth={2} strokeDasharray={dash} />
                  );
                })}
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

  if (type === 'Area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: yAxisLabel ? 10 : 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;
            const gradientId = `grad_${field}_${i}`;

            return (
              <React.Fragment key={field}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey={field} name={formatFieldLabel(field)} stroke={color} fill={`url(#${gradientId})`} strokeWidth={3} activeDot={{ r: 6 }} />
                {Array.from({ length: comparePeriods }).map((_, p) => {
                  const pIndex = p + 1;
                  const opacity = Math.max(0.1, 0.4 - (pIndex * 0.1));
                  const dash = pIndex === 1 ? "5 5" : pIndex === 2 ? "3 3" : "1 4";
                  const prevGradientId = `grad_${field}_prev_${pIndex}_${i}`;
                  return (
                    <React.Fragment key={`prev_${pIndex}`}>
                      <defs>
                        <linearGradient id={prevGradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={prevColor} stopOpacity={opacity}/>
                          <stop offset="95%" stopColor={prevColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey={`${field}_previous_${pIndex}`} name={`${formatFieldLabel(field)} (-${pIndex}W)`} stroke={prevColor} fill={`url(#${prevGradientId})`} strokeWidth={2} strokeDasharray={dash} />
                    </React.Fragment>
                  );
                })}
                {compareCohort && (
                  <React.Fragment key="cohort">
                    <defs>
                      <linearGradient id={`grad_${field}_cohort_${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cohortColor} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={cohortColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={`${field}_cohort`} name={`${formatFieldLabel(field)} (Cohort)`} stroke={cohortColor} fill={`url(#grad_${field}_cohort_${i})`} strokeWidth={2} strokeDasharray="3 3" />
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'BarLine') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: yAxisLabel ? 10 : 0, bottom: 0 }}>
          {renderAxes()}
          {selectedFields.map((field, i) => {
            const color = THEME_COLORS[i % THEME_COLORS.length];
            const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
            const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

            return (
              <React.Fragment key={field}>
                {i === 0 ? (
                  <Bar dataKey={field} name={formatFieldLabel(field)} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2} radius={[6, 6, 0, 0]} barSize={44} />
                ) : (
                  <Line type="monotone" dataKey={field} name={formatFieldLabel(field)} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                )}
                {Array.from({ length: comparePeriods }).map((_, p) => {
                  const pIndex = p + 1;
                  return (
                    <Line key={`prev_${pIndex}`} type="monotone" dataKey={`${field}_previous_${pIndex}`} name={`${formatFieldLabel(field)} (-${pIndex}W)`} stroke="var(--foreground)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--foreground)" }} activeDot={{ r: 6 }} />
                  );
                })}
                {compareCohort && (
                  <Line type="monotone" dataKey={`${field}_cohort`} name={`${formatFieldLabel(field)} (Cohort)`} stroke={cohortColor} strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                )}
              </React.Fragment>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'RangeBand') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: yAxisLabel ? 10 : 0, bottom: 0 }}>
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
                  barSize={32}
                  radius={[4, 4, 4, 4]}
                />
                <Scatter 
                  dataKey={field} 
                  name={`${formatFieldLabel(field)} Median`} 
                  fill={color} 
                  shape="circle"
                />
                {Array.from({ length: comparePeriods }).map((_, p) => {
                  const pIndex = p + 1;
                  const shapes = ["cross", "diamond", "square", "triangle"] as const;
                  const shape = shapes[(pIndex - 1) % shapes.length];
                  return (
                    <Scatter key={`prev_${pIndex}`} dataKey={`${field}_previous_${pIndex}`} name={`${formatFieldLabel(field)} (-${pIndex}W)`} fill={prevColor} fillOpacity={Math.max(0.3, 1 - (pIndex * 0.2))} shape={shape} />
                  );
                })}
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
    
    if (comparePeriods > 0 || compareCohort) {
      selectedFields.forEach((field, i) => {
        const color = THEME_COLORS[i % THEME_COLORS.length];
        const prevColor = `color-mix(in srgb, ${color} 45%, #a1a1aa)`;
        const cohortColor = `color-mix(in srgb, ${color} 20%, #d4d4d8)`;

        const totalCurrent = data.reduce((acc, curr) => acc + (curr[field] || 0), 0);
        pieData.push({ name: `${formatFieldLabel(field)} Total`, value: totalCurrent, fill: color });
        
        if (comparePeriods > 0) {
          Array.from({ length: comparePeriods }).forEach((_, p) => {
            const pIndex = p + 1;
            const totalPrev = data.reduce((acc, curr) => acc + (curr[`${field}_previous_${pIndex}`] || 0), 0);
            pieData.push({ name: `${formatFieldLabel(field)} (-${pIndex}W)`, value: totalPrev, fill: prevColor, opacity: Math.max(0.3, 1 - (pIndex * 0.2)) });
          });
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
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={entry.opacity || 1} />
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
        <ScatterChart margin={{ top: 20, right: 30, left: yAxisLabel ? 10 : 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis 
            type="category" 
            dataKey="label" 
            name="Date" 
            tick={{ fill: 'var(--muted-foreground)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            minTickGap={30}
            tickFormatter={formatXAxisTick}
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
                {Array.from({ length: comparePeriods }).map((_, p) => {
                  const pIndex = p + 1;
                  const shapes = ["cross", "diamond", "square", "triangle"] as const;
                  const shape = shapes[(pIndex - 1) % shapes.length];
                  return (
                    <Scatter key={`prev_${pIndex}`} name={`${formatFieldLabel(field)} (-${pIndex}W)`} data={scatterData} fill={prevColor} dataKey={`${field}_previous_${pIndex}`} shape={shape} fillOpacity={Math.max(0.3, 1 - (pIndex * 0.2))} />
                  );
                })}
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
      
      if (comparePeriods > 0) {
        Array.from({ length: comparePeriods }).forEach((_, p) => {
          const pIndex = p + 1;
          const avgPrev = data.reduce((acc, curr) => acc + (curr[`${field}_previous_${pIndex}`] || 0), 0) / (data.length || 1);
          dataPoint[`prevValue_${pIndex}`] = Math.round(avgPrev);
        });
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
          {Array.from({ length: comparePeriods }).map((_, p) => {
            const pIndex = p + 1;
            return (
              <Radar key={`prev_${pIndex}`} name={`-${pIndex}W`} dataKey={`prevValue_${pIndex}`} stroke="var(--muted-foreground)" fill="var(--muted-foreground)" fillOpacity={Math.max(0.1, 0.4 - (pIndex * 0.1))} />
            );
          })}
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

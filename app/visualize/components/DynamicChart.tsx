import React from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DataPoint } from '../utils/syntheticData';

interface DynamicChartProps {
  data: DataPoint[];
  type: 'Bar' | 'Line' | 'Pie' | 'Scatter' | 'RangeBand';
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
                <Bar dataKey={field} name={field} fill={color} radius={[4, 4, 0, 0]} />
                {comparePrevious && (
                  <Bar dataKey={`${field}_previous`} name={`${field} (Prev)`} fill={prevColor} radius={[4, 4, 0, 0]} />
                )}
                {compareCohort && (
                  <Bar dataKey={`${field}_cohort`} name={`${field} (Cohort)`} fill={cohortColor} radius={[4, 4, 0, 0]} />
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
                <Line type="monotone" dataKey={field} name={field} stroke={color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                {comparePrevious && (
                  <Line type="monotone" dataKey={`${field}_previous`} name={`${field} (Prev)`} stroke={prevColor} strokeWidth={2} strokeDasharray="5 5" />
                )}
                {compareCohort && (
                  <Line type="monotone" dataKey={`${field}_cohort`} name={`${field} (Cohort)`} stroke={cohortColor} strokeWidth={2} strokeDasharray="3 3" />
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
                  name={`${field} Range`} 
                  fill={color} 
                  fillOpacity={0.5} 
                  barSize={16}
                  radius={[4, 4, 4, 4]}
                />
                <Scatter 
                  dataKey={field} 
                  name={`${field} Median`} 
                  fill={color} 
                  shape="circle"
                />
                {comparePrevious && (
                  <Scatter dataKey={`${field}_previous`} name={`${field} (Prev)`} fill={prevColor} shape="cross" />
                )}
                {compareCohort && (
                  <Scatter dataKey={`${field}_cohort`} name={`${field} (Cohort)`} fill={cohortColor} shape="diamond" />
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
        pieData.push({ name: `${field} Total`, value: totalCurrent, fill: color });
        
        if (comparePrevious) {
          const totalPrev = data.reduce((acc, curr) => acc + (curr[`${field}_previous`] || 0), 0);
          pieData.push({ name: `${field} Prev`, value: totalPrev, fill: prevColor });
        }
        
        if (compareCohort) {
          const totalCohort = data.reduce((acc, curr) => acc + (curr[`${field}_cohort`] || 0), 0);
          pieData.push({ name: `${field} Cohort`, value: totalCohort, fill: cohortColor });
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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                <Scatter name={field} data={scatterData} fill={color} dataKey={field} />
                {comparePrevious && (
                  <Scatter name={`${field} (Prev)`} data={scatterData} fill={prevColor} dataKey={`${field}_previous`} shape="cross" />
                )}
                {compareCohort && (
                  <Scatter name={`${field} (Cohort)`} data={scatterData} fill={cohortColor} dataKey={`${field}_cohort`} shape="diamond" />
                )}
              </React.Fragment>
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

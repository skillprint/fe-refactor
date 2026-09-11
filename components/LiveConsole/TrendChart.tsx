import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';

export interface TrendSeries {
  key: string;
  label: string;
  colour: string;
}

interface TrendChartProps {
  data: Record<string, number | string>[];
  series: TrendSeries[];
  isClosed?: boolean;
  domain?: [number | string, number | string];
  emptyText?: string;
}

const tooltipStyle = {
  backgroundColor: 'var(--surface-box)',
  border: '1px solid var(--surface-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--ui-text)',
  fontSize: '12px',
  fontFamily: 'var(--font-mono)',
};

/** A line chart on the design tokens: one line per series, the last point marked once the session closes. */
export function TrendChart({ data, series, isClosed = false, domain = ['auto', 'auto'], emptyText = 'Waiting for trend data…' }: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="aa-chart aa-chart--recharts">
        <p className="aa-chart__empty">{emptyText}</p>
      </div>
    );
  }
  const last = data.length - 1;
  return (
    <div className="aa-chart aa-chart--recharts">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="time" hide />
          <YAxis domain={domain} width={40} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--ui-muted)', marginBottom: 4 }} itemStyle={{ fontWeight: 600 }} />
          {series.map(s => (
            <Line
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.label}
              stroke={s.colour}
              strokeWidth={2}
              isAnimationActive={false}
              activeDot={{ r: 3, fill: s.colour }}
              dot={(props: any) => {
                const isLast = props.index === last;
                if (isLast && isClosed) {
                  return <circle key={`${s.key}-${props.index}`} cx={props.cx} cy={props.cy} r={4} fill="var(--mint)" stroke="var(--surface-box)" strokeWidth={2} />;
                }
                if (props.index % 5 === 0 || isLast) {
                  return <circle key={`${s.key}-${props.index}`} cx={props.cx} cy={props.cy} r={2} fill={s.colour} stroke="none" />;
                }
                return <g key={`${s.key}-${props.index}`} />;
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLegend({ series }: { series: TrendSeries[] }) {
  return (
    <ul className="aa-legend" aria-label="Series">
      {series.map(s => (
        <li key={s.key}><i style={{ '--legend-colour': s.colour } as React.CSSProperties} aria-hidden="true" />{s.label}</li>
      ))}
    </ul>
  );
}

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { ChartDataPoint, MetricsFilter } from '../../hooks/useMetricsData';

interface MetricsChartProps {
    data: ChartDataPoint[];
    filters: MetricsFilter[];
    getColorForSlug: (slug: string) => string;
}

const CustomTooltip = ({ active, payload, label, getColorForSlug }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground border border-border shadow-md rounded-xl p-3 text-sm">
                <p className="font-bold mb-2 pb-1 border-b border-border text-xs uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center justify-between mb-1 gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color || getColorForSlug(entry.name) }}
                            />
                            <span className="capitalize">{entry.name}</span>
                        </div>
                        <span className="font-bold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function MetricsChart({ data, filters, getColorForSlug }: MetricsChartProps) {
    // If we have a filter with slugs, we stack by those slugs.
    const activeStackFilter = filters.find(f => f.type !== 'game' && f.slugs.length > 0);
    const stackKeys = activeStackFilter ? activeStackFilter.slugs : ['total'];

    return (
        <div className="h-[400px] w-full bg-card rounded-3xl p-6 shadow-sm border border-border">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barCategoryGap="20%"
                >
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        content={<CustomTooltip getColorForSlug={getColorForSlug} />}
                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    />

                    {stackKeys.map((key, index) => {
                        const isTop = index === stackKeys.length - 1;
                        const isBottom = index === 0;
                        const color = key === 'total' ? 'hsl(var(--primary))' : getColorForSlug(key);

                        return (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={color}
                                radius={
                                    stackKeys.length === 1
                                        ? [4, 4, 4, 4]
                                        : isTop
                                            ? [4, 4, 0, 0]
                                            : isBottom
                                                ? [0, 0, 4, 4]
                                                : [0, 0, 0, 0]
                                }
                            />
                        );
                    })}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

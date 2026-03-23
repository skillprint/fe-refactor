import { useMemo } from 'react';
import { useGamesBySkill } from './useGamesBySkill';
import { useGameSessions } from './useGameSessions';
import { GameSession } from '../lib/gameSessionUtils';

export type Timeframe = 'Day' | 'Week' | 'Month';
export type FilterType = 'mood' | 'skill' | 'game';

export interface MetricsFilter {
    type: FilterType;
    slugs: string[];
}

export interface ChartDataPoint {
    label: string;
    timestamp: number;
    total: number;
    [key: string]: any; // Allows for dynamic stacked keys (e.g. 'focus': 2, 'relax': 1)
}

export function useMetricsData(
    currentDate: Date,
    timeframe: Timeframe,
    filters: MetricsFilter[] = []
) {
    const { gamesByMood, gamesBySkill, moods, skills } = useGamesBySkill();
    const { sessions } = useGameSessions();

    // Create a fast lookup map for game to its moods and skills
    const gameMetadataMap = useMemo(() => {
        const map = new Map<string, { moods: string[], skills: string[], name: string }>();

        gamesByMood.forEach((g: any) => {
            map.set(g.slug, {
                moods: g.moods?.map((m: any) => m.slug) || [],
                skills: [],
                name: g.name
            });
        });

        gamesBySkill.forEach((g: any) => {
            const existing = map.get(g.slug);
            if (existing) {
                existing.skills = g.skills?.map((s: any) => s.slug) || [];
            } else {
                map.set(g.slug, {
                    moods: [],
                    skills: g.skills?.map((s: any) => s.slug) || [],
                    name: g.name
                });
            }
        });

        return map;
    }, [gamesByMood, gamesBySkill]);

    const chartData = useMemo(() => {
        // 1. Filter sessions
        let filteredSessions = sessions.filter((session) => {
            if (!session.completed) return false;
            const meta = gameMetadataMap.get(session.gameSlug);
            if (!meta) return true; // Keep if we don't know it

            // Apply all active filters
            for (const filter of filters) {
                if (filter.slugs.length === 0) continue; // Skip empty filters

                if (filter.type === 'game' && !filter.slugs.includes(session.gameSlug)) {
                    return false;
                }
                if (filter.type === 'mood' && !meta.moods.some(m => filter.slugs.includes(m))) {
                    return false;
                }
                if (filter.type === 'skill' && !meta.skills.some(s => filter.slugs.includes(s))) {
                    return false;
                }
            }
            return true;
        });

        // 2. Define Time Range based on currentDate and timeframe
        let startTimestamp: number;
        let endTimestamp: number;

        const startOfCurrentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();

        if (timeframe === 'Day') {
            startTimestamp = startOfCurrentDay;
            endTimestamp = startTimestamp + 24 * 60 * 60 * 1000 - 1;
        } else if (timeframe === 'Week') {
            // Assuming week starts on Sunday
            const dayOfWeek = currentDate.getDay();
            startTimestamp = startOfCurrentDay - dayOfWeek * 24 * 60 * 60 * 1000;
            endTimestamp = startTimestamp + 7 * 24 * 60 * 60 * 1000 - 1;
        } else { // Month
            startTimestamp = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
            endTimestamp = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        }

        // Filter by timestamp range
        filteredSessions = filteredSessions.filter(s => s.timestamp >= startTimestamp && s.timestamp <= endTimestamp);

        // 3. Aggregate into Buckets
        // If Day -> group by Hour. If Week -> group by Day. If Month -> group by Day.
        const bins = new Map<number, GameSession[]>(); // key: start timestamp of bin

        if (timeframe === 'Day') {
            for (let i = 0; i < 24; i++) {
                bins.set(startTimestamp + i * 60 * 60 * 1000, []);
            }
            filteredSessions.forEach(s => {
                const d = new Date(s.timestamp);
                const binStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime();
                if (bins.has(binStart)) bins.get(binStart)!.push(s);
            });
        } else if (timeframe === 'Week' || timeframe === 'Month') {
            const daysInPeriod = timeframe === 'Week' ? 7 : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            for (let i = 0; i < daysInPeriod; i++) {
                bins.set(startTimestamp + i * 24 * 60 * 60 * 1000, []);
            }
            filteredSessions.forEach(s => {
                const d = new Date(s.timestamp);
                const binStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                if (bins.has(binStart)) bins.get(binStart)!.push(s);
            });
        }

        // 4. Format into ChartDataPoint
        // Recharts needs an array of objects. We will build stacked properties based on the currently active filter type.
        // If multiple filters are active, we can just pick the first one to stack by (e.g. if filtering by mood, stack by mood).
        // If no filters, just total.
        const activeStackFilter = filters.find(f => f.slugs.length > 0);

        const result: ChartDataPoint[] = [];

        Array.from(bins.entries()).sort(([a], [b]) => a - b).forEach(([binTimestamp, binSessions]) => {
            const point: ChartDataPoint = {
                label: formatAxisLabel(binTimestamp, timeframe),
                timestamp: binTimestamp,
                total: binSessions.length,
            };

            if (activeStackFilter && activeStackFilter.type !== 'game') {
                // Build stack counts
                activeStackFilter.slugs.forEach(slug => { point[slug] = 0; });

                binSessions.forEach(session => {
                    const meta = gameMetadataMap.get(session.gameSlug);
                    if (!meta) return;

                    if (activeStackFilter.type === 'mood') {
                        meta.moods.forEach(m => {
                            if (activeStackFilter.slugs.includes(m)) {
                                point[m] = (point[m] || 0) + 1;
                            }
                        });
                    } else if (activeStackFilter.type === 'skill') {
                        meta.skills.forEach(s => {
                            if (activeStackFilter.slugs.includes(s)) {
                                point[s] = (point[s] || 0) + 1;
                            }
                        });
                    }
                });
            }

            result.push(point);
        });

        return result;

    }, [sessions, currentDate, timeframe, filters, gameMetadataMap]);

    return { chartData, moods, skills, games: gamesByMood.length > 0 ? gamesByMood : gamesBySkill, gameMetadataMap };
}

function formatAxisLabel(timestamp: number, timeframe: Timeframe): string {
    const d = new Date(timestamp);
    if (timeframe === 'Day') {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    } else if (timeframe === 'Week') {
        return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
        return d.toLocaleDateString('en-US', { day: 'numeric' });
    }
}

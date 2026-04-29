export interface DataPoint {
  date: string;
  label: string;
  [key: string]: any; // value, fieldName, fieldName_min, fieldName_max, previousValue, cohortValue
}

export const MODEL_FIELDS: Record<string, string[]> = {
  'Session': ['duration', 'score', 'telemetry_events'],
  'Game': ['priority', 'suggested_duration', 'total_players'],
  'SkillPrintProfile': ['total_sessions', 'total_time_played', 'avg_flow_score', 'flow_confidence'],
  'GameChunkAnalysis': ['processing_attempts', 'flow_llm_score', 'skill_llm_score'],
  'Survey': ['score', 'completion_time'],
  'Favorite': ['total_favorites', 'active_favorites']
};

export const MODEL_FILTERS: Record<string, string[]> = {
  'Session': ['game_id', 'user_id'],
  'GameChunkAnalysis': ['session_id'],
  'Survey': ['game_id', 'user_id', 'session_id'],
  'SkillPrintProfile': ['user_id'],
  'Favorite': ['game_id', 'user_id'],
  'GameScoringConfig': ['game_id'],
};

export interface SyntheticDataOptions {
  modelName: string;
  selectedFields: string[];
  chartType: string;
  startDate: Date;
  endDate: Date;
  comparePrevious: boolean;
  compareCohort: boolean;
  filters?: Record<string, string>;
}

export function generateSyntheticData({
  modelName,
  selectedFields,
  chartType,
  startDate,
  endDate,
  comparePrevious,
  compareCohort,
  filters = {},
}: SyntheticDataOptions): DataPoint[] {
  const data: DataPoint[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysToGenerate = diffDays > 0 ? diffDays + 1 : 1;

  // Base metrics by field to give the synthetic data realistic ranges
  const getFieldBase = (field: string) => {
    if (field.includes('duration') || field.includes('time')) return { base: 120, vol: 40 };
    if (field.includes('score') || field.includes('confidence')) return { base: 75, vol: 15 };
    if (field.includes('sessions') || field.includes('attempts')) return { base: 5, vol: 2 };
    if (field.includes('players') || field.includes('favorites')) return { base: 1000, vol: 200 };
    return { base: 50, vol: 10 };
  };

  for (let i = 0; i < daysToGenerate; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    const dataPoint: DataPoint = {
      date: currentDate.toISOString(),
      label: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    selectedFields.forEach((field) => {
      const { base, vol } = getFieldBase(field);
      const noise = (Math.random() * 2 - 1) * vol;
      const val = Math.max(0, Math.round(base + noise + (i * (vol / 10))));
      
      dataPoint[field] = val;

      if (chartType === 'RangeBand') {
        const spread = vol * 1.5;
        const min = Math.max(0, Math.round(val - spread + (Math.random() * vol * 0.5)));
        const max = Math.round(val + spread + (Math.random() * vol * 0.5));
        dataPoint[`${field}_range`] = [min, max];
      }

      if (comparePrevious) {
        const prevNoise = (Math.random() * 2 - 1) * vol;
        const trend = Math.random() > 0.5 ? 1.1 : 0.9;
        dataPoint[`${field}_previous`] = Math.max(0, Math.round((base * trend) + prevNoise));
      }

      if (compareCohort) {
        const cohortNoise = (Math.random() * 2 - 1) * (vol * 0.5);
        dataPoint[`${field}_cohort`] = Math.max(0, Math.round(base + cohortNoise));
      }
    });

    data.push(dataPoint);
  }

  return data;
}

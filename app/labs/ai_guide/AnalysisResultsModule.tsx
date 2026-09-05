import React, { useState } from 'react';
import { SkillScores } from '../../lib/skillprintSdk';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface AnalysisResultsModuleProps {
  skillScores?: SkillScores;
  skillScoresHistory?: { timestamp: number; scores: SkillScores }[];
  isSessionClosed?: boolean;
  gameSkills?: { name: string; slug: string }[];
}

export default function AnalysisResultsModule({ skillScores, skillScoresHistory = [], isSessionClosed = false, gameSkills = [] }: AnalysisResultsModuleProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Combine fetched scores with default game skills
  const displaySkills = React.useMemo(() => {
    const skillsMap: Record<string, { score: number, trend: number, confidence: number, name: string }> = {};
    
    // Initialize with game skills if provided
    gameSkills.forEach(skill => {
      // Use slug as the key (e.g. pattern-matching might be mapped to pattern_matching in scores, but let's handle the string representation)
      // The API returns skills with hyphens like 'pattern-matching', but metrics might use underscores depending on BE. Let's use name.
      const key = skill.slug.replace(/-/g, '_');
      skillsMap[key] = { score: 0, trend: 0, confidence: 0, name: skill.name };
    });

    // Override with actual scores if available
    if (skillScores && skillScores.metrics) {
      Object.entries(skillScores.metrics).forEach(([skillKey, metric]) => {
        skillsMap[skillKey] = {
          score: metric.score,
          trend: metric.trend,
          confidence: metric.confidence,
          name: skillsMap[skillKey]?.name || skillKey.replace(/_/g, ' ')
        };
      });
    }

    return skillsMap;
  }, [skillScores, gameSkills]);

  const hasSkills = Object.keys(displaySkills).length > 0;

  return (
    <div className="sp-card card--interactive relative overflow-visible p-4 flex flex-col mt-3 flex-grow" style={{ minHeight: '240px' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full z-30 border border-gray-700 shadow-md whitespace-nowrap">
        Skills
      </div>
      
      <div className="overflow-y-auto scrollbar-subtle flex-grow pr-2 mt-4 relative">
        {selectedSkill ? (
          <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-400 capitalize">{displaySkills[selectedSkill]?.name || selectedSkill.replace(/_/g, ' ')} Trend</h3>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider bg-gray-800 px-2 py-1 rounded border border-gray-700 hover:bg-gray-700"
              >
                ← Back
              </button>
            </div>
            
            <div className="flex-grow w-full min-h-[200px]">
              {skillScoresHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skillScoresHistory.map(h => ({
                    time: new Date(h.timestamp).toLocaleTimeString(),
                    score: h.scores.metrics[selectedSkill]?.score || 0,
                    trend: h.scores.metrics[selectedSkill]?.trend || 0,
                    confidence: h.scores.metrics[selectedSkill]?.confidence || 0
                  }))}>
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6b7280' }} width={30} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    />
                    <Line 
                      type="linear" 
                      dataKey="score" 
                      stroke="#60a5fa" 
                      strokeWidth={2} 
                      dot={(props: any) => {
                        const isLast = props.index === skillScoresHistory.length - 1;
                        if (isLast && isSessionClosed) {
                          return <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
                        }
                        if (props.index % 5 === 0 || isLast) {
                          return <circle key={props.index} cx={props.cx} cy={props.cy} r={1.5} fill={props.stroke} stroke="none" />;
                        }
                        return null;
                      }}
                      activeDot={{ r: 3, fill: '#60a5fa' }} 
                      isAnimationActive={true} 
                      animateNewValues={true}
                    />
                    <Line 
                      type="linear" 
                      dataKey="trend" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={(props: any) => {
                        const isLast = props.index === skillScoresHistory.length - 1;
                        if (isLast && isSessionClosed) {
                          return <circle key={`trend-${props.index}`} cx={props.cx} cy={props.cy} r={4} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
                        }
                        if (props.index % 5 === 0 || isLast) {
                          return <circle key={`trend-${props.index}`} cx={props.cx} cy={props.cy} r={1.5} fill={props.stroke} stroke="none" />;
                        }
                        return null;
                      }}
                      activeDot={{ r: 3, fill: '#10b981' }} 
                      isAnimationActive={true} 
                      animateNewValues={true}
                    />
                    <Line 
                      type="linear" 
                      dataKey="confidence" 
                      stroke="#a855f7" 
                      strokeWidth={2} 
                      dot={(props: any) => {
                        const isLast = props.index === skillScoresHistory.length - 1;
                        if (isLast && isSessionClosed) {
                          return <circle key={`conf-${props.index}`} cx={props.cx} cy={props.cy} r={4} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
                        }
                        if (props.index % 5 === 0 || isLast) {
                          return <circle key={`conf-${props.index}`} cx={props.cx} cy={props.cy} r={1.5} fill={props.stroke} stroke="none" />;
                        }
                        return null;
                      }}
                      activeDot={{ r: 3, fill: '#a855f7' }} 
                      isAnimationActive={true} 
                      animateNewValues={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-xs italic">
                  Waiting for trend data...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {!hasSkills ? (
              <p className="text-muted font-sm italic margin-none col-span-2">No skill scores available yet.</p>
            ) : (
              Object.entries(displaySkills).map(([skillKey, metric]) => (
                <div 
                  key={skillKey} 
                  onClick={() => setSelectedSkill(skillKey)}
                  className="sp-panel tone tone--blue px-1.5 py-1 radius-compact opacity-80 flex flex-col justify-between cursor-pointer hover:opacity-100 hover:bg-gray-800 transition-all border border-transparent hover:border-blue-500/30"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs capitalize truncate mr-1" title={metric.name}>{metric.name}</span>
                    <span className="font-mono text-xs">{metric.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 my-1">
                    <div
                      className="bg-blue-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-auto pt-1 text-[10px] text-gray-500 font-mono">
                    <span title="Trend">Trend: {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}</span>
                    <span title="Confidence">Confidence: {metric.confidence.toFixed(1)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

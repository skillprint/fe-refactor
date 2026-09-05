import React, { useState } from 'react';
import { MoodScores } from '../../lib/skillprintSdk';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface FlowStateModuleProps {
  moodScores?: MoodScores;
  moodScoresHistory?: { timestamp: number; scores: MoodScores }[];
  isSessionClosed?: boolean;
}

export default function FlowStateModule({ moodScores, moodScoresHistory = [], isSessionClosed = false }: FlowStateModuleProps) {
  const [selectedMetric, setSelectedMetric] = useState<'flowScore' | 'confidence' | null>(null);
  return (
    <div className="sp-card card--interactive relative overflow-visible p-0 flex flex-col mt-3">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-200 text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full z-30 border border-gray-700 shadow-md whitespace-nowrap">
        Flow State
      </div>
      
      <div className="overflow-y-auto scrollbar-subtle flex-grow pr-2 mt-4 relative">
        {selectedMetric ? (
          <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-semibold capitalize ${selectedMetric === 'flowScore' ? 'text-green-400' : 'text-blue-400'}`}>
                {selectedMetric === 'flowScore' ? 'Flow Score' : 'Confidence'} Trend
              </h3>
              <button 
                onClick={() => setSelectedMetric(null)}
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider bg-gray-800 px-2 py-1 rounded border border-gray-700 hover:bg-gray-700"
              >
                ← Back
              </button>
            </div>
            
            <div className="flex-grow w-full min-h-[150px]">
              {moodScoresHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodScoresHistory.map(h => ({
                    time: new Date(h.timestamp).toLocaleTimeString(),
                    value: selectedMetric === 'flowScore' ? h.scores.flowScore || 0 : h.scores.confidence || 0
                  }))}>
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6b7280' }} width={30} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: selectedMetric === 'flowScore' ? '#4ade80' : '#60a5fa', fontWeight: 'bold' }}
                      labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                    />
                    <Line 
                      type="linear" 
                      dataKey="value" 
                      stroke={selectedMetric === 'flowScore' ? '#4ade80' : '#60a5fa'} 
                      strokeWidth={2} 
                      dot={(props: any) => {
                        const isLast = props.index === moodScoresHistory.length - 1;
                        if (isLast && isSessionClosed) {
                          return <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1} />;
                        }
                        if (props.index % 5 === 0 || isLast) {
                          return <circle key={props.index} cx={props.cx} cy={props.cy} r={1.5} fill={props.stroke} stroke="none" />;
                        }
                        return null;
                      }}
                      activeDot={{ r: 3, fill: selectedMetric === 'flowScore' ? '#4ade80' : '#60a5fa' }} 
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
            {!moodScores ? (
              <p className="text-muted font-sm italic margin-none col-span-2">No flow state data available yet.</p>
            ) : (
              <>
                <div 
                  onClick={() => setSelectedMetric('flowScore')}
                  className="sp-panel tone tone--mint px-3 py-2 radius-compact opacity-80 flex flex-col justify-between cursor-pointer hover:opacity-100 hover:bg-green-900/20 transition-all border border-transparent hover:border-green-500/30"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Flow Score</span>
                    <span className="font-mono text-sm text-white">
                      {moodScores.flowScore !== undefined ? moodScores.flowScore.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-green-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, (moodScores.flowScore || 0) * 10))}%` }}
                    ></div>
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedMetric('confidence')}
                  className="sp-panel tone tone--blue px-3 py-2 radius-compact opacity-80 flex flex-col justify-between cursor-pointer hover:opacity-100 hover:bg-blue-900/20 transition-all border border-transparent hover:border-blue-500/30"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Confidence</span>
                    <span className="font-mono text-sm text-white">
                      {moodScores.confidence !== undefined ? moodScores.confidence.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-blue-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, (moodScores.confidence || 0) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

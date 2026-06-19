'use client';

import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { BenchmarkDataPoint } from '../models/types';

interface DynamicScatterPlotProps {
  data: BenchmarkDataPoint[];
  selectedModelId: string | null;
  onSelectModel: (id: string) => void;
}

export default function DynamicScatterPlot({ data, selectedModelId, onSelectModel }: DynamicScatterPlotProps) {
  // Categorize data for multi-series rendering in Recharts
  const reasoningData = data.filter((d) => d.type === 'reasoning');
  const visionData = data.filter((d) => d.type === 'vision_agent');
  const baseData = data.filter((d) => d.type === 'base_llm');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: BenchmarkDataPoint = payload[0].payload;
      const typeLabel =
        dataPoint.type === 'reasoning'
          ? 'Reasoning Agent'
          : dataPoint.type === 'vision_agent'
            ? 'Vision-LLM Agent'
            : 'Base LLM Agent';

      return (
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md text-slate-200 text-xs space-y-1.5 min-w-[200px]">
          <div className="flex justify-between items-center gap-4">
            <span className="font-bold text-white text-sm">{dataPoint.name}</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
              {dataPoint.provider}
            </span>
          </div>
          <div className="text-[10px] text-indigo-400 font-semibold">{typeLabel}</div>
          <hr className="border-slate-800 my-1" />
          <div className="flex justify-between">
            <span className="text-slate-400">Alignment Score:</span>
            <span className="font-bold text-emerald-400 font-mono">{dataPoint.score}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Cost per 100 moves:</span>
            <span className="font-bold text-amber-400 font-mono">${dataPoint.cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">VLM Frame Rate:</span>
            <span className="font-bold text-sky-400 font-mono">{dataPoint.vlmSpeed} FPS</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleNodeClick = (node: any) => {
    if (node && node.id) {
      onSelectModel(node.id);
    }
  };

  return (
    <div className="w-full h-full bg-slate-950/45 border border-slate-900 rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col justify-between">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Performance vs Cost Efficiency</h3>
          <p className="text-[11px] text-slate-500">
            Compare model alignment score against token cost per 100 moves. Select any node to inspect agent logs.
          </p>
        </div>
        {/* {selectedModelId && (
          <div className="text-[10px] px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Inspecting {data.find((d) => d.id === selectedModelId)?.name}
          </div>
        )} */}
      </div>

      <div className="w-full h-[320px] md:h-[380px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />
            <XAxis
              type="number"
              dataKey="cost"
              name="Cost per 100 Moves"
              unit=""
              domain={[0, 'auto']}
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'Avg Cost per 100 moves ($)',
                position: 'bottom',
                fill: '#94a3b8',
                fontSize: 11,
                offset: 5
              }}
            />
            <YAxis
              type="number"
              dataKey="score"
              name="Benchmark Score"
              unit="%"
              domain={[50, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'Skillprint Cognitive Score (%)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                fontSize: 11,
                offset: 5
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingBottom: 15 }}
            />

            <Scatter
              name="Reasoning Agents"
              data={reasoningData}
              fill="#543DEB"
              shape="square"
              onClick={handleNodeClick}
              className="cursor-pointer"
            >
              {reasoningData.map((entry, index) => {
                const isSelected = entry.id === selectedModelId;
                return (
                  <Cell
                    key={`reasoning-${index}`}
                    fill="#543DEB"
                    stroke={isSelected ? '#ffffff' : '#818cf8'}
                    strokeWidth={isSelected ? 3 : 1}
                    r={isSelected ? 12 : 7}
                    style={{
                      filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(84, 61, 235, 0.8))' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                );
              })}
            </Scatter>

            <Scatter
              name="Vision-LLM Agents"
              data={visionData}
              fill="#05DF91"
              shape="circle"
              onClick={handleNodeClick}
              className="cursor-pointer"
            >
              {visionData.map((entry, index) => {
                const isSelected = entry.id === selectedModelId;
                return (
                  <Cell
                    key={`vision-${index}`}
                    fill="#05DF91"
                    stroke={isSelected ? '#ffffff' : '#34d399'}
                    strokeWidth={isSelected ? 3 : 1}
                    r={isSelected ? 12 : 7}
                    style={{
                      filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(5, 223, 145, 0.8))' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                );
              })}
            </Scatter>

            <Scatter
              name="Base LLM Agents"
              data={baseData}
              fill="#26B8FF"
              shape="triangle"
              onClick={handleNodeClick}
              className="cursor-pointer"
            >
              {baseData.map((entry, index) => {
                const isSelected = entry.id === selectedModelId;
                return (
                  <Cell
                    key={`base-${index}`}
                    fill="#26B8FF"
                    stroke={isSelected ? '#ffffff' : '#38bdf8'}
                    strokeWidth={isSelected ? 3 : 1}
                    r={isSelected ? 12 : 7}
                    style={{
                      filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(38, 184, 255, 0.8))' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[10px] text-slate-500 text-center flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-900 pt-3">
        <span>🟦 Square: Reasoning systems (DeepSeek R1, o1-pro)</span>
        <span>🟢 Circle: Vision agents (GPT-4o, Claude 3.7)</span>
        <span>🔺 Triangle: Base models (Llama 3.1, Haiku)</span>
      </div>
    </div>
  );
}

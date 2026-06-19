'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DynamicChart from '../visualize/components/DynamicChart';
import { generateSyntheticData, DataPoint } from '../visualize/utils/syntheticData';

const PILLAR_DIMENSIONS = {
  Mood: ['relax', 'grit', 'focus', 'collaborate', 'empathy', 'creativity', 'joy', 'curiosity', 'awe'],
  Cognition: ['pattern_matching', 'attention', 'memory', 'planning', 'task_switching', 'math', 'deduction', 'visualization', 'verbal', 'timing', 'perceptual_speed', 'knowledge', 'action', 'spatial'],
  Personality: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability']
};

const PILLAR_MODELS = {
  Mood: 'MoodData',
  Cognition: 'CognitionData',
  Personality: 'PersonalityData'
};

export default function ProfilePerformanceTrends() {
  const [selectedPillar, setSelectedPillar] = useState<'Mood' | 'Cognition' | 'Personality'>('Mood');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['focus']);
  const [comparePeriods, setComparePeriods] = useState<number>(1);
  const [chartType, setChartType] = useState<'BarLine' | 'Area'>('BarLine');
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  // Reset selected dimensions when pillar changes
  useEffect(() => {
    if (selectedPillar === 'Mood') {
      setSelectedDimensions(['focus']);
    } else if (selectedPillar === 'Cognition') {
      setSelectedDimensions(['pattern_matching']);
    } else if (selectedPillar === 'Personality') {
      setSelectedDimensions(['openness']);
    }
  }, [selectedPillar]);

  // Generate chart data when parameters change
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);

    if (selectedDimensions.length > 0) {
      const data = generateSyntheticData({
        modelName: PILLAR_MODELS[selectedPillar],
        selectedFields: selectedDimensions,
        chartType: chartType,
        startDate: start,
        endDate: end,
        comparePeriods: comparePeriods,
        compareCohort: false
      });
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [comparePeriods, chartType, selectedPillar, selectedDimensions]);

  const toggleDimension = (dim: string) => {
    const isSelected = selectedDimensions.includes(dim);
    if (isSelected) {
      if (selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter(d => d !== dim));
      } else {
        toast.error('At least one metric must be selected.');
      }
    } else {
      if (selectedDimensions.length < 4) {
        setSelectedDimensions([...selectedDimensions, dim]);
      } else {
        toast.error('You can select a maximum of 4 metrics to compare.');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Performance Trends
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select a scoring pillar and track your cognitive, mood, and personality metrics over time
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Segmented Pillar Selector */}
          <div className="flex items-center bg-secondary/50 p-1 rounded-full border border-border shadow-inner">
            {(['Mood', 'Cognition', 'Personality'] as const).map((pillar) => (
              <button
                key={pillar}
                type="button"
                onClick={() => setSelectedPillar(pillar)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer ${
                  selectedPillar === pillar
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>

          {/* Segmented Chart Type Toggle */}
          <div className="flex items-center bg-secondary/50 p-1 rounded-full border border-border shadow-inner">
            <button
              type="button"
              onClick={() => setChartType('BarLine')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer ${
                chartType === 'BarLine'
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Bar & Lines
            </button>
            <button
              type="button"
              onClick={() => setChartType('Area')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer ${
                chartType === 'Area'
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Area Chart
            </button>
          </div>

          {/* Compare Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Compare:</label>
            <select
              value={comparePeriods}
              onChange={(e) => setComparePeriods(parseInt(e.target.value, 10))}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={0}>None</option>
              <option value={1}>Last Week</option>
              <option value={2}>Last 2 Weeks</option>
              <option value={3}>Last 3 Weeks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dimension Selector Chips */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-card rounded-xl border border-border">
        {PILLAR_DIMENSIONS[selectedPillar].map((dim) => {
          const isSelected = selectedDimensions.includes(dim);
          const label = dim.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
          return (
            <button
              key={dim}
              type="button"
              onClick={() => toggleDimension(dim)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                  : 'bg-card border-border text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm h-[350px] mb-8">
        <DynamicChart
          data={chartData}
          type={chartType}
          selectedFields={selectedDimensions}
          comparePeriods={comparePeriods}
          compareCohort={false}
          yAxisLabel="score"
        />
      </div>
    </div>
  );
}

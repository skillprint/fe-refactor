"use client";

import React, { useState, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import DynamicChart from './components/DynamicChart';
import { generateSyntheticData, DataPoint, MODEL_FIELDS } from './utils/syntheticData';

export default function VisualizeClient() {
  const [selectedModel, setSelectedModel] = useState<string>('Session');
  const [selectedFields, setSelectedFields] = useState<string[]>([MODEL_FIELDS['Session'][0]]);
  const [chartType, setChartType] = useState<'Bar' | 'Line' | 'Pie' | 'Scatter' | 'RangeBand'>('Bar');
  
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedFields([MODEL_FIELDS[model]?.[0] || '']);
    setFilters({}); // Reset filters on model change
  };

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [comparePrevious, setComparePrevious] = useState<boolean>(false);
  const [compareCohort, setCompareCohort] = useState<boolean>(false);
  
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateData = (overrides?: any) => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateSyntheticData({
        modelName: overrides?.modelName ?? selectedModel,
        selectedFields: (overrides?.selectedFields ?? selectedFields).filter((f: string) => f),
        chartType: overrides?.chartType ?? chartType,
        startDate: overrides?.startDate ?? dateRange.start,
        endDate: overrides?.endDate ?? dateRange.end,
        comparePrevious: overrides?.comparePrevious ?? comparePrevious,
        compareCohort: overrides?.compareCohort ?? compareCohort,
        filters: overrides?.filters ?? filters
      });
      setChartData(data);
      setIsGenerating(false);
    }, 400);
  };

  useEffect(() => {
    handleGenerateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <ControlPanel 
          selectedModel={selectedModel}
          setSelectedModel={handleModelChange}
          selectedFields={selectedFields}
          setSelectedFields={setSelectedFields}
          availableFields={MODEL_FIELDS[selectedModel] || []}
          filters={filters}
          setFilters={setFilters}
          chartType={chartType}
          setChartType={setChartType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          comparePrevious={comparePrevious}
          setComparePrevious={setComparePrevious}
          compareCohort={compareCohort}
          setCompareCohort={setCompareCohort}
          onGenerate={handleGenerateData}
          isGenerating={isGenerating}
        />
      </div>

      <div className="lg:col-span-3">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border min-h-[500px] flex flex-col">
          <h2 className="text-xl font-semibold mb-6 capitalize">{selectedModel} Trends</h2>
          
          <div className="flex-grow w-full h-[400px] min-h-[400px]">
            {isGenerating ? (
              <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
                  <p className="text-muted-foreground">Synthesizing data...</p>
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <DynamicChart 
                data={chartData} 
                type={chartType}
                selectedFields={selectedFields.filter(f => f)}
                comparePrevious={comparePrevious}
                compareCohort={compareCohort}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                 <p className="text-muted-foreground">No data to display. Generate data to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

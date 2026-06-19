import { Suspense } from 'react';
import VisualizeClient from './VisualizeClient';

export const metadata = {
  title: 'Visualize Data | Skillprint',
};

export default function VisualizePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Visualization Studio</h1>
          <p className="mt-2 text-muted-foreground">
            Explore, analyze, and generate synthetic insights from your models.
          </p>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
              <p className="text-muted-foreground">Loading Studio...</p>
            </div>
          </div>
        }>
          <VisualizeClient />
        </Suspense>
      </div>
    </div>
  );
}

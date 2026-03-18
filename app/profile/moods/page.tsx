'use client';

import { useVisualizeMoodProfile } from '../../hooks/useVisualizeMoodProfile';
import BuckyballLoading from '../../components/BuckyballLoading';

export default function VisualizeMoodProfileTestPage() {
    const { data, isLoading, error } = useVisualizeMoodProfile();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <BuckyballLoading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500">
                <p>Error loading profile: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 pt-24 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-white">Visualize Mood Profile Output</h1>
            <div className="bg-gray-800 p-6 rounded-lg overflow-x-auto shadow-lg">
                <pre className="text-sm text-green-400">
                    {data ? JSON.stringify(data, null, 2) : 'No data available.'}
                </pre>
            </div>
        </div>
    );
}

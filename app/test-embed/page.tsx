'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function EmbedContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || searchParams.get('user_id');

    // Construct the iframe URL
    const iframeSrc = userId
        ? `/?user_id=${encodeURIComponent(userId)}&first_name=TestPlayer`
        : '/';

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">PlayVS Test Embed</h1>
                <p className="text-gray-600 mt-2">
                    This page tests embedding the Skillprint marketplace within an iframe.
                </p>
                {userId && (
                    <p className="text-green-600 font-medium mt-1">
                        Authenticating as User ID: {userId}
                    </p>
                )}
            </header>

            <main className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                <iframe
                    src={iframeSrc}
                    className="w-full h-full border-0 absolute inset-0"
                    title="Skillprint Marketplace Embed"
                    allow="autoplay; fullscreen; microphone; camera"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </main>
        </div>
    );
}

export default function TestEmbedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100 p-8">Loading...</div>}>
            <EmbedContent />
        </Suspense>
    );
}

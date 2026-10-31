import { Suspense } from 'react';
import StatsClient from './StatsClient';

export default function StatsPage() {
    return (
        <Suspense fallback={null}>
            <StatsClient />
        </Suspense>
    );
}

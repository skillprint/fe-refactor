'use client';

import { useEffect } from 'react';

/**
 * Hook that checks for user_id and api_key query parameters,
 * writes them to cookies, and removes them from the URL
 */
export function useQueryParams() {
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const searchParams = new URLSearchParams(window.location.search);
        const userId = searchParams.get('user_id');
        const apiKey = searchParams.get('api_key');

        let paramsUpdated = false;

        // Write to cookies if parameters exist
        if (userId) {
            document.cookie = `user_id=${encodeURIComponent(userId)}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
            searchParams.delete('user_id');
            paramsUpdated = true;
        }

        if (apiKey) {
            document.cookie = `api_key=${encodeURIComponent(apiKey)}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
            searchParams.delete('api_key');
            paramsUpdated = true;
        }

        // Update URL silently if any params were found
        if (paramsUpdated) {
            const newUrl = searchParams.toString()
                ? `${window.location.pathname}?${searchParams.toString()}`
                : window.location.pathname;

            window.history.replaceState({}, '', newUrl);
        }
    }, []); // Run only once on mount
}

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface Challenge {
    id: string;
    organization_id: string;
    title: string;
    description: string;
    type: 'temporal' | 'skill_mood' | 'mixed';
    temporal_period?: 'daily' | 'weekly' | 'monthly' | null;
    associated_skill?: string[] | null;
    associated_mood?: string[] | null;
    start_date?: string | null;
    end_date?: string | null;
    game_ids?: string[];
    created_at?: string;
}

export function useChallenges() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchChallenges = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/org/challenges');
            const data = await res.json();
            if (data.success) {
                setChallenges(data.challenges);
            } else {
                throw new Error(data.error || 'Failed to fetch challenges');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || 'Failed to load challenges');
        } finally {
            setLoading(false);
        }
    }, []);

    const createChallenge = useCallback(async (challengeData: Partial<Challenge>) => {
        setError(null);
        try {
            const res = await fetch('/api/org/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(challengeData),
            });
            const data = await res.json();
            if (data.success) {
                setChallenges((prev) => [data.challenge, ...prev]);
                toast.success('Challenge created successfully');
                return data.challenge;
            } else {
                throw new Error(data.error || 'Failed to create challenge');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || 'Failed to create challenge');
            throw err;
        }
    }, []);

    const updateChallenge = useCallback(async (id: string, challengeData: Partial<Challenge>) => {
        setError(null);
        try {
            const res = await fetch(`/api/org/challenges/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(challengeData),
            });
            const data = await res.json();
            if (data.success) {
                setChallenges((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, ...data.challenge } : c))
                );
                toast.success('Challenge updated successfully');
                return data.challenge;
            } else {
                throw new Error(data.error || 'Failed to update challenge');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || 'Failed to update challenge');
            throw err;
        }
    }, []);

    const deleteChallenge = useCallback(async (id: string) => {
        setError(null);
        try {
            const res = await fetch(`/api/org/challenges/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setChallenges((prev) => prev.filter((c) => c.id !== id));
                toast.success('Challenge deleted successfully');
                return true;
            } else {
                throw new Error(data.error || 'Failed to delete challenge');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(err.message || 'Failed to delete challenge');
            throw err;
        }
    }, []);

    return {
        challenges,
        loading,
        error,
        fetchChallenges,
        createChallenge,
        updateChallenge,
        deleteChallenge,
    };
}

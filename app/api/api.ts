import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';
import { getCookie, getApiBaseUrl } from "../utils/cookieUtils";

// const instance = Axios.create();
// const axios = setupCache(instance);

// For production static builds, you'll need to configure CORS on your API server or CloudFront
export const BASE_URL = getApiBaseUrl();

// console.log(BASE_URL);

const moods_path = `games/api/moods/`;
const skills_path = `games/api/skills/`;
const catalog_path = `games/api/catalog/`;
const skillprint_path = `games/api/skillprint/`;
const visualize_skill_profile_path = `scoring/api/skill-progression/`;
const visualize_mood_profile_path = `scoring/api/mood-visualization/`;
const game_metrics_path = `scoring/api/game-metrics/`;
const add_user_path = `partners/api/users/add/`;
const add_user_token = `partners/api/users/auth/token/`;

const getUserId = () => {
    return getCookie('user_id');
}

const getApiKey = () => {
    return getCookie('api_key');
}



const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const get = async (path: string, useCache = false, customHeaders: any = {}) => {
    const fullPath = `${BASE_URL}${path}`;

    if (useCache) {
        // 1. Check deduplication map for in-flight requests
        const inflight = inFlightRequests.get(fullPath);
        if (inflight) {
            return inflight;
        }

        // 2. Check local storage for persistent cache
        if (typeof window !== 'undefined') {
            try {
                const cachedString = localStorage.getItem(fullPath);
                if (cachedString) {
                    const cached = JSON.parse(cachedString);
                    if (Date.now() - cached.timestamp < CACHE_TTL) {
                        console.log(`[API Cache] Hit (localStorage): ${path}`);
                        return cached.data;
                    }
                    // Expired
                    localStorage.removeItem(fullPath);
                }
            } catch (e) {
                console.warn('LocalStorage error:', e);
            }
        }
    }

    const headers = {
        "Content-Type": "application/json",
        ...customHeaders
        // "Authorization": `Api-Key ${getApiKey()}`
    }

    console.log(`[API] Fetching: ${BASE_URL}${path}`);

    // Create the promise
    const requestPromise = axios.get(fullPath, { headers })
        .then(response => {
            if (useCache && typeof window !== 'undefined') {
                try {
                    localStorage.setItem(fullPath, JSON.stringify({
                        data: response.data,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    console.warn('LocalStorage write error:', e);
                }
            }
            return response.data;
        })
        .catch(error => {
            throw error;
        })
        .finally(() => {
            if (useCache) {
                inFlightRequests.delete(fullPath);
            }
        });

    if (useCache) {
        inFlightRequests.set(fullPath, requestPromise);
    }

    return requestPromise;
};

export const post = async (path: string, data: any, headers: any) => {
    const hdrs = {
        "Content-Type": "application/json",
        // "Authorization": `Api-Key ${getApiKey()}`,
        ...headers
    }
    const response = await axios.post(`${BASE_URL}${path}`, data, { headers: hdrs });
    return response.data;
};

export const put = async (path: string, data: any, headers: any) => {
    const hdrs = {
        "Content-Type": "application/json",
        ...headers
    }
    const response = await axios.put(`${BASE_URL}${path}`, data, { headers: hdrs });
    return response.data;
};


export const addUser = async (user: any) => {
    const url = `${add_user_path}`;
    return await post(url, {}, { headers: { "Content-Type": "application/json" } });
}

export const addUserToken = async (user: any) => {
    const url = `${add_user_token}`;
    return await post(url, {}, { headers: { "Content-Type": "application/json" } });
}

export const getSkillprint = async () => {
    const url = `${skillprint_path}`;
    return await get(url, true);
};

export const getVisualizeSkillProfile = async (token?: string | null, apiKey?: string | null) => {
    const url = `${visualize_skill_profile_path}`;
    const headers: any = {};
    if (token) {
        headers["X-Auth-Token"] = `Token ${token}`;
    }
    if (apiKey) {
        headers["Authorization"] = `Api-Key ${apiKey}`;
    }
    return await get(url, false, headers);
};

export const getVisualizeMoodProfile = async (token?: string | null, apiKey?: string | null) => {
    const url = `${visualize_mood_profile_path}`;
    const headers: any = {};
    if (token) {
        headers["X-Auth-Token"] = `Token ${token}`;
    }
    if (apiKey) {
        headers["Authorization"] = `Api-Key ${apiKey}`;
    }
    return await get(url, false, headers);
};

export const getGameMetrics = async (games: string[], token?: string | null, apiKey?: string | null) => {
    const gamesQuery = games.length > 0 ? `?games=${games.join(',')}` : '';
    const url = `${game_metrics_path}${gamesQuery}`;
    const headers: any = {};
    if (token) {
        headers["X-Auth-Token"] = `Token ${token}`;
    }
    if (apiKey) {
        headers["Authorization"] = `Api-Key ${apiKey}`;
    }
    return await get(url, false, headers);
};

export const getCatalogItemsBySkill = async (skill_name: string) => {
    const url = `${catalog_path}?skills=${skill_name}&is_playable_in_pwa=true`;
    return await get(url, true);
};

export const getCatalogItemsByMood = async (mood_name: string) => {
    const url = `${catalog_path}?moods=${mood_name}&is_playable_in_pwa=true`;
    return await get(url, true);
};

export const getMoods = async () => {
    return await get(moods_path, true);
};

export const getSkills = async () => {
    return await get(skills_path, true);
};

export const getGameBySlug = async (slug: string) => {
    const url = `${catalog_path}?slug=${slug}`;
    const response = await get(url, true);
    return response.results && response.results.length > 0 ? response.results[0] : null;
};

export const getRecommendations = async (limit: number = 1) => {
    const url = `games/api/recommendations/?limit=${limit}`;
    return await get(url, false);
};

export const submitMoodSurvey = async (data: { score: number, game: string, mood: string }, token?: string | null) => {
    const url = `games/api/surveys/mood/`;
    const headers: any = { "Content-Type": "application/json" };
    if (token) {
        headers["X-Auth-Token"] = `Token ${token}`;
    }
    return await post(url, data, headers);
};

export const getUserGoals = async (token?: string | null, apiKey?: string | null) => {
    const url = `games/api/goals/`;
    const headers: any = {};
    if (token) {
        headers["X-Auth-Token"] = `Token ${token}`;
    }
    if (apiKey) {
        headers["Authorization"] = `Api-Key ${apiKey}`;
    }
    return await get(url, false, headers);
};

export const updateUserGoals = async (goals: any[], token?: string | null, apiKey?: string | null) => {
    const url = `games/api/goals/`;
    const headers: any = {};
    if (token) {
        headers["X-Auth-Token"] = `Token ${token}`;
    }
    if (apiKey) {
        headers["Authorization"] = `Api-Key ${apiKey}`;
    }
    return await put(url, goals, headers);
};
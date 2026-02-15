import axios from "axios";
import { setupCache } from 'axios-cache-interceptor';

// const instance = Axios.create();
// const axios = setupCache(instance);

// Use local proxy during development to avoid CORS
// The /api/ path will be rewritten to https://api.staging.skillprint.co/ by next.config.ts
// For production static builds, you'll need to configure CORS on your API server or CloudFront
const BASE_URL = "https://api.staging.skillprint.co/";

// console.log(BASE_URL);

const moods_path = `games/api/moods/`;
const skills_path = `games/api/skills/`;
const catalog_path = `games/api/catalog/`;
const skillprint_path = `games/api/skillprint/`;
const add_user_path = `partners/api/users/add/`;
const add_user_token = `partners/api/users/auth/token/`;

const getUserId = () => {
    if (typeof document === 'undefined') return null;
    const cookie = document.cookie.split(';').find(row => row.startsWith('user_id='));
    return cookie ? cookie.split('=')[1] : null;
}

const getApiKey = () => {
    if (typeof document === 'undefined') return null;
    const cookie = document.cookie.split(';').find(row => row.startsWith('api_key='));
    return cookie ? cookie.split('=')[1] : null;
}


const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const get = async (path: string, useCache = false) => {
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
        // "Authorization": `Api-Key ${getApiKey()}`
    }

    console.log(`[API] Fetching: ${path}`);

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

export const getCatalogItemsBySkill = async (skill_name: string) => {
    const url = `${catalog_path}?skills=${skill_name}`;
    return await get(url, true);
};

export const getCatalogItemsByMood = async (mood_name: string) => {
    const url = `${catalog_path}?moods=${mood_name}`;
    return await get(url, true);
};

export const getMoods = async () => {
    return await get(moods_path, true);
};

export const getSkills = async () => {
    return await get(skills_path, true);
};
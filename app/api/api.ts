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
    const cookie = document.cookie.split(';').find(row => row.startsWith('user_id='));
    return cookie ? cookie.split('=')[1] : null;
}

const getApiKey = () => {
    const cookie = document.cookie.split(';').find(row => row.startsWith('api_key='));
    return cookie ? cookie.split('=')[1] : null;
}


export const get = async (path: string) => {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${getApiKey()}`
    }
    const response = await axios.get(`${BASE_URL}${path}`, { headers });
    return response.data;
};

export const post = async (path: string, data: any, headers: any) => {
    const hdrs = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${getApiKey()}`,
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
    return await get(url);
};

export const getCatalogItemsBySkill = async (skill_name: string) => {
    const url = `${catalog_path}?skills=${skill_name}`;
    return await get(url);
};

export const getCatalogItemsByMood = async (mood_name: string) => {
    const url = `${catalog_path}?moods=${mood_name}`;
    return await get(url);
};

export const getMoods = async () => {
    return await get(moods_path);
};

export const getSkills = async () => {
    return await get(skills_path);
};
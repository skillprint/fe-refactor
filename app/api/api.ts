import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const moods_path = `games/api/moods/`;
const skills_path = `games/api/skills/`;
const catalog_path = `games/api/catalog/`;

export const get = async (path: string) => {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${process.env.NEXT_PUBLIC_API_KEY}`
    }
    const response = await axios.get(`${BASE_URL}${path}`, { headers });
    return response.data;
};

export const post = async (path: string, data: any, headers: any) => {
    const hdrs = {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${process.env.NEXT_PUBLIC_API_KEY}`,
        ...headers
    }
    const response = await axios.post(`${BASE_URL}${path}`, data, { headers: hdrs });
    return response.data;
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
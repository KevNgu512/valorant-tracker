import axios from 'axios';
import type { MatchData } from './types';

const API_URL = import.meta.env.PROD 
  ? 'https://valorant-tracker-4wnc.onrender.com/api' 
  : 'http://localhost:5000/api';

export const getMatchHistory = async (name: string, tag: string, region: string) => {
    const response = await axios.get<MatchData[]>(`${API_URL}/matches/${region}/${name}/${tag}`);
    return response.data; 
};

export const getMMRHistory = async (name: string, tag: string, region: string) => {
    const response = await axios.get(`${API_URL}/mmr-history/${region}/${name}/${tag}`);
    return response.data;
};

export const getPlayerRank = async (name: string, tag: string) => {
    try {
        const response = await axios.get(`${API_URL}/rank/${name}/${tag}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching rank:", error);
        throw error;
    }
};

// --- NEW FUNCTION ---
export const getGeminiAnalysis = async (p1: any, p2: any) => {
    // Send both players stats to our backend
    const response = await axios.post(`${API_URL}/analyze-comparison`, { p1, p2 });
    return response.data;
};
import axios from 'axios';
import type { MatchData } from './types';

const API_URL = 'http://localhost:5000/api';

export const getMatchHistory = async (name: string, tag: string, region: string) => {
    // CHANGE HERE: Removed { data: ... } wrapper. 
    // We are telling Axios: "The API response body IS the array of matches"
    const response = await axios.get<MatchData[]>(`${API_URL}/matches/${region}/${name}/${tag}`);
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
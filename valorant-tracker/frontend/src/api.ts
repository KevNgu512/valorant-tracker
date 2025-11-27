import axios from 'axios';

// This points to YOUR Backend, not the external API
const API_URL = 'http://localhost:5000/api';

export const getMatchHistory = async (name: string, tag: string) => {
    try {
        const response = await axios.get(`${API_URL}/matches/${name}/${tag}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching matches:", error);
        throw error;
    }
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
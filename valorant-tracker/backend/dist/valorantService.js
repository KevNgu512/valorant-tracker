import axios from 'axios';
const BASE_URL = 'https://api.henrikdev.xyz/valorant';
export class ValorantService {
    /**
     * Fetches the last 5 matches for a player
     * @param name - Player name (e.g. "TenZ")
     * @param tag - Player tag (e.g. "001")
     * @param region - Region (na, eu, ap, kr, latam, br)
     */
    static async getMatchHistory(name, tag, region) {
        try {
            // 1. Get the key from your .env file
            const apiKey = process.env.VALORANT_API_KEY;
            if (!apiKey) {
                console.warn("⚠️ WARNING: No VALORANT_API_KEY found in .env. You may be rate-limited.");
            }
            // 2. Make the request with the specific Region and Auth Header
            const response = await axios.get(`${BASE_URL}/v3/matches/${region}/${name}/${tag}`, {
                headers: {
                    // Standard Auth Header for HenrikDev API
                    'Authorization': apiKey || ''
                }
            });
            // 3. Validation
            if (response.status !== 200 || !response.data.data) {
                throw new Error('Invalid API Response');
            }
            return response.data.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error;
                const errorData = axiosError.response?.data; // Cast to any to access custom fields
                console.error(`❌ API Error [${axiosError.response?.status}]:`, errorData);
                // --- ADD THIS BLOCK ---
                // Check for specific HenrikDev Error Code 24
                if (errorData?.errors && errorData.errors[0]?.code === 24) {
                    throw new Error("NOT_ENOUGH_GAMES");
                }
                // ----------------------
                if (axiosError.response?.status === 404) {
                    throw new Error(`Player ${name}#${tag} not found in region ${region.toUpperCase()}`);
                }
                // ... other error checks ...
            }
            throw error;
        }
    }
    /**
     * Fetches player MMR (Rank) data
     */
    static async getPlayerMMR(name, tag, region) {
        try {
            const apiKey = process.env.VALORANT_API_KEY;
            const response = await axios.get(`${BASE_URL}/v1/mmr/${region}/${name}/${tag}`, {
                headers: {
                    'Authorization': apiKey || ''
                }
            });
            return response.data.data;
        }
        catch (error) {
            // MMR endpoints often 404 if the player hasn't played ranked recently
            // We return null instead of throwing so the UI can just say "Unranked"
            console.warn(`⚠️ Could not fetch Rank for ${name}#${tag}`);
            return null;
        }
    }
    /**
     * Fetches player MMR (Rank) history data
     */
    static async getMMRHistory(name, tag, region) {
        try {
            const apiKey = process.env.VALORANT_API_KEY;
            // Use v1 endpoint for MMR history
            const response = await axios.get(`https://api.henrikdev.xyz/valorant/v1/mmr-history/${region}/${name}/${tag}`, { headers: { 'Authorization': apiKey || '' } });
            return response.data.data;
        }
        catch (error) {
            console.warn(`⚠️ Could not fetch MMR History for ${name}#${tag}`);
            return []; // Return empty array so chart just doesn't show, preventing crash
        }
    }
}

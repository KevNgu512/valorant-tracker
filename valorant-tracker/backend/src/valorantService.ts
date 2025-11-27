import axios, { AxiosError } from 'axios';
import { APIResponse, MatchData } from './types.js';

const BASE_URL = 'https://api.henrikdev.xyz/valorant';

export class ValorantService {
  /**
   * Fetches the last 5 matches for a player
   * @param name - Player name (e.g. "TenZ")
   * @param tag - Player tag (e.g. "001")
   * @param region - Region (na, eu, ap, kr, latam, br)
   */
  static async getMatchHistory(name: string, tag: string, region: string): Promise<MatchData[]> {
    try {
      // 1. Get the key from your .env file
      const apiKey = process.env.VALORANT_API_KEY;

      if (!apiKey) {
        console.warn("⚠️ WARNING: No VALORANT_API_KEY found in .env. You may be rate-limited.");
      }

      // 2. Make the request with the specific Region and Auth Header
      const response = await axios.get<APIResponse>(
        `${BASE_URL}/v3/matches/${region}/${name}/${tag}`,
        {
          headers: {
            // Standard Auth Header for HenrikDev API
            'Authorization': apiKey || '' 
          }
        }
      );

      // 3. Validation
      if (response.status !== 200 || !response.data.data) {
        throw new Error('Invalid API Response');
      }

      return response.data.data;

    } catch (error) {
      // 4. Enhanced Error Logging (Crucial for debugging)
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error(`❌ API Error [${axiosError.response?.status}]:`, axiosError.response?.data);
        
        // Specific user feedback based on status code
        if (axiosError.response?.status === 404) {
          throw new Error(`Player ${name}#${tag} not found in region ${region.toUpperCase()}`);
        }
        if (axiosError.response?.status === 403 || axiosError.response?.status === 401) {
          throw new Error("API Key Invalid or missing.");
        }
        if (axiosError.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment.");
        }
      } else {
        console.error('❌ Unexpected Error:', error);
      }
      throw error;
    }
  }

  /**
   * Fetches player MMR (Rank) data
   */
  static async getPlayerMMR(name: string, tag: string, region: string) {
    try {
      const apiKey = process.env.VALORANT_API_KEY;
      
      const response = await axios.get(
        `${BASE_URL}/v1/mmr/${region}/${name}/${tag}`,
        {
          headers: {
            'Authorization': apiKey || ''
          }
        }
      );
      return response.data.data;
    } catch (error) {
        // MMR endpoints often 404 if the player hasn't played ranked recently
        // We return null instead of throwing so the UI can just say "Unranked"
        console.warn(`⚠️ Could not fetch Rank for ${name}#${tag}`);
        return null;
    }
  }
}
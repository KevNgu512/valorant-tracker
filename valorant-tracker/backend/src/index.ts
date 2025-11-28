import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ValorantService } from './valorantService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Valorant Tracker API is running!');
});

// 1. Get Match History (Now accepts :region)
app.get('/api/matches/:region/:name/:tag', async (req, res) => {
  // Extract region, name, and tag from the URL
  const { region, name, tag } = req.params;
  
  try {
    // Pass the region variable instead of hardcoded "na"
    const matches = await ValorantService.getMatchHistory(name, tag, region);
    res.json(matches);
  } catch (error: any) {
    // Send the actual error message from the Service (e.g. "Player not found")
    // This helps the Frontend show the real reason for failure
    res.status(500).json({ error: error.message || "Failed to fetch matches." });
  }
});

// 2. Get Player Rank (Now accepts :region)
app.get('/api/rank/:region/:name/:tag', async (req, res) => {
  const { region, name, tag } = req.params;
  
  try {
    const rankData = await ValorantService.getPlayerMMR(name, tag, region);
    res.json(rankData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rank." });
  }
});

// 3. Get MMR History (The missing route)
app.get('/api/mmr-history/:region/:name/:tag', async (req, res) => {
  const { region, name, tag } = req.params;
  try {
    const history = await ValorantService.getMMRHistory(name, tag, region);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch MMR history" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
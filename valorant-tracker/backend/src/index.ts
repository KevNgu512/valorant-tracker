import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ValorantService } from './valorantService.js'; // Import the service

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('Valorant Tracker API is running! Go to /api/matches/na/TenZ/001 to test.');
});
// 1. Get Match History
app.get('/api/matches/:name/:tag', async (req, res) => {
  const { name, tag } = req.params;
  try {
    const matches = await ValorantService.getMatchHistory(name, tag, "na");
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches. Check player name/tag." });
  }
});

// 2. Get Player Rank (MMR)
app.get('/api/rank/:name/:tag', async (req, res) => {
  const { name, tag } = req.params;
  try {
    const rankData = await ValorantService.getPlayerMMR(name, tag, "na");
    res.json(rankData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rank." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
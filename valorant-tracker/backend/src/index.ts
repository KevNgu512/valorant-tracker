import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ValorantService } from './valorantService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURATION ---
// Using Gemini 2.5 Flash (Stable, Free Tier Eligible)
const MODEL_NAME = "gemini-2.5-flash"; 

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

app.use(cors({
    origin: ['http://localhost:5173', 'https://valorant-tracker-woad.vercel.app']
}));
app.use(express.json());

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Valorant Tracker API is running!');
});

app.get('/api/matches/:region/:name/:tag', async (req, res) => {
  const { region, name, tag } = req.params;
  try {
    const matches = await ValorantService.getMatchHistory(name, tag, region);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch matches." });
  }
});

app.get('/api/rank/:region/:name/:tag', async (req, res) => {
  const { region, name, tag } = req.params;
  try {
    const rankData = await ValorantService.getPlayerMMR(name, tag, region);
    res.json(rankData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rank." });
  }
});

app.get('/api/mmr-history/:region/:name/:tag', async (req, res) => {
  const { region, name, tag } = req.params;
  try {
    const history = await ValorantService.getMMRHistory(name, tag, region);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch MMR history" });
  }
});

// --- AI ROUTE (No Rate Limit) ---
app.post('/api/analyze-comparison', async (req, res) => {
  const { p1, p2 } = req.body;

  try {
      console.log(`🤖 Analyzing: ${p1.name} vs ${p2.name} using ${MODEL_NAME}...`);

      const prompt = `
        Act as a professional Valorant Coach. Compare these two players.
        
        Player 1 (${p1.name}): Role: ${p1.role}, Rank: ${p1.rank}, Win Rate: ${p1.winRate}%, K/D: ${p1.kd}, ACS: ${p1.acs}, HS%: ${p1.hs}%
        Player 2 (${p2.name}): Role: ${p2.role}, Rank: ${p2.rank}, Win Rate: ${p2.winRate}%, K/D: ${p2.kd}, ACS: ${p2.acs}, HS%: ${p2.hs}%

        CRITERIA:
        - Context: Duelists need high stats. Supports (Sage/Omen) with decent stats are valuable.
        - Win Rate is key.

        OUTPUT FORMAT (JSON only):
        {
            "winner": "Player Name",
            "reason": "2 sentences explaining why."
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean JSON formatting
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      console.log("✅ AI Success:", text);
      res.json(JSON.parse(text));

  } catch (error: any) {
      console.error("❌ GEMINI ERROR:", error);
      res.status(500).json({ 
          error: error.message || "AI Service Error. Check backend console." 
      });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
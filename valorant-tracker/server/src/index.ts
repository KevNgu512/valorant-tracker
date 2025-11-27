import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your future frontend to talk to this server
app.use(express.json()); // Allows parsing of JSON data

// 1. Basic Health Check Route
app.get('/', (req, res) => {
  res.json({ message: "Valorant Tracker API is running!" });
});

// 2. Placeholder for Valorant Data
app.get('/api/player/:name/:tag', (req, res) => {
  // We will replace this with real API calls later
  const { name, tag } = req.params;
  res.json({ 
    player: `${name}#${tag}`, 
    rank: "Platinum 2", 
    last_match: "Win" 
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
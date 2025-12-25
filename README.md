# Valorant Performance Tracker
A full-stack web application that provides real-time match history, combat statistics, and rank progression (MMR) for Valorant players. Built to demonstrate secure API handling, modern UI/UX design, and data visualization without heavy dependencies.

## Key Features

* **Player Search:** Track stats for any player across multiple regions (NA, EU, APAC, KR).
* **Match History Dashboard:** Detailed cards showing KDA, Agent played, Map, and Match Result (Win/Loss/Deathmatch).
* **Detailed Match Stats:** Interactive modal showing a full scoreboard separated by teams (Red/Blue), including individual player ranks and combat scores.
* **MMR Trend Analysis:** Custom-built, zero-dependency SVG line chart visualizing Rank Rating (RR) fluctuations over the last 20 games.
* **Visual Rank Indicators:** Automatically fetches and renders official Rank Insignias based on player tier data.

## Tech Stack

### Frontend
* **Framework:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Glassmorphism & Gaming Aesthetic)
* **Visualization:** Custom SVG Engine (No external charting libraries)

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **API Integration:** HenrikDev Unofficial Valorant API
* **Security:** Proxy architecture to handle CORS and secure API keys server-side.

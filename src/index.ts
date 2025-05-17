/**
 * Application Entry Point
 * 
 * This file acts as the main entry point for the Whack-a-Mole High Scores API server.
 * It imports the Express app from app.ts and handles startup logic.
 */

import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get port from environment
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   Whack-a-Mole High Scores API                  │
│                                                 │
│   Server running at http://localhost:${port}       │
│   API Endpoints:                                │
│     - GET  /api/highscores                      │
│     - POST /api/highscores                      │
│                                                 │
└─────────────────────────────────────────────────┘
  `);
});

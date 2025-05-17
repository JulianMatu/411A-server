import { Router } from 'express';
import { HighScoreController } from '../controllers/high-score.controller';
import { validateHighScoreInput, rateLimit } from '../middlewares/validation';

const router = Router();

// POST /api/highscores - Create a new high score
router.post(
  '/highscores',
  rateLimit, // Apply rate limiting
  validateHighScoreInput, // Validate input
  HighScoreController.createHighScore
);

// GET /api/highscores - Get top high scores
router.get(
  '/highscores',
  rateLimit, // Apply rate limiting
  HighScoreController.getTopHighScores
);

// GET /api/highscores/:id - Get a high score by ID
// Not in requirements but useful for testing/future expansion
router.get(
  '/highscores/:id',
  rateLimit, // Apply rate limiting
  HighScoreController.getHighScoreById
);

export default router;

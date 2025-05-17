import { Request, Response, NextFunction } from 'express';
import { HighScoreModel, HighScore, HighScoreInput } from '../models/high-score.model';
import { ApiError } from '../middlewares/error-handler';

/**
 * Controller for high score operations
 */
export class HighScoreController {
  /**
   * Create a new high score
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   * @param {NextFunction} next - Express next function
   */
  static async createHighScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const highScoreData: HighScoreInput = {
        name: req.body.name,
        score: Number(req.body.score)
      };
      
      const newHighScore = await HighScoreModel.create(highScoreData);
      
      res.status(201).json(newHighScore);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top high scores
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   * @param {NextFunction} next - Express next function
   */
  static async getTopHighScores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Default limit to 100 as per requirements
      const limit = 100;
      
      const highScores = await HighScoreModel.getTopScores(limit);
      
      res.status(200).json(highScores);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single high score by ID
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   * @param {NextFunction} next - Express next function
   */
  static async getHighScoreById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        throw new ApiError(400, 'Invalid ID format');
      }
      
      const highScore = await HighScoreModel.getById(id);
      
      if (!highScore) {
        throw new ApiError(404, `High score with ID ${id} not found`);
      }
      
      res.status(200).json(highScore);
    } catch (error) {
      next(error);
    }
  }
}

import pool from '../config/database';

// Define the high score type
export interface HighScore {
  id: number;
  name: string;
  score: number;
  created_at: Date;
}

// Define the high score input type (for creating new high scores)
export interface HighScoreInput {
  name: string;
  score: number;
}

/**
 * High Score model with database operations
 */
export class HighScoreModel {
  /**
   * Create a new high score
   * @param {HighScoreInput} data - The high score data
   * @returns {Promise<HighScore>} - The created high score
   */
  static async create(data: HighScoreInput): Promise<HighScore> {
    const { name, score } = data;
    
    const result = await pool.query(
      'INSERT INTO high_scores (name, score) VALUES ($1, $2) RETURNING *',
      [name, score]
    );
    
    return result.rows[0];
  }

  /**
   * Get top high scores
   * @param {number} limit - Maximum number of high scores to return
   * @returns {Promise<HighScore[]>} - Array of high scores
   */
  static async getTopScores(limit: number = 100): Promise<HighScore[]> {
    const result = await pool.query(
      'SELECT * FROM high_scores ORDER BY score DESC LIMIT $1',
      [limit]
    );
    
    return result.rows;
  }

  /**
   * Get a single high score by ID
   * @param {number} id - The high score ID
   * @returns {Promise<HighScore | null>} - The high score or null if not found
   */
  static async getById(id: number): Promise<HighScore | null> {
    const result = await pool.query(
      'SELECT * FROM high_scores WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

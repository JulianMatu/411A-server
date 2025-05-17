import pool from '../config/database';

/**
 * Initialize database schema
 */
export const initializeDb = async (): Promise<void> => {
  try {
    // Create high scores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS high_scores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index on score for faster sorting
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores (score DESC)
    `);
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
};

/**
 * Drop database tables (for testing purposes)
 */
export const dropTables = async (): Promise<void> => {
  try {
    await pool.query('DROP TABLE IF EXISTS high_scores');
    console.log('Tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDb()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

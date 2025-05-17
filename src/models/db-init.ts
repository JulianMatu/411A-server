import pool from '../config/database';

/**
 * Attempts to connect to the database
 * Useful for testing if the connection is working
 */
export const testConnection = async (): Promise<boolean> => {
  let client;
  try {
    console.log('Testing database connection...');
    client = await pool.connect();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    if (client) client.release();
  }
};

/**
 * Initialize database schema
 */
export const initializeDb = async (): Promise<void> => {
  let client;
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds
  
  while (retryCount < maxRetries) {
    try {
      // Check connection first
      const connectionSuccess = await testConnection();
      if (!connectionSuccess) {
        throw new Error('Failed to connect to database');
      }
      
      client = await pool.connect();
      
      // Create high scores table
      await client.query(`
        CREATE TABLE IF NOT EXISTS high_scores (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          score INTEGER NOT NULL CHECK (score >= 0),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create index on score for faster sorting
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores (score DESC)
      `);
      
      console.log('Database schema initialized successfully');
      return;
    } catch (error) {
      retryCount++;
      console.error(`Error initializing database schema (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount >= maxRetries) {
        console.error('Maximum retries reached. Database initialization failed.');
        throw error;
      }
      
      // Wait before retrying
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } finally {
      if (client) client.release();
    }
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

// Test connection to Cloud SQL using Unix socket
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if necessary environment variables are set
if (!process.env.INSTANCE_CONNECTION_NAME) {
  console.error('Error: INSTANCE_CONNECTION_NAME environment variable is required');
  process.exit(1);
}

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('Error: DB_USER, DB_PASSWORD, and DB_NAME environment variables are required');
  process.exit(1);
}

// Set up socket path
const socketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME;

console.log(`Testing connection to Cloud SQL instance: ${instanceConnectionName}`);
console.log(`Using socket path: ${socketPath}/${instanceConnectionName}`);

// Create a connection pool with Unix socket
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: `${socketPath}/${instanceConnectionName}`,
  connectionTimeoutMillis: 5000, // 5 seconds
});

// Test the connection
async function testConnection() {
  let client;
  
  try {
    console.log('Attempting to connect to database...');
    client = await pool.connect();
    console.log('Successfully connected to database!');
    
    // Perform a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Query result:', result.rows[0]);
    
    return true;
  } catch (err) {
    console.error('Error connecting to database:', err);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('Database connection test completed successfully');
      process.exit(0);
    } else {
      console.log('Database connection test failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });

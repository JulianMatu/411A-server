import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine if we're connecting to Cloud SQL via Unix socket
const isUnixSocketConnection = process.env.INSTANCE_CONNECTION_NAME ? true : false;
const socketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

// Configure the connection based on environment
let poolConfig: PoolConfig;

if (isUnixSocketConnection) {
  // Unix socket connection for Cloud SQL
  poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: `${socketPath}/${process.env.INSTANCE_CONNECTION_NAME}`,
    // Add connection pooling settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
  };
  console.log('Configuring Cloud SQL connection using Unix socket');
} else {
  // Standard TCP connection
  poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Add connection pooling settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
  };
  console.log('Configuring PostgreSQL connection using TCP');
}

// Create a connection pool
const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  if (isUnixSocketConnection) {
    console.log(`Connected to Cloud SQL PostgreSQL database via Unix socket at ${socketPath}/${process.env.INSTANCE_CONNECTION_NAME}`);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Export for use in other files
export default pool;

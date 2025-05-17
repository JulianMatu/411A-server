import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Determine if we're connecting to Cloud SQL via Unix socket
const isUnixSocketConnection = process.env.INSTANCE_CONNECTION_NAME ? true : false;
const socketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

// For debugging purposes, log the connection type and variables
console.log(`Database connection mode: ${isUnixSocketConnection ? 'UNIX Socket' : 'TCP'}`);
if (isUnixSocketConnection) {
  console.log(`INSTANCE_CONNECTION_NAME: ${process.env.INSTANCE_CONNECTION_NAME}`);
  console.log(`Socket path: ${socketPath}`);
  console.log(`Full socket path: ${socketPath}/${process.env.INSTANCE_CONNECTION_NAME}`);
  
  // Check if socket directory exists
  if (fs.existsSync(socketPath)) {
    console.log(`Socket directory exists: ${socketPath}`);
    
    // List contents of socket directory
    try {
      const files = fs.readdirSync(socketPath);
      console.log(`Socket directory contents: ${files.join(', ')}`);
      
      // Check if instance directory exists
      const instanceDir = `${socketPath}/${process.env.INSTANCE_CONNECTION_NAME}`;
      if (fs.existsSync(instanceDir)) {
        console.log(`Instance directory exists: ${instanceDir}`);
        
        // List contents of instance directory
        try {
          const instanceFiles = fs.readdirSync(instanceDir);
          console.log(`Instance directory contents: ${instanceFiles.join(', ')}`);
        } catch (err: any) {
          console.error(`Error reading instance directory: ${err.message || err}`);
        }
      } else {
        console.error(`Instance directory does not exist: ${instanceDir}`);
      }
    } catch (err: any) {
      console.error(`Error reading socket directory: ${err.message || err}`);
    }
  } else {
    console.error(`Socket directory does not exist: ${socketPath}`);
  }
}

// Configure the connection based on environment
let poolConfig: PoolConfig;

if (isUnixSocketConnection) {
  // Unix socket connection for Cloud SQL
  poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // For PostgreSQL, when connecting via Unix domain socket,
    // we need to provide the directory containing the .s.PGSQL.5432 socket file.
    // The socket file is named .s.PGSQL.5432 and will be inside the instance directory.
    host: `${socketPath}/${process.env.INSTANCE_CONNECTION_NAME}`,
    
    // No need to specify port when using a Unix socket
    // The connection string will look for .s.PGSQL.5432 automatically
    
    // Add connection pooling settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 5000, // Increased timeout for Cloud SQL connections
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
  console.error('Unexpected error on PostgreSQL client', err);
  // Don't exit the process on connection error - this allows for retries
  // process.exit(-1);
});

// Export for use in other files
export default pool;

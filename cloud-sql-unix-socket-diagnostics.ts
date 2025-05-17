// Cloud SQL Unix Socket Connection Troubleshooter
// This script helps diagnose issues with Cloud SQL Unix socket connections

import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert exec to promise-based
const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

// Required environment variables
const requiredVars = ['INSTANCE_CONNECTION_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

// Check if required environment variables are present
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error(`\nMake sure you have the following variables set in your .env file:`);
  console.error(`INSTANCE_CONNECTION_NAME=project:region:instance`);
  console.error(`DB_USER=your_username`);
  console.error(`DB_PASSWORD=your_password`);
  console.error(`DB_NAME=your_database_name`);
  process.exit(1);
}

// Unix socket path
const socketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
const instanceName = process.env.INSTANCE_CONNECTION_NAME as string;
const socketFullPath = `${socketPath}/${instanceName}`;
const pgsqlSocket = `${socketFullPath}/.s.PGSQL.5432`;

// Display environment information
async function displayEnvironmentInfo() {
  console.log('📊 Environment Information:');
  console.log(`- Node.js version: ${process.version}`);
  console.log(`- Platform: ${process.platform}`);
  console.log(`- Database connection type: Unix Socket`);
  console.log(`- Socket path: ${socketPath}`);
  console.log(`- Instance connection name: ${instanceName}`);
  console.log(`- Expected socket file: ${pgsqlSocket}`);
  
  // Check for environment variables
  console.log('\n🔑 Environment Variables:');
  console.log(`- INSTANCE_CONNECTION_NAME: ${maskString(process.env.INSTANCE_CONNECTION_NAME || '')}`);
  console.log(`- DB_USER: ${maskString(process.env.DB_USER || '')}`);
  console.log(`- DB_PASSWORD: ${maskString(process.env.DB_PASSWORD || '', true)}`);
  console.log(`- DB_NAME: ${maskString(process.env.DB_NAME || '')}`);
  console.log(`- DB_SOCKET_PATH: ${process.env.DB_SOCKET_PATH || '/cloudsql (default)'}`);
}

// Check the socket directory
async function checkSocketDirectory() {
  console.log('\n📁 Socket Directory Check:');
  
  // Check if socket directory exists
  if (!fs.existsSync(socketPath)) {
    console.error(`❌ Socket directory does not exist: ${socketPath}`);
    console.log('   This is typically created by the Cloud Run service when adding a Cloud SQL instance.');
    return false;
  }
  
  console.log(`✅ Socket directory exists: ${socketPath}`);
  
  // Check permissions on socket directory
  try {
    const stats = fs.statSync(socketPath);
    const permissions = stats.mode.toString(8).slice(-3);
    console.log(`   - Permissions: ${permissions}`);
    
    if (permissions !== '777' && permissions !== '775' && permissions !== '755') {
      console.warn(`⚠️ Socket directory permissions (${permissions}) may be too restrictive. Recommended: 777`);
    }
  } catch (err: any) {
    console.error(`❌ Error checking socket directory permissions: ${err.message}`);
  }
  
  // List contents of socket directory
  try {
    const files = fs.readdirSync(socketPath);
    console.log(`   - Contents: ${files.length === 0 ? '(empty)' : files.join(', ')}`);
    
    if (!files.includes(instanceName)) {
      console.error(`❌ Instance directory not found in socket directory!`);
      console.log(`   This suggests the Cloud SQL instance is not properly attached to your Cloud Run service.`);
      return false;
    }
  } catch (err: any) {
    console.error(`❌ Error reading socket directory: ${err.message}`);
    return false;
  }
  
  return true;
}

// Check the instance directory
async function checkInstanceDirectory() {
  console.log('\n📁 Instance Directory Check:');
  
  // Check if instance directory exists
  if (!fs.existsSync(socketFullPath)) {
    console.error(`❌ Instance directory does not exist: ${socketFullPath}`);
    return false;
  }
  
  console.log(`✅ Instance directory exists: ${socketFullPath}`);
  
  // List contents of instance directory
  try {
    const files = fs.readdirSync(socketFullPath);
    console.log(`   - Contents: ${files.length === 0 ? '(empty)' : files.join(', ')}`);
    
    // Check for PostgreSQL socket
    if (!files.includes('.s.PGSQL.5432')) {
      console.error(`❌ PostgreSQL socket file (.s.PGSQL.5432) not found in instance directory!`);
      return false;
    } else {
      console.log(`✅ PostgreSQL socket file found: .s.PGSQL.5432`);
    }
  } catch (err: any) {
    console.error(`❌ Error reading instance directory: ${err.message}`);
    return false;
  }
  
  return true;
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n🔄 Testing Database Connection:');
  
  // Create a connection pool with Unix socket
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: socketFullPath,
    connectionTimeoutMillis: 10000, // 10 seconds
  });
  
  let client;
  try {
    console.log(`   Attempting to connect to database...`);
    client = await pool.connect();
    console.log(`✅ Successfully connected to database!`);
    
    // Perform a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Database query successful. Server time: ${result.rows[0].current_time}`);
    
    return true;
  } catch (err: any) {
    console.error(`❌ Database connection failed: ${err.message}`);
    
    // Suggest fixes based on error message
    if (err.message.includes('ENOENT')) {
      console.error(`   This error suggests the Unix socket file doesn't exist.`);
      console.error(`   Make sure your Cloud SQL instance is properly attached to your Cloud Run service.`);
      console.error(`   Check the --add-cloudsql-instances flag in your deployment command.`);
    } else if (err.message.includes('password authentication failed')) {
      console.error(`   This error suggests your database credentials are incorrect.`);
    } else if (err.message.includes('database "')) {
      console.error(`   This error suggests the specified database doesn't exist.`);
      console.error(`   You may need to create the database first.`);
    }
    
    return false;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Helper function to mask sensitive information
function maskString(str: string, isPassword = false): string {
  if (!str) return '(not set)';
  if (isPassword) return '********';
  if (str.length <= 8) return str;
  return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
}

// Run all the checks
async function runDiagnostics() {
  console.log('🔍 Starting Cloud SQL Unix Socket Connection Diagnostics\n');
  
  // Step 1: Display environment information
  await displayEnvironmentInfo();
  
  // Step 2: Check socket directory
  const socketDirOk = await checkSocketDirectory();
  if (!socketDirOk) {
    console.log('\n⚠️ Socket directory check failed. This must be fixed before proceeding.');
    console.log('   Make sure your Cloud SQL instance is properly attached to your Cloud Run service.');
    console.log('   Check your deployment command includes: --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME');
    return false;
  }
  
  // Step 3: Check instance directory
  const instanceDirOk = await checkInstanceDirectory();
  if (!instanceDirOk) {
    console.log('\n⚠️ Instance directory check failed. This must be fixed before proceeding.');
    return false;
  }
  
  // Step 4: Test database connection
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('\n⚠️ Database connection test failed.');
    return false;
  }
  
  console.log('\n✅ All diagnostics passed! Your Cloud SQL Unix socket connection is working correctly.');
  return true;
}

// Run the diagnostics
runDiagnostics()
  .then((success) => {
    if (!success) {
      console.log('\n📋 Troubleshooting Summary:');
      console.log('1. Make sure your Cloud SQL instance exists and is running');
      console.log('2. Make sure you\'ve properly attached the Cloud SQL instance to your Cloud Run service');
      console.log('3. Make sure your instance connection name is correct (PROJECT_ID:REGION:INSTANCE_NAME)');
      console.log('4. Make sure your database exists in the Cloud SQL instance');
      console.log('5. Make sure your database credentials are correct');
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('An unexpected error occurred during diagnostics:', err);
    process.exit(1);
  });

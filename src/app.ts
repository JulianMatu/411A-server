import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import highScoreRoutes from './routes/high-score.routes';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { initializeDb } from './models/db-init';

// Load environment variables
dotenv.config();

// Initialize the Express application
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api', highScoreRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Whack-a-Mole High Scores API',
    version: '1.0.0',
    endpoints: {
      highScores: '/api/highscores'
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database on startup
const startServer = async () => {
  try {
    // Initialize the database schema
    await initializeDb();
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  }
};

// Run database initialization if this file is run directly
if (require.main === module) {
  startServer();
}

// Call startServer but don't wait for it to complete
// This ensures the app is exported immediately while initializing the DB in the background
startServer().catch(err => {
  console.error('Database initialization error:', err);
});

// Export for use in index.ts and for testing purposes
export default app;

import { Request, Response, NextFunction } from 'express';

/**
 * Validate high score input
 */
export const validateHighScoreInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, score } = req.body;
  const errors: string[] = [];

  // Check if name exists and is a string
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  // Check if score exists and is a positive integer
  if (score === undefined || score === null) {
    errors.push('Score is required');
  } else if (!Number.isInteger(Number(score)) || Number(score) < 0) {
    errors.push('Score must be a positive integer');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  next();
};

/**
 * Rate limiting middleware
 * This is a simple in-memory implementation. For production, consider using 
 * a more robust solution like 'express-rate-limit' with Redis store.
 */
const requestCounts: Record<string, { count: number; startTime: number }> = {};
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // Default: 1 minute
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10); // Default: 60 requests per minute

export const rateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || '';
  const now = Date.now();
  
  // Initialize or reset entry if the time window has passed
  if (!requestCounts[ip] || now - requestCounts[ip].startTime > windowMs) {
    requestCounts[ip] = { count: 1, startTime: now };
    next();
    return;
  }
  
  // Increment the request count
  requestCounts[ip].count++;
  
  // Check if the request count exceeds the limit
  if (requestCounts[ip].count > maxRequests) {
    res.status(429).json({ 
      error: 'Too Many Requests', 
      message: 'Rate limit exceeded. Please try again later.'
    });
    return;
  }
  
  next();
};

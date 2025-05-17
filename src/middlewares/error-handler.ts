import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
    return;
  }

  // Handle database errors
  if (err.message.includes('database') || err.message.includes('sql')) {
    res.status(500).json({
      error: 'Database Error',
      message: 'A database error occurred'
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Server Error',
    message: 'An unexpected error occurred'
  });
};

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

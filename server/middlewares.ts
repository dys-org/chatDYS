import { NextFunction, Request, Response } from 'express';
import OpenAI from 'openai';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof OpenAI.APIError) {
    const { status, message, code, type } = err;
    res.status(status ?? 500).json({ message, code, type });
    return;
  }
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

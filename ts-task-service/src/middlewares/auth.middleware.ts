import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenPayloadSchema } from '../schemas/auth.schema';
import { AppError } from '../errors/app-error';
import { JWT_SECRET } from '../config/config';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token not found!');
  }
  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const payload = tokenPayloadSchema.parse(decoded);
    req.userId = payload.sub;
    next();
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token!');
  }
}

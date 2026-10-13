import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AppErrorCode, AppError } from '../errors/app-error';

interface ErrorResponseBody {
  success: false;
  code: AppErrorCode;
  message: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    const errorRes: ErrorResponseBody = {
      success: false,
      code: 'VALIDATION_ERROR',
      message: validationError.message,
    };
    res.status(400).json(errorRes);
    return;
  }
  if (err instanceof AppError) {
    const errorRes: ErrorResponseBody = {
      success: false,
      code: err.code,
      message: err.message,
    };
    res.status(err.status).json(errorRes);
    return;
  }
  console.error('INTERNAL SERVER ERROR: ', err);

  const errorRes: ErrorResponseBody = {
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error!',
  };

  res.status(500).json(errorRes);
  return;
};

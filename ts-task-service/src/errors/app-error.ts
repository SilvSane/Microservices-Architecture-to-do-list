export class AppError extends Error {
  status: number;
  code: AppErrorCode;

  constructor(status: number, code: AppErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'KAFKA_COMMUNICATION_ERROR'
  | (string & {});

//make it global later

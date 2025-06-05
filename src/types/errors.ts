export class DashboardError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'DashboardError';
  }
}

export type ErrorCode = 
  | 'NO_TURMA'
  | 'FETCH_ERROR'
  | 'NOT_FOUND'
  | 'MISSING_ID'
  | 'INTERNAL_ERROR';

export interface DashboardErrorType {
  code: ErrorCode;
  message: string;
}

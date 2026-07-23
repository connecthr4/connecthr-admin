export interface ApiErrorInfo {
  message: string;
  success: boolean;
}

export function getApiErrorInfo(err: unknown): ApiErrorInfo {
  const error = err as any;

  const message = (error?.details && (error.details as any).message) ?? error?.message ?? 'Request failed';

  const success = (error?.details && (error.details as any).success) ?? false;

  return { message: String(message), success };
}

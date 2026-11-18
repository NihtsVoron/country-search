import { HttpError } from './errors.js';

export type ErrorKind = 'cancelled' | 'timeout' | 'http' | 'network';

export function classifyError(error: unknown): ErrorKind {
  if (error instanceof HttpError) {
    return 'http';
  }

  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name: unknown }).name)
      : '';

  if (name === 'AbortError') {
    return 'cancelled';
  }

  if (name === 'TimeoutError') {
    return 'timeout';
  }

  return 'network';
}

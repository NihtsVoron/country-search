export type ErrorKind = 'cancelled' | 'timeout' | 'http' | 'network';

export function classifyError(error: unknown): ErrorKind {
  void error;
  throw new Error('not implemented');
}

import type { CountryRaw } from './types.js';

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs: number = 8000,
): Promise<CountryRaw[]> {
  void query;
  void signal;
  void timeoutMs;
  throw new Error('not implemented');
}

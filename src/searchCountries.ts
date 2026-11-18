import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants.js';
import { HttpError } from './errors.js';
import type { CountryRaw } from './types.js';

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<CountryRaw[]> {
  signal.throwIfAborted();

  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
  const url = `${API_BASE_URL}${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal: requestSignal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const data: unknown = await response.json();

  return Array.isArray(data) ? (data as CountryRaw[]) : [];
}

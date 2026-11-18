import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './constants.js';
import { HttpError } from './errors.js';
export async function searchCountries(query, signal, timeoutMs = DEFAULT_TIMEOUT_MS) {
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
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}
//# sourceMappingURL=searchCountries.js.map
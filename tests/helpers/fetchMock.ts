export interface PendingCall {
  url: string;
  signal: AbortSignal | undefined;
  respond: (response: Response) => void;
  fail: (reason: unknown) => void;
}

export interface FetchMock {
  fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
  calls: PendingCall[];
}

/**
 * Мок `fetch`, который сам ничего не отвечает: тест решает, когда и что вернуть.
 * Если по переданному сигналу вызван abort(), промис отклоняется его причиной —
 * ровно так ведёт себя настоящий fetch (AbortError / TimeoutError).
 */
export function createFetchMock(): FetchMock {
  const calls: PendingCall[] = [];

  const fetchMock = (input: string | URL | Request, init?: RequestInit): Promise<Response> =>
    new Promise<Response>((resolve, reject) => {
      const signal = init?.signal ?? undefined;
      const url = input instanceof Request ? input.url : String(input);

      if (signal?.aborted === true) {
        reject(signal.reason);
        return;
      }

      signal?.addEventListener('abort', () => reject(signal.reason), { once: true });

      calls.push({
        url,
        signal,
        respond: (response: Response): void => resolve(response),
        fail: (reason: unknown): void => reject(reason),
      });
    });

  return { fetch: fetchMock, calls };
}

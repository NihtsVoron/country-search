import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mapCountryResponse } from '../src/mapCountryResponse.js';
import { createSearchController } from '../src/searchController.js';
import { searchCountries } from '../src/searchCountries.js';
import type { CountryCard, SearchState } from '../src/types.js';
import { spainRaw } from './fixtures/spain.js';
import { createFetchMock } from './helpers/fetchMock.js';

const DEBOUNCE = 300;

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

interface Setup {
  states: SearchState[];
  controller: ReturnType<typeof createSearchController>;
}

function setup(): Setup {
  const states: SearchState[] = [];

  const controller = createSearchController({
    search: async (query: string, signal: AbortSignal): Promise<CountryCard[]> =>
      (await searchCountries(query, signal, 5000)).map(mapCountryResponse),
    onState: (state: SearchState): void => {
      states.push(state);
    },
    debounceMs: DEBOUNCE,
  });

  return { states, controller };
}

describe('search race', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('aborts the stale request instead of rendering its late response', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);
    const { controller, states } = setup();

    controller.input('sp');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(mock.calls).toHaveLength(1);

    controller.input('spain');
    expect(mock.calls[0]?.signal?.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(mock.calls).toHaveLength(2);

    mock.calls[1]?.respond(jsonResponse([spainRaw]));
    await vi.advanceTimersByTimeAsync(0);

    mock.calls[0]?.respond(jsonResponse([spainRaw]));
    await vi.advanceTimersByTimeAsync(0);

    expect(states.at(-1)).toMatchObject({ kind: 'results', query: 'spain' });
    expect(states.filter((state): boolean => state.kind === 'error')).toHaveLength(0);
  });

  it('does not send a request when the query is cleared before debounce fires', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);
    const { controller, states } = setup();

    controller.input('spain');
    controller.input('');
    await vi.advanceTimersByTimeAsync(DEBOUNCE * 3);

    expect(mock.calls).toHaveLength(0);
    expect(states.at(-1)).toEqual({ kind: 'idle' });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSearchController } from '../src/searchController.js';
import type { SearchController } from '../src/searchController.js';
import type { CountryCard, SearchState } from '../src/types.js';

const DEBOUNCE = 300;

function card(name: string): CountryCard {
  return {
    id: name,
    name,
    flagUrl: '',
    capital: '',
    region: '',
    population: 0,
    languages: [],
    nativeName: name,
    subregion: '',
    demonym: '',
    area: null,
    borders: [],
    currencies: [],
    timezones: [],
  };
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = (): void => {};
  let reject: (reason: unknown) => void = (): void => {};

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

interface Setup {
  states: SearchState[];
  queries: string[];
  controller: SearchController;
}

function setup(search: (query: string, signal: AbortSignal) => Promise<CountryCard[]>): Setup {
  const states: SearchState[] = [];
  const queries: string[] = [];

  const controller = createSearchController({
    search: async (query: string, signal: AbortSignal): Promise<CountryCard[]> => {
      queries.push(query);
      return search(query, signal);
    },
    onState: (state: SearchState): void => {
      states.push(state);
    },
    debounceMs: DEBOUNCE,
  });

  return { states, queries, controller };
}

const lastState = (states: SearchState[]): SearchState | undefined => states.at(-1);

describe('createSearchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the idle state and sends nothing for an empty query', async () => {
    const { controller, states, queries } = setup(async (): Promise<CountryCard[]> => []);

    controller.input('');

    expect(lastState(states)).toEqual({ kind: 'idle' });
    await vi.advanceTimersByTimeAsync(1000);
    expect(queries).toHaveLength(0);
  });

  it('treats a whitespace-only query as empty', async () => {
    const { controller, states, queries } = setup(async (): Promise<CountryCard[]> => []);

    controller.input('   ');
    await vi.advanceTimersByTimeAsync(1000);

    expect(lastState(states)).toEqual({ kind: 'idle' });
    expect(queries).toHaveLength(0);
  });

  it('shows loading right away, before debounce fires', () => {
    const { controller, states, queries } = setup(async (): Promise<CountryCard[]> => []);

    controller.input('spain');

    expect(lastState(states)).toEqual({ kind: 'loading', query: 'spain' });
    expect(queries).toHaveLength(0);
  });

  it('collapses a burst of keystrokes into one request', async () => {
    const { controller, states, queries } = setup(async (): Promise<CountryCard[]> => []);

    controller.input('s');
    controller.input('sp');
    controller.input('spa');
    controller.input('spain');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    expect(queries).toEqual(['spain']);
    expect(lastState(states)).toEqual({ kind: 'empty', query: 'spain' });
  });

  it('renders results with the found items', async () => {
    const { controller, states } = setup(async (): Promise<CountryCard[]> => [
      card('Spain'),
      card('Spain 2'),
    ]);

    controller.input('spain');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    expect(lastState(states)).toMatchObject({ kind: 'results', query: 'spain' });
    const state = lastState(states);
    expect(state?.kind === 'results' ? state.items : []).toHaveLength(2);
  });

  it('renders the empty state for an empty array', async () => {
    const { controller, states } = setup(async (): Promise<CountryCard[]> => []);

    controller.input('zzzzzz');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    expect(lastState(states)).toEqual({ kind: 'empty', query: 'zzzzzz' });
  });

  it('renders an error with the network reason', async () => {
    const { controller, states } = setup(async (): Promise<CountryCard[]> => {
      throw new TypeError('Failed to fetch');
    });

    controller.input('spain');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    expect(lastState(states)).toEqual({ kind: 'error', query: 'spain', reason: 'network' });
  });

  it('renders an error with the timeout reason', async () => {
    const { controller, states } = setup(async (): Promise<CountryCard[]> => {
      throw new DOMException('Timed out', 'TimeoutError');
    });

    controller.input('spain');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    expect(lastState(states)).toEqual({ kind: 'error', query: 'spain', reason: 'timeout' });
  });

  it('never shows our own cancellation as an error', async () => {
    const first = deferred<CountryCard[]>();

    let calls = 0;
    const { controller, states } = setup((): Promise<CountryCard[]> => {
      calls += 1;
      return calls === 1 ? first.promise : Promise.resolve([card('Spain')]);
    });

    controller.input('sp');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    controller.input('spa');
    first.reject(new DOMException('Aborted', 'AbortError'));
    await vi.advanceTimersByTimeAsync(DEBOUNCE);

    expect(states.some((state): boolean => state.kind === 'error')).toBe(false);
    expect(lastState(states)).toMatchObject({ kind: 'results', query: 'spa' });
  });

  it('retry repeats the last query immediately, without debounce', async () => {
    let calls = 0;
    const { controller, states, queries } = setup((): Promise<CountryCard[]> => {
      calls += 1;
      return calls === 1
        ? Promise.reject(new DOMException('HTTP 500', 'HttpError'))
        : Promise.resolve([card('Spain')]);
    });

    controller.input('spain');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(lastState(states)).toMatchObject({ kind: 'error' });

    controller.retry();
    expect(lastState(states)).toEqual({ kind: 'loading', query: 'spain' });

    await vi.advanceTimersByTimeAsync(0);
    expect(lastState(states)).toMatchObject({ kind: 'results', query: 'spain' });
    expect(queries).toEqual(['spain', 'spain']);
  });

  it('retry still repeats the last query after the field is cleared', async () => {
    const { controller, queries } = setup(async (): Promise<CountryCard[]> => [card('Spain')]);

    controller.input('spain');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    controller.input('');
    controller.retry();

    await vi.advanceTimersByTimeAsync(0);
    expect(queries).toEqual(['spain', 'spain']);
  });

  it('retry does nothing when nothing was searched yet', () => {
    const { controller, states, queries } = setup(async (): Promise<CountryCard[]> => []);

    controller.retry();

    expect(queries).toHaveLength(0);
    expect(states).toHaveLength(0);
  });
});

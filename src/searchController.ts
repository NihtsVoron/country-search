import { classifyError } from './classifyError.js';
import { debounce } from './debounce.js';
import type { CountryCard, SearchState } from './types.js';

export interface SearchController {
  /** Вызывается на каждое изменение поля ввода. */
  input(text: string): void;
  /** Повторяет последний введённый запрос, без debounce. */
  retry(): void;
}

export interface SearchControllerDeps {
  search: (query: string, signal: AbortSignal) => Promise<CountryCard[]>;
  onState: (state: SearchState) => void;
  debounceMs: number;
}

export function createSearchController(deps: SearchControllerDeps): SearchController {
  const { search, onState, debounceMs } = deps;

  let current: AbortController | undefined;
  let lastQuery = '';

  const run = async (query: string, controller: AbortController): Promise<void> => {
    if (controller.signal.aborted) {
      return;
    }

    try {
      const items = await search(query, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      onState(items.length > 0 ? { kind: 'results', query, items } : { kind: 'empty', query });
    } catch (error) {
      const kind = classifyError(error);

      if (kind === 'cancelled') {
        return;
      }

      if (controller.signal.aborted) {
        return;
      }

      onState({ kind: 'error', query, reason: kind });
    }
  };

  const scheduleSearch = debounce((query: string, controller: AbortController): void => {
    void run(query, controller);
  }, debounceMs);

  return {
    input(text: string): void {
      current?.abort();

      const query = text.trim();

      if (query === '') {
        current = undefined;
        onState({ kind: 'idle' });
        return;
      }

      lastQuery = query;

      const controller = new AbortController();
      current = controller;

      onState({ kind: 'loading', query });
      scheduleSearch(query, controller);
    },

    retry(): void {
      if (lastQuery === '') {
        return;
      }

      current?.abort();

      const query = lastQuery;
      const controller = new AbortController();
      current = controller;

      onState({ kind: 'loading', query });
      void run(query, controller);
    },
  };
}

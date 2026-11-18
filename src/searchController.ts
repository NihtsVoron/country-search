import type { CountryCard, SearchState } from './types.js';

export interface SearchController {
  input(text: string): void;
  retry(): void;
}

export interface SearchControllerDeps {
  search: (query: string, signal: AbortSignal) => Promise<CountryCard[]>;
  onState: (state: SearchState) => void;
  debounceMs: number;
}

export function createSearchController(deps: SearchControllerDeps): SearchController {
  void deps;
  throw new Error('not implemented');
}

import { DEBOUNCE_MS } from './constants.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import { searchCountries } from './searchCountries.js';
import { createSearchController } from './searchController.js';
import type { CountryCard } from './types.js';
import { createUi } from './ui.js';

const ui = createUi(document.body);

const controller = createSearchController({
  search: async (query: string, signal: AbortSignal): Promise<CountryCard[]> =>
    (await searchCountries(query, signal)).map(mapCountryResponse),
  onState: ui.render,
  debounceMs: DEBOUNCE_MS,
});

ui.setRetryHandler((): void => {
  controller.retry();
});

ui.input.addEventListener('input', (event: Event): void => {
  const target = event.target;

  if (target instanceof HTMLInputElement) {
    controller.input(target.value);
  }
});

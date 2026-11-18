import { describe, expect, it } from 'vitest';

import { mapCountryResponse } from '../src/mapCountryResponse.js';
import { noCapitalRaw } from './fixtures/noCapital.js';
import { severalLanguagesRaw } from './fixtures/severalLanguages.js';
import { spainRaw } from './fixtures/spain.js';

describe('mapCountryResponse', () => {
  it('maps the fields of the list card', () => {
    expect(mapCountryResponse(spainRaw)).toMatchObject({
      id: 'ESP',
      name: 'Spain',
      flagUrl: 'https://flagcdn.com/es.svg',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: ['Spanish'],
    });
  });

  it('maps the fields of the detail view', () => {
    expect(mapCountryResponse(spainRaw)).toMatchObject({
      nativeName: 'España',
      subregion: 'Southern Europe',
      demonym: 'Spanish',
      area: 505992,
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      currencies: ['Euro (€, EUR)'],
      timezones: ['UTC', 'UTC+01:00'],
    });
  });

  it('keeps an empty capital when the API has none', () => {
    const card = mapCountryResponse(noCapitalRaw);

    expect(card.capital).toBe('');
    expect(card.area).toBeNull();
    expect(card.borders).toEqual([]);
  });

  it('maps several languages', () => {
    expect(mapCountryResponse(severalLanguagesRaw).languages).toEqual(['Swahili', 'English']);
  });

  it('does not mutate its input', () => {
    const snapshot = structuredClone(severalLanguagesRaw);
    const card = mapCountryResponse(severalLanguagesRaw);

    expect(severalLanguagesRaw).toEqual(snapshot);
    expect(card.languages).not.toBe(severalLanguagesRaw.languages);
    expect(card.borders).not.toBe(severalLanguagesRaw.borders);
  });

  it('returns equal results for equal input', () => {
    expect(mapCountryResponse(spainRaw)).toEqual(mapCountryResponse(spainRaw));
  });

  it('falls back to defaults when optional fields are missing', () => {
    expect(mapCountryResponse({ name: 'Nowhere' })).toEqual({
      id: '',
      name: 'Nowhere',
      flagUrl: '',
      capital: '',
      region: '',
      population: 0,
      languages: [],
      nativeName: 'Nowhere',
      subregion: '',
      demonym: '',
      area: null,
      borders: [],
      currencies: [],
      timezones: [],
    });
  });
});

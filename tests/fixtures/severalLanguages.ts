import type { CountryRaw } from '../../src/types.js';

/**
 * Реальный ответ GET https://countries.dev/alpha/TZ.
 * Особенность: два языка и две валюты в одном ответе.
 */
export const severalLanguagesRaw: CountryRaw = {
  area: 945087,
  cioc: 'TAN',
  flag: '🇹🇿',
  gini: 40.5,
  name: 'Tanzania, United Republic of',
  flags: {
    png: 'https://flagcdn.com/w320/tz.png',
    svg: 'https://flagcdn.com/tz.svg',
  },
  latlng: [-6, 35],
  region: 'Africa',
  borders: ['BDI', 'COD', 'KEN', 'MWI', 'MOZ', 'RWA', 'UGA', 'ZMB'],
  capital: 'Dodoma',
  demonym: 'Tanzanian',
  languages: [
    {
      name: 'Swahili',
      iso639_1: 'sw',
      iso639_2: 'swa',
      nativeName: 'Kiswahili',
    },
    {
      name: 'English',
      iso639_1: 'en',
      iso639_2: 'eng',
      nativeName: 'English',
    },
  ],
  subregion: 'Eastern Africa',
  timezones: ['UTC+03:00'],
  alpha2Code: 'TZ',
  alpha3Code: 'TZA',
  currencies: [{ code: 'TZS', name: 'Tanzanian shilling', symbol: 'Sh' }],
  nativeName: 'Tanzania',
  population: 59734213,
  independent: true,
  numericCode: '834',
  callingCodes: ['255'],
  topLevelDomain: ['.tz'],
  populationDensity: 63.2,
};

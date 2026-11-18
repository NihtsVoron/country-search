import type { CountryRaw } from '../../src/types.js';

/**
 * Реальный ответ GET https://countries.dev/alpha/UM.
 * Особенность: у страны нет capital, area и borders — хорошая проверка фолбэков.
 */
export const noCapitalRaw: CountryRaw = {
  flag: '🇺🇲',
  name: 'United States Minor Outlying Islands',
  flags: {
    png: 'https://flagcdn.com/w320/um.png',
    svg: 'https://flagcdn.com/um.svg',
  },
  region: 'Americas',
  demonym: 'American',
  languages: [
    {
      name: 'English',
      iso639_1: 'en',
      iso639_2: 'eng',
      nativeName: 'English',
    },
  ],
  subregion: 'Northern America',
  timezones: ['UTC-11:00', 'UTC-10:00', 'UTC+12:00'],
  alpha2Code: 'UM',
  alpha3Code: 'UMI',
  currencies: [{ code: 'GBP', name: 'British pound', symbol: '£' }],
  nativeName: 'United States Minor Outlying Islands',
  population: 300,
  independent: false,
  numericCode: '581',
  callingCodes: ['246'],
  topLevelDomain: ['.us'],
};

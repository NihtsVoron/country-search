export interface CountryLanguageRaw {
  name: string;
  iso639_1?: string;
  iso639_2?: string;
  nativeName?: string;
}

export interface CountryCurrencyRaw {
  code?: string;
  name?: string;
  symbol?: string;
}

export interface CountryFlagsRaw {
  svg?: string;
  png?: string;
}

export interface CountryRaw {
  name: string;
  alpha2Code?: string;
  alpha3Code?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  languages?: CountryLanguageRaw[];
  currencies?: CountryCurrencyRaw[];
  flags?: CountryFlagsRaw;
  flag?: string;
  nativeName?: string;
  demonym?: string;
  timezones?: string[];
  [key: string]: unknown;
}

export interface CountryCard {
  id: string;
  name: string;
  flagUrl: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  nativeName: string;
  subregion: string;
  demonym: string;
  area: number | null;
  borders: string[];
  currencies: string[];
  timezones: string[];
}

export type SearchErrorReason = 'timeout' | 'http' | 'network';

export type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading'; query: string }
  | { kind: 'results'; query: string; items: CountryCard[] }
  | { kind: 'empty'; query: string }
  | { kind: 'error'; query: string; reason: SearchErrorReason };

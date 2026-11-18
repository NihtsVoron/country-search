/** База эндпоинта поиска по имени: к ней добавляется encodeURIComponent(query). */
export const API_BASE_URL = 'https://countries.dev/name/';
/** Предел ожидания ответа: дольше — это таймаут, а не «ещё грузится». */
export const DEFAULT_TIMEOUT_MS = 8000;
/** Задержка debounce: схлопывает набор слова, оставаясь незаметной. */
export const DEBOUNCE_MS = 300;
/** Ключ истории поиска в localStorage. */
export const HISTORY_STORAGE_KEY = 'country-search:history';
/** Сколько последних запросов хранить. */
export const HISTORY_LIMIT = 10;
//# sourceMappingURL=constants.js.map
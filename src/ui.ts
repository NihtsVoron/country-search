import type { CountryCard, SearchState } from './types.js';

export interface Ui {
  input: HTMLInputElement;
  render: (state: SearchState) => void;
  setRetryHandler: (handler: () => void) => void;
}

const POPULATION_FORMAT = new Intl.NumberFormat('ru-RU');

const ERROR_TEXT: Record<'timeout' | 'http' | 'network', string> = {
  timeout: 'Сервер не ответил вовремя. Попробуйте ещё раз.',
  http: 'Сервер вернул ошибку. Попробуйте ещё раз.',
  network: 'Нет соединения с сервером. Проверьте сеть и попробуйте снова.',
};

function createText(tag: string, className: string, text: string): HTMLElement {
  const element = document.createElement(tag);

  if (className !== '') {
    element.className = className;
  }

  element.textContent = text;

  return element;
}

function createDetailRow(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'detail';
  row.append(
    createText('span', 'detail__label', label),
    createText('span', 'detail__value', value),
  );

  return row;
}

function createCard(card: CountryCard, onOpen: (card: CountryCard) => void): HTMLElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card';

  const flag = document.createElement('img');
  flag.className = 'card__flag';
  flag.alt = '';

  if (card.flagUrl === '') {
    flag.hidden = true;
  } else {
    flag.src = card.flagUrl;
    flag.loading = 'lazy';
  }

  const population = POPULATION_FORMAT.format(card.population);
  const meta = `${card.capital === '' ? '—' : card.capital} · ${card.region === '' ? '—' : card.region} · ${population} чел.`;

  button.append(
    flag,
    createText('span', 'card__name', card.name),
    createText('span', 'card__meta', meta),
  );

  button.addEventListener('click', (): void => onOpen(card));

  return button;
}

export function createUi(root: HTMLElement): Ui {
  const heading = createText('h1', 'title', 'Поиск страны');

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search';
  input.placeholder = 'Например, spain';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Поиск страны по названию');

  const results = document.createElement('div');
  results.className = 'results';
  results.setAttribute('aria-live', 'polite');
  results.setAttribute('aria-busy', 'false');

  const dialog = document.createElement('dialog');
  dialog.className = 'dialog';

  root.append(heading, input, results, dialog);

  let retryHandler: (() => void) | undefined;

  const openDetails = (card: CountryCard): void => {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'dialog__close';
    close.textContent = 'Закрыть';
    close.addEventListener('click', (): void => dialog.close());

    const rows = document.createElement('div');
    rows.className = 'dialog__rows';
    rows.append(
      createDetailRow('Оригинальное название', card.nativeName === '' ? '—' : card.nativeName),
      createDetailRow('Столица', card.capital === '' ? 'нет данных' : card.capital),
      createDetailRow(
        'Регион',
        [card.subregion, card.region].filter((part): boolean => part !== '').join(', ') || '—',
      ),
      createDetailRow('Население', `${POPULATION_FORMAT.format(card.population)} чел.`),
      createDetailRow(
        'Площадь',
        card.area === null ? 'нет данных' : `${POPULATION_FORMAT.format(card.area)} км²`,
      ),
      createDetailRow('Языки', card.languages.join(', ') || 'нет данных'),
      createDetailRow('Валюта', card.currencies.join(', ') || 'нет данных'),
      createDetailRow('Границы', card.borders.join(', ') || 'нет данных'),
      createDetailRow('Часовые пояса', card.timezones.join(', ') || 'нет данных'),
      createDetailRow('Народ', card.demonym === '' ? '—' : card.demonym),
    );

    dialog.replaceChildren(close, createText('h2', 'dialog__title', card.name), rows);
    dialog.showModal();
  };

  const render = (state: SearchState): void => {
    switch (state.kind) {
      case 'idle': {
        results.setAttribute('aria-busy', 'false');
        results.replaceChildren();
        return;
      }

      case 'loading': {
        results.setAttribute('aria-busy', 'true');
        const status = createText('p', 'status', `Ищем «${state.query}»…`);
        status.setAttribute('role', 'status');
        results.replaceChildren(status);
        return;
      }

      case 'results': {
        results.setAttribute('aria-busy', 'false');
        results.replaceChildren(
          ...state.items.map((card): HTMLElement => createCard(card, openDetails)),
        );
        return;
      }

      case 'empty': {
        results.setAttribute('aria-busy', 'false');
        const status = createText(
          'p',
          'status status--empty',
          `По запросу «${state.query}» ничего не найдено`,
        );
        status.setAttribute('role', 'status');
        results.replaceChildren(status);
        return;
      }

      case 'error': {
        results.setAttribute('aria-busy', 'false');

        const box = document.createElement('div');
        box.className = 'error';

        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'error__retry';
        retry.textContent = 'Повторить';
        retry.addEventListener('click', (): void => retryHandler?.());

        box.append(createText('p', 'error__text', ERROR_TEXT[state.reason]), retry);
        results.replaceChildren(box);
      }
    }
  };

  return {
    input,
    render,
    setRetryHandler(handler: () => void): void {
      retryHandler = handler;
    },
  };
}

import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '../src/errors.js';
import { searchCountries } from '../src/searchCountries.js';
import { spainRaw } from './fixtures/spain.js';
import { createFetchMock } from './helpers/fetchMock.js';

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with an array of countries on 200', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    const promise = searchCountries('spain', new AbortController().signal);
    mock.calls[0]?.respond(jsonResponse([spainRaw]));

    await expect(promise).resolves.toEqual([spainRaw]);
  });

  it('treats 404 as an empty result, not as an error', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    const promise = searchCountries('zzzzzz', new AbortController().signal);
    mock.calls[0]?.respond(new Response('Country not found', { status: 404 }));

    await expect(promise).resolves.toEqual([]);
  });

  it('throws HttpError on 500', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    const promise = searchCountries('spain', new AbortController().signal);
    mock.calls[0]?.respond(new Response('boom', { status: 500 }));

    const error: unknown = await promise.then(
      (): unknown => null,
      (reason: unknown): unknown => reason,
    );

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
    expect((error as HttpError).status).toBe(500);
  });

  it('propagates a network error', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    const promise = searchCountries('spain', new AbortController().signal);
    mock.calls[0]?.fail(new TypeError('Failed to fetch'));

    await expect(promise).rejects.toBeInstanceOf(TypeError);
  });

  it('rejects with AbortError when the signal is aborted during the request', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    const controller = new AbortController();
    const promise = searchCountries('spain', controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects with AbortError when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(searchCountries('spain', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('rejects with TimeoutError when the server stays silent', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    await expect(searchCountries('spain', new AbortController().signal, 20)).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });

  it('encodes the query exactly once', async () => {
    const mock = createFetchMock();
    vi.stubGlobal('fetch', mock.fetch);

    void searchCountries('united states', new AbortController().signal);

    expect(mock.calls[0]?.url).toBe('https://countries.dev/name/united%20states');
  });
});

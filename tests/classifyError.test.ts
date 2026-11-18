import { describe, expect, it } from 'vitest';

import { classifyError } from '../src/classifyError.js';
import { HttpError } from '../src/errors.js';

describe('classifyError', () => {
  it('treats AbortError as our own cancellation', () => {
    expect(classifyError(new DOMException('Aborted', 'AbortError'))).toBe('cancelled');
  });

  it('recognises TimeoutError separately from AbortError', () => {
    expect(classifyError(new DOMException('Timed out', 'TimeoutError'))).toBe('timeout');
  });

  it('recognises HttpError', () => {
    expect(classifyError(new HttpError(500))).toBe('http');
  });

  it('treats a network failure as network', () => {
    expect(classifyError(new TypeError('Failed to fetch'))).toBe('network');
  });

  it('does not throw on values that are not errors', () => {
    expect(classifyError('oops')).toBe('network');
    expect(classifyError(undefined)).toBe('network');
    expect(classifyError(null)).toBe('network');
    expect(classifyError(42)).toBe('network');
  });

  it('recognises an abort-shaped object even without DOMException', () => {
    expect(classifyError({ name: 'AbortError' })).toBe('cancelled');
    expect(classifyError({ name: 'TimeoutError' })).toBe('timeout');
  });
});

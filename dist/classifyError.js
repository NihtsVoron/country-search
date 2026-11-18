import { HttpError } from './errors.js';
export function classifyError(error) {
    if (error instanceof HttpError) {
        return 'http';
    }
    const name = typeof error === 'object' && error !== null && 'name' in error
        ? String(error.name)
        : '';
    if (name === 'AbortError') {
        return 'cancelled';
    }
    if (name === 'TimeoutError') {
        return 'timeout';
    }
    return 'network';
}
//# sourceMappingURL=classifyError.js.map
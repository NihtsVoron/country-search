import { classifyError } from './classifyError.js';
import { debounce } from './debounce.js';
export function createSearchController(deps) {
    const { search, onState, debounceMs } = deps;
    let current;
    let lastQuery = '';
    const run = async (query, controller) => {
        if (controller.signal.aborted) {
            return;
        }
        try {
            const items = await search(query, controller.signal);
            if (controller.signal.aborted) {
                return;
            }
            onState(items.length > 0 ? { kind: 'results', query, items } : { kind: 'empty', query });
        }
        catch (error) {
            const kind = classifyError(error);
            if (kind === 'cancelled') {
                return;
            }
            if (controller.signal.aborted) {
                return;
            }
            onState({ kind: 'error', query, reason: kind });
        }
    };
    const scheduleSearch = debounce((query, controller) => {
        void run(query, controller);
    }, debounceMs);
    return {
        input(text) {
            current?.abort();
            const query = text.trim();
            if (query === '') {
                current = undefined;
                onState({ kind: 'idle' });
                return;
            }
            lastQuery = query;
            const controller = new AbortController();
            current = controller;
            onState({ kind: 'loading', query });
            scheduleSearch(query, controller);
        },
        retry() {
            if (lastQuery === '') {
                return;
            }
            current?.abort();
            const query = lastQuery;
            const controller = new AbortController();
            current = controller;
            onState({ kind: 'loading', query });
            void run(query, controller);
        },
    };
}
//# sourceMappingURL=searchController.js.map
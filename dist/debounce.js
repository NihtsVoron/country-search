export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            timer = undefined;
            fn(...args);
        }, delay);
    };
}
//# sourceMappingURL=debounce.js.map
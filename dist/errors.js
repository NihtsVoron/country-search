export class HttpError extends Error {
    status;
    constructor(status, message = `HTTP ${String(status)}`) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}
//# sourceMappingURL=errors.js.map
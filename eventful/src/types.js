export class ListenerError extends Error {
    constructor(message, error, object, event, listener) {
        super(message);
        this.name = 'ListenerError';
        this.error = error;
        this.object = object;
        this.event = event;
        this.listener = listener;
    }
}

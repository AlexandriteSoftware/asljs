export function eventTypeGuard(value) {
    if (typeof value !== 'string'
        && typeof value !== 'symbol') {
        throw new TypeError('Expect event to be a string or symbol.');
    }
}
export function isFunction(value) {
    return typeof value === 'function';
}
export function isObject(value) {
    return typeof value === 'object'
        && value !== null;
}
export function functionTypeGuard(value) {
    if (!isFunction(value)) {
        throw new TypeError('Expect a function.');
    }
}

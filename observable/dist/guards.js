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

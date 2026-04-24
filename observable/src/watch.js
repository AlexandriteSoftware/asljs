import { asEventfulLike } from 'asljs-eventful';
import { functionTypeGuard, isObject, } from './guards.js';
function splitPath(path) {
    if (path.trim() === '') {
        throw new TypeError('Expect watch path to be a non-empty string.');
    }
    const rawSegments = path.split('.');
    for (const rawSegment of rawSegments) {
        if (rawSegment.trim() === '') {
            throw new TypeError('Expect watch path segments to be non-empty.');
        }
    }
    return path
        .split('.')
        .map(segment => segment.trim())
        .filter(segment => segment !== '');
}
function readPathValue(source, path) {
    const segments = splitPath(path);
    if (segments.length === 0) {
        return undefined;
    }
    let current = source;
    for (const segment of segments) {
        if (!isObject(current)
            || !(segment in current)) {
            return undefined;
        }
        current = current[segment];
    }
    return current;
}
export const watchImpl = (target, properties, callback) => {
    if (Array.isArray(target)) {
        throw new TypeError('Watching arrays is not supported.');
    }
    functionTypeGuard(callback);
    const propertiesList = typeof properties === 'string'
        ? [properties]
        : properties;
    if (!Array.isArray(propertiesList)) {
        throw new TypeError('Expect properties to be a string or an array of strings.');
    }
    for (const property of propertiesList) {
        if (typeof property !== 'string') {
            throw new TypeError('Expect properties to be a string or an array of strings.');
        }
        splitPath(property);
    }
    const getValues = () => propertiesList.map(property => readPathValue(target, property));
    const unwatchers = [];
    for (const property of propertiesList) {
        const segments = splitPath(property);
        let unwatchPath = null;
        const bindPath = () => {
            const localUnwatchers = [];
            const bindFrom = (current, index) => {
                if (!isObject(current)
                    || index >= segments.length) {
                    return;
                }
                const segment = segments[index];
                const eventfulLike = asEventfulLike(current);
                if (eventfulLike) {
                    const unwatch = eventfulLike.on(`set:${segment}`, () => {
                        callback(...getValues());
                        if (index < segments.length - 1
                            && unwatchPath) {
                            unwatchPath();
                            unwatchPath = bindPath();
                        }
                    });
                    localUnwatchers.push(unwatch);
                }
                if (index < segments.length - 1) {
                    bindFrom(current[segment], index + 1);
                }
            };
            bindFrom(target, 0);
            return () => localUnwatchers.reduce((result, unwatch) => unwatch() || result, false);
        };
        unwatchPath = bindPath();
        unwatchers.push(() => unwatchPath
            ? unwatchPath()
            : false);
    }
    callback(...getValues());
    return () => unwatchers.reduce((result, unwatch) => unwatch() || result, false);
};
export function ensureWatchMethod(target, watchFn) {
    if ('watch' in target)
        return;
    Object.defineProperty(target, 'watch', { configurable: true,
        writable: true,
        enumerable: false,
        value(properties, callback) {
            if (typeof properties === 'string') {
                return watchFn(this, properties, callback);
            }
            return watchFn(this, properties, callback);
        } });
}

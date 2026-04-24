export function readModelPath(model, path) {
    if (path === '')
        return null;
    if (hasGetMethod(model))
        return model.get(path);
    return readNestedPath(model, path);
}
function hasGetMethod(value) {
    return typeof value.get === 'function';
}
function readNestedPath(source, path) {
    const parts = path
        .split('.')
        .map(part => part.trim())
        .filter(part => part !== '');
    let current = source;
    for (const part of parts) {
        if (typeof current !== 'object'
            || current === null
            || !(part in current)) {
            return null;
        }
        current =
            current[part];
    }
    return current;
}

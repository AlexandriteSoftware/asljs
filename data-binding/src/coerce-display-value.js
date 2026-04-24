/**
 * Converts value of any type to a string suitable for display in the UI.
 *
 * - `null` and `undefined` are converted to empty string
 * - `Date` objects are converted to ISO strings
 * - all other values are converted using `String()`
 */
export function coerceDisplayValue(value) {
    if (value === null
        || value === undefined) {
        return '';
    }
    if (value instanceof Date)
        return value.toISOString();
    return String(value);
}

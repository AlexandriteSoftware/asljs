import { coerceDisplayValue } from './coerce-display-value.js';
/**
 * Last step of value binding: writes the value to the target element.
 */
export function writeBindingValue(element, target, value) {
    if (target.kind === 'class') {
        element.classList.toggle(target.name, Boolean(value));
        return;
    }
    if (target.kind === 'prop') {
        const propertyName = target.name;
        element[propertyName] = value;
        return;
    }
    if (target.kind === 'attr') {
        if (value === null
            || value === undefined) {
            element.removeAttribute(target.name);
            return;
        }
        element.setAttribute(target.name, coerceDisplayValue(value));
        return;
    }
    const displayValue = coerceDisplayValue(value);
    if (target.kind === 'html') {
        element.innerHTML = displayValue;
        return;
    }
    element.textContent = displayValue;
}

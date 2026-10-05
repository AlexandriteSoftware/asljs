import { coerceDisplayValue }
  from './coerce-display-value.js';
import { BindingTarget }
  from './types.js';

/**
 * Last step of value binding: writes the value to the target element.
 */
export function writeBindingValue(
    element: HTMLElement,
    target: BindingTarget,
    value: unknown
  ): void
{
  if (target.kind === 'class') {
    element.classList.toggle(
      target.name,
      Boolean(value));

    return;
  }

  if (target.kind === 'prop') {
    const propertyName =
      target.name as keyof HTMLElement;

    // A nullish value is written as the property's empty value: false for a
    // boolean property such as hidden, '' for any other. Assigned as it is,
    // undefined would show as the text "undefined" in an input.
    const written =
      value === null
        || value === undefined
      ? emptyValueOf(
        element[propertyName])
      : value;

    (element[propertyName] as unknown) = written;

    return;
  }

  if (target.kind === 'attr') {
    if (
      value === null
      || value === undefined
    ) {
      element.removeAttribute(
        target.name);

      return;
    }

    element.setAttribute(
      target.name,
      coerceDisplayValue(value));

    return;
  }

  const displayValue =
    coerceDisplayValue(value);

  if (target.kind === 'html') {
    element.innerHTML = displayValue;

    return;
  }

  element.textContent = displayValue;
}

function emptyValueOf(
    current: unknown
  ): false | ''
{
  if (
    typeof current
    === 'boolean'
  ) {
    return false;
  }

  return '';
}

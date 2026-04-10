import {
    coerceDisplayValue
  } from './coerce-display-value.js';
import {
    type BindingTarget
  } from './types.js';


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

    (element[propertyName] as unknown) = value;

    return;
  }

  if (target.kind === 'attr') {
    if (value === null
        || value === undefined)
    {
      element.removeAttribute(target.name);

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

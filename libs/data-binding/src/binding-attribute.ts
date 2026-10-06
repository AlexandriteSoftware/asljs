import { parseEventBindingExpression,
         parseValueBindingExpression }
  from './parse-data-model-binding.js';
import { BindingSpec,
         BindingTarget }
  from './types.js';

export const BIND_PREFIX = 'data-bind-';

export const CONTEXT_ATTR = 'data-bind-context';

/**
 * Turns the part of a binding attribute's name after `data-bind-` and its value
 * into a binding. The runtime and `data-bind-compile` both read attributes
 * through it, so a template is checked by the rules it is bound by.
 */
export function createBindingSpec(
    suffix: string,
    expression: string
  ): BindingSpec
{
  if (isEventSuffix(suffix)) {
    return parseEventBindingExpression(
      suffix.slice(
        'on-'.length),
      expression);
  }

  return parseValueBindingExpression(
    resolveValueTarget(suffix),
    expression);
}

/**
 * True for `on-<event>`: the event name follows `on-` and is used as written,
 * so `on-click` listens to `click` and `on-key-submit` to `key-submit`.
 */
export function isEventSuffix(
    suffix: string
  ): boolean
{
  return suffix.startsWith('on-')
    && suffix.length > 'on-'.length;
}

function resolveValueTarget(
    suffix: string
  ): BindingTarget
{
  if (suffix === 'text') {
    return { kind: 'text' };
  }

  if (suffix === 'html') {
    return { kind: 'html' };
  }

  if (
    suffix.startsWith('class-')
    && suffix.length > 6
  ) {
    return { kind: 'class',
             name:
               suffix.slice(
                 'class-'.length) };
  }

  if (
    suffix.startsWith('prop-')
    && suffix.length > 5
  ) {
    return { kind: 'prop',
             name:
               toPropertyName(
                 suffix.slice(
                   'prop-'.length)) };
  }

  return { kind: 'attr',
           name: suffix };
}

/**
 * Converts the property part of a `data-bind-prop-<name>` attribute the way
 * `dataset` converts a `data-*` name: each hyphen followed by a lowercase
 * letter is removed and the letter uppercased, so `read-only` becomes
 * `readOnly`. The HTML parser lowercases attribute names, so this is the only
 * way to reach a camel-case property.
 */
function toPropertyName(
    name: string
  ): string
{
  return name.replace(
    /-([a-z])/g,
    (
      _match: string,
      letter: string
    ) => letter.toUpperCase());
}

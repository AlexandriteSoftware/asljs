/**
 * Parses a data-bind value expression.
 *
 * @example
 * ```ts
 * parseValueBindingExpression(
 *   { kind: 'text' },
 *   'name | upper');
 * ```
 */
export function parseValueBindingExpression(target, expression) {
    const segments = splitExpressionTokens(expression, '|')
        .map(segment => segment.trim())
        .filter(segment => segment !== '');
    const path = segments[0] ?? '';
    const pipes = segments
        .slice(1)
        .map(parsePipe)
        .filter((pipe) => pipe !== null);
    return {
        kind: 'value',
        target,
        path,
        pipes
    };
}
/**
 * Parses a data-bind event expression.
 *
 * @example
 * ```ts
 * parseEventBindingExpression(
 *   'click',
 *   'activate');
 * ```
 */
export function parseEventBindingExpression(eventName, expression) {
    const actionPath = expression.trim();
    return {
        kind: 'event',
        eventName,
        actionPath
    };
}
function parsePipe(text) {
    const trimmed = text.trim();
    const firstColon = trimmed.indexOf(':');
    const name = (firstColon < 0
        ? trimmed
        : trimmed.slice(0, firstColon))
        .trim();
    if (name === '') {
        return null;
    }
    if (firstColon < 0) {
        return {
            name,
            args: []
        };
    }
    const args = parsePipeArgs(trimmed, firstColon + 1);
    return {
        name,
        args
    };
}
function parsePipeArgs(text, index) {
    const args = [];
    let i = index;
    while (i < text.length) {
        while (i < text.length
            && text[i] === ' ') {
            i++;
        }
        if (i >= text.length || text[i] === '|') {
            break;
        }
        if (text[i] === '\'' || text[i] === '"') {
            const quote = text[i];
            i++;
            let value = '';
            let escape = false;
            while (i < text.length) {
                const char = text[i];
                if (escape) {
                    value += char;
                    escape = false;
                    i++;
                    continue;
                }
                if (char === '\\') {
                    escape = true;
                    i++;
                    continue;
                }
                if (char === quote) {
                    i++;
                    break;
                }
                value += char;
                i++;
            }
            args.push(value);
        }
        else {
            let value = '';
            while (i < text.length) {
                const char = text[i];
                if (char === ':' || char === '|') {
                    break;
                }
                value += char;
                i++;
            }
            args.push(value.trim());
        }
        while (i < text.length
            && text[i] === ' ') {
            i++;
        }
        if (i < text.length && text[i] === ':') {
            i++;
            continue;
        }
        if (i < text.length && text[i] === '|') {
            break;
        }
    }
    return args;
}
function splitExpressionTokens(text, delimiter, stripQuotes = false) {
    const tokens = [];
    let current = '';
    let quote = null;
    let escape = false;
    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (escape) {
            current += char;
            escape = false;
            continue;
        }
        if (char === '\\') {
            if (!stripQuotes) {
                current += char;
            }
            escape = true;
            continue;
        }
        if (quote !== null) {
            if (char === quote) {
                quote = null;
                if (!stripQuotes) {
                    current += char;
                }
                continue;
            }
            current += char;
            continue;
        }
        if (char === '\'' || char === '"') {
            quote = char;
            if (!stripQuotes) {
                current += char;
            }
            continue;
        }
        if (char === delimiter) {
            tokens.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    tokens.push(current);
    return tokens;
}

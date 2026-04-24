import { observable } from 'asljs-observable';
import { mergePipes } from './pipes.js';
import { readModelPath } from './read-model-path.js';
import { writeBindingValue } from './write-binding-value.js';
export function bindValueModel(element, spec, model, options) {
    const pipeRegistry = mergePipes(options);
    const compiledPipes = compilePipes(spec.pipes, pipeRegistry);
    const update = () => {
        const rawValue = readModelPath(model, spec.path);
        const formattedValue = applyPipes(rawValue, compiledPipes);
        writeBindingValue(element, spec.target, formattedValue);
    };
    update();
    if (spec.path === '')
        return () => { };
    const maybeUnsubscribe = observable.watch(model, spec.path, () => update());
    if (typeof maybeUnsubscribe !== 'function')
        return () => { };
    return () => maybeUnsubscribe();
}
function compilePipes(pipes, registry) {
    const compiled = [];
    for (const pipe of pipes) {
        const formatter = registry[pipe.name];
        if (!formatter) {
            throw new Error(`Unknown pipe: ${pipe.name}`);
        }
        compiled.push({ args: [...pipe.args],
            formatter });
    }
    return compiled;
}
function applyPipes(value, pipes) {
    let current = value;
    for (const pipe of pipes) {
        current =
            pipe.formatter(current, ...pipe.args);
    }
    return current;
}

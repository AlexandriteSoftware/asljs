import { observable } from 'asljs-observable';
import { readModelPath } from './read-model-path.js';
export function bindEventModel(element, spec, model, warnPrefix, warnOnce) {
    let currentAction = readModelPath(model, spec.actionPath);
    const refreshAction = () => {
        currentAction =
            readModelPath(model, spec.actionPath);
    };
    const listener = (event) => {
        if (typeof currentAction !== 'function') {
            warnOnce(`${warnPrefix}:missing-action:${spec.actionPath}`, `${warnPrefix}: action '${spec.actionPath}' is not a function`);
            return;
        }
        try {
            currentAction(event, model, element);
        }
        catch (error) {
            warnOnce(`${warnPrefix}:action-error:${spec.actionPath}`, `${warnPrefix}: action '${spec.actionPath}' failed`, error);
        }
    };
    element.addEventListener(spec.eventName, listener);
    let unsubscribe = null;
    if (spec.actionPath !== '') {
        const maybeUnsubscribe = observable.watch(model, spec.actionPath, () => refreshAction());
        if (typeof maybeUnsubscribe === 'function')
            unsubscribe = maybeUnsubscribe;
    }
    return () => {
        element.removeEventListener(spec.eventName, listener);
        unsubscribe?.();
    };
}

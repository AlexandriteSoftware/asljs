import { MessageContext }
  from './types.js';

const instanceIds =
  new WeakMap<object | Function, string>();

const instanceCounters = new Map<string, number>();

let messageCounter = 0;

let currentContext: MessageContext | null = null;

/**
 * Returns a stable identifier for an instance, assigning one on first use.
 *
 * The identifier is `<type>#<n>`, where the type is the constructor name, so a
 * trace reads as `Cart#1 -> Basket#2` rather than as opaque numbers. Instances
 * are held weakly, so identifying one does not keep it alive.
 */
export function instanceId(
    object: object | Function
  ): string
{
  const existing =
    instanceIds.get(object);

  if (existing !== undefined) {
    return existing;
  }

  const typeName =
    getTypeName(object);

  const nextCount =
    (instanceCounters.get(typeName)
    ?? 0)
    + 1;

  instanceCounters.set(
    typeName,
    nextCount);

  const id =
    `${typeName}#${nextCount}`;

  instanceIds.set(
    object,
    id);

  return id;
}

/**
 * Returns the message being dispatched on this call stack, or null outside a
 * dispatch.
 */
export function getCurrentMessageContext(
  ): MessageContext | null
{
  return currentContext;
}

/**
 * Creates the context for a message about to be sent.
 *
 * A message sent while another is being dispatched is caused by it and joins
 * its correlation. A message sent outside any dispatch starts a correlation of
 * its own.
 */
export function nextMessageContext(
  ): MessageContext
{
  messageCounter += 1;

  const messageId =
    `m${messageCounter}`;

  if (currentContext === null) {
    return { messageId,
             correlationId: messageId,
             causationId: null };
  }

  return { messageId,
           correlationId:
             currentContext.correlationId,
           causationId:
             currentContext.messageId };
}

/**
 * Runs `fn` with `context` as the current message, restoring the previous one
 * afterwards.
 *
 * The context is ambient on the call stack, so it reaches emits made
 * synchronously by a listener. A listener that emits after awaiting has already
 * left this stack; such a message starts a new correlation unless the listener
 * carries the context itself.
 */
export function runInMessageContext<T>(
    context: MessageContext,
    fn: () => T
  ): T
{
  const previousContext = currentContext;

  currentContext = context;

  try {
    return fn();
  } finally {
    currentContext = previousContext;
  }
}

function getTypeName(
    object: object | Function
  ): string
{
  if (
    typeof object
    === 'function'
  ) {
    return object.name === ''
      ? 'Function'
      : object.name;
  }

  const constructorName =
    (object as { constructor?: { name?: string; }; })
    .constructor?.name;

  return constructorName === undefined
      || constructorName === ''
    ? 'Object'
    : constructorName;
}

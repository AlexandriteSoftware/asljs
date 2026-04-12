/**
 * A message published to the broadcast channel when a Table commits a change.
 *
 * Fields for loop prevention and deduplication:
 *  - `originId`  — unique ID of the Table instance that produced the message.
 *  - `messageId` — unique ID of this particular message.
 *
 * A Table that receives a message with `originId === this.#instanceId` must
 * discard it to prevent echo/loop.
 */
export interface TableBroadcastMessage {
  /** Unique ID of this specific message (for deduplication). */
  readonly messageId: string;
  /** Unique ID of the Table instance that originated the message. */
  readonly originId: string;
  /** Name of the IndexedDB object store (Table.storeName). */
  readonly storeName: string;
  /** The table event type that triggered the broadcast. */
  readonly eventType: 'add' | 'update' | 'delete' | 'clear';
  /**
   * Serialisable event payload.
   * Shape matches the TableEvents tuple for the given eventType:
   *  - add/delete:  `{ record: T }`
   *  - update:      `{ record: T; previousRecord: T }`
   *  - clear:       `{ records: T[] }`
   */
  readonly payload: unknown;
}

/**
 * Abstraction over a publish/subscribe transport used by Table to
 * broadcast committed changes to other tabs/windows.
 *
 * The implementation is deliberately decoupled from BroadcastChannel so
 * that callers can use any equivalent mechanism (e.g. BroadcastChannel,
 * SharedWorker messages, or in-process mocks for tests).
 */
export interface TableBroadcastService {
  /**
   * Publish a committed-change message to all other subscribers.
   * Called only after a successful IndexedDB transaction.
   */
  publish(message: TableBroadcastMessage): void;

  /**
   * Subscribe to incoming broadcast messages.
   * Returns a disposal function that removes the subscription.
   */
  subscribe(
      handler: (message: TableBroadcastMessage) => void
    ): () => void;
}

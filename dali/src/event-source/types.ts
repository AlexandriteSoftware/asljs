export const EVENT_SOURCE_STORE_NAME =
  'event_source_transactions';

export const EVENT_SOURCE_PROJECTION_STORE_NAME =
  'event_source_projections';

export type EventSourceEvent =
  { tableName: string;
    eventName: string;
    forward: unknown;
    undo: unknown; };

export type EventSourceTransaction =
  { id: string;
    previousTransactionId: string | null;
    sequence: number;
    sagaId: string;
    createdAt: string;
    events: EventSourceEvent[]; };

export type EventSourceProjection =
  { projectionId: string;
    appliedTransactionId: string | null;
    updatedAt: string; };

export interface EventSourceAdapter
{
  readonly name: string;

  peek(
    ): Promise<EventSourceTransaction | null>;

  append(
      transaction: EventSourceTransaction,
      expectedPreviousTransactionId: string | null
    ): Promise<void>;

  readAfter(
      transactionId: string | null
    ): Promise<EventSourceTransaction[]>;
}

export class EventSourceConflictError
  extends Error
{
  constructor(
      message: string
    )
  {
    super(message);

    this.name = 'EventSourceConflictError';
  }
}
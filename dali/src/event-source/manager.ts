import { EventSourceAdapter,
         EventSourceConflictError,
         EventSourceEvent,
         EventSourceTransaction }
  from './types.js';

export class EventSourceManager
{
  constructor(
    public readonly local: EventSourceAdapter,
    public readonly linked: EventSourceAdapter[] = []
  )
  {
  }

  async appendTransaction(
    args: { sagaId: string; events: EventSourceEvent[]; id?: string; }
  ): Promise<EventSourceTransaction>
  {
    let attempt = 0;

    while (attempt < 4) {
      attempt += 1;

      await this.synchronize();

      const head =
        await this.local.peek();

      const previousTransactionId =
        head?.id
        ?? null;

      const sequence =
        (head?.sequence ?? 0) + 1;

      const transaction: EventSourceTransaction =
        {
        id: args.id ?? crypto.randomUUID(),
        previousTransactionId,
        sequence,
        sagaId: args.sagaId,
        createdAt: new Date().toISOString(),
        events: args.events
      };

      try {
        for (const adapter of this.linked) {
          const remoteHead =
            await adapter.peek();

          const remotePrevious =
            remoteHead?.id
            ?? null;

          if (remotePrevious !== previousTransactionId) {
            throw new EventSourceConflictError(
              `${adapter.name}: head mismatch before append.`
            );
          }

          await adapter.append(
            transaction,
            previousTransactionId);
        }

        await this.local.append(
          transaction,
          previousTransactionId);

        return transaction;
      } catch (error) {
        if (!(error instanceof EventSourceConflictError)) {
          throw error;
        }

        if (attempt >= 4) {
          throw error;
        }
      }
    }

    throw new EventSourceConflictError(
      'Failed to append transaction after retries.'
    );
  }

  async synchronize(): Promise<void>
  {
    for (const adapter of this.linked) {
      await this.#pullFrom(adapter);
    }
  }

  async readAfter(
    transactionId: string | null
  ): Promise<EventSourceTransaction[]>
  {
    return this.local.readAfter(transactionId);
  }

  async getLocalHead(): Promise<EventSourceTransaction | null>
  {
    return this.local.peek();
  }

  async #pullFrom(
    adapter: EventSourceAdapter
  ): Promise<void>
  {
    const localHead =
      await this.local.peek();

    const fromId =
      localHead?.id
      ?? null;

    let transactions: EventSourceTransaction[] = [];

    try {
      transactions = await adapter.readAfter(fromId);
    } catch (error) {
      if (error instanceof EventSourceConflictError) {
        transactions = await adapter.readAfter(null);
      } else {
        throw error;
      }
    }

    if (transactions.length === 0) {
      return;
    }

    let expected = fromId;

    for (const transaction of transactions) {
      if (transaction.previousTransactionId !== expected) {
        throw new EventSourceConflictError(
          `${adapter.name}: non-contiguous chain while pulling to local.`
        );
      }

      await this.local.append(
        transaction,
        expected);

      expected = transaction.id;
    }
  }
}

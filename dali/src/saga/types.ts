export const SAGA_STORE_NAME =
  'saga_transactions';

export const SAGA_ENTRIES_STORE_NAME =
  'saga_entries';

export type SagaStatus =
  'started'
  | 'completed'
  | 'rolled_back'
  | 'failed';

export type SagaUndoOperation =
  { type: 'delete';
    tableName: string;
    key: IDBValidKey; }
  | { type: 'put';
      tableName: string;
      record: Record<string, any>; }
  | { type: 'clear';
      tableName: string;
      records: Record<string, any>[]; };

export type SagaForwardOperation =
  { type: 'add';
    tableName: string;
    record: Record<string, any>; }
  | { type: 'update';
      tableName: string;
      record: Record<string, any>;
      previousRecord: Record<string, any>; }
  | { type: 'delete';
      tableName: string;
      record: Record<string, any>; }
  | { type: 'clear';
      tableName: string;
      records: Record<string, any>[]; };

export type SagaTransactionRecord =
  { id: string;
    name: string;
    status: SagaStatus;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    rollbackAt?: string;
    eventTransactionId?: string;
    error?: string; };

export type SagaEntryRecord =
  { id?: number;
    sagaId: string;
    sequence: number;
    tableName: string;
    eventName: string;
    forward: SagaForwardOperation;
    undo: SagaUndoOperation;
    createdAt: string; };
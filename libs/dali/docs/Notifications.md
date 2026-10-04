# Notifications

## Purpose

How a `Table` reports committed changes: `notify` for writes made by this
instance, `observe` for local and remote writes, and the broadcast service that
carries changes between tabs.

## Usage

`Table` supports two notification paths:

- If you want callbacks only for writes committed by this `Table` instance, then
  use `notify(receiver)`.
- If you want callbacks for local writes and remote writes from other tabs, then
  use `observe(receiver)`.

## Cross-tab delivery

Pass a `broadcastService` to the Table constructor to enable cross-tab delivery.
The service is an abstraction — you can implement it with `BroadcastChannel` or
any equivalent transport.

```ts
import {
    type TableBroadcastMessage,
    type TableBroadcastService,
  } from 'asljs-dali';

// BroadcastChannel-backed implementation
function makeBroadcastService(
    channelName: string
  ): TableBroadcastService
{
  const channel = new BroadcastChannel(channelName);

  return {
    publish(message: TableBroadcastMessage) {
      channel.postMessage(message);
    },
    subscribe(handler) {
      const listener = (ev: MessageEvent) => handler(ev.data);
      channel.addEventListener('message', listener);
      return () => channel.removeEventListener('message', listener);
    },
  };
}

const notes =
  new Table<Note>(
    'notes',
    db,
    { broadcastService: makeBroadcastService('notes-sync') });

// Local-only — fires only for writes made by this Table instance.
notes.notify(
  { add(record) { console.log('local add', record); } });

// Observed — fires for both local and remote writes.
// The `source` field tells you where the change came from.
const unobserve =
  notes.observe(event => {
    console.log(event.source, event.eventType);
    if (event.eventType === 'add')
      console.log(event.record);
  });

// When the Table is no longer needed, dispose it to stop listening.
notes.dispose();
```

## Delivery rules

- Broadcast messages are published only after a successful IndexedDB
  transaction; rolled-back or provisional changes are never broadcast.
- A Table instance discards its own echoed messages using a per-instance
  `originId` included in every broadcast message.
- Remote messages are routed only to `observe()` subscribers; local-only
  `notify()` subscribers are never called for remote events.
- A Table receiving a remote message does not re-publish it, preventing
  broadcast loops.

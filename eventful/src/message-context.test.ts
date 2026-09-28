import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { getCurrentMessageContext,
         instanceId,
         nextMessageContext,
         runInMessageContext }
  from './message-context.js';

const TEST_SUITE = 'message-context';

class Cart
{
}

test(
  `${TEST_SUITE}: instanceId is stable for the same instance`,
  () =>
  {
    const cart =
      new Cart();

    assert.equal(
      instanceId(cart),
      instanceId(cart));
  });

test(
  `${TEST_SUITE}: instanceId names the type and numbers the instance`,
  () =>
  {
    const first =
      new Cart();

    const second =
      new Cart();

    assert.match(
      instanceId(first),
      /^Cart#\d+$/);

    assert.notEqual(
      instanceId(first),
      instanceId(second));
  });

test(
  `${TEST_SUITE}: instanceId falls back to Object for a null prototype`,
  () =>
  {
    assert.match(
      instanceId(
        Object.create(null)),
      /^Object#\d+$/);
  });

test(
  `${TEST_SUITE}: instanceId uses the name of a function`,
  () =>
  {
    assert.match(
      instanceId(
        function handler (): void
        {
        }),
      /^handler#\d+$/);
  });

test(
  `${TEST_SUITE}: a message sent outside a dispatch starts a correlation`,
  () =>
  {
    const context =
      nextMessageContext();

    assert.equal(
      context.causationId,
      null);

    assert.equal(
      context.correlationId,
      context.messageId);
  });

test(
  `${TEST_SUITE}: a message sent during a dispatch is caused by it`,
  () =>
  {
    const first =
      nextMessageContext();

    const second =
      runInMessageContext(
        first,
        () => nextMessageContext());

    assert.equal(
      second.causationId,
      first.messageId);

    assert.equal(
      second.correlationId,
      first.correlationId);

    assert.notEqual(
      second.messageId,
      first.messageId);
  });

test(
  `${TEST_SUITE}: correlation survives a chain, causation tracks the parent`,
  () =>
  {
    const first =
      nextMessageContext();

    const third =
      runInMessageContext(
        first,
        () =>
        {
        const second =
          nextMessageContext();

        return runInMessageContext(
          second,
          () => nextMessageContext());
      });

    assert.equal(
      third.correlationId,
      first.correlationId);

    assert.notEqual(
      third.causationId,
      first.messageId);
  });

test(
  `${TEST_SUITE}: the previous context is restored, including after a throw`,
  () =>
  {
    const context =
      nextMessageContext();

    assert.equal(
      getCurrentMessageContext(),
      null);

    assert.throws(
      () =>
        runInMessageContext(
          context,
          (): void =>
          {
            assert.equal(
              getCurrentMessageContext()?.messageId,
              context.messageId);

            throw new Error('listener failed');
          }),
      /listener failed/);

    assert.equal(
      getCurrentMessageContext(),
      null);
  });

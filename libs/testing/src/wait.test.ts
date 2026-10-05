import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { flushMicrotasks,
         waitFor }
  from './wait.js';

test(
  'RQ005 flushMicrotasks runs a callback that queues one more',
  async () =>
  {
    let done = false;

    void Promise.resolve()
      .then(
        () => Promise.resolve())
      .then(
        () =>
        {
          done = true;
        });

    await flushMicrotasks();
    await flushMicrotasks();

    assert.equal(
      done,
      true);
  });

test(
  'RQ005 waitFor resolves at once when the condition already holds',
  async () =>
  {
    await waitFor(
      () => true);
  });

test(
  'RQ005 waitFor resolves once a timer makes the condition true',
  async () =>
  {
    let ready = false;

    setTimeout(
      () =>
      {
        ready = true;
      },
      10);

    await waitFor(
      () => ready);

    assert.equal(
      ready,
      true);
  });

test(
  'RQ005 waitFor rejects when the time runs out',
  async () =>
  {
    await assert.rejects(
      waitFor(
        () => false,
        20),
      /Timed out after 20 ms/);
  });

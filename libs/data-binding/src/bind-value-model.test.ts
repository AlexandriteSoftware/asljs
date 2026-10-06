import { observable,
         observe }
  from 'asljs-observable';
import { JSDOM }
  from 'jsdom';
import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { bindValueModel }
  from './bind-value-model.js';
import { ValueBindingSpec }
  from './types.js';

const TEST_SUITE = 'bind-value-model';

test(
  `${TEST_SUITE}: applies configured pipes in order`,
  () =>
  {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model: Record<string, unknown> =
      { value: 4 };

    const spec: ValueBindingSpec =
      { kind: 'value',
        target:
          { kind: 'text' },
        path: 'value',
        pipes:
          [ { name: 'add',
              args:
                [ '2' ] },
            { name: 'mul',
              args:
                [ '3' ] } ] };

    bindValueModel(
      element,
      spec,
      model,
      { pipes:
          { add:
              (value, amount) => Number(value) + Number(amount),
            mul:
              (value, factor) => Number(value) * Number(factor) } });

    assert.equal(
      element.textContent,
      '18');
  });

test(
  `${TEST_SUITE}: throws for unknown pipe during binding setup`,
  () =>
  {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model: Record<string, unknown> =
      { value: 'A' };

    const spec: ValueBindingSpec =
      { kind: 'value',
        target:
          { kind: 'text' },
        path: 'value',
        pipes:
          [ { name: 'missing',
              args: [ ] } ] };

    assert.throws(
      () =>
        bindValueModel(
          element,
          spec,
          model,
          {}),
      /Unknown pipe: missing/);
  });

test(
  `${TEST_SUITE}: pipe error propagates to caller`,
  () =>
  {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model: Record<string, unknown> =
      { value: 'X' };

    const spec: ValueBindingSpec =
      { kind: 'value',
        target:
          { kind: 'text' },
        path: 'value',
        pipes:
          [ { name: 'boom',
              args: [ ] } ] };

    assert.throws(
      () =>
        bindValueModel(
          element,
          spec,
          model,
          { pipes:
              { boom:
                  () =>
                  {
                throw new Error('broken');
              } } }),
      /broken/);
  });

test(
  `${TEST_SUITE}: renders nullish values as empty string for text and html`,
  () =>
  {
    const dom =
      new JSDOM(
        `
          <div>
            <span></span>
            <div></div>
          </div>
        `);

    const textElement =
      dom.window.document.querySelector(
        'span') as HTMLElement;

    const htmlElement =
      dom.window.document.querySelector(
        'div div') as HTMLElement;

    const model: Record<string, unknown> =
      { textValue: null,
        htmlValue: undefined };

    bindValueModel(
      textElement,
      { kind: 'value',
        target:
          { kind: 'text' },
        path: 'textValue',
        pipes: [ ] },
      model,
      {});

    bindValueModel(
      htmlElement,
      { kind: 'value',
        target:
          { kind: 'html' },
        path: 'htmlValue',
        pipes: [ ] },
      model,
      {});

    assert.equal(
      textElement.textContent,
      '');

    assert.equal(
      htmlElement.innerHTML,
      '');
  });

test(
  `${TEST_SUITE}: updates nested path via watch when leaf and ancestor change`,
  () =>
  {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    const model =
      observable(
        { user:
            { name: 'Alice' } },
        { deep: true });

    const spec: ValueBindingSpec =
      { kind: 'value',
        target:
          { kind: 'text' },
        path: 'user.name',
        pipes: [ ] };

    const dispose =
      bindValueModel(
        element,
        spec,
        model,
        {});

    assert.equal(
      element.textContent,
      'Alice');

    model.user.name = 'Bob';

    assert.equal(
      element.textContent,
      'Bob');

    model.user =
      observable(
        { name: 'Carol' });

    assert.equal(
      element.textContent,
      'Carol');

    dispose();

    model.user.name = 'Dan';

    assert.equal(
      element.textContent,
      'Carol');
  });

test(
  `${TEST_SUITE}: renders the value the watch delivered without reading the path again`,
  () =>
  {
    const dom =
      new JSDOM('<span></span>');

    const element =
      dom.window.document.querySelector('span') as HTMLElement;

    let reads = 0;

    // The model is not deep, so the user stays this proxy, which counts the
    // reads of its name.
    const user =
      new Proxy(
        { name: 'Ada' },
        { get:
            (
                target,
                property,
                receiver
              ) =>
            {
          if (property === 'name') {
            reads++;
          }

          return Reflect.get(
            target,
            property,
            receiver);
        } });

    const model =
      observable(
        { user });

    // The subscription's own reads, which the binding cannot avoid.
    observe(model)
      .at('user.name')
      .subscribe(
        () => { })();

    const subscriptionReads = reads;

    reads = 0;

    bindValueModel(
      element,
      { kind: 'value',
        target:
          { kind: 'text' },
        path: 'user.name',
        pipes: [ ] },
      model,
      {});

    assert.equal(
      element.textContent,
      'Ada');

    assert.equal(
      reads,
      subscriptionReads);
  });

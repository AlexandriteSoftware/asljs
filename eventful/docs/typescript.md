# TypeScript

## Purpose

How to get checked event names and listener arguments, for each way of adding
events to an object.

## Usage

Declare an event map: an object type from each event name to the tuple of
arguments its listeners receive. The exported `Eventful<Events>` type then
checks event names and listener arguments on `on`, `once`, `off`, `emit` and
`emitAsync`.

```ts
type Events = { greet: [msg: string]; };
```

Which pattern to use:

- If you control the class hierarchy, then extend `EventfulBase<Events>`.
- If the class already extends something else, then call `eventful(this)` in the
  constructor and declare the methods.
- If you are enhancing a plain object, then annotate the variable with
  `typeof raw & Eventful<Events>`.

## Plain object

```ts
import {
  type Eventful,
  eventful
} from 'asljs-eventful';

type Events = { greet: [msg: string]; };

const obj: { name: string; } & Eventful<Events> = eventful({ name: 'Alice' });

obj.on('greet', msg => console.log(`${msg}, ${obj.name}!`));

// writes "Hello, Alice!" to console
obj.emit('greet', 'Hello');
```

## Inheritance

```ts
import {
  EventfulBase
} from 'asljs-eventful';

type MyClassEvents = { greet: [message: string]; };

class MyClass extends EventfulBase<MyClassEvents>
{
  name: string;

  constructor(name: string)
  {
    super();

    this.name = name;
  }

  greet()
  {
    this.emit(
      'greet',
      `Hello, ${this.name}`
    );
  }
}
```

## Construction

When the class cannot extend `EventfulBase`, call `eventful(this)` in the
constructor. TypeScript does not see methods added at runtime, so declare them:

```ts
import {
  type Eventful,
  eventful
} from 'asljs-eventful';

type MyClassEvents = { greet: [message: string]; };

export class MyClass implements Eventful<MyClassEvents>
{
  name: string;

  declare on: Eventful<MyClassEvents>['on'];
  declare once: Eventful<MyClassEvents>['once'];
  declare off: Eventful<MyClassEvents>['off'];
  declare emit: Eventful<MyClassEvents>['emit'];
  declare emitAsync: Eventful<MyClassEvents>['emitAsync'];
  declare has: Eventful<MyClassEvents>['has'];
  declare removeAllListeners: Eventful<MyClassEvents>['removeAllListeners'];
  declare getListeners: Eventful<MyClassEvents>['getListeners'];

  constructor(name: string)
  {
    eventful(this);

    this.name = name;
  }

  greet()
  {
    this.emit(
      'greet',
      `Hello, ${this.name}`
    );
  }
}
```

## Why the event map cannot be a type argument

`eventful` infers the type of the object it enhances, but it cannot infer your
event map: the map appears only in the return type, so there is no argument to
infer it from. Naming it explicitly means naming the object type too, because
TypeScript stops inferring type arguments as soon as any are written by hand:

```ts
import {
  eventful
} from 'asljs-eventful';

type CartEvents = { checkout: [total: number]; };

const cart = { items: 2 };

eventful<CartEvents>(cart);
// error TS2345: Argument of type '{ items: number; }' is not assignable
//               to parameter of type 'CartEvents'.
```

Annotate the variable instead. `typeof` names the object without restating its
shape, and the annotation says exactly what `eventful` added:

```ts
import {
  type Eventful,
  eventful
} from 'asljs-eventful';

type CartEvents = { checkout: [total: number]; };

const raw = { items: 2 };

const cart: typeof raw & Eventful<CartEvents> = eventful(raw);

cart.on(
  'checkout',
  total => total.toFixed(2)
); // total is a number

cart.items; // still a number
```

Both halves are checked. An unknown event name, a listener whose arguments do
not match the map, and a property the object does not have are all errors.

Note that the type query takes a name, so it is `typeof raw` rather than
`typeof (raw)`, and the object has to be a variable. For an object written
inline there is nothing to point `typeof` at, so name it first.

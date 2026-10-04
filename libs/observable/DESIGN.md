# DESIGN

D1. The purpose of `observable` is to create an observable version of a given
data structure, not to extend the existing data with observability.

D2. `observable` is a function that returns an observable version of the given
object, array or value, which reports its changes through
`on('change', listener)`. The observable has at least `on` and `off`. Its
methods are added by the `eventful` factory (D18), which defines the full set;
the default, `eventful` from `asljs-eventful`, adds `on`, `once`, `off`, `emit`,
`emitAsync`, `has`, `removeAllListeners` and `getListeners`.

The listener receives one argument: the list of modifications that make up the
change, in the order they were carried out. Applying them in that order turns
the previous state into the current one, except that a `reset` (D15) says only
that the array must be read again. The kinds of modification are listed in D15.

```js
const model = observable({ a: 1 });

model.on('change', changes => console.log(changes));

model.a = 2;    // [ { kind: 'set', property: 'a', value: 2, previous: 1 } ]
```

D3. `observable` does not mutate the original object or array; it returns a new
observable version.

D4. `observable` treats `Date`, `RegExp` and function values as immutable:
conversion keeps the reference and does not convert them.

A frozen plain object or plain array (D12) nested in the data is a value in the
same sense, an object-value like a `Date`: it is kept by reference, `convert` is
not asked about it, it is not traversed, and a query with `observe()` stops on
it as it does on a `Date`. Freezing is shallow, so whatever a frozen value
refers to is kept as it is too. At the top level a frozen object throws unless
`convert` takes it over (D10): observing something that cannot change is an
invalid operation (D16).

A frozen object with internal state, such as a frozen `Map` or a frozen class
instance, is not a value: freezing does not stop its internal state changing,
so it is handled like any other object of its kind.

```js
const config = Object.freeze({ theme: 'dark' });

observable({ config }, { deep: true }).config === config;   // true
observable(config);                                         // throws
```

D5. The `deep` parameter controls whether nested objects and arrays are also
made observable. If `deep` is `true`, the observation is applied recursively;
if `false`, only the top-level object is observed.

Each observable reports changes to its own properties only. A change inside a
nested observable is reported by that observable and not by its parent, because
the parent still holds the same object.

```js
const model = observable({ user: { name: 'Ann' } }, { deep: true });

model.user.name = 'Bob';    // reported by model.user, not by model
model.user = null;          // reported by model
```

D6. Changes to the observable's own properties do not affect the original object
or array, and changes to the original's own properties do not affect the
observable. A value both of them hold by reference — a nested object under
`deep: false`, a `Date`, a `RegExp`, a function, a frozen plain object or array,
an object kept because it implements `on` and `off`, or a value `convert`
returned that is held elsewhere too — is one object, so a change made inside it
is visible from both sides.

```js
const original = { nested: { x: 0 } };
const result = observable(original);   // deep: false

result.nested.x = 1;    // changes nested, which both hold
original.nested.x;      // 1

result.nested = null;   // changes result's own property
original.nested;        // still { x: 1 }
```

D7. When `deep` is `true`, `observable` throws on a circular reference, detected
while the object graph is being traversed. A circular reference is an object
reached again while its own values are still being converted; an object reached
again after its conversion has finished is a repeated reference, which D8
allows. Anything kept by reference or replaced by `convert` (D11, rules 2 to 5)
is not traversed, so a cycle inside it is allowed.

Example of circular reference detection:

```js
const obj = {};
obj.self = obj;

observable(obj, { deep: true });
// throws: at value.self: circular reference to value
```

Example of a cycle inside a value, which is not traversed:

```js
const dt = new Date();
dt.self = dt;

observable({ date: dt }, { deep: true });   // converted, date kept by reference
```

D8. When `deep` is `true`, the same object reached twice within one call
becomes one observable, used in both places. The result keeps the shape of the
data it was given, and an object is converted once however many times it is
referenced. This holds within one call only: separate calls to `observable`
produce separate observables.

```js
const shared = { n: 1 };

const result = observable(
  { value1: shared,
    value2: shared },
  { deep: true });

result.value1 === result.value2;    // true
result.value1.n = 2;
result.value2.n;                    // 2, one observable reports the change
```

A `Date`, a `RegExp` or a function reached twice is kept by reference in both
places, as D4 states:

```js
const dt = new Date();

const result = observable(
  { value1: dt,
    value2: dt },
  { deep: true });

result.value1 === result.value2;    // true, dt itself
```

D9. The `convert` hook replaces one object with another. It is called for
objects only, arrays included: primitive values, `Date`, `RegExp`, functions and
nested frozen plain objects and arrays are values (D4), and `convert` is never
asked about them. It is called before `observable` decides what to do with an
object, including whether it already implements `on` and `off`, so it has the
first say. It is asked about the top-level value when that
value is an object, and, when `deep` is `true`, about every nested object that
is not kept by reference first (D11). When `deep` is `false` it is called at
most once.

```js
observable(false, { convert });       // convert not called: a value
observable(new Map(), { convert });   // called once, for the Map
observable(
  { a: new Map() },
  { convert });                       // called once, for the top-level object
```

Returning `null` or `undefined` leaves the decision to the rules below. Any
other value is the converted object: no other rule applies to it, it is not
checked or traversed, and it is stored in place of the original, after which
conversion continues with the next value. Returning the given object itself is
allowed: the original is then stored by reference and shared, as D6 describes.
At the top level the result is what `observable` returns, so there it must
implement `on` and `off` and must not be the given object itself, otherwise
`observable` throws (D10); a nested result is not checked. `observable`
recognises plain data from any realm (D12), but a hook that tests with
`instanceof` sees only its own realm's classes, so recognising objects from
other realms is up to the hook.

D7 and D8 are applied before `convert` is asked. An object reached a second time
reuses what its first occurrence became, so `convert` is called once for it and
its result is used in both places; a circular reference throws without
`convert` being called again. What `convert` returns is not traversed, so D7
and D8 do not apply inside it.

D10. The value given to `observable` is checked against these rules in order,
and the first that matches applies:

1. A primitive value, a `Date`, a `RegExp` or a function is boxed as
   `{ value: ... }`.
2. When `convert` returns a value other than `null` or `undefined`, that value
   is returned (D9). It must implement `on` and `off` and must not be the value
   it was given, otherwise `observable` throws, so that what `observable`
   returns is always a new observable version (D2, D3).
3. An object that already implements `on` and `off` throws: returning it as is
   would make the observable version the original itself, contrary to D3 and
   D6. That covers an `EventEmitter` and an observable produced by
   `observable`.
4. An object or array that has a property named like a method the `eventful`
   factory adds throws, because the observable it would be converted to has
   methods with those names. With the default factory those are the eight
   names listed in D2. With a custom factory `observable` knows only `on` and
   `off`; any other name the factory adds is the factory's responsibility, and
   a property of the data with that name is whatever the factory makes of
   it.
5. A plain object or a plain array (D12) holding plain data (D16) is converted
   to an observable, applying D11 to its own values.
6. Anything else throws.

```js
const emitter = new EventEmitter();

observable(emitter);               // throws
observable(observable({ a: 1 }));  // throws
observable({ on: null });          // throws
observable(emitter, {              // converted by the hook
  convert: value =>
    value === emitter
      ? observable({ source: 'emitter' })
      : undefined
});
```

D11. While rebuilding an object or array, each property value or element is
checked against these rules in order, and the first that matches applies:

1. A primitive value is copied.
2. A `Date`, a `RegExp`, a function, or a frozen plain object or plain array
   is kept by reference (D4).
3. When `deep` is `false`, any other object or array is kept by reference.
4. When `convert` returns a value other than `null` or `undefined`, that value
   is used (D9).
5. An object that already implements `on` and `off` (e.g., `EventEmitter`) is
   kept by reference.
6. An object or array that has a property named like a method the `eventful`
   factory adds throws, as in D10.
7. A plain object or a plain array (D12) holding plain data (D16) is converted
   to an observable, applying these rules to its own values.
8. Anything else throws.

Because rule 3 comes before rules 4 to 8, `convert` is not called and nothing
throws for nested values when `deep` is `false`. Because rule 5 comes before
rule 8, an `EventEmitter` is kept although it is a class instance, unlike at the
top level (D10). Because rule 5 comes before rule 6, an object whose `on` and
`off` are both functions is kept rather than refused, while one where either is
anything else, or one with only a reserved name such as `emit`, is refused.

```js
const emitter = new EventEmitter();

observable({ events: emitter }, { deep: true });         // events kept
observable({ a: { on: null } }, { deep: true });         // throws
observable({ a: { on: null } });                         // kept, deep: false
observable(
  { a: { on: () => {}, off: () => {} } },
  { deep: true });                                       // a kept by reference
```

D12. Only plain objects are converted. An object is plain when its prototype is
`Object.prototype` or `null`, which is what an object literal
`{ property: 'value', ... }`, `Object.create(null)` and `JSON.parse` produce.
An object with any other prototype, such as one created by `new Class()`, is
not converted. At the top level it throws unless `convert` takes it over (D10).
Nested under `deep: true` it throws unless `convert` takes it over or it
implements `on` and `off` (D11). Nested under `deep: false` it is kept by
reference. `Date`, `RegExp` and functions are not
objects in this sense: they are boxed at the top level (D10) and kept by
reference when nested (D11).

Only plain arrays are converted. An array is plain when its prototype is
`Array.prototype`, which is what an array literal `[ ... ]`, `Array.from` and
`JSON.parse` produce. An instance of a subclass of `Array`, such as one created
by `new List()` for `class List extends Array`, is a class instance like any
other, and is handled as one.

These checks hold across realms. An object or array created in another realm,
such as a same-origin iframe or a Node `vm` context, has that realm's
`Object.prototype` or `Array.prototype`, and it is plain data all the same, so
the checks recognise any realm's prototypes rather than only this realm's:

- an object is plain when its prototype is `null`, or is an `Object.prototype`
  of some realm: an object whose own prototype is `null` and whose
  `constructor` is a function named `Object`;
- an array is plain when both it and its prototype are arrays by
  `Array.isArray`, because every realm's `Array.prototype` is an array and a
  subclass prototype is not;
- a `Date` or a `RegExp` (D4) is recognised by what it is, not by `instanceof`,
  so one from another realm is a value too.

A prototype made to look like `Object.prototype` passes the object check. That
takes deliberate effort, and the result is still handled as plain data.

```js
const data = frame.JSON.parse('{"a":1,"list":[1]}');   // another realm

observable(data, { deep: true });                       // converted
observable({ when: new frame.Date() }, { deep: true }); // when kept, a value
```

The rule is decided by the prototype, not by how the object was written, because
the prototype is all `observable` can see. A copy by `{ ...instance }` would
keep the own properties and lose the prototype, and with it the methods,
accessors and `instanceof`, so the result would no longer be the class it came
from.

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

observable({ x: 1, y: 2 });             // converted
observable(Object.create(null));        // converted
observable(new Point(1, 2));            // throws
observable(new Point(1, 2), {           // converted by the hook
  convert: value =>
    value instanceof Point
      ? observable({ x: value.x, y: value.y })
      : undefined
});
```

D13. Conversion happens once, when `observable` is called. A value written to an
observable later is stored as it is: it is not converted, copied or checked, and
D7, D8, D9, D10, D11, D12 and D16 do not apply to it. The write itself is
reported, as D15 describes. How the data is managed after that is up to the
caller, who converts a value before assigning it if its own changes should be
reported. Writing a method the `eventful` factory added is not specified: what
happens is whatever the factory's methods do with a write to their names.

```js
const model = observable({ user: { name: 'Ann' } }, { deep: true });

model.user = { name: 'Bob' };       // reported; model.user is plain
model.user.name = 'Carol';          // not reported

model.user = observable({ name: 'Dan' });
model.user.name = 'Eve';            // reported by model.user
```

Because a written value is stored by reference, it is shared with whoever
assigned it, as D6 describes for values held by reference:

```js
const user = { name: 'Ann' };

model.user = user;
user.name = 'Bob';                  // not reported
model.user.name;                    // 'Bob'
```

D14. An observable looks as much as possible like the data it was converted
from. The default `eventful` factory adds its methods as own, non-enumerable
properties, so `Object.keys`, `for...in`, spreading and `JSON.stringify` see the
data and not the methods, while `'on' in result` is `true`. A custom factory
decides for itself how its methods are defined. The prototype of an observable
object is not specified: it is whatever the implementation finds simplest.

An observable array is an array: `Array.isArray` returns `true` for it, it has
`length`, index access and the array methods, it can be iterated and spread, and
`JSON.stringify` writes it as an array. With the default factory its methods are
non-enumerable too, so none of these see them. Methods that return a new array,
such as `map`, `filter`, `slice`, `concat` and `flat`, return a plain array, not
an observable.

```js
const result = observable({ a: 1 });

Object.keys(result);        // [ 'a' ]
JSON.stringify(result);     // '{"a":1}'
'on' in result;             // true

const list = observable([ 1, 2 ]);

Array.isArray(list);        // true
JSON.stringify(list);       // '[1,2]'
[ ...list ];                // [ 1, 2 ]
```

D15. A modification is one of these kinds:

- `{ kind: 'set', property, value, previous }`: a property of an object, an
  index of an array, or an array's `length` was set from `previous` to `value`.
  `property` is always a string, so an array index is reported as `'0'`, not
  `0`. Deleting a property is reported as a `set` to `undefined`, so a deleted
  property and one set to `undefined` are reported alike.
- `{ kind: 'splice', index, removed, added }`: at position `index` of an
  array, the elements in `removed` were removed and the elements in `added`
  were inserted. Both are lists of the values themselves, not counts.
- `{ kind: 'reset' }`: the array changed so much that it is better read again.
  It carries no other properties.

An object reports `set` only. `splice` and `reset` are reported by arrays.

An index written past the end of an array grows its `length`, and no splice
describes that, so the change also carries a `set` for `length`, after the
`set` for the index.

A `splice` at `index` also changes every index from `index` onwards and, when
the counts differ, `length`; no separate `set` is reported for them. A
subscriber that tracks indices or `length` either interprets `splice` that way
or, like for any kind it does not handle, reads the array again.

A modification is reported only when the property reads differently afterwards,
compared with `Object.is`. Assigning the value a property already has, or
deleting a property that reads as `undefined`, reports nothing.

A definition with `Object.defineProperty` is reported the same way, by the value
the property reads as before and after. Defining a getter therefore runs it once
to obtain `value`, and replacing one runs the old getter once to obtain
`previous`. A definition that changes only attributes, such as `enumerable`,
reports nothing.

A write under a symbol key, its deletion included, is stored and not reported:
`property` is always a string, and symbol keys are not data (D16).

```js
const model = observable({ a: 1, first: 'Ann', last: 'Lee' });

model.a = 1;                                        // not reported: same value
model.a = NaN;                                      // reported
model.a = NaN;                                      // not reported: Object.is

Object.defineProperty(model, 'full', {
  get() { return `${this.first} ${this.last}`; }
});                                                 // set, value: 'Ann Lee'

Object.defineProperty(model, 'a', {
  enumerable: false });                             // not reported

model[Symbol('meta')] = 1;                          // not reported
```

A subscriber must handle `set`. For any other kind it does not recognise,
`splice` and `reset` included, it reads the array again. That lets an
observable report a change in whatever form is cheapest and lets new kinds be
added without breaking subscribers.

How a change is split into `change` events is up to the implementation, but one
call that changes an array, such as `push(a, b)` or `sort()`, is preferably one
`change` event carrying all its modifications.

```js
const list = observable([ 'a', 'b' ]);

list.on('change', changes => {
  for (const change of changes) {
    if (change.kind !== 'set') {
      render([ ...list ]);      // unknown kind: read the array again
      return;
    }

    if (change.property !== 'length') {
      renderAt(change.property, change.value);
    }
  }
});

list.push('c', 'd');            // one change
```

D16. A plain object or plain array is converted only when it holds plain data,
and throws otherwise. Plain data means that every own property, other than an
array's `length`:

- has a string key: a symbol key throws;
- is a data property: a getter or a setter throws;
- is enumerable, writable and configurable, as a property created by a literal
  or by assignment is: any other attributes throw.

The object or array itself must be extensible, so a frozen, sealed or
non-extensible one throws. A nested frozen plain object or array never reaches
this check: it is kept as a value (D4, D11). An array must also have no holes
and no own properties other than its indices and `length`.

The case `observable` is for is plain data such as `observable({ user: ... })`.
Data that needs accessors, hidden or read-only properties, or symbol keys is a
class in all but name, and a class can report its own changes through
`eventful` without `observable`.

```js
observable({ get full() { return 'Ann Lee'; } });        // throws: accessor
observable({ [Symbol('meta')]: 1 });                     // throws: symbol key
observable(Object.freeze({ a: 1 }));                     // throws: frozen
observable([ 1, , 3 ]);                                  // throws: hole
observable(Object.assign([ 1 ], { total: 1 }));          // throws: extra key
observable({ a: 1, list: [ 1, 2 ] }, { deep: true });    // converted
```

D17. An error thrown by `observable` says where the problem is and what it is.
The message starts with the path of the offending value, written from `value`
as the top level, with `.name` for a property and `[0]` for an array index,
followed by the reason. A circular reference names both ends: where the cycle
was found and the object it leads back to. An error thrown by the `convert`
hook or by the `eventful` factory is reported the same way, prefixed with the
path of the value it was handling, with the original error as its `cause`.

```js
observable({ orders: [ { meta: new Map() } ] }, { deep: true });
// throws: at value.orders[0].meta: Map is not supported

const a = { b: {} };
a.b.back = a;
observable({ a }, { deep: true });
// throws: at value.a.b.back: circular reference to value.a

observable({ list: [ 1, , 3 ] }, { deep: true });
// throws: at value.list: an array with holes is not supported
```

D18. `observable` takes these options:

- `deep` (D5).
- `convert` (D9).
- `eventful`: the factory that adds the methods to each observable, the
  top-level one and every nested one created in the same call. It is given the
  new object, array or box and must give it at least `on` and `off`, and a way
  for `observable` to deliver `change`; anything more is the factory's choice.
  The default is `eventful` from `asljs-eventful`. Whatever the emitter does
  beyond that, such as what happens when a listener throws, is the factory's
  behaviour, and the factory is also how its settings are passed:
  `observable(model, { eventful: value => eventful(value, { strict: true }) })`.
- `trace`: a hook `(object, action, payload)` called with `'new'` and
  `{ object }` when an observable is created, and with `'change'` and the list
  of modifications each time a change is delivered. Every observable created in
  the same call shares it. When a call passes none, the process-wide
  `observable.options.trace` is used, if set.

D19. `batch(fn)` groups the changes made while `fn` runs:

- Every observable written to during `fn` delivers one `change` when the batch
  ends, carrying all its modifications in the order they were made. Nothing is
  merged or dropped: two writes to one property are two `set` entries, so the
  list can always be applied in order (D2).
- The observables deliver in the order they were first written to.
- Batches nest: an inner `batch` joins the outer one, and only the outermost
  delivers.
- When `fn` throws, the changes already made are still delivered, because the
  writes have happened, and the exception is rethrown afterwards.
- A write made by a listener while a change is being delivered takes effect at
  once, but its own `change` is delivered after the current delivery finishes,
  so every listener of one change receives the same list. Listeners that keep
  causing writes are stopped after a fixed number of rounds with an error.
- When a listener throws, which the factory decides (D18), the error
  propagates at once. Changes still queued for delivery are discarded: the
  writes have happened, but their `change` is not delivered.

```js
const model = observable({ n: 1 });

model.on('change', changes => console.log(changes.length));

batch(() => {
  model.n = 2;
  model.n = 3;
});
// 2: set n 1 → 2, then set n 2 → 3
```

Merging repeated writes is left for later: it is easy to get wrong for arrays,
where an index means a different element after a `splice`.

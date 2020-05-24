### ValueStore
 `<= ValueStream`

ValueStreams are useful in their own right but ValueStores are the overarching
product of LGE. A ValueStore is a set of streams and methods to update the streams.

ValueStores are themselves ValueStreams. 

The children of ValueStreams are called "properties"; this is an OOP-ism. 

## constructor
`(name: string, values?: {Object}, methods? {Object})`

The "value" of a store is the summary of all the key/value pairs of its children. 
 
The streamed value of a store is *itself* that is emitted over and over to its subscribers
on changes to any of its child streams. 

*Constructor Arguments*:

`values` can be used to seed properties. They can be name/value pairs
or name/argument pairs if you want to add validators etc. to the properties. 

`methods` can be used to initialize methods. they are name/function pairs. 

FWIW I personally prefer currying construction of ValueStores but for those
that want to fully construct a store in the constructor these properties exist. 

## subscribe
`(onChange, onError, onComplete)`

unlike ValueStore subscriptions which return the updates to value onChange,
store subscriptions return itself repeatedly on changes to its properties. 
Also all property errors are repeated to onError in the form:

```
{ 
    store: string, // name of this store
    source: string, // name of the stream that had an error
    error: Object, // JSON snapshot of the error message
}
```

## METHODS 

Methods are the "actions" of a store. They allow you to write mutators
that can interact with the store. 

These actions are *not* in any way like Redux methods; they are closer to 
an OOP Classes' methods. 

The return value of a method is both *optional* and *ignored* by the store itself. 
Methods can be used to define derived values but are not used to update the store.
The only way to update the store (and trigger a subscription update) is to 
set a properties' value. This can be done *never*, *once* or *multiple times* by an action. 

Methods' first argument is the store itself. Any other called arguments are passed 
in after that. So, the `this` value is not useful (or a good idea) to refer to in the body of an action. 
that being said, if the `bind` modifier is true the method will be bound to the store. 

Methods are synchronous *by default*. You can return a promise but the method is considered 
complete (and the transactionality closed) at the end of the synchronous execution of the method. 

By default method errors are trapped and redirected to the errors stream. That can be *bad* if
you call several methods in a row and expect that they have done their business.

For that reason methods are given a set of behavior modifiers:

### Method modifiers

* `throws` re-throws any errors your function emits or emitted from th errors collection. 
  this should be "all the errors". 
* `trans` is not exactly what DB transactions are. Due to references and other things its really
  not valid to be able to claim the ability to reset a store to a previous state. 
  What it does do is muffle any change emission that happens in its execution or in any sub-method call
  executions until its completed. Note that "completed" is a synchronous concept; async
  functions are not guaranteed to wait to complete before ending the transaction and allowing broadcasts;
  in fact they are pretty much guaranteed to be impossible to externally freeze. (you can still
  create transactions inside a method to control broadcast of an async method if you want.)
* `bind` is for those for whom normal methods have gotten boring and who want to add a little
  excitement in their code. Just kidding; it uses functional binding to make the "this" reference
  equal to the store. Not advised, but available. 
  
All these switches can be used in any combination to alter application flow to 
the way you want it to execute. 

Again, all configuration options are optional. 

## addMethod
`(name: string, fn: function, options?: {bind:bool, trans:bool, throws: bool})` (alias `method`)

Adds a method to the store. is *not* idempotent; 
successive attempts to redefine the same method throw errors.

## .do[methodName]

A proxy to all the methods BUT WAIT -- THERE's MORE! When you add a property to the ValueStore
you get free "setter" methods.

For instance if you add a "count" property you get the methods "setCount(value)" and
a throwable set, "setCount_ot(value" AT NO ADDITIONAL COST! 

```javascript

const counter = new ValueStore('counter', { count: [0  , 'number']});

counter.subscribe((vs) => console.log(vs.my.count));

counter.do.setCount(1);
counter.do.setCount_ot('doghnut');

// '1'
// (throws)
```

## PROPERTIES

Properties are the value providers for the store. Each property is a ValueStream (see) and  contributes to the 
collective value of the store. 

## setFilter
`(name, filter): self`

sets and overrides the filter for a particular property. 

## .value
`{Object}`

a name/value snapshot of the properties' values. NOTE: this is 
more expensive than using `#my` if you just want to get one or more 
properties from a large component so prefer the latter when possible (and if proxies exist.);

## my[propertyName]

.my is a proxy that lets you tunnel and extract the current value of a/some proxies using a Proxy implementation. 
It is far more efficient than `.values` in most scenarios; given that Proxy is only available in most scenarios. 

```javascript

const threeDcoord = new ValueStream('coord3d', {x: 0, y: 0, z: 0});

const {x, y, z} = threeDcoord.my;

threeDcoord.do.setX(10);

console.log('x was', x, 'and is now', threeDcoord.my.x);

// 'x was', 0, 'and is now', 10
```

## property 
`(name, value, fliter?)` (alias `.setStream`)

defines a property of the ValueStore. 
Properties cannot be redefined (throws error once a name is taken).

This method creates a ValueStream and attaches it to the streams collection. 

## VIRTUALS

Virtuals are computed values that are derived from the store. They are only computed when retrieved. 
The function that defines a virtual *cannot* change the store. a virtual can call another virtual; but 
any circular reference (a calls b which calls a) will throw an error. 

Virtuals, like property values, can be accessed off the `.my` proxy. 

```javascript

const coord = new ValueStore('coord2D', { x: 0, y: 0 }, {}, {
  magnitude: (store) => {
    return Math.sqrt(store.my.x ** 2 + store.my.y ** 2);
  },
});

coord.do.setX(10);
coord.do.setY(20);
console.log('magnitude:', coord.my.magnitude)
// 'magnitude:' 22.360679774997897

```

## watch 
`(onChange, field:string, field:string...) : subscription`

calls onChange every time one or more of the observed fields (properties or virtuals) changes.
If no fields are expressed, returns null.
 
(note - the arguments are flattenDeep'd, so you can define fields as an array of strings)

`onChange(values:object, store{ValueStore})` is passed an object with key/values from virtual or properties
as specified by fields. 

note, "change" is murky in javascript. By default watch serializes the field values object (the first parameter)
using json-stringify-safe (a variant of JSON.stringify). This is potentially a time-suck; if you want to serialize
the object array differently you can pass a second argument for serialization.

Observe this from the tap tests:

```javascript

      const info = [];
      const person = new ValueStore('person', {
        first: '', last: '',
      });
      person.addVirtual('full', (s) => `${s.my.first} ${s.my.last}`.trim());

      person.watch((xy) => {
        info.push(xy);
      }, ({ full }) => full.toLowerCase(), ['first', 'last', 'full']);

      tWatch.same(info, [
        { full: '', first: '', last: '' },
      ]);

      person.do.setFirst('bruce');
      person.do.setLast('Wayne');

      tWatch.same(info, [
        { full: '', first: '', last: '' },
        { full: 'bruce', first: 'bruce', last: '' },
        { full: 'bruce Wayne', first: 'bruce', last: 'Wayne' },
      ]);

      // this is the critical test - the serializer only looks at the lowercase full name
      // so changing the case of bruce shouldn't trigger an alert.

      person.do.setFirst('Bruce');

      tWatch.same(info, [
        { full: '', first: '', last: '' },
        { full: 'bruce', first: 'bruce', last: '' },
        { full: 'bruce Wayne', first: 'bruce', last: 'Wayne' },
      ]);

      person.do.setLast('Jenner');

      // but the change is carried through when the case -insensitve full name does change
      // as when we change the actual last name

      tWatch.same(info, [
        { full: '', first: '', last: '' },
        { full: 'bruce', first: 'bruce', last: '' },
        { full: 'bruce Wayne', first: 'bruce', last: 'Wayne' },
        { full: 'Bruce Jenner', first: 'Bruce', last: 'Jenner' },
      ]);

```


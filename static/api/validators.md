# Validators

`validators(name, fn, override = false)` is a registry for validation functions, There are a few 
"starter" validators for common tests. In earlier editions the entire is.js module
was used to handle named tests but the bundle size got so big, and validators 
is a stand-in for that. 

There are a few pre-loaded tests:

* 'string'
* 'number'
* 'nan'
* 'integer'
* 'array'
* 'object' -- for the record, this test will fail null and arrays

for really basic type checking. Feel free to add your own. 

Fair warning: validators will throw an error if you try to redefine a validator without
the third argument being true. 

validators curries if the second argument is present. so if it doesn't drive you nuts
you can call:

```javascript

validators('odd', (v) => ((v + 1) % 2)  ? 'value must be odd' : false)
('even', (v) => v % 2 ? false : 'value must be even')
('square', (v) => Math.sqrt(v) % 1 ? 'value must be a perfect square' : false);

```

This is used in conjunction with defining properties or ValueStreams:

```javascript

const coords = new ValueStream('coords')
.property('x', 'number')
.property('y', 'number')
.property('z', 'number')

```



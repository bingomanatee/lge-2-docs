# Value

The Value is a name-value pair. Its not particularly useful but it does isolate some of the fundamental
properties of the other classes into a basic subclass. 

* It has no children or default requirements/restrictions on its value. 
* It can have a filter to restrict input. 
* It cannot be updated externally. 

Setting the value to an invalid item will throw; and if this is true of the initial value,
*creating* a Value with an invalid initial value (based on its validator) will throw. 

Value is *not* a stream: it is simply the core validation/value/name functionality underpinning
the other classes. 

## constructor
`(name: string, value?, filter? : function)`

## .name 
`{String`
Name must be a valid javascript property name. 

## .value
can be any type. note - if not initialized to a value, it is internally
annotated with a symbol ABSENT. 

## .filter
can be:
* absent/falsy; all values are acceptable
* a string: name of a method registered in validators
* an array of the above

functional tests express errors - valid values require a falsy return. 
The first argument to the function is the value. The second one is an array
of results from previously returned errors if the filter is an array:

```javascript
function isOddNumber(n, errors) {
    if (errors.length) {
      return false; // don't test oddness if the value is not a number.
    }
    
    if ((n + 1) % 2) {
      return 'must be an odd number';
    }
    return false;
}

const ss2 = new Value('oddNum', 1, ['number', isOddNumber]);
```

Array filters let you ensure type sanity before applying business logic, or to 
develop and mix a suite of validation computations. The logical union of an array
of tests is AND as in, every test in the array must pass or the validation is 
considered a failure. Unlike javascript && logic, every test in the array is always
processed regardless of the outcomes of the previous tests. 

## validate
`(value = ABSENT singleError? = false)`

tests a value against the filter. returns an array of errors - empty if valid. 
if singleError, returns the first error. 

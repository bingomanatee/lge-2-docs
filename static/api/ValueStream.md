#ValueStream
 `<= Value`

ValueStream is a streaming version of Value. 

* It has the same constructor (and as a child class, methods) as `Value`. 
* It is an Observable, with the rx.js subscribe method available
* You can set its' value with `.next(value)`

## next
`(value, attrs?:Object) : Message | Error`

Unlike Value, ValueStream has a public method to update errors.
`next(value)` will return a string if the value fails validation, 
and will leave its value unchanged. 

If you want to augment the message that next uses to transmit state 
(such as making it transactional with {trans: true) you can set an object parameter set for the 
second argument. 

In extreme failures, a standard error will be emitted; it will still 
have an `.error` property for consistency. 

## nextPromise
`(value, attrs?:Object) : Message | Error`

uses the async conventions to allow you to trigger a handler when the 
next attempt fails. Generally this is because you attempted to assert an invalid value.
note, the change is still immediate/synchronous. 

## subscribe
`(onChange, onError, onComplete)`

This is the Observable method; it follows `rx.js` conventions EXCEPT that onError
gets more messages than is typical. the rx.js standard is that onError is, like a 
failed promise, the death rattle of a stream; and gets zero or one messages. 

In LGE ValueStreams emit to onError many times, 
including when you try to set a value to an invalid value. 

It may be useful to actually use onError to change field 
values to the user-attempted values and display errors on validation failure. 
this will create dissonance between the form displayed values and the stored values
but as this only exists prior to submission it might be a good convention to try out. 

subscribe listens to the `.$updateStream`; if you want to do rxjs operations on updates,
pipe this stream. 

## complete
`()`

this is part of the Observable interfaces. It completes all subscriptions. `.next` 
at this point doesn't have any effects after completion. 

## .$requests
`stream`

ordinarily an internal stream that channels all the Messages prior to any
error testing/changes. Useful for debugging. 

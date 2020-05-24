# Transactions and Blockers

These are advanced functionality that should be used with extreme care. 

Why?

Because they can paralyze your feedback streams and bring your store to a screeching halt.  

So if they're so dangerous why use them? because 

> DANGER IS MY LAST NAME! --- Carlos Danger

## Transactions

Transactions is probably not the best name for this behavior but its very close. Transactions
temporarily squelch messaging in streams while the transaction exists. what is NOT squelched
are methods, value updates, etc. Because of this, transactions can snuff out a lot of transitional
noise as sub-methods, property updates, etc. occur in a Store or Stream, allowing a quick 
"after I'm done" update that broadcasts the effect of multiple actions ina a single swoop. 

This is a good thing, when everything goes right. 

The method handling of a Store is designed to be as error-proof as possible. That is why 
there are four classes of methods:

* **default** -- non-transactional, never throws
* **throws** -- non-transactional, throws
* **trans** -- transactional, never throws
* **throws + trans** -- transactional, throws

Whatever the variant, the design of the store is to trap the thrown error and to squelch 
the transaction before passing on the error to the errors stream -- and possibly throw it. 

BUT CODE IS HARD.

so if for some reason you suspect your transactions are choking:

1. subscribe to `MyStream/MyStore._$transStream`
2. watch to see if it stays in a non-zero state for too long
3. If you want to be ham-handed just call `Stream/Store.flushTranses()`.
4. `flushTranses()` returns any stalled transactions; these Message instances
   should tell you which transactions are delaying your Store/Stream. 
   
## Blockers: the ultimate cyberbully

Blockers are total show-stoppers. They don't just delay notification; they disable all methods
AND update messaging. In fact if a Store is blocked, its properties are also blocked. 

WHY DO THIS?

Because there are circumstances where you don't want your Store/Stream to update. 
The built in time is when you are deriving values for virtual fields. Derivation is intended 
to be totally non-invasive and non-store-updating. So if the Store detects that a derivation is
calling methods or setting values, the setting and calling short circuits and throws an error. 

Virtual fields re-calculate every broadcast cycle. They are intended to be idempotent reflectors
of the stores' values. A classic example would be the magnitude of a point or the sin of an angle. 
Store.value.virtual will be undefined while blockers are present. 

Store.my IS available to be used, as it is a proxy, by derivations, and will have a store.my.virtualValue;
You can even call one virtual field from another provided this doesn't generate circularity. 
Handily, when one virtual field blocks, it blocks itself from being re-called by any other virtuals (and throws),
preventing circular paralysis (but throwing);


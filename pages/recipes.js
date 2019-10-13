import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import l from '../utils/l';

function Recipes() {
  return <div>
    <HeadView/>
    <PageHeader active="recipes"/>
    <main>
      <article>
        <h1>Usage Tips</h1>
        <h2>Synchronous Actions</h2>
        <p>Simple property setting is <i>immediate</i>. As soon as you call <code>myStore.actions.setCount(2)</code>
           a notification will go out the stream. Even if you do so inside another action!
        </p>
        <p>
          If this is undesirable, either bundle your changes at the end of the action by returning a replacement
          value for state instead of using set[PropertyName] calls, or use transactional locking.
        </p>
        <h2>Asynchronous Actions</h2>
        <p>Actions return promises; use this to your advantage to make sure that your action return is simultaneous with
           any third-party promise based activity. </p>
        <code>
          <pre>
            {l(`
              import axios from 'axios';
              
              const store = new Store({
                actions: {
                  async getProducts(store) {
                    if (store.state.loading) return;
                    await store.setState({loading: true, loaded: false, products: [], error: null});
                    try {
                      const {data} = await axios.get('http://mystore.com/api/products');
                      await store.setState({loading: false, loaded: true, products: data, error: null});
                    } catch (error) {
                      await store.setState({loading: false, loaded: false, products: [], error});
                    }
                  }
                }
               })
               .addStateProp('products', {type: 'array', start: []})
               .addStateProp('loading', false, 'boolean')
               .addStateProp('loaded', false, 'boolean')
               .addStateProp('error', null);
               
            `)}
          </pre>
        </code>
        <p>Also, we are using setState to set a number of properties simultaneously.</p>
        <p>It may be tempting to deconstruct the first argument (store) into <code>{`{state, actions}`}</code>.
           you can do this <i>up until you call any actions</i> - at which point your state property is
           a <i>historical</i>
           copy of the old state -- and you have no way of getting the new state
           (except for maybe from the action callback but that's pushing it.)
        </p>
        <code>
          <pre>
            {l(`
              const API = 'http://mystore.com/api/';
              const badShoppingCart =  new Store({
                actions: {
                  async getProducts(store) {
                    if (store.state.loading) return;
                    await store.setState({loading: true, loaded: false, products: [], error: null});
                    try {
                      const {data} = await axios.get(API + 'products');
                      await store.setState({loading: false, loaded: true, products: data, error: null});
                    } catch (error) {
                      await store.setState({loading: false, loaded: false, products: [], error});
                    }
                  },
                  async getCartID(store) {
                    // begin a cart session;
                    const cart = axios.post(API +  'cart');
                    store.actions.setCartID(cart.id);
                  },
                  async sendProduct(store, product) {
                    const {data} = await(axios.post('http://www.fakesite.com', product);
                    //@TODO - integrate server feedback
                  },
                  async addProduct({state, actions}, productID, product) {
                    await axios.put('cart/' + productID, product);
                    const {data} = await api.get('cart/');
                    state.actions.setCart(data);
                    const total = state.cart.reduce((total, product) => {}, 0);
                    actions.setTotal(total);
                  }
                }
               })
               .addStateProp('cartID', 0, 'number');
               .addStateProp('products', {type: 'array', start: []})
               .addStateProp('cart', {type: 'array', start: []});
               .addStateProp('total', 0, 'number')
               .addStateProp('loading', false, 'boolean')
               .addStateProp('loaded', false, 'boolean')
               .addStateProp('error', null);
               
               Promise.all([ 
                 badShoppingCart.actions.getCartID(),
                 badShoppingCart.actions.getProducts()
                ])
                .then(() => {
                  const product = badShoppingCart.state.products[0];
                  badShoppingCart.addProduct(product.id)
                  .then(() => {
                     console.log('added product ', product.name, 'and total is now ', badShoppingCart.state.total);
                  });
                });
              
               .catch((err) => {
               console.log('cannot get cart id', err);
              });
            `)}
          </pre>
        </code>
        <p>The problem here is in the <code>addProduct</code> method. It puts the new purchase into the
           cart on the server, then it fetches the new cart and puts it into the store.
          <b>then we reduce the original state to get the new total.</b>
           But that state is a copy of the state <i>before</i> our purchase was reflected and re-fetched from the server
           (zero).
        </p>
        <p>If you made seven purchases you might not notice that easily -- the total will always reflect all your
           purchases <i>except for the last. </i></p>
        <p>The right way to write addProduct is:</p>
        <code>
          <pre>
            {l(`
                   async addProduct(store, productID) {
                    await axios.put('cart/' + productID);
                    const {data} = api.get('cart/' + productID);
                    state.actions.setCart(data);
                    const total = store.state.cart.reduce((total, product) => {}, 0);
                    store.actions.setTotal(total);
                  }`)}
          </pre>
        </code>
        <p>As we refer to actions and state as properties of the store object, we will always be up to date with the
           state changes from any action calls.</p>
        <h2>Transactional Locks</h2>
        <p>
          Transactions - an experimental feature. They do the following: </p>
        <ol>
          <li>
            stop update events from emitting until the transactional
            action is complete (though subaction calls <i>DO</i>{' '}still change the state)
          </li>
          <li> if there is an
               error in the transaction, returns the state to the version of state that existed prior to the action
               being called.
          </li>
        </ol>
        <p>Note there are significant implications to this last point; if the state is asynchromous and other activity
           has happened inside the state, reversion could have issues of its own. But if the transaction is not
           asyncronous and can throw errors, its a good way to scrub the actions's updates back to start; also
           if frequent updates triggered a synchronous actions's sub-calls are causing performance issues its
           a good way to deliver all of an actions' changes in one cycle, rather than on each sub-call.</p>
        <ul>
          <li>
            If you do a lot of prop-setting inside an action but you don't want to broadcast all the intermediary
            stages, transactional locking ensures all the updates that come out of an action are synchronized.
            This is especially useful for suppressing intermediate messages
            to prevent, say, React's <code>.setState()</code> from getting overloaded.
          </li>
          <li>
            If the action throws an error, a transactionally locked action will reset the state to its value
            prior to the start of the action.
          </li>
        </ul>

        <code>
          <pre>
            {l(`
              const s = new Store({
                actions: {
                  switch: {
                    action: ({actions, state}){
                      const {a, b} = state;
                      actions.setB(a);
                      actions:setA(b);
                    },
                    info: {
                      transaction: true
                    }
                  }
                }
              })
              .addStateProp('a', 1, 'integer')
              .addStateProp('b', 2', 'integer');
            
              const events = [];
              s.subscribe((({state}) => events.push(state));
              
              s.actions.switch();
              
              console.log('events: ',events);
               // [{a: 1, b: 2}, {a: 2, b: 1}];
            `)}
          </pre>
        </code>
        <p>
          Note in the above example, the state updates from <code>setB()</code> and <code>setA()</code>
          do not appear in the event stream. Without Transactional Locking the event stream would look like this,
          as each set[PropertyName] call emits a change notification:
        </p>
        <code>
          <pre>
            {`[{a:1, b:2}, {a: 1, b: 1}, {a:2, b:1}]`}
          </pre>
        </code>
        <p>
          One minor point: transactional locking does <i>not</i> freeze <code>myStore.state</code>; it will
          get updated in real time by any actions or property setters. It's only effect (unless an error is thrown)
          is on the stream and subscription updating methods.
        </p>
        <p>Fair warning - the reverted snapshot is a deconstructed copy of the state object.
           If you have arrays and objects that you modify instead of modifying with <code>.pop()</code> or whatever,
           set info to <code>{`{transaction: true, clone: true}`}</code>. This will snapshot the state with lodash's
          <code>.cloneDeep()</code> method. this, in turn, can create issues if your store properties are class
           instances:
          <code>.cloneDeep()</code> will break any connections between instances and their prototypes.
        </p>
        <h3>Nested Transactions</h3>
        <p>Diagnosing sub-failed transactions is complex; here are two suggestions when a transactionally locked
           action triggers another transactionally locked action: </p>
        <ol>
          <li>Note the last element in the transactions array at the start of the action; that is the transaction id
              of the current action.
          </li>
          <li>Inside the outer action use <code>myStore.myAction().catch((err) => lastErr = err})</code> to detect any
              transactional errors.
          </li>
          <li>The most manageable solution to responding to a sub-transactional failure is to throw an error
              and revert the outer transaction. If you feel moved to do more specialized corrective surgery,
              you can do so by watching the state update that the inner transactional reset triggers.
          </li>
        </ol>
        <h3>Callbacks</h3>
        <p>the nature of actions is that their results are not specific to the individual action; they are the store
           itself,
           restated. If you want to do feedback to the user when an action is complete add a callback; for instance,</p>
        <code>
          <pre>
            {l(`
              const listStore = new Store({
                actions: {
                  push (store, member) {
                    store.setList([...store.state.list, member]);
                  },
                  pop(store, member, done){
                    const {list} = store.state;
                    if (list.length < 1) {
                      const err = new Error('cannot pop empty list');
                      if (done){
                        done(err);
                      }
                      return;
                    }
                    const last = list.pop();
                    store.actions.setList([...list]);
                    if (done) {
                       done(null, last);
                    }
                  }
                }
              })
              .addStateProp('list', {type: 'array', start: []});
              
              list.actions.push('alpha');
              const cb = (err, value) =>{
                if (err) console.log('error - ', err.message);
                throw err; // short circuit the outer transaction.
                else console.log('popped ', value);
              }
              
              await list.actions.pop(cb);
              // 'popped alpha'
              await list.actions.pop(cb);
              // 'error - cannot pop empty list';
            `)}
          </pre>
        </code>

        <h2>The many ways to update state (and the one that causes issues)</h2>
        <p>State can be updated in many ways:</p>
        <h3>Returning state from an action</h3>
        <p>As in redux any value returned from an action replaces a state. Warning - this is different
           from React's <code>setState</code> method which updates a subset of properties.
        </p>
        <p>
          By convention we return a new object with the same properties; not purely necessary but for immutability
          it is a good idea.
        </p>
        <code>
          <pre>
            {l(`
              const counter = new Store({
                actions: {
                   increment(store) {
                    return {...store.state, count: store.state.count + 1};
                   },
                   increment2(store) {
                      store.actions.setCount(store.state.count + 1);
                   },
                   incrementCrappy(store){
                     store.state.count += 1;
                   }
                }
                })
                .addStateProp('count', 0, 'number');
            `)}
          </pre>
        </code>
        <h3>Calling other actions, property setter actions</h3>
        <p>creating a state property creates a 'set' action automatically so calling that also updates state.
           the example above, <code>increment2()</code>, is identical with <code>increment()</code>.</p>
        <h3>The bad way - altering state directly. </h3>
        <p><code>incrementCrappy</code> is really... crappy. state is "updated" but the subscribers will not
                                        get any notification of the change. </p>
        <h3>Pro tip: always recreate complex structures</h3>
        <p>Always return new arrays or objects rather than modifying old ones. It might not have direct consequences
           but it doesn't play well with React and other systems that use identity to trigger updates. (see push and pop
           above)</p>
        <h2>How to break Looking Glass Stores</h2>
        <p>If you return a value that doesn't contain the properties you expect the Store will not alert/check for them.
           That's on you.</p>
        <p>If you return something that is not an object the Store will explode in short order. </p>
        <p>If you call actions with async consequences without await-ing for the results -- and especially if you write
           crappy actions that deconstruct state (see above) you will get
           a messed up state. </p>
        <p>If you alter store.state directly you will not get notified. Also you won't benefit from any type checking
           done in the prop setters. </p>
        <p>If you update a property defined by <code>.addStateProp</code> or the <code>props</code> definition in the
           constructor, you won't benefit from
           any validation defined in the prop creation. This may be ok if <i>you</i> check the property value (or get
           lucky), but it is still best to use
           property setter methods wherever possible.</p>
        <h3>Error Handling</h3>
        <p>
          LGE bends over backwards to trap and channel any thrown errors in your code into the notification stream.
          This includes
        </p>
        <ul>
          <li>Errors triggered by putting bad values into validated properties</li>
          <li>Errors thrown by calls in third party libraries</li>
          <li>Errors you intentionally throw</li>
          <li>Errors you accidentally generate (code errors)</li>
        </ul>
        <p>
          Obviously we can't guarantee 100% idiot-proofing but in most cases you will only pick up on errors by
          subscribing to
          your own store and putting a notifier in as the second argument. Which means of course <b>ALWAYS WATCH STREAM
                                                                                                    FOR ERRORS.</b>
        </p>
        <p>
          Errors will short circuit your action in the middle. This could put you in a half-baked state; transactional
          locking
          (see above) should help with the cleanup. If you are having trouble diagnosing problems,
          call <code>myStore.startDebugging()</code>
          and watch the debugStream: <code>myStore.debugStream.subscribe(onInfo, onError)</code>.
        </p>
      </article>
    </main>
  </div>
}

export default Recipes;

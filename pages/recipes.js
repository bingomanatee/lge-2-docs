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
        <p>Simple property setting is <i>immediate</i>. As soon as you call <code>myStore.do.setCount(2)</code>
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
              
              const store = new ValueStream('products')
              .method('loadProducts', async getProducts(store) => {
                  if (store.my.loading) return;
                  store.do.setLoading(true);
                  store.do.setLoaded(false);
                  store.do.setProducts([]);
                  store.do.setError(null);
                  
                  try {
                    const {data} = await axios.get('http://mystore.com/api/products');
                    store.do.setProducts(data);
                    store.do.setLoading(false);
                    store.do.setLoaded(true);
                  } catch (error) {
                    store.do.setError(error);
                    store.do.setLoading(false);
                    store.do.setLoaded(false);
                  }
               })
               .property('products', [], 'array')
               .property('loading', false, 'boolean')
               .property('loaded', false, 'boolean')
               .property('error', null);
               
            `)}
          </pre>
        </code>
        <p>It may be tempting to deconstruct the first argument (store) into <code>{`{value, do}`}</code>.
           you can do this <i>up until you call any actions</i> - at which point your state property is
           a <i>historical</i> copy of the old value -- and you have no way of getting the new value.
        </p>
        <code>
          <pre>
            {l(`
              const API = 'http://mystore.com/api/';
              const badShoppingCart =  new ValueStream('cart')
              .method('getProducts', 
                  async (store) => {
                    if (store.my.loading) return;
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
                    store.do.setCartID(cart.id);
                  },
                  async sendProduct(store, product) {
                    const {data} = await(axios.post('http://www.fakesite.com', product);
                    //@TODO - integrate server feedback
                  },
                  async addProduct({value, do}, productID, product) {
                    await axios.put('cart/' + productID, product);
                    const {data} = await api.get('cart/');
                    do.setCart(data);
                    const total = value.cart.reduce((total, product) => {}, 0);
                    // NOTE THE CART WAS DECONSTRUCTED BEFORE setCart changed the cart.
                    do.setTotal(total);
                  }
                }
               })
               .property('cartID', 0, 'number');
               .property('products', [], 'array'})
               .property('cart',  [], 'array');
               .property('total', 0, 'number')
               .property('loading', false, 'boolean')
               .property('loaded', false, 'boolean')
               .property('error', null);
               
               Promise.all([ 
                 badShoppingCart.do.getCartID(),
                 badShoppingCart.do.getProducts()
                ])
                .then(() => {
                  const product = badShoppingCart.my.products[0];
                  badShoppingCart.do.addProduct(product.id)
                  .then(() => {
                     console.log('added product ', product.name, 'and total is now ', badShoppingCart.my.total);
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
                    state.do.setCart(data);
                    const total = store.my.cart.reduce((total, product) => {}, 0);
                    store.do.setTotal(total);
                  }`)}
          </pre>
        </code>
        <p>As we refer to actions and state as properties of the store object, we will always be up to date with the
           state changes from any action calls.</p>
        <h2>Transactional Locks</h2>
        <p>
          Transactions - an experimental feature. They stop update events from emitting until the transactional
          action is complete (though subaction calls <i>DO</i>{' '}still change the state): </p>

        <p>Transactions do <i>not</i> meet the definition of a SQL transaction: they don't revert upon an error to the previous state
           or lock any value/data during their commission.</p>

        <code>
          <pre>
            {l(`
              const s = new ValueStream('numbers')
              .method('switch', (stream) => {
                const a = stream.my.a;
                const b = stream.my.b;
                stream.do.setB(a);
                stream.do.setA(b);
                }, true)
              .property('a', 1, 'integer')
              .property('b', 2', 'integer');
            
              const events = [];
              s.subscribe((({value}) => events.push(value));
              
              s.do.switch();
              
              console.log('events: ',events);
               // [{a: 1, b: 2}, {a: 2, b: 1}];
            `)}
          </pre>
        </code>
        <p>
          Note in the above example, the state updates from <code>setB()</code> and <code>setA()</code>
          do not appear in the event stream. If the method were not a transaction(second variable of <code>method(fn, trans)</code> false or absent)
          the event stream would look like this, as each set[PropertyName] call emits a change notification:
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
        <h3>Returned values from methods</h3>
        <p>up til now, we have only used methods to change state. You can also get a returned value from
           a stream; and in fact you don't have to change any properties in a method if you don't want to.
          You can also pass callbacks into methods, a la node.js:
        </p>
        <code>
          <pre>
            {l(`
              const listStore = new ValueStream('list')
              .method ('push', (store, member) {
                    store.do.setList([...store.my.list, member]);
                  })
                  .method(  'pop', (store, member, done){
                    const list = store.my.list;
                    if (list.length < 1) {
                      const err = new Error('cannot pop empty list');
                      if (done){
                        done(err);
                      }
                      return;
                    }
                    const last = list.pop();
                    store.do.setList([...list]);
                    if (done) {
                       done(null, last);
                    }
                  }
                }
              })
              .property('list',[], 'array');
              
              list.do.push('alpha');
              const cb = (err, value) =>{
                if (err) console.log('error - ', err.message);
                throw err; // short circuit the outer transaction.
                else console.log('popped ', value);
              }
              
              await list.do.pop(cb);
              // 'popped alpha'
              await list.do.pop(cb);
              // 'error - cannot pop empty list';
            `)}
          </pre>
        </code>

        <h3>Error Handling</h3>
        <p>
          LGE bends over backwards to trap and channel any thrown errors in your code
          into the notification stream.  This includes
        </p>
        <ul>
          <li>Errors triggered by putting bad values into validated properties</li>
          <li>Errors thrown by calls in third party libraries</li>
          <li>Errors you intentionally throw</li>
          <li>Errors you accidentally generate (code errors)</li>
          <li>Returning failed promises</li>
        </ul>
        <p>
          Obviously we can't guarantee 100% idiot-proofing but in most cases you will only pick up on errors by
          subscribing to your own store and putting a notifier in as the second argument.
          Which means of course <b>ALWAYS WATCH STREAMS FOR ERRORS.</b>
        </p>
        <p>
          Because errors are suppressed, as with early Angular, on
          a stream without an error listener (see <code>subscribe()</code> in the API)
          your code might silently fail to execute. This is a recoverable state but
          not a good one to be in in the first place...
        </p>
      </article>
    </main>
  </div>
}

export default Recipes;

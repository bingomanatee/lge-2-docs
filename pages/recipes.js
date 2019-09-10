import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Recipes() {
  return <div>
    <HeadView/>
    <PageHeader active="recipes"/>
    <main>
      <article>
        <h1>Usage Tips</h1>
        <h2>Asynchronous Actions</h2>
        <p>Actions return promises; use this to your advantage to make sure that your action return is simultaneous with
           any third-party promise based activity. </p>
        <p>Because we are awaiting change, we don't rely on a deconstructed store in the getProducts action.</p>
        <p>Also, we are using setState to set a number of properties simultaneously.</p>
        <code>
          <pre>
            {`
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
               .addStateProp('products', [], 'array')
               .addStateProp('loading', false, 'boolean')
               .addStateProp('loaded', false, 'boolean')
               .addStateProp('error', null);
               
            `}
          </pre>
        </code>

        <h2>Transactional Locks</h2>
        <p>
          Transactions - an experimental feature - chokes the update stream until an action is fully complete.
          This is useful in two ways:
        </p>
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
            {`
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
            `}
          </pre>
        </code>
        <p>
          Note in the above example, the state updates from <code>setB()</code> and <code>setA()</code>
          do not appear in the event stream.
        </p>
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
              transactional errors.</li>
          <li>The most manageable solution to responding to a sub-transactional failure is to throw an error
              and revert the outer transaction. If you feel moved to do more specialized corrective surgery,
              you can do so by watching the state update that the inner transactional reset triggers.
          </li>
        </ol>
      </article>
    </main>
  </div>
}

export default Recipes;

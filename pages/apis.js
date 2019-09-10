import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Home() {
  return <div>

    <HeadView/>

    <PageHeader active="api"/>

    <main>

      <article>

        <h1>
          API
        </h1>
        <p>
          There is only one (documented) member of the looking glass engine: the <code>
          State</code> class
        </p>

        <h2>State</h2>

        <h3>state: Object</h3>

        <p className="indent">
          a POJO that is a mirror of the current state.
        </p>

        <h3>
          actions: Object</h3>

        <p className="indent">
          A POJO with the actions defined in the constructor.
        </p>

        <h3>
          addStateProp(name, start, type)
        </h3>

        <p className="indent">
          adds a property definition and type validator to the store. Not only does this change
          state, it also adds a <code>set[Name](value)</code> action to the store. ideally do this in a
          factory function or at least before you start observing the store.</p>

        <h3>addAction(name, mutatorFunction, info?)</h3>

        <p className="indent">
          If for some reason you don't want to define an action in the constructor, you can do so
          using this
          method.</p>

        <h3>stream: <a href="http://reactivex.io/rxjs/manual/overview.html#behaviorsubject"
                       target="rxjs">BehaviorSubject(RxJS)</a></h3>

        <p className="indent">
          the mechanic for broadcasting state updates. Repeatedly broadcasts the state itself.
        </p>

        <h3>
          subscribe(onChange, onError, onComplete)
        </h3>

        <p className="indent">
          subscribes to the stream (see above).
        </p>

        <h3> complete()</h3>

        <p className="indent">
          kills off any subscription and completes the stream (and debugStream if present).
        </p>

        <hr/>

        <h3>Debugging</h3>

        <p>
          If you want to get extremely granular the <code>.debugStream</code>
          can be enabled by either passing <code>debug:true</code>
          to the constructor or calling <code>.startDebugging()</code>.
          At that point you can subscribe to <code>myStore.debugStream</code>
          and watch all the changes as they occur.
        </p>
      </article>
    </main>
  </div>

}

export default Home

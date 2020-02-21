import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import l from './../utils/l';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="home"/>
    <main>
      <article>
        <h1>Ritual Free JS State Management</h1>
        <p>
          Over the years, state management has become one of the pivotal systems that makes or breaks applications and
          app frameworks. Looking Glass Engine is a combination of the best features of Redux, Freactal and RxjS.
        </p>
        <p>
          It is designed to be <b>predictable</b>, <b>Testable</b>, <b>Observable</b> and <b>compact</b>.
        </p>
        <p>Most importantly not only are state management systems a class, each property they manage is an instance of
           the same class, giving you control over the notification, type filtering, and the ability to obeserve and
           trigger
           off individual property changes.</p>
        <code>
          <pre>{l(`
import {ValueStream} from '@wonderlandlabs/looking-glass-engine';

const abStream = new ValueStream('alphaBeta')
  .method('swapAlphaAndBeta', (store) => {
    const alpha = store.get('alpha');
    const beta = store.get('beta');

    store.do.setBeta(alpha);
    store.do.setAlpha(beta);
  }, true)
  .property('alpha',1)
  .property('beta', 2)
  .property('delta', 3);

abStream.subscribe(({value}) => {
    console.log('state is now ', value);
  });
// state is now  { alpha: 1, beta: 2, delta: 3 }

abStream.do.setAlpha(4);

// state is now  { alpha: 4, beta: 2, delta: 3 }

abStream.do.swapAlphaAndBeta();

// state is now  { alpha: 2, beta: 4, delta: 3 }
`)}
          </pre>
        </code>
        <h2>Unlearning Redux</h2>
        <p>
          ValueStreams are object instances that broadcast change to listeners. That means they follow Flux patterns,
        but are objective in nature, not functional. Change broadcasting is synchronous, but a LGE stream's methods can
          be asynchronous.</p>
        <p>
          Because the output of an action(method) is not the trigger for change, you can change a
          property inside an async function whenever you want and it applies instantly.
        </p>
        <p>
          Because the properties are managed individually, instead of being a generic passed-through item,
          they can have types/schema, and be monitored for change (watched).
        </p>
        <p>
          The creation of a property also creates a 'set' method, as shown above.
        </p>
        <h2>Top Features</h2>
        <ul>
          <li>
            <b>Stream based notification:</b>{' '}
            Because RxJS is the underlying notification system, you can use
            all the power of RxJS to observe, filter or throttle notification to control
            the flow of information to your system.
          </li>
          <li>
            <b>Composite actions:</b>{' '}
            Methods in LGE can call other methods. And you can throttle notification
            for a single action to allow changes from multiple actions to broadcast when you
            want them to.
          </li>
          <li>
            <b>Control over state schema:</b>{' '}
            You can control the acceptable values
            for a property and catch error messages when bad data is submitted to
            a property.
          </li>
          <li>
            <b>Observable Properties:</b>{' '}
            You can write hooks to trigger when state properties change,
            or tell LGE to trigger actions to execute when a property changes.
          </li>
          <li>
            <b>Testable state systems:</b>{' '}
            Because state is a class instance, you can trigger changes and test it
            without any scaffolding or artifice; testing LGE is like testing any other object instance.
          </li>
          <li>
            <b>Inherent error trapping:</b>{' '}
            Errors in actions are streamed through the observation cycle.
            this makes dynamically reacting to errors more controllable.
          </li>
          <li>
            <b>Ritual free access to global or local state:</b>{' '}
            State objects, once created, can be shared globally or bound to a single view system.
            Or a blend of both can be used. As they exist apart from the view tree, LGE state can
            be mixed in and accessed like a library item, <i>or</i> instantiated and connected with a
            single view, as needed.
          </li>
        </ul>
        <p>
          This documentation is for version <code>3.1.x</code> of the looking glass engine package.
          Looking Glass Engine was developed under Rollup and should be safe for most modern browsers,
          especially as it makes no direct reference to DOM objects (window or document). It should
          also work under any recent (8.x+) release of Node.js. It is compatible with React, Angular and any
          UI framework that is RXJS compatible.
        </p>
        <p>
          LGE has internal dependencies on RxJS, lodash, and <code>@wonderlandlabs/propper</code>.
        </p>
      </article>
    </main>
  </div>
}

export default Home

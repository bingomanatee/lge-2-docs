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

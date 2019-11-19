import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

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
          <pre>{`
          import {State} from '@wonderlandlabs/looking-glass-engine';
          
          const s = new State({
          actions: {
            swapAlphaAndBeta({state, actions}) {
              const {alpha, beta} = state;
              return {...state, alpha: beta, beta: alpha}
            }
          }
        })
          .addStateProp('alpha',1)
          .addStateProp('beta', 2)
          .addStateProp('delta', 3);

          s.subscribe(
            ({state}) => {
              console.log('state is now ', state);
            }
          );

          s.actions.setAlpha(4);
          
          // 'state is now', {alpha: 4, beta: 2, delta: 3}
          
          s.actions.swapAlphaAndBeta();
          
          // 'state is now', {alpha: 2, beta: 4, delta: 3}
`}
          </pre>
        </code>
        <p>
          This documentation is for version <code>2.0.5</code> of the looking glass engine package and beyond.
          Looking Glass Engine was developed under Rollup and should be safe for most modern browsers,
          especially as it makes no direct reference to DOM objects (window or document). It should
          also work under any recent (8.x+) release of Node.js.
        </p>
        <p>
          It has internal dependencies on a small part of RxJS, lodash, and <code>@wonderlandlabs/propper</code>.
        </p>
        <h2>Breaking news: version 3.0</h2>
        <p>
          Version 3.0 is released and under development; take care to target thw 2.x release branch if you want
          to use the documented and heavily real world tested version.
        </p>
        <p>
          Version 3.0 is similar to LGE 2.1.0, but takes sharp departures from the features documented here.
          And as mentioned 3.x has NOT had the level of production testing that branch 2.x has.
          In the coming weeks I will provide version 3.x documentation as its profile becomes better tested and
          refined with real use.
        </p>
      </article>
    </main>
  </div>
}

export default Home

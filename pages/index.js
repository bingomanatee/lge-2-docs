import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="home"/>
    <main>
      <article>
        <h1>Ritual Free JS State Managment</h1>
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
      </article>
    </main>
  </div>
}

export default Home

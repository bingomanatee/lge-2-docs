import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <article>
        <h1>Getting Started</h1>
        <p>
          Looking Glass Engine is system-agnostic; at the moment there is no singular method of designing, organizing,
          and binding to State systems.
        </p>
        <p>
          The basic flow of State design in LGE is:
        </p>
          <ol>
            <li>Decide whether you want a <i>central</i> or <i>local</i> store.</li>
            <li>Define the properties you want to put into state</li>
            <li>Define any higher order/bridging actions/side effects (like getting data from an API or updating a canvas.)</li>
            <li>Synchronize the Store's state updates and the view layer</li>
          </ol>
        <h2>Installation</h2>
        <p>LGE is a module intended to be used in a babelized context. No testing has been done outside of parcel.js/webpack.</p>

        <code>
          <pre>
            yarn add @wonderlandlabs/looking-glass-engine

            --------

            import {Store} from '@wonderlandlabs/looking-glass-engine';

            const myStore = new Store({})
            .addStateProps('count', 0, 'integer');
          </pre>
        </code>

       <ul>
         <li><a href="/starting/example_1">Example 1: Login Screen (local store)</a></li>
         <li><a href="/starting/example_2">Example 2: Shopping Cart (global store)</a></li>
       </ul>
      </article>
    </main>
  </div>
}

export default Home

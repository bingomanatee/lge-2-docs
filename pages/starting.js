import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import l from './../utils/l';

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
            <li>Decide whether you want a <i>global</i> or <i>local</i> store.</li>
            <li>Define the properties you want to put into state</li>
            <li>Define any methods (like getting data from an API or updating a canvas.)</li>
            <li>Synchronize the Store's values with the view layer</li>
          </ol>
        <h2>Installation</h2>
        <p>LGE is a module intended to be used in a babelized context.
           It has been tested/used in React, and its unit tests run in tap/node.</p>

        <code>
          <pre>
            {l(`yarn add @wonderlandlabs/looking-glass-engine

            --------

            import {ValueStream} from '@wonderlandlabs/looking-glass-engine';

            const myStore = new ValueStream('counter')
            .property('count', 0, 'integer');`)}
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

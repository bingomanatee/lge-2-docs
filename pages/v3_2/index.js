import HeadView from "../../views/Head";
import PageHeader from '../../views/PageHeader';
import List from '../../views/List';
import l from './../../utils/l';
import {Button} from 'grommet'

function Home32() {
  return <div>
    <HeadView/>
    <PageHeader active="home32"/>
    <main>
      <article>
        <h1>Ritual Free JS State Management enhanced</h1>
        <p>Looking Glass Engine (LGE) is a long-evolved RXJS state management solution. it is:</p>
        <h2>Synchronous</h2>
        <p>Changes to values are <i>immediate</i> and accessible as soon as you change them.</p>
        <h2>Observable</h2>
        <p>Built with a healthy amount of RxJS, you can subscribe (or unsubscribe) to a ValueStore
           from anywhere in your app.
           They make great contexts but can also be a global module reference wherever you need them.
           You can even subscribe to one or more sub-properties and watch for subset changes.
        </p>
        <h2>Testable</h2>
        <p>An LGE ValueStore tests very easily; as an object instance, you can set its values,
           and by the next line in your test,
           observe the results. You can extract the entire business logic out of the view layer
           and pull it into a testable context that expresses business logic
           outside of the view -- which was <i>the original intent of React</i>.</p>
        <h2>Independent</h2>
        <p>While designed with React in mind, LGE ValueStores can operate in any environment - bare metal Javascript,
           Node, React or Angular.</p>

        <h1>Version 3.2 enhancements</h1>
        <ul>
          <il><b>Expanded watching:</b> instead of watching a single value you can watch subsets of values for change
          </il>
          <li><b>Enhanced method tuning:</b>
            while default methods don't directly throw, you can now tune a method to throw in order to interrupt flow
            for validation failures or application specific thrown errors.
          </li>
          <li><b>Specialized class design:</b>
            while not a "feature" as such, the code has been broken into a series of classes to better
            demarcate the code. The root ValueStore now has the child/parent features,
            methods and properties as specialized enhancements not present (or
            needed) in the property handlers.
          </li>
        </ul>
        <Button primary plain={false} href="/v3_2/api">Full API</Button>
      </article>
    </main>
  </div>
}

export default Home32

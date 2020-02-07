import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import l from "../utils/l";

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="hooks"/>
    <main>
      <article>
        <h1>Watching Property Change and Events</h1>
     <p>A "Killer feature" of Looking Glass Engine is the ability to watch values change. You can also trigger
     methods upon changes to a property value. you can use this to bind an action method to a property update, or define
     a function to execute on property change.</p>

        <h2>Watches</h2>
        <p>By calling the "watch" method on a stream you can tell it to trigger a method of
        a stream upon value change, or to execute a custom function. The value of the change is passed to
        the watch function as an object (<code>{`{value: currentValue, prev: pastValue, name: string}`}</code>).</p>

        <p>>Or, if you call watchFlat, as a series of properties (<code>value, prevValue, name</code>). </p>

        <code>
          <pre>
            {l(`
const {ValueStream} = require('@wonderlandlabs/looking-glass-engine') ;

const stream = new ValueStream('coord');
stream.property('x', 0, 'number')
  .property('y', 0, 'number')
  .property('magnitude', 0, 'number')
  .method('updateMagnitude', (s, {value, prev, name}) => {
    console.log('updateMagnitude called; changing', name, ' from ', prev, 'to', value);
    s.do.setMagnitude(Math.sqrt(s.my.x **2 + s.my.y**2));
  })
  .watch('x', 'updateMagnitude')
  .watch('y', 'updateMagnitude')
  .method('add', (stream, x, y) => {
    stream.do.setX(x + stream.get('x'));
    stream.do.setY(y + stream.get('y'));
  }, true);

stream.subscribe(({value}) => {
  const {x, y, magnitude} = value;
  console.log('pt: (', x,',', y, '), magnitude: ', magnitude);
});

console.log('first change');
stream.do.setY(2);
console.log('second change');
stream.do.add(2, 2);
console.log('third change');
stream.set('x', 3);
console.log('fourth change');
stream.set('x', 3);

/**

 pt: ( 0 , 0 ), magnitude:  0
 first change
 updateMagnitude called; changing y  from  0 to 2
 pt: ( 0 , 2 ), magnitude:  2
 pt: ( 0 , 2 ), magnitude:  2
 second change
 updateMagnitude called; changing x  from  0 to 2
 updateMagnitude called; changing y  from  2 to 4
 pt: ( 2 , 4 ), magnitude:  4.47213595499958
 third change
 updateMagnitude called; changing x  from  2 to 3
 pt: ( 3 , 4 ), magnitude:  5
 pt: ( 3 , 4 ), magnitude:  5
 fourth change

 */
        `)}
          </pre>
        </code>

        <h2>Events</h2>
        <p>Events follow the node.js pattern of eventEmitters; a value can be emitted via a named event,
        and a listener can be attached to listen to the event. You can use this to trigger watchable errors, or
        emit a transient value that listeners can respond to. The main difference is that a method name can be
          passed to <code>on(name)</code> to route traffic to a specific listener.
        </p>

        <p>An event is not related to the data that a ValueStream manages as state, or tied to any of the
           observables that are concerned with property updates. Like property watchers they can
        be bound to custom functions or (by name, when passed a string) to methods of the ValueStream.  </p>
      </article>
    </main>
  </div>
}

export default Home

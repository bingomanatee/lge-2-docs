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

        <h2>The TODO MVC app as a ValueStream</h2>
        <p>The TODO MVC app is easily ported into a store:</p>

        <code>
          <pre>
            {l(
        `import {ValueStream} from '@wonderlandlabs/looking-glass-engine';
        import uuid from 'uuid/v4';

        console.log('uuid:', uuid);

        class Todo {
          constructor(text, id, completed) {
          this.id = id || uuid()
          this.text = text;
          this.completed = completed;
        }

        clone() {
          return new Todo(this.text, this.id, this.completed)
        }
      }

        export default new ValueStream('todos')
        .property('todos', [new Todo('React With LGE')], 'array')
        .method('addTodo', (s, text) => {
        s.do.setTodos([...s.my.todos, new Todo(text) ])
      })
        .method('deleteTodo', (s, id) => {
        s.do.setTodos(s.my.todos.filter(todo => todo.id !== id));
      })
        .method('completeTodo', (s, id) => {
        console.log('completing todo ', id );
        s.do.setTodos(s.my.todos.map((todo) => {
        if (todo.id === id) {
        let newTodo = todo.clone();
        newTodo.completed = !newTodo.completed;
        return newTodo;
      }
        return todo;
      }));
      })
        .method('completeAll', (s) => {
        s.do.completeForAll(true);
      })
        .method('clearCompleted', (s) => {
        s.do.completeForAll(false);
      })
        .method('completeForAll', (s, complete) => {
        s.do.setTodos(s.my.todos.map((todo) => {
          if (todo.completed !== complete) {
            let newTodo = todo.clone();
            newTodo.completed = complete;
            return newTodo;
          }
          return todo;
        }));
      })
        .method('editTodo', (s, id, text) => {
        s.do.setTodos(s.my.todos.map((todo) => {
          if (todo.id === id) {
            let newTodo = todo.clone();
            newTodo.text = text;
            return newTodo;
          }
          return todo;
        }));
      });`)}
          </pre>
        </code>

        <p>The binding to the App:</p>


        <code>
          <pre>
            {l(`import React, {Component} from 'react'
import Header from './Header'
import MainSection from './MainSection'

import todoState from './todo.state';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {...todoState.value};
  }

  componentWillUnmount() {
    this.mounted = false;
    this._sub.unsubscribe();
  }

  componentDidMount() {
    this.mounted = true;
    this._sub = todoState.subscribe((s) => {
      if (this.mounted) {
        this.setState(s.value)
      }
    }, (e) => {
      console.log('state error: ', e);
    })
  }

  render() {
    return (
      <div>
        <Header addTodo={todoState.do.addTodo}/>
        <MainSection todos={this.state.todos} actions={todoState.do}/>
      </div>
    )
  }
}

export default App
`)}
              </pre>
              </code>

        <p>The full codeSandbox can be found <a href="https://codesandbox.io/s/lookking-glass-todo-mvc-me5xk" target="lge-mvc">HERE</a></p>

        <h2>More Examples</h2>

        <ul>
          <li><a href="/starting/example_1">Example 1: Login Screen (local store)</a></li>
          <li><a href="/starting/example_2">Example 2: Shopping Cart (global store)</a></li>
        </ul>

      </article>
    </main>
  </div>
}

export default Home

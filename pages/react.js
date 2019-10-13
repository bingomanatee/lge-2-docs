import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import l from "../utils/l";

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="react"/>
    <main>
      <article>
        <h1>Connecting with React</h1>
        <p>
          Connecting to a Store in React is the same as with any other <a href="https://www.robinwieruch.de/react-rxjs-state-management-tutorial" target="rx">
          RxJS Observable</a>, with one minor twitch. The method varies depending on whether you have a transient
          state that shares the components' lifecycle or a global store(s) that are shared between components.
        </p>
        <h2>A Global Store</h2>
        <p>Global stores are best for scenarios where the store is shared throughout the application.
           Classic examples include:</p>
        <ul>
          <li>User stores for the logged-in user</li>
          <li>Shopping Carts</li>
          <li>A DIY Routing system</li>
        </ul>

        <p>The pattern for global storage sync is as follows:</p>
        <ol>
          <li>Create the store as a global resource; potentially loading it from local storage
              or a remote database</li>
          <li>Assign the values from the store to state</li>
          <li>Use the state values and actions in the render path</li>
          <li>Subscribe to updates</li>
          <li>Unsubscribe to the store upon closure of the component</li>
        </ol>
        <p>Assuming this is the store file:</p>
        <code>
          <pre>
            {l(`
import {Store} from '@wonderlandlabs/looking-glass-engine';
import tryToLogUserIn from './user/tryToLogIn';
let storedUser = localStorage.get('user');
if (!storedUser && (typeof storedUser === 'object')) storedUser = false;

export default new Store({
  actions: {
    async login (store, username, password) {
       store.actions.setLoginError(false);
       try {
          let user = await tryToLogIn(username, password);
          store.actions.setUser(user);
       } catch (err) {
          this.setLoginError(err);
       }
       this.set
    }
  }
})
.addProp('loginError')
.addProp('user', user, 'object');
`)}
          </pre>
        </code>
        <p>
          Then you could combine the state with a login form component as such. Note - data validation,
          mid-submit state and error announcement are not shown here.
        </p>
        <code>
          <pre>
            {l(`
import userStore from './userStore';
import React, {Component} from 'react';

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {...userStore.state };
    this.doLogin = this.doLogin.bind(this);
  }
  
  componentDidMount() {
    this.sub = userStore.subscribe(({state}) => {
      this.setState(state);
    });
  }
  
  componentWillUnmount(){
    if (this.sub) this.sub.unsubscribe();
  }
  
  doLogin(){
    const {username, password} = this.state;
    userStore.actions.login(username, password);
  }
  
  render () {
    const {username, password} = this.state;
    return (
      <div className="login-form">
        <div className="form-row">
          <label>Username</label>
           <input type="text" value={username}
            onChange={({target}) => { this.setState({username: target.value})}}/>
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={username} 
          onChange={({target}) => { this.setState({password: target.value})}} />
        </div>
          
         <div className="form-row">
          <button onClick={this.doLogin}>Log In</button>
          </div>
      </div>
    )
  }
}

`)}
          </pre>
        </code>

        <h2>A Local Store</h2>
        <p>Local stores are best for scenarios where the store is shared throughout the application.
           Classic examples include:</p>
        <ul>
          <li>A Form Manager</li>
          <li>A local table state</li>
          <li>Anything you would use traditional React state for.</li>
        </ul>

        <p>The latter is understandably a fair sticking point: local state management is after all what
          <code>state</code> and <code>setState</code> are for. The advantages to local LGE stores include:</p>
        <ul>
          <li>Synchronous updates of properties</li>
          <li>Transactional grouping of serial updates</li>
          <li>Better trapping of thrown errors</li>
          <li>The ability to use factory patterns
              to apply similar states across multiple components</li>
        </ul>

        <p>The pattern for local storage sync is as follows:</p>
        <ol>
          <li>Design a function to produce the store; either as a method of the compoent or (cleaner) a seperate resource</li>
          <li>Assign the state to a local property</li>
          <li>Bind the store to the component as above.</li>
        </ol>
        <p>For this example lets take the component above and manage form state with it.</p>

        <code>
          <pre>
            {l(`
import userStore from './userStore';
import {Store} from '@wonderlandlabs/looking-glass-engine';
import React, {Component} from 'react';

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this._initFormStore();
    this.state = {...userStore.state, ...this.formStore.state };
    this.doLogin = this.doLogin.bind(this);
  }
  
  _initFormStore() {
    this.formStore = new State({})
    .addProp('username', '' 'string')
    .addProp('password', '', 'string')
    .addProp('loggingIn',false, 'boolean');
  }
  
  componentDidMount() {
    this.sub = userStore.subscribe(({state}) => {
      this.setState(state);
    });
    this.localSub = this.formStore.subscribe({state} => {
      this.setState(state);
    });
  }
  
  componentWillUnmount(){
    if (this.sub) this.sub.unsubscribe();
  }
  
  doLogin(){
    const {username, password, loggingIn} = this.formStore.state;
    if (!loggingIn) {
      userStore.actions.login(username, password);
    }
  }
  
  render () {
    const {username, password} = this.state;
    return (
      <div className="login-form">
        <div className="form-row">
          <label>Username</label>
           <input type="text" value={username}
            onChange={({target}) => this.formStore.actions.setUsername(target.value) } />
        </div>
        
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={username} 
          onChange={({target}) => this.formStore.actions.setPassword(target.value)} />
        </div>
          
         <div className="form-row">
          <button onClick={this.doLogin}>Log In</button>
          </div>
      </div>
    )
  }
}

`)}
          </pre>
        </code>
        <h2>Passing actions in params</h2>
        <p>The pattern of passing actions through parameters in Redux and other systems
        is common; in practice, in LGE, it is actually kind of noisy and unnecessary.
          Actions of a global store can be accessed directly through importing the store itself -
           there is no benefit to passing global actions through the view layer.</p>
        <p>
        Generally it is easier to pass the state itself as a parameter if a downstream
        component needs to use local actions. But it is valid and possible to destructure
        some or all actions of a local store into a subview if you want to.</p>
      </article>
    </main>
  </div>
}

export default Home

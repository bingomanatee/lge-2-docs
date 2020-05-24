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
          Connecting to a ValueStream in React is the same as with any other
          <a href="https://www.robinwieruch.de/react-rxjs-state-management-tutorial" target="rx">
          RxJS Observable</a>, with one minor twitch. The method varies depending on whether you have a transient
          state that shares the components' lifecycle or a global store(s) that are shared between components.
        </p>
        <h2>A Global ValueStream</h2>
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
import {userAPI} from '../utils.userAPI';
const userStore = new ValueStream('userStore')
  .method('loadUserFromLocalStorage', (store) => {
      let userString = localStorage.getItem('user');
      try {
        store.do.setUser(JSON.parse(userString));
      } catch (err) {
        store.do.clearUserFromLocalStorage();
      }
    })
    .method(   'saveUserToLocalStorage', (store) =>{
      const userObject = store.do.user;
      if (!userObject) {
        localStorage.removeItem('user');
        return;
      }
      try {
        localStorage.setItem('user', userString);
      } catch (err) {
        store.do.clearUserFromLocalStorage();
      }
    })
    .method( 'clearUserFromLocalStorage', (store) => {
      localStorage.removeItem('user');
      store.do.setUser(null);
    })
    .method('logout', (store) => {
      store.do.clearUserFromLocalStorage();
    })
    .method(login, async (store) {
      store.do.setLoginError(false);
      try {
        let user = await tryToLogIn(store.my.username, store.my.password);
        store.do.setUser(user);
        store.do.saveUserToLocalStorage(user);
      } catch (err) {
        this.setLoginError(err);
      }
    })
  .property('username', '', 'string')
  .property('password', '', 'string')
  .property('loginError', null)
  .property('user', storedUser || null);
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
    this.state = {...userStore.value };
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
  }
  
  setPassword(e){
    const {target} = e;
    // note - the reason we manually set state here is the twitchiness if react input update handling
    this.setState({password: target.value}, () => {
    userStore.do.setPassword(username);
    });
  }
  
  setUsername(e){
    const {target} = e;
    this.setState({username: target.value}, () => {
    userStore.do.setUsername(target.value);
    });
  }
  
  componentDidMount() {
    this.sub = userStore.subscribe(us) => {
      this.setState(us.value);
    });
  }
  
  componentWillUnmount(){
    if (this.sub) this.sub.unsubscribe();
  }
  
  render () {
    const {username, password, loginError} = this.state;
    
    return (
      <div className="login-form">
        {loginError? <p>{loginError.message}</p> : ''}
        <div className="form-row">
          <label>Username</label>
           <input type="text" value={username}
            onChange={this.setUsername} />
        </div>
        
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={username} 
          onChange={this.setPassword} />
        </div>
          
         <div className="form-row">
          <button onClick={userStore.do.login}>Log In</button>
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
          <li>The ability to use factory patterns to apply similar states across multiple components</li>
          <li>A state system testable outside of the view layer</li>
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
import {ValueStream} from '@wonderlandlabs/looking-glass-engine';
import React, {Component} from 'react';

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this._initFormStore();
    this.state = {...userStore.value, ...this.formStore.value };
    this.doLogin = this.doLogin.bind(this);
  }
  
  _initFormStore() {
    this.formStore = new ValueStream('login-form-state')
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
  
  async doLogin(){
    if (!loggingIn) {
      this.formState.do.setLoggingIn(true);
      await userStore.do.login(this.formState.my.username, this.formState.my.password);
      this.formState.do.setLoggingIn(false);
    }
  }
  
  render () {
    const {username, password, loginError, loggingIn} = this.state;
    return (
      <div className="login-form">
        {loginError? <p>{loginError.message}</p> : ''}
        <div className="form-row">
          <label>Username</label>
           <input type="text" value={username}
            onChange={({target}) => this.formStore.do.setUsername(target.value) } />
        </div>
        
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={username} 
          onChange={({target}) => this.formStore.do.setPassword(target.value)} />
        </div>
          
         <div className="form-row">
          {loggingIn ? <p>Logging In, please wait...</p> : :<button onClick={this.doLogin}>Log In</button>}
          </div>
      </div>
    )
  }
}

`)}
          </pre>
        </code>
        <h2>Passing stream properties and Actions to downstream views</h2>
        <p>The pattern of passing actions through parameters in Redux and other systems
        is common; in practice, in LGE, it is actually kind of noisy and unnecessary.
          Actions of a stream can be accessed directly from the stream itself.
           For a global stream. you can import it as a module; for a local stream, you can pass it as a
        parameter to downstream views. </p>
        <p>
        Generally it is easier to pass the stream as a parameter if a downstream
        component needs to use local actions. But it is valid and possible to destructure
        some or all actions of a stream into a subview if you want to.</p>
        <h2>Optimizing Refresh</h2>
        <p>In the examples above, we "dump" all the state from LGE to React.
           This is easy to understand but inefficient. In a working example you will want
        to pick and choose which state properties to bind into local state. </p>
        <p>Also, when combining states there is always the chance of overriding properties
        from one state to another; be careful to do so selectively.</p>
      </article>
    </main>
  </div>
}

export default Home

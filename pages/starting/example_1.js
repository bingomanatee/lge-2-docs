import HeadView from "../../views/Head";
import PageHeader from '../../views/PageHeader';
import List from '../../views/List';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <article>
        <h1>Getting Started/Example 1: localized State in a login form</h1>

        <p>for a login form, the state can be encapsulated in the component; since there is no need to share state
           outside of the view, we add the store as a property of the Login view.</p>
        <p>Along with the username/password fields, we can add a host of utility such as a status message for each
           field and a flag to disable login with invalid value. Normally we'd submit to an API end point, ut in this case
           we just use `window.alert` to echo the data and reset status. (note to be lazy, we snapshot state initally
           and return the snaspshot in the `reset()` action)</p>

        <code>
          <pre>
            {`import React, {Component} from 'react';

const {Store} = require('@wonderlandlabs/looking-glass-engine');
import _ from 'lodash';

class Login extends Component {

  constructor(params) {
    super(params);

    this.store = new Store({
        actions: {
          submit(store) {
            const {state, actions} = store;
            const {username, password} = state;
            window.alert(\`userName = "$-{username}; password="$-{password}; submitting, and resetting state'\`);
            actions.reset();
          },
          toggleShowPassword({actions, state}) {
            actions.setShowPassword(!state.showPassword);
          },
          chooseUsername(store, e) {
          /** note -- as a convention when you want to add side effect handling 
           * around a "set___" property handler, we use "choose___".
           * In this case we can also delegate event extraction to the choose function. */
            const {actions} = store;
            const un = _.get(e, 'target.value', e);
            actions.setUsername(un);
            if (!un) {
              actions.setUnMsg('required');
            } else if (un.length < 4) {
              actions.setUnMsg('must be at least 4 characters');
            } else {
              actions.setUnMsg('valid');
            }
            actions.checkCanSubmit();
          },
          checkCanSubmit({actions, state}) {
          /* for economy sometimes we deconstuct the store argument. 
           * WARNING: the state object will NOT be kept up to date with changes to state
           * so only do this if you don't need to examine state AFTER you call any actions.
           */
            const {unMsg, pwMsg} = state;
            actions.setCanSubmit(unMsg === 'valid' && pwMsg === 'valid');
          },
          reset(){
          // a bit of lazy;
            return {...initialState};
          },
          choosePassword(store, e) {
            const {actions} = store;
            const pw = _.get(e, 'target.value', '');
            actions.setPassword(pw);
            if (pw.length < 4) {
              actions.setPwMsg('must be at least 8 characters');
            } else if (!(/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[\\d]/.test(pw))) {
              actions.setPwMsg('must have one uppercase, one lowercase, and one number');
            } else {
              actions.setPwMsg('valid');
            }
            actions.checkCanSubmit();
          }
        }
      }
    )
      .addStateProp('username', '', 'string')
      .addStateProp('password', '', 'string')
      .addStateProp('showPassword', false, 'boolean')
      .addStateProp('canSubmit', false, 'boolean')
      .addStateProp('unMsg', 'required', 'string')
      .addStateProp('pwMsg', 'required', 'string');

    const initialState = this.store.state;
    this.state = {...this.store.state};
  }

  componentWillUnmount() {
    // see RxJS subscription
    this._sub.unsubscribe();
  }

  componentDidMount() {
  /*
   * this lifecycle event happens once after render. 
   * the first argument happens every state update.
   * the next is an error feedback function.
   * there is a third listener for completion, but as we're causing completion ourselves
   * its a bit redundant.
   */
    this._sub = this.store.stream.subscribe((store) => {
      this.setState(store.state)
    }, (err) => {
      console.log('login error: ', err);
    });
  }

  render() {
    const {username, unMsg, password, pwMsg, showPassword, canSubmit} = this.store.state;
    const {chooseUsername, choosePassword, submit, toggleShowPassword} = this.store.actions;

    return <section>
      <div className="form-row">
        <label>Username</label>
        <input type="text" value={username} onChange={chooseUsername}/>
      </div>
      <p className="form-feedback"  style={({color: unMsg === 'valid' ? 'green' : 'red'})}>{unMsg}</p>
      <div className="form-row">
        <label>Password</label>
        <input type={showPassword ? 'text' : 'password'} value={password} onChange={choosePassword}/>
      </div>
      <p className="form-feedback" style={({color: pwMsg === 'valid' ? 'green' : 'red'})}>{pwMsg}</p>
      <div className="form-row">
        <button onClick={toggleShowPassword}>{showPassword ? 'Hide Password' : 'Show Password'}</button>
        <button onClick={submit} disabled={!canSubmit}>Log In</button>
      </div>
    </section>
  }
}


export default Login;`}
          </pre>
        </code>

        <p>the working example is <a href="/example-login">Here.</a></p>
        <h2>Next Example</h2>
        <p><a href="/starting/example_2">Example 2: Shopping cart (Global State)</a></p>
      </article>
    </main>
  </div>
}

export default Home

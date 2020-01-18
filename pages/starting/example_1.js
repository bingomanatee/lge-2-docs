import HeadView from "../../views/Head";
import PageHeader from '../../views/PageHeader';
import List from '../../views/List';
import l from '../../utils/l';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <article>
        <h1>Getting Started/Example 1: localized State in a login form</h1>

        <p>The ValueStream is created in the component; since there is no need to share state
           outside of the view, we add the stream as a property of the Login view. It has the same lifespan as the Login view.</p>
        <p>Along with the username/password fields, we can add a host of utility such as a status message for each
           field and a flag to disable login with invalid value. Normally we'd submit to an API end point, ut in this case
           we just use `window.alert` to echo the data and reset status. (note to be lazy, we snapshot state initally
           and return the snaspshot in the `reset()` action)</p>
        <p>To reduce repeated renders, some methods are marked as transactional
           (the third parameter in <code>.method(name, fn, trans)</code>.
        This suppresses all updating of the component until the method is complete.
        </p>
        <code>
          <pre>
            {l(
              `
import React, {Component} from 'react';

const {ValueStream} = require('@wonderlandlabs/looking-glass-engine');
import _ from 'lodash';

class Login extends Component {

  constructor(params) {
    super(params);

    this.store = new ValueStream('login')
      .method('submit', (stream) => {
      const {username, password} = stream.value;
      window.alert(\`userName = "$\{username}; password="$\{password}; submitting, and resetting state'\`);
      stream.do.reset();
    })
      .method('toggleShowPassword', (stream) => {
        stream.do.setShowPassword(!stream.get('showPassword'));
      })
      .method('chooseUsername', (stream, e) => {
        const un = _.get(e, 'target.value', e);
        stream.do.setUsername(un);
        if (!un) {
          stream.do.setUnMsg('required');
        } else if (un.length < 4) {
          stream.do.setUnMsg('must be at least 4 characters');
        } else {
          stream.do.setUnMsg('valid');
        }
        stream.do.checkCanSubmit();
      }, true)
      .method('checkCanSubmit', (stream) => {
        const {unMsg, pwMsg} = stream.value;
        stream.do.setCanSubmit(unMsg === 'valid' && pwMsg === 'valid');
      })
      .method('reset', (stream) => {
        Object.keys(initialState).forEach((key) => {
          stream.set(key, initialState[key])
        });
      }, true)
      .method('choosePassword', (stream, e) => {
        const pw = _.get(e, 'target.value', '');
        stream.do.setPassword(pw);
        if (pw.length < 4) {
          stream.do.setPwMsg('must be at least 8 characters');
        } else if (!(/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[\\d]/.test(pw))) {
          stream.do.setPwMsg('must have one uppercase, one lowercase, and one number');
        } else {
          stream.do.setPwMsg('valid');
        }
        stream.do.checkCanSubmit();
      }, true)
      .property('username', '', 'string')
      .property('password', '', 'string')
      .property('showPassword', false, 'boolean')
      .property('canSubmit', false, 'boolean')
      .property('unMsg', 'required', 'string')
      .property('pwMsg', 'required', 'string');

    const initialState = this.store.value;
    this.state = {...initialState};
  }

  componentWillUnmount() {
    this._sub.unsubscribe();
  }

  componentDidMount() {
    console.log('mounted');
    this._sub = this.store.subscribe((store) => {
      this.setState(store.value)
    }, (err) => {
      console.log('login error: ', err);
    })
  }

  render() {
    const {username, unMsg, password, pwMsg, showPassword, canSubmit} = this.store.value;
    const {chooseUsername, choosePassword, submit, toggleShowPassword} = this.store.do;

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

export default Login;
              `
            )}
          </pre>
        </code>

        <h3>Standard practices with Looking Glass Engine</h3>
        <p>The state is initialized by copying the store's value into the components' state, both initially,
           and in <code>componentDidMount</code>.
           When the store updates, the component will re-render. <code>subscribe(...)</code> returns an RXJS Subscription,
        which we terminate when the component closes.</p>
        <p>The stores' values are deserialized from the <code>.value</code> property. This is more readable, but
        in larger stores, tactical use of get is more economical.</p>
        <p>All methods in LGE have no practical use for the <code>this</code> concept; their first parameter is the context,
        so they can be used unbound as dom listeners.</p>
        <p>Every property definition creates a <code>setMyName</code> method.</p>

        <p>the working example is <a href="/example-login">Here.</a></p>
        <h2>Next Example</h2>
        <p><a href="/starting/example_2">Example 2: Shopping cart (Global State)</a></p>
      </article>
    </main>
  </div>
}

export default Home

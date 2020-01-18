import React, {Component} from 'react';

const {ValueStream} = require('@wonderlandlabs/looking-glass-engine');
import _ from 'lodash';

class Login extends Component {

  constructor(params) {
    super(params);

    this.store = new ValueStream('login')
      .method('submit', (stream) => {
      const {username, password} = stream.value;
      window.alert(`userName = "${username}; password="${password}; submitting, and resetting state'`);
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
        } else if (!(/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[\d]/.test(pw))) {
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

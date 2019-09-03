import React, {Component} from 'react';

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
            window.alert(`userName = "${username}; password="${password}; submitting, and resetting state'`);
            actions.reset();
          },
          toggleShowPassword({actions, state}) {
            actions.setShowPassword(!state.showPassword);
          },
          chooseUsername(store, e) {
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
            const {unMsg, pwMsg} = state;
            actions.setCanSubmit(unMsg === 'valid' && pwMsg === 'valid');
          },
          reset(){
            return {...initialState};
          },
          choosePassword(store, e) {
            const {actions} = store;
            const pw = _.get(e, 'target.value', '');
            actions.setPassword(pw);
            if (pw.length < 4) {
              actions.setPwMsg('must be at least 8 characters');
            } else if (!(/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[\d]/.test(pw))) {
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
    this._sub.unsubscribe();
  }

  componentDidMount() {
    console.log('mounted');

    this._sub = this.store.stream.subscribe((store) => {
      this.setState(store.state)
    }, (err) => {
      console.log('login error: ', err);
    }, () => { // complete
      this._sub.unsubscribe();
    })
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


export default Login;

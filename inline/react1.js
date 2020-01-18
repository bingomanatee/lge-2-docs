import tryToLogIn from './utils/tryToLogIn';

const userStore = new ValueStream('userStore')
  .method('loadUserFromLocalStorage', (stream) => {
    let userString = localStorage.getItem('user');
    try {
      stream.do.setUser(JSON.parse(userString));
    } catch (err) {
      stream.do.clearUserFromLocalStorage();
    }
  })
  .method('logout', (stream) => {
    stream.do.clearUserFromLocalStorage();
  })
  .method('login', async (stream, username, password) => {
      stream.do.setLoginError(false);
      try {
        let user = await tryToLogIn(username, password);
        stream.do.setUser(user);
        stream.do.saveUserToLocalStorage(user);
      } catch (err) {
        this.setLoginError(err);
      }
    }
  )
  .method('saveUserToLocalStorage', (stream) => {
    const userObject = stream.get('user');
    if (!userObject) {
      localStorage.removeItem('user');
      return;
    }
    try {
      localStorage.setItem('user', JSON.stringify(userObject));
    } catch (err) {
      stream.do.clearUserFromLocalStorage();
    }
  })
  .method('clearUserFromLocalStorage', () => {
    localStorage.removeItem('user');
    stream.do.setUser(null);
  })
  .property('loginError')
  .property('user', null);

userStore.do.loadUserFromLocalStorage();

export default userStore;

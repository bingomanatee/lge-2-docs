import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import Login from './Login';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <Login />
    </main>
  </div>
}

export default Home

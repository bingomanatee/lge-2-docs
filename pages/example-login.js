import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';
import Login from './Login';
import Footer from '../views/Footer';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <Login />
      <Footer/>
    </main>
  </div>
}

export default Home

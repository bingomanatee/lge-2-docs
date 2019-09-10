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
      <footer>
        <p>
          <a href="/starting">Back to "Getting Started"</a>
        </p>
      </footer>
    </main>
  </div>
}

export default Home

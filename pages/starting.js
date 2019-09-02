import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <article>
        <h1>Getting Started</h1>
        <p>
          Looking Glass Engine is system-agnostic; at the moment there is no singular method of designing, organizing,
          and binding to State systems.
        </p>
        <p>
          The basic flow of State design in LGE is:
          <ol>
            <li>Decide whether you want a <i>central</i> or <i>local</i> store.</li>
            <li>Define the </li>
          </ol>
        </p>
       <h2></h2>
      </article>
    </main>
  </div>
}

export default Home

import HeadView from "../../../views/Head";
import PageHeader from '../../../views/PageHeader';
import List from '../../../views/List';
import l from './../../../utils/l';
import {Markdown} from 'grommet';
import valueStoreMD from './ValueStore.md';

function Home32() {
  return <div>
    <HeadView/>
    <PageHeader active="api32"/>
    <main>
      <article>
        <h1>Looking Glass Engine 3.2 API</h1>
        <Markdown>
          {valueStoreMD}
        </Markdown>
      </article>
    </main>
  </div>
}

export default Home32

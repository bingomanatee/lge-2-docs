import React, {useState} from 'react';
import axios from 'axios';
import HeadView from "../../../views/Head";
import PageHeader from '../../../views/PageHeader';
import List from '../../../views/List';
import l from './../../../utils/l';
import {Markdown} from 'grommet';

function Home32() {
  const [vs, setVS] = useState('');

  axios.get('/static/api/valueStore.md')
    .then(({data}) => {
      console.log('markdown:', data);
      setVS(data);
    }).catch (err => {});


  return <div>
    <HeadView/>
    <PageHeader active="api32"/>
    <main>
      <article>
        <h1>Looking Glass Engine 3.2 API</h1>
        <Markdown>
          {vs}
        </Markdown>
      </article>
    </main>
  </div>
}

export default Home32

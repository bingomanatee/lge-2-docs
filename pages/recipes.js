import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import List from '../views/List';

function Recipes() {
  return <div>
    <HeadView/>
    <PageHeader active="recipes"/>
    <main>
      <article>
        <h1>Usage Tips</h1>
        <h2>Asynchronous Actions</h2>
        <p>Actions return promises; use this to your advantage to make sure that your action return is simultaneous with
           any third-party promise based activity. </p>
        <p>Because we are awaiting change, we don't rely on a deconstructed store in the getProducts action.</p>
        <p>Also, we are using setState to set a number of properties simultaneously.</p>
        <code>
          <pre>
            {`
              import axios from 'axios';
              
              const store = new Store({
                actions: {
                  async getProducts(store) {
                    if (store.state.loading) return;
                    await store.setState({loading: true, loaded: false, products: [], error: null});
                    try {
                      const {data} = await axios.get('http://mystore.com/api/products');
                      await store.setState({loading: false, loaded: true, products: data, error: null});
                    } catch (error) {
                      await store.setState({loading: false, loaded: false, products: [], error});
                    }
                  }
                }
               })
               .addStateProp('products', [], 'array')
               .addStateProp('loading', false, 'boolean')
               .addStateProp('loaded', false, 'boolean')
               .addStateProp('error', null);
               
            `}
          </pre>
        </code>
      </article>
    </main>
  </div>
}

export default Recipes;

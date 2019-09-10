import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import ShoppingCart from './ShoppingCart'

function ShoppingCartExample() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <ShoppingCart />
    </main>
    <footer>
      <p>
        <a href="/starting">Back to "Getting Started"</a>
      </p>
    </footer>
  </div>
}

export default ShoppingCartExample

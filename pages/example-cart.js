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
  </div>
}

export default ShoppingCartExample

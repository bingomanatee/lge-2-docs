import HeadView from "../views/Head";
import PageHeader from '../views/PageHeader';
import ShoppingCart from './ShoppingCart';
import Footer from '../views/Footer';

function ShoppingCartExample() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <ShoppingCart />
    </main>
    <Footer />
  </div>
}

export default ShoppingCartExample

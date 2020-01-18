import HeadView from "../../views/Head";
import PageHeader from '../../views/PageHeader';
import List from '../../views/List';
import l from '../../utils/l';

function Home() {
  return <div>
    <HeadView/>
    <PageHeader active="starting"/>
    <main>
      <article>
        <h1>Getting Started/Example 2: global state -- shopping cart</h1>

        <p>A shopping cart is a good example of a state that many pages of goods might share. .</p>
        <p>This page lists goods for sale </p>

        <h2>Part 1: the store</h2>
        <p>This store is a straightforward store with two properties:</p>
        <ol>
          <li>
          <code>cartItems</code>, an array of <code>CartItem</code> instances
          </li>
          <li>
            <code>totalCost</code>, a float that is a summation of the items in <code>cartItems</code>
          </li>
        </ol>

        <p>There are three actions:</p>
        <ol>
          <li><code>addItem</code> which accepts a set of parameters (id, qty, name, unitCost, nodes)
            or the same parameters in an object, with qty as a POJO item, to make it easy
            to add items from a catalog. The addItem code is smart enough to merge duplicate
            entries and increase their quantity.
          </li>
          <li>
            <code>removeItem</code>, which removes all items with a given ID.
          </li>
          <li>
            <code>updateCost</code> reduces the item costs to a single total. its mostly for
            internal item changing actions to keep totalCost in sync.
          </li>
        </ol>

        <code>
          <pre>
            {l(`import _ from 'lodash';
import {ValueStream} from '@wonderlandlabs/looking-glass-engine';

/**
 * A Micro-structure for things in a cart; in a real app we would be validating things
 * like the integral value of quantity and the non-negative unit cost.
 */
class CartItem {
  constructor(id, name, unitCost = 0, qty = 1, notes = '') {
    if (!(_.isNumber(qty) && _.isNumber(unitCost))) {
      throw new Error(\`bad item ($\{id}, $\{name}, $ $\{unitCost}, q[$\{qty}])\`);
    }
    this.id = id;
    this.name = name;
    this.unitCost = unitCost;
    this.qty = qty;
    this.notes = notes;
  }

  addMore(q) {
    this.qty += q;
  }

  get itemCost() {
    return this.qty * this.unitCost;
  }
}

const cart = new ValueStream('cart')
  .method('addItem', (stream, id, qty = 1, name, unitCost, notes = '') => {
    if (_.isObject(id)) {
      console.log('adding item (obj)', id);
      return stream.do.addItem(id.id, qty, id.name, id.unitCost, id.notes);
    }
    const cart = stream.get('cartItems');
    const existing = _.find(cart, {id});
    if (existing) {
      existing.addMore(qty);
    } else {
      const item = new CartItem(id, name, unitCost, qty, notes);
      stream.do.setCartItems([...cart, item]);
    }
    stream.do.updateCost();
  })
  .method('updateCost', (stream) => {
    const newCost = stream.get('cartItems').reduce((c, i) => c + i.itemCost, 0);
    stream.do.setTotalCost(newCost);
  })
  .method('clearItem', (stream, id) => {
    stream.do.setCartItems(_.reject(stream.get('cartItems'), {id}));
    stream.do.updateCost();
  })
  .property('totalCost', 0, 'number')
  .property('cartItems', [], 'array');

export default cart;
`)}
          </pre>
        </code>

        <h2>Part 2: the view</h2>
        <p>Unlike the previous example the cart is created in another file and brought in as a module.
           As with the login screen, the cart is subscribe to in the <code>componentDidMount</code>
          method and unsubscribed to on dismount.
        </p>
        <code>
          <pre>
            {l(`import React, {Component} from 'react';
import List from './../views/List';
import cart from '../utils/ShoppingCartStore';
import uuid from 'uuid/v4';

class Purchaseable {
  constructor(name, unitCost, notes = '') {
    this.id = uuid();
    this.unitCost = unitCost;
    this.name = name;
    this.notes = notes;
  }
}

const fruits = [
  new Purchaseable('Apple', 0.5, 'golden delicious.'),
  new Purchaseable('Banana', 0.7, 'bundle')
];

const veggies = [
  new Purchaseable('Carrots', 0.9, 'bundle'),
  new Purchaseable('Broccoli', 1.5, 'stalk')
];

const rightAlign = {textAlign: 'right',  display: 'block', padding: 10};

class ShoppingCart extends Component {

  constructor(params) {
    super(params);

    this.state = {...cart.value};
  }

  componentWillUnmount() {
    this._sub.unsubscribe();
  }

  componentDidMount() {
    // note = we are subscribing to a global store;
    // more than one component can do this as long as their componentWillUnmount cleans up
    // their subscriptions.
    // This also means that actions for the global store may trigger updates on this component.

    this._sub = cart.subscribe((store) => {
      this.setState(store.value)
    }, (err) => {
      console.log('Shopping Cart Error: ', err);
    }, () => { // complete
      this._sub.unsubscribe();
    })
  }

  render() {
    const {cartItems, totalCost} = this.state;
    const {addItem, clearItem} = cart.do;
    return <section>
      <List>
        <List.Item>
          <List.ItemHead>
            Fruits
          </List.ItemHead>
          <ul>
            {fruits.map(fruit => <li key={fruit.id}>
              {fruit.name} <button  onClick={() => addItem(fruit, 1)}>Add</button>
            </li>)}
          </ul>
        </List.Item>
        <List.Item>
          <List.ItemHead>
            Vegetables
          </List.ItemHead>
          <ul>
            {veggies.map( v => <li key={v.id}>
              {v.name} <button  onClick={() => addItem(v, 1)}>Add</button>
            </li>)}
          </ul>
        </List.Item>
        <List.Item style={({border: '2px solid red', padding: 10})}>
          <List.ItemHead>
            Cart
          </List.ItemHead>
          <dl>
            {cartItems.map( item => <React.Fragment>
                <dt key={item.id}>{item.name} ({item.qty}) $\{item.unitCost.toFixed(2)} each: </dt>
              <dd style={rightAlign}> <button onClick={() =>clearItem(item.id)}>remove</button> $\{item.itemCost.toFixed(2)}</dd>
            </React.Fragment>)}
          </dl>
          <hr />
          <div style={rightAlign}>
          <b>TOTAL: $\{totalCost.toFixed(2)}</b>
          </div>
        </List.Item>
      </List>
    </section>
  }
}

export default ShoppingCart;`)}
          </pre>
        </code>

        <p>The working example is <a href="/example-cart">Here.</a></p>
        <p><a href="/starting">Back to Starting</a></p>
      </article>
    </main>
  </div>
}

export default Home

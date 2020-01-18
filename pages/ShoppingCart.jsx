import React, {Component} from 'react';
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
                <dt key={item.id}>{item.name} ({item.qty}) ${item.unitCost.toFixed(2)} each: </dt>
              <dd style={rightAlign}> <button onClick={() =>clearItem(item.id)}>remove</button> ${item.itemCost.toFixed(2)}</dd>
            </React.Fragment>)}
          </dl>
          <hr />
          <div style={rightAlign}>
          <b>TOTAL: ${totalCost.toFixed(2)}</b>
          </div>
        </List.Item>
      </List>
    </section>
  }
}


export default ShoppingCart;

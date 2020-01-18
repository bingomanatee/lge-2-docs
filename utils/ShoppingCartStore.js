import _ from 'lodash';
import {ValueStream} from '@wonderlandlabs/looking-glass-engine';

/**
 * A Micro-structure for things in a cart; in a real app we would be validating things
 * like the integral value of quantity and the non-negative unit cost.
 */
class CartItem {
  constructor(id, name, unitCost = 0, qty = 1, notes = '') {
    if (!(_.isNumber(qty) && _.isNumber(unitCost))) {
      throw new Error(`bad item (${id}, ${name}, $ ${unitCost}, q[${qty}])`);
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

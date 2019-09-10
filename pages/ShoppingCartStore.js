import _ from 'lodash';
import React from 'react';
const {Store} = require('@wonderlandlabs/looking-glass-engine');

/**
 * A Micro-structure for things in a cart; in a real app we would be validating things
 * like the integral value of quantity and the non-negative unit cost.
 */
class CartItem {
  constructor(id, name, unitCost = 0, qty = 1, notes = '') {
    if (!(_.isNumber(qty) && _.isNumber(unitCost))){
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


const cart = new Store({
  actions: {
    async addItem(store, id, qty = 1, name, unitCost, notes = '') {
      if (_.isObject(id)) {
        console.log('adding item (obj)', id);
        return store.actions.addItem(id.id, qty,  id.name, id.unitCost, id.notes);
      }
      const cart = _.get(store, 'state.cartItems');
      const existing = _.find(cart, {id});
      if (existing) {
        existing.addMore(qty);
      } else {
        cart.push(new CartItem(id, name, unitCost, qty, notes));
      }
      await store.actions.setCartItems([...cart]);
      store.actions.updateCost();
    },
    clearItem({state, actions}, id){
      const {cartItems} = state;
      actions.setCartItems(_.reject(cartItems, {id}));
      actions.updateCost();
    },
    updateCost({state, actions}){
      const {cartItems} = state;
      const newCost = cartItems.reduce((c, i) => c + i.itemCost, 0);
      actions.setTotalCost(newCost);
    }
  },
  props: {
    totalCost: {
      type: 'number',
      start: 0
    },
    cartItems: {
      type: 'array',
      start: []
    }
  }
});

export default cart;

import {ValueStream} from '@wonderlandlabs/looking-glass-engine';
// const {ValueStream} = require('@wonderlandlabs/looking-glass-engine') ;
const abStream = new ValueStream('alphaBeta')
  .method('swapAlphaAndBeta', (store) => {
    const alpha = store.get('alpha');
    const beta = store.get('beta');

    store.do.setBeta(alpha);
    store.do.setAlpha(beta);
  }, true)
  .property('alpha',1)
  .property('beta', 2)
  .property('delta', 3);

abStream.subscribe(
  ({value}) => {
    console.log('state is now ', value);
  }
);
// state is now  { alpha: 1, beta: 2, delta: 3 }

abStream.do.setAlpha(4);

// state is now  { alpha: 4, beta: 2, delta: 3 }

abStream.do.swapAlphaAndBeta();

// state is now  { alpha: 2, beta: 4, delta: 3 }

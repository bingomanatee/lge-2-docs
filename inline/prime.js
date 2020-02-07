const {ValueStream} = require('@wonderlandlabs/looking-glass-engine');

const primes = [ 2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];

const stream = new ValueStream('primer')
  .property('prime', 2, (value) => {return primes.includes(value) ? false : 'must be prime'; });
const sub = stream.subscribe(
  ({value}) => {
    console.log('value is ', value);
  },
  (fail) => {
    console.log('error: ', fail);
  });

stream.do.setPrime(5);
console.log('after 5 prime value:', stream.my.prime);
stream.do.setPrime(4);
console.log('after 4 prime value:', stream.my.prime);
// value is still 5
stream.do.setPrime(7);
console.log('after 7 prime value:', stream.my.prime);
// value is now seven

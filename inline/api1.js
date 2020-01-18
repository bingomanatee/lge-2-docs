const {ValueStream} = require('@wonderlandlabs/looking-glass-engine') ;

const myStream = new ValueStream('articleStream')
  .property('count', 0, 'integer')
  .method('increment', (stream) => stream.do.setCount(stream.my.count + 1))
  .method('incBy', (stream, n) => stream.do.setCount(stream.my.count + n));

const sub = myStream.subscribe((stream) => console.log('count is ', stream.my.count));
myStream.do.increment();
myStream.do.incBy(10);
myStream.do.increment();

/**

 count is  0
 count is  1
 count is  11
 count is  12
**/

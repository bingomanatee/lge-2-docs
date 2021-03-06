const {ValueStream} = require('@wonderlandlabs/looking-glass-engine') ;

const stream = new ValueStream('coord');
stream.property('x', 0, 'number')
  .property('y', 0, 'number')
  .property('magnitude', 0, 'number')
  .method('updateMagnitude', (s, {value, prev, name}) => {
    console.log('updateMagnitude called; changing', name, ' from ', prev, 'to', value);
    s.do.setMagnitude(Math.sqrt(s.my.x **2 + s.my.y**2));
  })
  .watch('x', 'updateMagnitude')
  .watch('y', 'updateMagnitude')
  .method('add', (stream, x, y) => {
    stream.do.setX(x + stream.get('x'));
    stream.do.setY(y + stream.get('y'));
  }, true);

stream.subscribe(({value}) => {
  const {x, y, magnitude} = value;
  console.log('pt: (', x,',', y, '), magnitude: ', magnitude);
});

console.log('first change');
stream.do.setY(2);
console.log('second change');
stream.do.add(2, 2);
console.log('third change');
stream.set('x', 3);
console.log('fourth change');
stream.set('x', 3);

/**

 pt: ( 0 , 0 ), magnitude:  0
 first change
 updateMagnitude called; changing y  from  0 to 2
 pt: ( 0 , 2 ), magnitude:  2
 pt: ( 0 , 2 ), magnitude:  2
 second change
 updateMagnitude called; changing x  from  0 to 2
 updateMagnitude called; changing y  from  2 to 4
 pt: ( 2 , 4 ), magnitude:  4.47213595499958
 third change
 updateMagnitude called; changing x  from  2 to 3
 pt: ( 3 , 4 ), magnitude:  5
 pt: ( 3 , 4 ), magnitude:  5
 fourth change

 */

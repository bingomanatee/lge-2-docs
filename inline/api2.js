const {ValueStream} = require('@wonderlandlabs/looking-glass-engine') ;

const latLon = new ValueStream('latlon')
  .propertyRange('lat', 0, {min: -90, max: 90})
  .propertyRange('lon', 0, {min: -180, max: 180})
  .method('flip', (stream) => {
    const lon = stream.my.lon;
    const lat = stream.my.lat;
    stream.do.setLat(lon);
    stream.do.setLon(lat);
  }, true);

let line = 0;
latLon.do.setLat(20);
latLon.do.setLon(80);
const sub = latLon.subscribe((stream) => console.log(line++, 'lat', stream.my.lat, 'lon', stream.my.lon));
latLon.do.flip();

// by contrast this is the same structure without transactional locking
const latLonNoTrans = new ValueStream('latlon')
  .propertyRange('lat', 0, {min: -90, max: 90})
  .propertyRange('lon', 0, {min: -180, max: 180})
  .method('flip', (stream) => {
    const lon = stream.my.lon;
    const lat = stream.my.lat;
    stream.do.setLat(lon);
    stream.do.setLon(lat);
  });

let line2 = 0;
latLonNoTrans.do.setLat(20);
latLonNoTrans.do.setLon(80);
const sub2 = latLonNoTrans.subscribe((stream) => console.log(line2++, 'lat', stream.my.lat, 'lon', stream.my.lon));
latLonNoTrans.do.flip();


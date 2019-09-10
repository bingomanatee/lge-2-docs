import _ from 'lodash';

export default (str) =>{
  if (typeof str !== 'string') return str;

  const lines = str.split(/[\n\r]+/);
  const spaces = lines.map(s => {
    const m = /^([\s]+)/.exec(s);
    if (m) {
      return m[1].length;
    }
    return 0;
  }).reduce((max, n) => {
    if (n > 0) {
      if (max === Infinity) return n;
      return max;
    }
    return max;
  }, Infinity);
  if (spaces === Infinity) return str;
  return _.trim(lines.map(s => {
    const prefix = s.substr(0, spaces);
    const main = s.substr(spaces);
    return _.trimStart(prefix) + main;
  }).join("\n"), ' \n\r');
}

// const Promise = require('./mPromise');

function isThenable (obj) {
  return obj && obj.then instanceof Function;
}

module.exports = function co (genFunc, initValue) {
  const gen = genFunc();
  return new Promise((resolve, reject) => {
    function run (err, val) {
      let value, done;
      if (err) {
        ({value, done} = gen.throw(err));
      } else {
        ({value, done} = gen.next(val));
      }
      if (!done) {
        if (isThenable(value)) {
          value
            .then(value => run(null, value))
            .catch(err => run(err, null));
        } else {
          setTimeout(() => run(null, value), 0);
        }
      } else {
        resolve(value);
      }
    }

    run(null, initValue);
  });
};

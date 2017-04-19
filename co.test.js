// const Promise = require('./mPromise');
const co = require('./co');
const assert = require('assert');

function timeout (time, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), time);
  });
}

describe('Co', () => {
  it('最简情况', done => {
    co(function * () {
      yield 1;
      yield 2;
      yield 3;
      return 4;
    })
      .then(value => {
        assert.equal(value, 4);
        done();
      });
  });

  it('正常驱动(with promise)', done => {
    co(function * () {
      yield 1;
      const startTime = new Date();
      const res = yield timeout(20, 2);
      assert.equal(res, 2);
      assert(new Date() - startTime >= 20);
      return 3;
    })
      .then(value => {
        assert.equal(value, 3);
        done();
      });
  });

  it('捕捉错误', done => {
    co(function * () {
      try {
        const foo = yield Promise.reject(new Error('test error'));
        assert(false, 'should not be here');
      } catch (err) {
        /* error caught */
        assert.equal(err.message, 'test error');
      }
      return 3;
    })
      .then(value => {
        assert.equal(value, 3);
        done();
      });
  });
});

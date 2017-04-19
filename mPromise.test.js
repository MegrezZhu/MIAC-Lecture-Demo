const MPromise = require('./mPromise');
const assert = require('assert');

function timeout (time, value) {
  return new MPromise(resolve => {
    setTimeout(() => resolve(value), time);
  });
}

describe('MPromise', () => {
  it('#then,func返回value', done => {
    const p1 = new MPromise(resolve => resolve(1));
    p1
      .then(value => {
        assert(p1.status === 'Fulfilled');
        assert.equal(value, 1);
        return 2;
      })
      .then(value => {
        assert.equal(value, 2);
        done();
      });
  });

  it('#then,func返回resolved MPromise', done => {
    const p1 = new MPromise(resolve => resolve(1));
    const startDate = new Date();
    p1
      .then(value => {
        assert.equal(value, 1);
        return new MPromise(resolve => {
          setTimeout(() => resolve(2), 10);
        });
      })
      .then(value => {
        assert.equal(value, 2);
        assert(new Date() - startDate >= 10);
        done();
      });
  });

  it('#then,func返回rejected MPromise', done => {
    const p1 = new MPromise(resolve => resolve(1));
    const startDate = new Date();
    p1
      .then(value => {
        assert.equal(value, 1);
        return new MPromise((resolve, reject) => {
          setTimeout(() => reject(new Error('test error')), 10);
        });
      })
      .then(value => {
        assert(false);
      })
      .catch(err => {
        assert(new Date() - startDate >= 10);
        assert.equal(err.message, 'test error');
        done();
      });
  });

  it('#catch', done => {
    const prom = new MPromise((resolve, reject) => {
      reject(new Error('test error'));
    });
    prom
      .catch(err => {
        assert(err);
        assert.equal(err.message, 'test error');
        done();
      });
  });

  it('#static resolve', done => {
    const prom = MPromise.resolve(1);
    assert.equal(prom.status, 'Fulfilled');
    prom
      .then(value => {
        assert.equal(value, 1);
        done();
      });
  });

  it('#static reject', done => {
    const prom = MPromise.reject(new Error('test error'));
    assert.equal(prom.status, 'Rejected');
    prom
      .catch(err => {
        assert.equal(err.message, 'test error');
        done();
      });
  });

  it('timeout测试', done => {
    const startTime = new Date();
    timeout(30, 5)
      .then(value => {
        assert.equal(value, 5);
        assert(new Date() - startTime >= 30);
        done();
      });
  });
});

describe('MPromise与Promise兼容', () => {
  it('#then中返回Promise', done => {
    const p = new MPromise(resolve => resolve(1));
    p
      .then(value => {
        assert.equal(value, 1);
        return new Promise(resolve => resolve(2));
      })
      .then(value => {
        assert.equal(value, 2);
        done();
      });
  });

  it('Promise后接MPromise', done => {
    const p = new Promise(resolve => resolve(1));
    p
      .then(value => {
        assert.equal(value, 1);
        return new MPromise(resolve => resolve(2));
      })
      .then(value => {
        assert.equal(value, 2);
        done();
      });
  });
});

class MPromise {
  constructor (func) {
    this.status = 'Pending';
    this.nextPromise = this.func = this.fulfillValue = this.rejectError = null;

    if (func) {
      setTimeout(() => {
        func(
          this.resolve.bind(this),
          this.reject.bind(this)
        );
      }, 0);
    }
  }

  then (func) {
    const thenPromise = this.nextPromise = new MPromise();
    thenPromise.func = MPromise.wrapThenFunc(func);
    if (this.status === 'Fulfilled') {
      setTimeout(() => {
        thenPromise.func(null, this.fulfillValue);
      }, 0);
    }
    return thenPromise;
  }

  catch (func) {
    const thenPromise = this.nextPromise = new MPromise();
    thenPromise.func = MPromise.wrapCatchFunc(func);
    if (this.status === 'Rejected') {
      setTimeout(() => {
        thenPromise.func(this.rejectError, null);
      });
    }
  }

  resolve (value) {
    if (this.status === 'Pending') {
      this.status = 'Fulfilled';
      this.fulfillValue = value;
      if (this.nextPromise) {
        setTimeout(() => this.nextPromise.func(null, value), 0);
      }
    }
  }

  reject (err) {
    if (this.status === 'Pending') {
      this.status = 'Rejected';
      this.rejectError = err;
      if (this.nextPromise) {
        setTimeout(() => this.nextPromise.func(err, null), 0);
      } else {
        throw err; // unhandeld exception
      }
    }
  }

  static resolve (value) {
    const prom = new MPromise();
    prom.resolve(value);
    return prom;
  }

  static reject (err) {
    const prom = new MPromise();
    prom.status = 'Rejected';
    prom.rejectError = err;
    return prom;
  }

  static isThenable (obj) {
    return obj && obj.then instanceof Function;
  }

  static wrapThenFunc (func) {
    return function (err, value) {
      if (err) {
        return this.reject(err);
      }

      try {
        const res = func(value);
        if (MPromise.isThenable(res)) {
          res
            .then(value => this.resolve(value))
            .catch(err => this.reject(err));
        } else {
          this.resolve(res);
        }
      } catch (err) {
        this.reject(err);
        if (!this.nextPromise) {
          throw err;
        }
      }
    };
  }

  static wrapCatchFunc (func) {
    return function (err, value) {
      if (!err) {
        return this.resolve(value);
      }

      try {
        const res = func(err);
        if (MPromise.isThenable(res)) {
          res
            .then(value => this.resolve(value))
            .catch(err => this.reject(err));
        } else {
          this.resolve(res);
        }
      } catch (err) {
        this.reject(err);
        if (!this.nextPromise) {
          throw err;
        }
      }
    };
  }
}

module.exports = MPromise;

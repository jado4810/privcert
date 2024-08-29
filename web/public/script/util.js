var privcert = {};
privcert.app = {};
privcert.Util = {};

// Inherits
privcert.Util.inherit = function(child, parent) {
  // Copy properties from parent class
  for (var property in parent) {
    child[property] = parent[property];
  }

  // Set prototype of parent class
  child.__super__ = parent.prototype;

  // Copy prototype without calling constructor of parent class
  var DummyClass = function() {};
  DummyClass.prototype = parent.prototype;
  child.prototype = new DummyClass();

  // Replace only constructor() in prototype of child class
  child.prototype.constructor = child;
  return child;
}

// Initialize
privcert.Util.ready = function(callback) {
  if (document.readyState == 'complete' ||
      document.readyState != 'loading' && !document.documentElement.doScroll) {
    Object.assign(privcert.app, callback.call(window));
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      Object.assign(privcert.app, callback.call(window));
    }, false);
  }
}

// Promise
privcert.Util.Promise = function() {
  // Status
  // null - not decided / true - resolved / false - rejected
  this.stat = null;
  // Value passed when resolved or rejected
  this.arg = null;

  // Callbacks on resolve
  this.doneCB = [];
  // Callbacks on reject
  this.failCB = [];
}

// Set callback on both resolve and reject
privcert.Util.Promise.prototype.then = function(doneCB, failCB) {
  this.done(doneCB);
  this.fail(failCB);

  return this;
}

// Set callback on resolve
privcert.Util.Promise.prototype.done = function(callback) {
  if (callback != null) {
    this.doneCB.push(callback);

    // Apply callbacks now if already resolved
    if (this.stat == true) callback.apply(this, this.arg);
  }

  return this;
}

// Set callback on reject
privcert.Util.Promise.prototype.fail = function(callback) {
  if (callback != null) {
    this.failCB.push(callback);

    // Apply callbacks now if already rejected
    if (this.stat == false) callback.apply(this, this.arg);
  }

  return this;
}

// Set callback common on resolve and reject
privcert.Util.Promise.prototype.anyway = function(callback) {
  this.done(callback);
  this.fail(callback);

  return this;
}

// Make the promise object resolved
privcert.Util.Promise.prototype.resolve = function() {
  if (this.stat != null) return this;

  this.stat = true;
  this.arg = arguments;

  this.doneCB.forEach(function(cb) {
    cb.apply(this, this.arg);
  }.bind(this));

  return this;
}

// Make the promise object rejected
privcert.Util.Promise.prototype.reject = function() {
  if (this.stat != null) return this;

  this.stat = false;
  this.arg = arguments;

  this.failCB.forEach(function(cb) {
    cb.apply(this, this.arg);
  }.bind(this));

  return this;
}

// Make the promise object for continuous async processes
privcert.Util.Promise.prototype.pipe = function(doneFilter, failFilter) {
  var promise = new privcert.Util.Promise();

  if (doneFilter == null) {
    // Pass to the new promise now if without filter for resolve
    this.done(promise.resolve.bind(promise));
  } else {
    this.done(function(promise, doneFilter) {
      var values = Array.prototype.slice.call(arguments, 2);

      // Kick continuous process on resolve
      var subResult = doneFilter.apply(this, values);
      if (subResult instanceof privcert.Util.Promise) {
        // Pass to the new promise if returned the promise object
        subResult.then(promise.resolve.bind(promise),
                       promise.reject.bind(promise));
      } else {
        // Otherwise, resolve new promise with the return value
        promise.resolve(subResult);
      }
    }.bind(this, promise, doneFilter));
  }

  if (failFilter == null) {
    // Pass to the new promise now if without filter for reject
    this.fail(promise.reject.bind(promise));
  } else {
    this.fail(function(promise, failFilter) {
      var reasons = Array.prototype.slice.call(arguments, 2);

      // Kick continuous process on reject
      var subResult = failFilter.apply(this, reasons);
      if (subResult instanceof privcert.Util.Promise) {
        // Pass to the new promise if returned the promise object
        subResult.then(promise.resolve.bind(promise),
                       promise.reject.bind(promise));
      } else {
        // Otherwise, reject new promise with the return value
        promise.reject(subResult);
      }
    }.bind(this, promise, failFilter));
  }

  return promise;
}

// XHR on Promise
privcert.Util.Promise.XHR = function() {
  privcert.Util.Promise.call(this);

  this.req = new XMLHttpRequest();
  this.req.onreadystatechange = function() {
    if (this.req.readyState != 4) return;

    if (this.req.status == 200) {
      this.resolve(this.req.responseText);
    } else {
      this.reject(this.req.status);
    }
  }.bind(this);
}
privcert.Util.inherit(privcert.Util.Promise.XHR, privcert.Util.Promise);

// Get json from server response
privcert.Util.Promise.XHR.prototype.receive_json = function() {
  return this.pipe(function(res) {
    try {
      return JSON.parse(res);
    } catch (e) {
      var promise = new privcert.Util.Promise();
      return promise.reject(-1);
    }
  }, function(status) {
    if (status == 401) {
      document.location.href = './login';
    }
    return status;
  });
}

// Get json with HTTP GET
privcert.Util.get_json = function(url) {
  var xhr = new privcert.Util.Promise.XHR();

  xhr.req.open('GET', url, true);
  xhr.req.send();

  return xhr.receive_json();
}

// Post data with HTTP POST and get json
privcert.Util.post_json = function(url, data, csrf_token) {
  var xhr = new privcert.Util.Promise.XHR();

  xhr.req.open('POST', url, true);
  xhr.req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  if (csrf_token != null) {
    xhr.req.setRequestHeader('X-CSRF-Token', csrf_token);
  }

  param = Object.keys(data).map(function(key) {
    return key + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+');
  }).join('&');

  xhr.req.send(param);

  return xhr.receive_json();
}

// I18n error messages (to be initialized by server view)
privcert.Util.i18n_error_msgs = {};

// Get translation
function _(key) {
  return privcert.Util.i18n_error_msgs[key] || key;
}

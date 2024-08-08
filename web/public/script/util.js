var privcert = {};
privcert.app = {};
privcert.Util = {};

// 継承
privcert.Util.inherit = function(child, parent) {
  // 親クラスのプロパティをコピー
  for (var property in parent) {
    child[property] = parent[property];
  }

  // 親クラスのプロトタイプをセット
  child.__super__ = parent.prototype;

  // 親クラスのコンストラクタを呼ばずにプロトタイプをコピー
  var DummyClass = function() {};
  DummyClass.prototype = parent.prototype;
  child.prototype = new DummyClass();

  // 子クラスのプロトタイプはconstructor()のみ差し替え
  child.prototype.constructor = child;
  return child;
}

// 初期化処理
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
  // 状態
  // null…未解決 / true…解決済 / false…棄却済
  this.stat = null;
  // 解決時または棄却時に渡される値
  this.arg = null;

  // 解決時の処理
  this.doneCB = [];
  // 棄却時の処理
  this.failCB = [];
}

// 解決時・棄却時の処理を予約
privcert.Util.Promise.prototype.then = function(doneCB, failCB) {
  this.done(doneCB);
  this.fail(failCB);

  return this;
}

// 解決時の処理を予約
privcert.Util.Promise.prototype.done = function(callback) {
  if (callback != null) {
    this.doneCB.push(callback);

    // 既に解決済の場合、即コールバックを実行
    if (this.stat == true) callback.apply(this, this.arg);
  }

  return this;
}

// 棄却時の処理を予約
privcert.Util.Promise.prototype.fail = function(callback) {
  if (callback != null) {
    this.failCB.push(callback);

    // 既に棄却済の場合、即コールバックを実行
    if (this.stat == false) callback.apply(this, this.arg);
  }

  return this;
}

// 解決時・棄却時共通の処理を予約
privcert.Util.Promise.prototype.anyway = function(callback) {
  this.done(callback);
  this.fail(callback);

  return this;
}

// 解決済状態への移行を通知
privcert.Util.Promise.prototype.resolve = function() {
  if (this.stat != null) return this;

  this.stat = true;
  this.arg = arguments;

  this.doneCB.forEach(function(cb) {
    cb.apply(this, this.arg);
  }.bind(this));

  return this;
}

// 棄却済状態への移行を通知
privcert.Util.Promise.prototype.reject = function() {
  if (this.stat != null) return this;

  this.stat = false;
  this.arg = arguments;

  this.failCB.forEach(function(cb) {
    cb.apply(this, this.arg);
  }.bind(this));

  return this;
}

// 連続した非同期処理のためのPromiseオブジェクトを生成
privcert.Util.Promise.prototype.pipe = function(doneFilter, failFilter) {
  var promise = new privcert.Util.Promise();

  if (doneFilter == null) {
    // 解決時フィルタが指定されていない場合、即新しいPromiseに連動させる
    this.done(promise.resolve.bind(promise));
  } else {
    this.done(function(promise, doneFilter) {
      var values = Array.prototype.slice.call(arguments, 2);

      // 解決時に続く処理を実行
      var subResult = doneFilter.apply(this, values);
      if (subResult instanceof privcert.Util.Promise) {
        // Promiseが返された場合、新しいPromiseに連動させる
        subResult.then(promise.resolve.bind(promise),
                       promise.reject.bind(promise));
      } else {
        // それ以外が返された場合、その値で新しいPromiseを解決
        promise.resolve(subResult);
      }
    }.bind(this, promise, doneFilter));
  }

  if (failFilter == null) {
    // 棄却時フィルタが指定されていない場合、即新しいPromiseに連動させる
    this.fail(promise.reject.bind(promise));
  } else {
    this.fail(function(promise, failFilter) {
      var reasons = Array.prototype.slice.call(arguments, 2);

      // 棄却時に続く処理を実行
      var subResult = failFilter.apply(this, reasons);
      if (subResult instanceof privcert.Util.Promise) {
        // Promiseが返された場合、新しいPromiseに連動させる
        subResult.then(promise.resolve.bind(promise),
                       promise.reject.bind(promise));
      } else {
        // それ以外が返された場合、その値で新しいPromiseを棄却
        promise.reject(subResult);
      }
    }.bind(this, promise, failFilter));
  }

  return promise;
}

// 並行する非同期処理のためのPromiseオブジェクトを生成
privcert.Util.Promise.when = function(promises) {
  var promise = new privcert.Util.Promise();
  promise.nSub = arguments.length;
  promise.nResolve = 0;
  promise.nReject = 0;
  promise.subValue = new Array(promise.nSub);
  promise.subReason = new Array(promise.nSub);

  Array.prototype.forEach.call(arguments, function(p, i) {
    p.then(function(value) {
      promise.subValue[i] = value;
      promise.subReason[i] = null;
      promise.nResolve++;
      if (promise.nResolve + promise.nReject >= promise.nSub) {
        if (promise.nReject == 0) {
          promise.resolve.apply(promise, promise.subValue);
        } else {
          promise.reject.apply(promise, promise.subReason);
        }
      }
    }, function(reason) {
      promise.subValue[i] = null;
      promise.subReason[i] = reason;
      promise.nReject++;
      if (promise.nResolve + promise.nReject >= promise.nSub) {
        promise.reject.apply(promise, promise.subReason);
      }
    });
  });

  return promise;
}

// Promise版XHRオブジェクトを生成
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

// サーバレスポンスのJSONデータを取得
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

// HTTP GETでJSONを取得
privcert.Util.get_json = function(url) {
  var xhr = new privcert.Util.Promise.XHR();

  xhr.req.open('GET', url, true);
  xhr.req.send();

  return xhr.receive_json();
}

// HTTP POSTでデータを送信してJSONを取得
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

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

// Get json from server response
privcert.Util.receive_json_ = function(res) {
  if (!res.ok) {
    if (res.status == 401) {
      document.location.href = './login';
    }
    throw new Error('Ajax error: status=' + res.status);
  }
  return res.json();
}

// Get json with HTTP GET
privcert.Util.get_json = function(url) {
  return fetch(url).then(privcert.Util.receive_json_);
}

// Post data with HTTP POST and get json
privcert.Util.post_json = function(url, data, csrf_token) {
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  if (csrf_token != null) {
    Object.assign(headers, {
      'X-CSRF-Token': csrf_token
    });
  }

  var body = Object.keys(data).map(function(key) {
    return key + '=' + encodeURIComponent(data[key]).replace(/%20/g, '+');
  }).join('&');

  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  }).then(privcert.Util.receive_json_);
}

// Ignore exceptions from rejected promise
privcert.Util.ignore_error = function(e) {
  return e.toString();
}

// I18n error messages (to be initialized by server view)
privcert.Util.i18n_error_msgs = {};

// Get translation
function _(key) {
  return privcert.Util.i18n_error_msgs[key] || key;
}

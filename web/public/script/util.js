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

// Dialog
privcert.Util.Dialog = function() {
  this.dialog = document.createElement('dialog');
  this.dialog.addEventListener('cancel', this.cancel.bind(this), false);

  this.promise = null;
  this.resolve = null;
  this.reject = null;
}

privcert.Util.Dialog.prototype.set_content = function(content) {
  while (this.dialog.firstChild) {
    this.dialog.removeChild(this.dialog.firstChild);
  }
  this.dialog.appendChild(content);
}

// Show modal dialog
privcert.Util.Dialog.prototype.show_modal = function(initial_focus) {
  document.body.appendChild(this.dialog);
  this.dialog.showModal();

  if (initial_focus == null) {
    this.dialog.focus();
    this.dialog.blur();
  } else {
    initial_focus.focus();
  }

  this.promise = new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
  }.bind(this));

  return this.promise.finally(function() {
    this.dialog.close();
    document.body.removeChild(this.dialog);

    this.promise = null;
    this.resolve = null;
    this.reject = null;
  }.bind(this));
}

// Close dialog with resolving
privcert.Util.Dialog.prototype.okay = function(value) {
  if (this.resolve == null) return;
  this.resolve((value == null) ? true : value);
}

// Close dialog with rejecting
privcert.Util.Dialog.prototype.cancel = function() {
  if (this.reject == null) return;
  this.reject(new Error('Canceled'));
}

// Confirm on modal dialog
privcert.Util.confirm = function(messages, okay_label, cancel_label,
                                 reject_if_cancel) {
  var dialog = new privcert.Util.Dialog();

  var content = document.createElement('div');
  content.className = 'dialog-content'

  var p = document.createElement('p');
  messages.map(function(line) {
    return [document.createTextNode(line), document.createElement('br')];
  }).flat().slice(0, -1).forEach(function(elem) {
    p.appendChild(elem);
  });

  content.appendChild(p);

  var footer = document.createElement('footer');
  footer.className = 'dialog-ui';

  var cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.dataset.icon = 'close';
  cancel.appendChild(document.createTextNode(cancel_label));
  cancel.addEventListener('click', dialog.cancel.bind(dialog), false);
  footer.appendChild(cancel);

  var okay = document.createElement('button');
  okay.dataset.icon = 'done';
  okay.appendChild(document.createTextNode(okay_label));
  okay.addEventListener('click', dialog.okay.bind(dialog, true), false);
  footer.appendChild(okay);

  content.appendChild(footer);
  dialog.set_content(content);

  var promise = dialog.show_modal();
  if (reject_if_cancel) return promise;

  return promise.catch(function() {
    return false;
  });
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

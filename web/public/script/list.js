privcert.List = function() {
  var list = document.getElementById('list');
  var error = document.getElementById('error');
  var view = document.getElementById('view');
  if (!list || !error || !view) return;

  var type = list.dataset.type;
  if (!type) return;

  this.type = type;

  this.list = list;
  this.error = error;
  this.view = view;
  this.edit = document.getElementById('edit');

  var sw = document.getElementById('switch');
  var open = document.getElementById('open');
  var close = document.getElementById('close');
  var form = document.getElementById('create');
  if (sw && open && close && form) {
    this.sw = sw;
    this.form = form;
    open.addEventListener('click', this.open_.bind(this), false);
    close.addEventListener('click', this.close_.bind(this), false);

    this.csrf_token = form.dataset.csrftoken;
    form.addEventListener('submit', this.create_.bind(this), false);
  }

  this.read_();
}

privcert.List.prototype.open_ = function(e) {
  e.stopPropagation();
  this.sw.checked = true;
}

privcert.List.prototype.close_ = function(e) {
  e.preventDefault();
  this.form.reset();
  this.sw.checked = false;
}

privcert.List.prototype.create_ = function(e) {
  e.preventDefault();

  var elems = this.form.querySelectorAll('input');
  var param = Array.prototype.reduce.call(elems, function(param, elem) {
    var val = elem.value;
    if (elem.type == 'password') {
      param[elem.name] = elem.value;
    } else {
      param[elem.name] = elem.value.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    return param;
  }, {
    mode: 'create'
  });

  var data = this.error.querySelector('data[value="create"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Create failed.';
  }

  this.clear_error_();

  var url = './' + this.type;
  privcert.Util.post_json(url, param, this.csrf_token)
      .done(this.show_.bind(this, error_msg))
      .fail(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.read_ = function() {
  var data = this.error.querySelector('data[value="read"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Read failed.';
  }

  var url = './' + this.type + '/list.json';
  privcert.Util.get_json(url)
      .done(this.show_.bind(this, error_msg))
      .fail(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.update_ = function(name, e) {
  e.preventDefault();
}

privcert.List.prototype.delete_ = function(name, confirm_msg, warn_msg, e) {
  e.preventDefault();

  if (!confirm(confirm_msg + '\n' + warn_msg)) return;

  var param = {
    mode: 'delete',
    name: name
  };

  var data = this.error.querySelector('data[value="delete"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Delete failed.';
  }

  this.clear_error_();

  var url = './' + this.type;
  privcert.Util.post_json(url, param, this.csrf_token)
      .done(this.show_.bind(this, error_msg))
      .fail(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.show_ = function(error_msg, res) {
  if (res.error) {
    this.error_(error_msg, res.detail);
    return;
  }

  this.form.reset();
  this.sw.checked = false;
  this.list.innerHTML = '';
  res.detail.forEach(function(entry) {
    var elem = document.createElement('div');
    elem.className = 'list-entry';

    Array.prototype.forEach.call(this.view.children, function(spec) {
      var col = document.createElement('span');
      col.className = spec.dataset.klass;

      if (spec.dataset.key) {
        col.appendChild(document.createTextNode(entry[spec.dataset.key]));
      } else if (spec.dataset.value) {
        col.appendChild(document.createTextNode(spec.dataset.value));
      } else if (spec.dataset.klass == 'col-ui') {
        Array.prototype.forEach.call(spec.children, function(data) {
          var link = document.createElement('a');
          link.title = data.firstChild.nodeValue;
          switch (data.value) {
          case 'link':
            link.href = './' + this.type + '/' + entry[data.dataset.key];
            link.dataset.icon = 'link';
            break;
          case 'update':
            link.href = '.';
            link.dataset.icon = 'edit';
            link.addEventListener(
                'click', this.update_.bind(this, entry[data.dataset.key]), false
            );
            break;
          case 'delete':
            link.href = '.';
            link.dataset.icon = 'delete';
            if (entry.deletable) {
              link.addEventListener(
                  'click',
                  this.delete_.bind(
                      this, entry[data.dataset.key],
                      data.dataset.confirm, data.dataset.warn
                  ),
                  false
              );
            } else {
              link.className = 'disabled';
            }
            break;
          }
          col.appendChild(link);
        }.bind(this));
      }

      elem.appendChild(col);
    }.bind(this));

    this.list.appendChild(elem);
  }.bind(this));
}

privcert.List.prototype.error_ = function(error_msg, err_detail) {
  if (!err_detail) err_detail = 'access error';
  var msg = error_msg.replace('%s', _(err_detail));
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(msg));
  this.error.appendChild(p);
}

privcert.List.prototype.clear_error_ = function() {
  Array.prototype.forEach.call(this.error.children, function(elem) {
    if (elem.tagName != 'DATA') this.error.removeChild(elem);
  }.bind(this));
}

privcert.Util.ready(function() {
  return {
    list: new privcert.List()
  };
});

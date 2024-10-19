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

  var sw = document.getElementById('switch');
  var open = document.getElementById('open');
  var close = document.getElementById('close');
  var form = document.getElementById('create');
  if (sw && open && close && form) {
    var edit = document.getElementById('edit');
    if (edit) {
      this.edit = {
        template: edit,
        target: null,
        form: null
      };
    }
    this.create = {
      sw: sw,
      form: form
    };

    this.csrf_token = form.dataset.csrftoken;

    open.addEventListener(
        'click',
        function(e) {
          e.stopPropagation();
          if (this.edit && this.edit.form) {
            this.edit.target.style.display = '';
            this.edit.target = null;
            this.list.removeChild(this.edit.form);
            this.edit.form = null;
          }
          sw.checked = true;
        }.bind(this),
        false
    );
    close.addEventListener(
        'click',
        function(e) {
          e.preventDefault();
          form.reset();
          sw.checked = false;
        },
        false
    );
    form.addEventListener('submit', this.create_.bind(this), false);
  }

  this.busy = new privcert.Util.Busy();

  this.read_();
}

privcert.List.prototype.create_ = function(e) {
  e.preventDefault();

  var elems = this.create.form.querySelectorAll('input');
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
  this.busy.show();

  var url = './' + this.type;
  privcert.Util.post_json(url, param, this.csrf_token)
      .finally(this.busy.clear.bind(this.busy))
      .then(this.show_.bind(this, error_msg))
      .catch(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.read_ = function() {
  var data = this.error.querySelector('data[value="read"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Read failed.';
  }

  this.busy.show();

  var url = './' + this.type + '/list.json';
  privcert.Util.get_json(url)
      .finally(this.busy.clear.bind(this.busy))
      .then(this.show_.bind(this, error_msg))
      .catch(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.update_ = function(name, e) {
  e.preventDefault();

  this.create.form.reset();
  this.create.sw.checked = false;
  if (this.edit.form) {
    this.edit.target.style.display = '';
    this.edit.target = null;
    this.list.removeChild(this.edit.form);
    this.edit.form = null;
  }

  for (var target = e.target.parentElement;
       target.className != 'list-entry'; target = target.parentElement) {
    if (!target) return;
  }
  this.edit.target = target;

  var form = document.createElement('form');
  form.className = 'list-entry';
  this.edit.form = form;

  var fixed_param = {};

  var template = this.edit.template;
  Array.prototype.forEach.call(template.children, function(spec, idx) {
    var col = document.createElement('span');
    col.className = spec.dataset.klass;

    if (!spec.children.length) {
      var text = target.children[idx].firstChild;
      if (text) {
        col.appendChild(text.cloneNode());
        if (spec.dataset.name) {
          fixed_param[spec.dataset.name] =
              text.nodeValue.replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }
    } else {
      var elem = spec.firstElementChild.cloneNode(true);
      if (spec.dataset.klass == 'col-ui') {
        elem.addEventListener(
            'click',
            function(e) {
              e.preventDefault();
              target.style.display = '';
              this.edit.target = null;
              this.list.removeChild(form);
              this.edit.form = null;
            }.bind(this),
            false
        );
      }
      col.appendChild(elem);
    }
    form.appendChild(col);
  }.bind(this));

  form.addEventListener(
      'submit',
      function(e) {
        e.preventDefault();

        var elems = form.querySelectorAll('input');
        var param = Array.prototype.reduce.call(elems, function(param, elem) {
          var val = elem.value;
          if (elem.type == 'password') {
            param[elem.name] = elem.value;
          } else {
            param[elem.name] =
                elem.value.replace(/^\s+/, '').replace(/\s+$/, '');
          }
          return param;
        }, Object.assign({
          mode: 'update'
        }, fixed_param));

        var data = this.error.querySelector('data[value="update"]');
        if (data) {
          var error_msg = data.firstChild.nodeValue;
        } else {
          var error_msg = 'Update failed.';
        }

        this.clear_error_();
        this.busy.show();

        var url = this.type;
        privcert.Util.post_json(url, param, this.csrf_token)
            .finally(this.busy.clear.bind(this.busy))
            .then(this.show_.bind(this, error_msg))
            .catch(this.error_.bind(this, error_msg, null));

        target.style.display = '';
        this.edit.target = null;
        this.list.removeChild(form);
        this.edit.form = null;
      }.bind(this),
      false
  );

  target.style.display = 'none';
  this.list.insertBefore(form, target.nextSibling);
}

privcert.List.prototype.delete_ = function(name, messages, okay, cancel, e) {
  e.preventDefault();

  privcert.Util.confirm(messages, okay, cancel, true).then(function() {
    this.create.form.reset();
    this.create.sw.checked = false;
    if (this.edit && this.edit.form) {
      this.edit.target.style.display = '';
      this.edit.target = null;
      this.list.removeChild(this.edit.form);
      this.edit.form = null;
    }

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
    this.busy.show();

    var url = './' + this.type;
    privcert.Util.post_json(url, param, this.csrf_token)
        .finally(this.busy.clear.bind(this.busy))
        .then(this.show_.bind(this, error_msg))
        .catch(this.error_.bind(this, error_msg, null));
  }).catch(privcert.Util.ignore_error);
}

privcert.List.prototype.show_ = function(error_msg, res) {
  if (res.error) {
    this.error_(error_msg, res.detail);
    return;
  }

  if (this.create) {
    this.create.form.reset();
    this.create.sw.checked = false;
  }
  while (this.list.firstChild) {
    this.list.removeChild(this.list.firstChild);
  }
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
          switch (data.value) {
          case 'link':
            link.href = './' + this.type + '/' + entry[data.dataset.key];
            link.title = data.firstChild.nodeValue;
            link.dataset.icon = 'link';
            break;
          case 'update':
            if (!this.edit) return;
            if (entry.mine) {
              link.className = 'disabled';
              link.href = '.';
              link.tabIndex = '-1';
            } else {
              link.href = '.';
              link.title = data.firstChild.nodeValue;
              link.addEventListener(
                  'click',
                  this.update_.bind(this, entry[data.dataset.key]),
                  false
              );
            }
            link.dataset.icon = 'edit';
            break;
          case 'delete':
            if (entry.mine) {
              link.className = 'disabled';
              link.href = '.';
              link.tabIndex = '-1';
            } else {
              link.href = '.';
              link.title = data.firstChild.nodeValue;
              link.addEventListener(
                  'click',
                  this.delete_.bind(
                      this, entry[data.dataset.key],
                      [data.dataset.confirm, data.dataset.warn],
                      data.dataset.okay, data.dataset.cancel
                  ),
                  false
              );
            }
            link.dataset.icon = 'delete';
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

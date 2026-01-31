privcert.List = function() {
  var list = document.getElementById('list');
  var error = document.getElementById('error');
  var entry = document.getElementById('entry');
  if (!list || !error || !entry) return;

  var type = list.dataset.type;
  if (!type) return;

  this.type = type;

  this.list = {
    type: type,
    container: list,
    error: error,
    template: entry
  };

  var visible = document.getElementById('visible');
  var open = document.getElementById('open');
  var close = document.getElementById('close');
  var create = document.getElementById('create');
  if (visible && open && close && create) {
    var edit = document.getElementById('edit');
    if (edit) {
      this.edit = {
        template: edit,
        target: null,
        form: null
      };
    }

    this.create = {
      visible: visible,
      form: create
    };

    this.csrf_token = create.dataset.csrftoken;

    open.addEventListener('click', this.open_create_form_.bind(this), false);
    close.addEventListener('click', this.cancel_create_.bind(this), false);
    create.addEventListener('submit', this.create_entry_.bind(this), false);
  }

  this.data = null;

  this.busy = new privcert.Util.Busy();

  var data = this.list.error.querySelector('data[value="read"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Read failed.';
  }

  this.busy.show();

  var url = './' + this.type + '/list.json';
  privcert.Util.get_json(url)
      .finally(this.busy.clear.bind(this.busy))
      .then(this.show_list_.bind(this))
      .catch(this.show_error_.bind(this, error_msg));
}

privcert.List.prototype.show_list_ = function(res) {
  this.data = res;

  this.close_create_form_();
  this.close_update_form_();

  while (this.list.container.firstChild) {
    this.list.container.removeChild(this.list.container.firstChild);
  }

  this.data.list.forEach(function(entry) {
    var elem = document.createElement('div');
    elem.className = 'list-entry';

    Array.prototype.forEach.call(this.list.template.children, function(spec) {
      var col = document.createElement('span');
      col.className = spec.className;

      if (spec.dataset.key) {
        col.appendChild(document.createTextNode(entry[spec.dataset.key]));
      } else if (spec.dataset.value) {
        col.appendChild(document.createTextNode(spec.dataset.value));
      } else if (spec.className == 'col-ui') {
        Array.prototype.forEach.call(spec.children, function(data) {
          var link = document.createElement('a');
          switch (data.value) {
          case 'link':
            link.href = './' + this.type + '/' + entry.key;
            link.title = data.firstChild.nodeValue;
            link.dataset.icon = 'link';
            break;
          case 'update':
            if (!this.edit) return;
            if (entry.updatable == null || entry.updatable) {
              link.href = '.';
              link.title = data.firstChild.nodeValue;
              link.addEventListener(
                  'click', this.make_update_form_.bind(this, entry.id), false
              );
            } else {
              link.className = 'disabled';
              link.href = '.';
              link.tabIndex = '-1';
            }
            link.dataset.icon = 'edit';
            break;
          case 'delete':
            if (entry.deletable == null || entry.deletable) {
              link.href = '.';
              link.title = data.firstChild.nodeValue;
              link.addEventListener(
                  'click',
                  this.delete_entry_.bind(
                      this, entry.id,
                      [data.dataset.confirm, data.dataset.warn],
                      data.dataset.okay, data.dataset.cancel
                  ),
                  false
              );
            } else {
              link.className = 'disabled';
              link.href = '.';
              link.tabIndex = '-1';
            }
            link.dataset.icon = 'delete';
            break;
          }
          col.appendChild(link);
        }.bind(this));
      }

      elem.appendChild(col);
    }.bind(this));

    this.list.container.appendChild(elem);
  }.bind(this));
}

privcert.List.prototype.show_error_ = function(error_msg, err_detail) {
  if (!err_detail) err_detail = 'access error';

  this.close_update_form_();

  var msg = error_msg.replace('%s', _(err_detail));
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(msg));
  this.list.error.appendChild(p);
}

privcert.List.prototype.clear_error_ = function() {
  Array.prototype.forEach.call(this.list.error.children, function(elem) {
    if (elem.tagName != 'DATA') this.list.error.removeChild(elem);
  }.bind(this));
}

privcert.List.prototype.open_create_form_ = function(e) {
  e.stopPropagation();

  this.close_update_form_();
  this.create.visible.checked = true;
  this.create.visible.parentElement.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

privcert.List.prototype.cancel_create_ = function(e) {
  e.preventDefault();

  this.close_create_form_();
}

privcert.List.prototype.close_create_form_ = function() {
  if (!this.create) return;

  this.create.form.reset();
  this.create.visible.checked = false;
}

privcert.List.prototype.create_entry_ = function(e) {
  e.preventDefault();

  this.clear_error_();
  this.busy.show();

  var url = './' + this.type;

  var elems = this.create.form.querySelectorAll('input');
  var param = Array.prototype.reduce.call(elems, function(param, elem) {
    var val = elem.value;
    if (elem.type == 'password') {
      param[elem.name] = elem.value;
    } else {
      param[elem.name] = elem.value.trim();
    }
    return param;
  }, {});

  var data = this.list.error.querySelector('data[value="create"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Create failed.';
  }

  privcert.Util.post_json(url, param, this.csrf_token)
      .finally(this.busy.clear.bind(this.busy))
      .then(this.show_list_.bind(this))
      .catch(this.show_error_.bind(this, error_msg));
}

privcert.List.prototype.make_update_form_ = function(id, e) {
  e.preventDefault();

  this.close_create_form_();
  this.close_update_form_();

  for (var target = e.target.parentElement;
       target.className != 'list-entry'; target = target.parentElement) {
    if (!target) return;
  }
  this.edit.target = target;

  var form = document.createElement('form');
  form.className = 'list-entry';
  this.edit.form = form;

  var template = this.edit.template;
  Array.prototype.forEach.call(template.children, function(spec, idx) {
    var col = document.createElement('span');
    col.className = spec.className;

    var textnode = target.children[idx];
    if (!spec.childElementCount) {
      if (textnode.firstChild) {
        col.appendChild(textnode.firstChild.cloneNode());
      }
    } else {
      var elem = spec.firstElementChild.cloneNode(true);
      if (spec.className == 'col-ui') {
        elem.addEventListener('click', this.cancel_update_.bind(this), false);
      }
      col.appendChild(elem);
    }
    form.appendChild(col);
  }.bind(this));

  form.addEventListener('submit', this.update_entry_.bind(this, id), false);

  target.style.display = 'none';
  this.list.container.insertBefore(form, target.nextSibling);
}

privcert.List.prototype.cancel_update_ = function(e) {
  e.preventDefault();

  this.close_update_form_();
}

privcert.List.prototype.close_update_form_ = function() {
  if (!this.edit || !this.edit.form) return;

  this.edit.target.style.display = '';
  this.edit.target = null;
  this.list.container.removeChild(this.edit.form);
  this.edit.form = null;
}

privcert.List.prototype.update_entry_ = function(id, e) {
  e.preventDefault();

  this.clear_error_();
  this.busy.show();

  var url = './' + this.type + '/' + id;

  var elems = this.edit.form.querySelectorAll('input');
  var param = Array.prototype.reduce.call(elems, function(param, elem) {
    var val = elem.value;
    if (elem.type == 'password') {
      param[elem.name] = elem.value;
    } else {
      param[elem.name] = elem.value.trim();
    }
    return param;
  }, {});

  var data = this.list.error.querySelector('data[value="update"]');
  if (data) {
    var error_msg = data.firstChild.nodeValue;
  } else {
    var error_msg = 'Update failed.';
  }

  privcert.Util.post_json(url, param, this.csrf_token)
      .finally(this.busy.clear.bind(this.busy))
      .then(this.show_list_.bind(this))
      .catch(this.show_error_.bind(this, error_msg));
}

privcert.List.prototype.delete_entry_ = function(id, msgs, okay, cancel, e) {
  e.preventDefault();

  privcert.Util.confirm(msgs, okay, cancel, true).then(function() {
    this.close_create_form_();
    this.close_update_form_();

    this.clear_error_();
    this.busy.show();

    var url = './' + this.type + '/' + id;
    var param = {
      mode: 'delete'
    };

    var data = this.list.error.querySelector('data[value="delete"]');
    if (data) {
      var error_msg = data.firstChild.nodeValue;
    } else {
      var error_msg = 'Delete failed.';
    }

    privcert.Util.post_json(url, param, this.csrf_token)
        .finally(this.busy.clear.bind(this.busy))
        .then(this.show_list_.bind(this))
        .catch(this.show_error_.bind(this, error_msg));
  }.bind(this)).catch(privcert.Util.ignore_error);
}

privcert.Util.ready(function() {
  return {
    list: new privcert.List()
  };
});

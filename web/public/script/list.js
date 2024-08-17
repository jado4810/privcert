privcert.List = function() {
  var list = document.getElementById('user-list');
  var error = document.getElementById('user-list-error');
  if (!list || !error) return;

  this.list = list;
  this.error = error;

  var sw = document.getElementById('user-list-switch');
  var open = document.getElementById('user-list-open');
  var close = document.getElementById('user-list-close');
  var form = document.getElementById('user-list-create');
  if (sw && open && close && form) {
    this.sw = sw;
    this.form = form;
    open.addEventListener('click', this.open_.bind(this), false);
    close.addEventListener('click', this.close_.bind(this), false);
    form.addEventListener('submit', this.create_.bind(this), false);
  }

  this.get_();
}

privcert.List.prototype.open_ = function(e) {
  e.stopPropagation();
  this.sw.checked = true;
}

privcert.List.prototype.close_ = function(e) {
  e.stopPropagation();
  this.form.reset();
  this.sw.checked = false;
}

privcert.List.prototype.get_ = function() {
  var error_msg = 'Loading list failed(%s).';
  privcert.Util.get_json('./cert/list.json')
      .done(this.show_.bind(this, error_msg))
      .fail(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.create_ = function(e) {
  e.preventDefault();

  var param = ['name', 'cname', 'mail'].reduce(function(v, key) {
    v[key] = this.form[key].value.replace(/^\s+/, '').replace(/\s+$/, '');
    return v;
  }.bind(this), {});

  if (!param.name) return;

  this.error.innerHTML = '';
  var csrf_token = this.form.dataset.csrftoken;
  var error_msg = 'Creating cert failed(%s).';
  privcert.Util.post_json('./cert', param, csrf_token)
      .done(this.show_.bind(this, error_msg))
      .fail(this.error_.bind(this, error_msg, null));
}

privcert.List.prototype.revoke_ = function(name, e) {
  e.preventDefault();

  var param = {
    mode: 'revoke',
    name: name
  };

  this.error.innerHTML = '';
  var csrf_token = this.form.dataset.csrftoken;
  var error_msg = 'Revoking cert failed(%s).';
  privcert.Util.post_json('./cert', param, csrf_token)
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
    elem.className = 'user-list-entry';

    ['name', 'cname', 'mail', 'expire'].forEach(function(key) {
      var col = document.createElement('span');
      col.className = key;
      col.appendChild(document.createTextNode(entry[key]));
      elem.appendChild(col);
    });

    var ui = document.createElement('span');
    ui.className = 'ui';

    var dllink = document.createElement('a');
    dllink.href = './cert/' + entry.key;
    dllink.title = _('Download URL');
    dllink.dataset.icon = 'link';
    ui.appendChild(dllink);

    var dellink = document.createElement('a');
    dellink.href = '.';
    dellink.title = _('Revoke Cert');
    dellink.dataset.icon = 'delete';
    dellink.addEventListener(
        'click', this.revoke_.bind(this, entry.name), false
    );
    ui.appendChild(dellink);

    elem.appendChild(ui);
    this.list.appendChild(elem);
  }.bind(this));
}

privcert.List.prototype.error_ = function(error_msg, err_detail) {
  if (!err_detail) err_detail = 'access error';
  var msg = _(error_msg).replace('%s', _(err_detail));
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(msg));
  this.error.appendChild(p);
}

privcert.Util.ready(function() {
  return {
    list: new privcert.List()
  };
});

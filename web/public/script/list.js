privcert.List = function() {
  var list = document.getElementById('user-list');
  if (!list) return;

  this.list = list;
  this.show_();
}

privcert.List.prototype.show_ = function() {
  var list = this.list;

  var url = './list.json';
  privcert.Util.get_json(url).anyway(function() {
    list.innerHTML = '';
  }).done(function(res) {
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
      list.appendChild(elem);
    }.bind(this));
  }.bind(this)).fail(function() {
    var p = document.createElement('p');
    p.appendChild(document.createTextNode(_('Loading list failed.')));
    list.appendChild(p);
  });
}

privcert.List.prototype.revoke_ = function(name, e) {
  e.preventDefault();
}

privcert.Util.ready(function() {
  return {
    list: new privcert.List()
  };
});

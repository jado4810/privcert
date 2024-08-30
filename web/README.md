PrivCert web interface
======================

Requirement
-----------

### Run with Docker (Recommended)

* Docker (CE 19.03 or later) with compose plugin
* Web server (such as apache) as reverse proxy

### Run standalone

* Ruby (2.6 or later)
* Web server (such as apache) to drive rack

Register PrivCert as a service
------------------------------

### For systemd compatible system

A socket service file (`privcert.socket`) and a service template file
(`privcert@.service`) are available under `sample/systemd`.

To change listening port from default of 26310/TCP, edit `ListenStream`
definition in `privcert.socket` file:

```ini
[Socket]
ListenStream = 127.0.0.1:26310
```

For security reasons, strongly recommended not to change listening address from
default of 127.0.0.1.

If `PREFIX` or `BINDIR` changed while installing privcert, edit `ExecStart`
definition in `privcert@.service` file:

```ini
[Service]
ExecStart = /usr/local/sbin/privcert server
```

Copy these files under `/etc/systemd/system`, and activate the socket service:

```console
$ sudo cp sample/systemd/privcert.socket sample/systemd/privcert@.service /etc/systemd/system
$ sudo systemctl daemon-reload
$ sudo systemctl enable privcert.socket
$ sudo systemctl start privcert.socket
```

### For inetd compatible system

Configure inetd to run `/usr/local/sbin/privcert server`.

For the systems with xinetd and `/etc/xinetd.d`, a service config file
(`privcert`) under `sample/xinetd` is available; copy it and restart xinetd.

Recommend to restrict source address to 127.0.0.1 with tcpwrapper or firewalld;
for tcpwrapper, just add below to `/etc/hosts.allow`:

```hosts
privcert:127.0.0.1 :allow
```

Installation
------------

### Run with Docker

First, build an container image on this directory and load it:

```console
$ cd web
$ docker build -t privcert .
$ docker save privcert | ssh webapp-server docker load
```

Or just load the provided container image:

```console
$ xzcat privcert-latest.tar.xz | docker load
```

Edit `docker-compose.yml` under `sample/docker`.

Mostly editing points are below:

* If changed `CA_ROOT`, modify auth database path in `volumes`
* If changed the local path part of the url from `/privcert/`, modify `URL_PATH`
* If changed the port of the privcert server, modify `SERVER_PORT`
* Set the password for the privcert server to `SERVER_PASSWD`

Strongly recommended to make new account for web application process, and set
its uid and gid on `APP_UID` and `APP_GID`.

```console
$ sudo useradd -UMd /etc/privcert privcert
$ id privcert
uid=501(privcert) gid=501(privcert) groups=501(privcert)
```

Run container on the directory where `docker-compose.yml` exists:

```console
$ cd path/to/dockerComposeYml
$ docker compose up -d
```

Initialize an auth database on the first run:

```console
$ docker compose exec app rake db:create
$ docker compose exec app rake db:migrate
$ docker compose exec app rake db:seed
$ sudo chown privcert:privcert /etc/privcert/web/auth.db
$ sudo chmod 700 /etc/privcert/web
$ sudo chmod 600 /etc/privcert/web/auth.db
```

Put reverse proxy settings into `ssl.conf` (for apache):

```apache
SSLProxyEngine on
RequestHeader set X-Forwarded-Proto 'https'

ProxyPass /privcert/ http://localhost:31080/
```

> [!NOTE]
> `SSLProxyEngine` and `RequestHeader` might already be set for other apps.

And add the condition to require a client cert by adding below to `SSLRequire`
in `ssl.conf`:

```apache
<If "%{REQUEST_URI} !~ m!/privcert/cert/.*$!">
  SSLRequire %{SSL_CLIENT_S_DN_O} eq "Your Company"
</If>
```

Set `/privcert/` part in `If` directive to the local path part of `ProxyPass`,
which is to be used as the URL to access this app.
This condition is necessary to allow download for the user without the cert
installed.

And activate it:

```console
$ sudo apachectl restart
```

### Run standalone

First, install Ruby environment using rbenv or from the official package
repository of the target OS.

For example, using rbenv with recent RHEL or compatible distros:

```console
$ sudo su -
# dnf install -y openssl-devel readline-devel zlib-devel
# dnf install -y sqlite-devel
# dnf install -y curl-devel httpd-devel apr-devel apr-util-devel
# cd /usr/local
# git clone git://github.com/sstephenson/rbenv.git rbenv
# git clone git://github.com/sstephenson/ruby-build.git rbenv/plugins/ruby-build
# vi /etc/profile.d/rbenv.sh
export RBENV_ROOT=/usr/local/rbenv
export PATH=$RBENV_ROOT/bin:$PATH
eval "$(rbenv init --no-rehash -)"
# source /etc/profile.d/rbenv.sh
# ebenv install --list
# rbenv insatll 3.2.3
# rbenv global 3.2.3
# gem install bundler --no-document
# gem install passenger --no-document
```

Or using RHEL or compatible appstream packages:

```console
$ sudo su -
# dnf module reset ruby
# dnf module enable ruby:3.2
# dnf module -y install ruby:3.2
```

Next, install the passenger module to apache:

```console
# passenger-install-apache2-module
```

Just hit <kbd>Enter</kbd>s to any questions.

Will displayed a piece to be added to apache configuration, copy them to
`/etc/httpd/conf.d/passenger.conf` and edit below:

* Line 1, 3 and 4 - just copy the content
* Line 5-8 - add `PassengerEnabled` line and below:

```apache
LoadModule passenger_module /usr/local/rbenv/…/buildout/apache2/mod_passenger.so
<IfModule mod_passenger.c>
  PassengerRoot /usr/local/rbenv/…/gems/3.2.0/gems/passenger-6.0.23
  PassengerDefaultRuby /usr/local/rbenv/versions/3.2.2/bin/ruby
  PassengerEnabled off
  PassengerUserSwitching off
  PassengerDefaultUser apache
  PassengerDisableAnonymousTelemetry on
</IfModule>
```

Then place whole contents under this directory into an appropriate path:

```console
# cp -r web /usr/local/privcert-web
# cd /usr/local/privcert-web
```

Edit `.bundle/config` and change `production` to `development` in
`BUNDLE_WITHOUT`:

```yaml
BUNDLE_WITHOUT: "development:test"
```

Install bundled packages with `bundle install`:

```console
# bundle install
```

Change configuration in `config/settings.yml` and `config/database.yml`.

Initialize an auth database on the first run:

```console
# bundle exec rake db:create APP_ENV=production
# bundle exec rake db:migrate APP_ENV=production
# bundle exec rake db:seed APP_ENV=production
# chown apache:apache /etc/privcert/web/auth.db
# chmod 700 /etc/privcert/web
# chmod 600 /etc/privcert/web/auth.db
```

Put below into `ssl.conf`:

```apache
Alias /privcert /usr/local/privcert-web/public
<Location /privcert>
  PassengerEnabled on
  PassengerBaseURI /privcert
  PassengerAppRoot /usr/local/privcert-web
</Location>

<Directory /usr/local/privcert-web/public>
  AllowOverride all
  Options -MultiViews
  Require all granted
</Directory>
```

And add the condition to require a client cert by adding below to `SSLRequire`
in `ssl.conf`:

```apache
<If "%{REQUEST_URI} !~ m!/privcert/cert/.*$!">
  SSLRequire %{SSL_CLIENT_S_DN_O} eq "Your Company"
</If>
```

Set `/privcert/` part in `If` directive to the local path part of `Alias`,
which is to be used as the URL to access this app.
This condition is necessary to allow download for the user without the cert
installed.

And activate it:

```console
# apachectl restart
```

Default account
---------------

`rake db:seed` introduces a default account "`admin`" with password
"`PrivCertAdmin`".
Strongly recommended changing it at first.

Managing certs
--------------

Valid user certs is listed on main panel, and will be able to download from
"link" icon: send the url to the user to allow access.

The user can download the cert file from that url, and import it with
double-clicking or tapping it.
The fixed password is also necessary, so remember to announce it with the url.

Making and revoking certs are available from this panel.

Two other panels are available to manage account and to change password.

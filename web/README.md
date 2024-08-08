PrivCert web interface
======================

Requirement
-----------

### Run with Docker

* Docker
* Docker compose plugin
* Web server (such as apache) as reverse proxy

### Run standalone

* Ruby (2.6 or later)
* Web server (such as apache) to drive rack

Register PrivCert as a service
------------------------------

### For systemd compatible system

A socket service file (`privcert.socket`) and a service template file
(`privcert@.service`) are available under `sample/systemd/`.

To change listening port from default of 26310/TCP, edit `ListenStream`
definition in `privcert.socket` file:

```ini:privcert.socket
[Socket]
ListenStream = 127.0.0.1:26310
```

For security reasons, strongly recommended not to change listening address from
default of 127.0.0.1.

If `PREFIX` or `BINDIR` changed while installing privcert, edit `ExecStart`
definition in `privcert@.service` file:

```ini:privcert@.service
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
(`privcert`) under `sample/xinetd/` is available; copy it and restart xinetd.

Recommend to restrict source address to 127.0.0.1 with tcpwrapper or firewalld;
just like below for tcpwrapper:

```hosts:hosts.allow
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

Or just load the privided container image:

```console
$ xzcat privcert-latest.tar.xz | docker load
```

Edit `docker-compose.yml` under `sample/docker`.

```yaml:docker-compose.yml
```

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
$ cd path/to/docker-compose
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

```apache:ssl.conf
SSLProxyEngine on
RequestHeader set X-Forwarded-Proto 'https'

ProxyPass /privcert/ http://localhost:31080/
```

> [!NOTE]
> `SSLProxyEngine` and `RequestHeader` might already be set for other apps.

And activate it:

```console
$ sudo apachectl restart
```

### Run standalone

to be written...

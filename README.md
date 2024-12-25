PrivCert - Private CA for management of user certs
==================================================

[![Ruby](https://img.shields.io/github/languages/top/jado4810/privcert?logo=ruby&logoColor=fff&label=Ruby&labelColor=cc342d&color=666)](https://github.com/jado4810/privcert/search?l=Ruby)
[![Shell](https://img.shields.io/badge/Shell-4eaa25?logo=gnu-bash&logoColor=fff)](https://github.com/jado4810/privcert/search?l=Shell)
[![Sinatra](https://img.shields.io/badge/-Sinatra-000?logo=ruby-sinatra&logoColor=fff)](https://github.com/sinatra)
[![Docker](https://img.shields.io/badge/-Docker-2496ed?logo=docker&logoColor=fff)](https://github.com/docker)
[![MIT License](https://img.shields.io/github/license/jado4810/privcert?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI2ZmZiI%2BPHBhdGggZD0iTTguNzUuNzVWMmguOTg1Yy4zMDQgMCAuNjAzLjA4Ljg2Ny4yMzFsMS4yOS43MzZjLjAzOC4wMjIuMDguMDMzLjEyNC4wMzNoMi4yMzRhLjc1Ljc1IDAgMCAxIDAgMS41aC0uNDI3bDIuMTExIDQuNjkyYS43NS43NSAwIDAgMS0uMTU0LjgzOGwtLjUzLS41My41MjkuNTMxLS4wMDEuMDAyLS4wMDIuMDAyLS4wMDYuMDA2LS4wMDYuMDA1LS4wMS4wMS0uMDQ1LjA0Yy0uMjEuMTc2LS40NDEuMzI3LS42ODYuNDVDMTQuNTU2IDEwLjc4IDEzLjg4IDExIDEzIDExYTQuNDk4IDQuNDk4IDAgMCAxLTIuMDIzLS40NTQgMy41NDQgMy41NDQgMCAwIDEtLjY4Ni0uNDVsLS4wNDUtLjA0LS4wMTYtLjAxNS0uMDA2LS4wMDYtLjAwNC0uMDA0di0uMDAxYS43NS43NSAwIDAgMS0uMTU0LS44MzhMMTIuMTc4IDQuNWgtLjE2MmMtLjMwNSAwLS42MDQtLjA3OS0uODY4LS4yMzFsLTEuMjktLjczNmEuMjQ1LjI0NSAwIDAgMC0uMTI0LS4wMzNIOC43NVYxM2gyLjVhLjc1Ljc1IDAgMCAxIDAgMS41aC02LjVhLjc1Ljc1IDAgMCAxIDAtMS41aDIuNVYzLjVoLS45ODRhLjI0NS4yNDUgMCAwIDAtLjEyNC4wMzNsLTEuMjg5LjczN2MtLjI2NS4xNS0uNTY0LjIzLS44NjkuMjNoLS4xNjJsMi4xMTIgNC42OTJhLjc1Ljc1IDAgMCAxLS4xNTQuODM4bC0uNTMtLjUzLjUyOS41MzEtLjAwMS4wMDItLjAwMi4wMDItLjAwNi4wMDYtLjAxNi4wMTUtLjA0NS4wNGMtLjIxLjE3Ni0uNDQxLjMyNy0uNjg2LjQ1QzQuNTU2IDEwLjc4IDMuODggMTEgMyAxMWE0LjQ5OCA0LjQ5OCAwIDAgMS0yLjAyMy0uNDU0IDMuNTQ0IDMuNTQ0IDAgMCAxLS42ODYtLjQ1bC0uMDQ1LS4wNC0uMDE2LS4wMTUtLjAwNi0uMDA2LS4wMDQtLjAwNHYtLjAwMWEuNzUuNzUgMCAwIDEtLjE1NC0uODM4TDIuMTc4IDQuNUgxLjc1YS43NS43NSAwIDAgMSAwLTEuNWgyLjIzNGEuMjQ5LjI0OSAwIDAgMCAuMTI1LS4wMzNsMS4yODgtLjczN2MuMjY1LS4xNS41NjQtLjIzLjg2OS0uMjNoLjk4NFYuNzVhLjc1Ljc1IDAgMCAxIDEuNSAwWm0yLjk0NSA4LjQ3N2MuMjg1LjEzNS43MTguMjczIDEuMzA1LjI3M3MxLjAyLS4xMzggMS4zMDUtLjI3M0wxMyA2LjMyN1ptLTEwIDBjLjI4NS4xMzUuNzE4LjI3MyAxLjMwNS4yNzNzMS4wMi0uMTM4IDEuMzA1LS4yNzNMMyA2LjMyN1oiPjwvcGF0aD48L3N2Zz4%3D)](https://github.com/jado4810/privcert/blob/main/LICENSE.txt)

EN|[JA](./README-ja.md)

What is this?
-------------

Simple script to manage user certs to be used for client certification on the restricted websites.

It sets up self-signed CA and generates client certs per user.

Requirement
-----------

* OpenSSL
* Web server (such as apache)

Installation
------------

```console
$ make
$ sudo make install
```

Variables available on `make`:

* `CA_ROOT` - where certs are stored at
    * default: `/etc/privcert`
* `OPENSSL` - openssl executable path
    * default: (auto detected)
* `MD5SUM` - md5sum executable path
    * default: (auto detected)
* `BASE64` - base64 executable path
    * default: (auto detected)
* `DN_BASE` - prefix to X.509 DN
    * default: `/C=JP/ST=Tokyo/O=Your Company`
    * requires C, ST and O
    * must omit CN and emailAddress (to be set individually)
* `EXTRACT_PWD` - password to extract user cert on install
    * default: `privcert`
* `CERT_NAME` - default name of user cert
    * default: `PrivCert`
    * recommended to set the site name
* `UPDATE_HOOK` - hook to reconfigure web server
    * default: `apachectl restart` (with auto detected executable path)
* `KEYLEN` - default key length in bits
    * default: `2048`
    * can be overridden by `-l` option
* `EXPIRE` - default certs expiration in days
    * default: `3650`(≒10yr)
    * can be overridden by `-e` option

Variables available on `make install`:

* `PREFIX` - install prefix
    * default: `/usr/local`
* `BINDIR` - where executables are installed at
    * default: `$(PREFIX)/sbin`

Also `DESTDIR`, useful when making packages, available.

Preparation
-----------

First, initialize the environment and generate self-signed cert for local CA:

> [!NOTE]
> On most systems, privcert executable installed in `/usr/local/sbin` is not found under `sudo` due to overridden `$PATH` for security reasons.
> So consider adding `-i` option to bring `$PATH` from root environment.

```console
$ sudo -i privcert init
```

A piece to be set to the ssl configuration will be displayed after initialization.

Then, input password for server mode twice.

> [!NOTE]
> If omit password or failed to set password, retry `init` to initialize password.
>
> Once initialized password, try `sudo -i privcert passwd` to update.

Set displayed piece on the ssl configuration of your web server.
For Apache, append below to the `VirtualHost` directive in `ssl.conf`:

> [!NOTE]
> `ssl.conf` would be found under `/etc/httpd/conf.d` on RHEL or compatible system.
> It might have other location or filename, for example, `default-ssl.conf` under `/etc/apache2/sites-available` on Ubuntu or Debian variants.

```apache
SSLCACertificateFile /etc/privcert/ca/cert.pem
SSLVerifyClient optional
SSLVerifyDepth 10
SSLCARevocationCheck leaf
SSLCARevocationFile /etc/privcert/ca/crl.pem

SSLRequire %{SSL_CLIENT_S_DN_O} eq "Your Company"
```

The value in `SSLRequire` should be changed to O value of DN specified in `DN_BASE`, from the default of "`Your Company`".
Anyway, just copy the displayed piece of the configuration.

> [!NOTE]
> In addition, might already have specified `SSLCertificateFile` and `SSLCertificateKeyFile` to enable SSL with an appropriate server cert.

Update apache configuration to make those valid:

```console
$ sudo apachectl restart
```

Now the site is not accessible until installing the client cert signed by this ca.

Setup web interface (optional)
------------------------------

To use with web interface, register `privcert` as a service and modify some configuration after setup the webapp.

See [web/README.md](./web/README.md) for more details.

User certs management
---------------------

### Make user cert

```console
$ sudo -i privcert make u̲s̲e̲r̲ [c̲n̲] [e̲m̲a̲i̲l̲]
```

To make the site accessible, import the cert file generated at `/etc/privcert/users/u̲s̲e̲r̲.pfx` into the environment of the user.
Ordinary, just double-click or tap that file to import into the system cert store, or, on some environments, might need to import from the cert management menu of the browser.

The fixed password set on `EXTRACT_PWD`, default to be `privcert`, is necessary.

[Web interface](./web/) should be useful to distribute certs.

### Show all user certs

```console
$ sudo -i privcert list
```

It shows only certs just under `/etc/privcert/users`, which should hold only valid ones.

### Revoke user cert

```console
$ sudo -i privcert revoke u̲s̲e̲r̲
```

Revoked cert is added to certificate revocation list (`crl.pem`), so the client with the cert could no longer access.
And the cert is moved to `/etc/privcert/trash`.

ToDo
----

* Server certificate (to use with VPN server)
* Update CA cert (necessary?)

Copyright and License
---------------------

Copyright (c)2024 Shun-ichi TAHARA &lt;jado@flowernet.jp&gt;

Provided under [MIT license](./LICENSE.txt), with the exception of [third-party/getoptions](./third-party/getoptions/) directory, which is appropriated from [ko1nksm/getoptions](https://github.com/ko1nksm/getoptions) of [CC0](./third-party/getoptions/LICENSE).

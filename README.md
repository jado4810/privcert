PrivCert - Private CA for management of user certs
==================================================

[![GitHub top language](https://img.shields.io/github/languages/top/jado4810/privcert?logo=shell&logoColor=white&labelColor=%23ffd500&color=%23666)](https://github.com/jado4810/privcert/search?l=Shell)
[![Ruby](https://img.shields.io/badge/-Ruby-CC342D?logo=Ruby&logoColor=fff)](https://github.com/ruby)
[![Sinatra](https://img.shields.io/badge/-Sinatra-000.svg?logo=Ruby%20Sinatra&logoColor=fff)](https://github.com/sinatra)
[![Docker](https://img.shields.io/badge/-Docker-2496ed.svg?logo=Docker&logoColor=fff)](https://github.com/docker)
[![License](https://img.shields.io/github/license/jado4810/privcert.svg)](https://github.com/jado4810/privcert/blob/main/LICENSE.txt)

What is this?
-------------

Simple script to manage user certs to be used for client certification on the
restricted websites.

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
* `UPDATE_HOOK` - hook to reconfigure web server
    * default: `apachectl restart` (with auto detected executable path)
* `KEYLEN` - default key length in bits
    * default: `2048`
    * can be overridden by `-l` option
* `EXPIRE` - default certs expiration in days
    * default: `3650`(≒10yr)
    * can be overridden by `-e` option

Variables available on `make install`:

* `PREFIX` - install prefix, default is `/usr/local`.
* `BINDIR` - where executables are installed at, default is `$(PREFIX)/sbin`.

Also `DESTDIR`, useful when making packages, available.

Register `privcert` as a service to use from web interface, see
[web/README.md](./web/README.md) for more details.

Preparation
-----------

First, init the environment and generate self-signed cert for local CA.

> [!NOTE]
> On most systems, privcert executable installed in `/usr/local/sbin` is not
> found under `sudo` due to overridden `$PATH` for security reasons.
> So consider adding `-i` option to bring `$PATH` from root environment.

```console
$ sudo -i privcert init
```

Then, input password for server mode twice.

> [!NOTE]
> If omit password or failed to set password, retry `init` to initialize
> password.
>
> Once initialized password, try `sudo -i privcert passwd` to update.

Set generated cert on the ssl configuration of your web server.
For Apache, append below to the `VirtualHost` directive in `ssl.conf`:

```apache
SSLCACertificateFile /etc/privcert/ca/cert.pem
SSLVerifyClient require
SSLVerifyDepth 10
SSLCARevocationCheck leaf
SSLCARevocationFile /etc/privcert/ca/crl.pem
```

> [!NOTE]
> In addition, might already have specified `SSLCertificateFile` and
> `SSLCertificateKeyFile` to enable SSL with an appropriate server cert.

Update apache configuration to make those valid:

```console
$ sudo apachectl restart
```

Now the site is not accessible until installing the client cert signed by this
ca.

User certs management
---------------------

### Make user cert

```console
$ sudo -i privcert make u̲s̲e̲r̲ [c̲n̲] [e̲m̲a̲i̲l̲]
```

To make the site accessible, import the cert file generated at
`/etc/privcert/users/u̲s̲e̲r̲.pfx` into the environment of the user.

### Show all user certs

```console
$ sudo -i privcert list
```

It shows only certs just under `/etc/privcert/users`, which should hold only
valid ones.

### Revoke user cert

```console
$ sudo -i privcert revoke u̲s̲e̲r̲
```

Revoked cert is added to certificate revocation list (`crl.pem`), so the client
with the cert could no longer access.
And the cert is moved to `/etc/privcert/trash`.

ToDo
----

* Web interface
* Server certificate (to use with VPN server)
* Update CA cert (necessary?)

Copyright and License
---------------------

Copyright (c)2024 Shun-ichi TAHARA &lt;jado@flowernet.jp&gt;

Provided under MIT license, with the exception of third-party/getoptions
directory, which is appropriated from
[ko1nksm/getoptions](https://github.com/ko1nksm/getoptions) of CC0 license.

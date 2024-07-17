PrivCert - Private CA for management of user certs
==================================================

[![GitHub top language](https://img.shields.io/github/languages/top/jado4810/privcert.svg)](https://github.com/jado4810/privcert/search?l=Shell)
[![License](https://img.shields.io/github/license/jado4810/privcert.svg)](https://github.com/jado4810/privcert/blob/main/LICENSE.txt)

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
* `BINDIR` - where executables are installed at, default value is `$(PREFIX)/sbin`.

Also `DESTDIR`, useful when making packages, available.

Preparation
-----------

First, init the environment and generate self-signed cert for local CA.

```console
$ sudo privcert init
```

Input password for server mode twice.

> If omit password or failed to set password, retry `init` to initialize password.
>
> Once initializing password, try `sudo privcert passwd` to update.

Set generated cert on ssl configuration of your web server.
For Apache, like below:

```apache:ssl.conf
SSLCACertificateFile /etc/privcert/ca/cert.pem
SSLVerifyClient require
SSLVerifyDepth 10
SSLCARevocationCheck leaf
SSLCARevocationFile /etc/privcert/ca/crl.pem
```

Update apache configuration to make those valid:

```console
$ sudo apachectl restart
```

Now that site is not accessible until being installed cert signed by this ca.

User certs management
---------------------

### Make user cert

```console
$ sudo privcert make «user» [«cn»] [«email»]
```

Import a cert file generated at `/etc/privcert/users/«user».pfx` into the environment of the user, and it could be access to the site.

### Show all user certs

```console
$ sudo privcert list
```

It shows only certs just under `/etc/privcert/users`, which should only hold currently valid ones.

### Revoke user cert

```console
$ sudo privcert revoke «user»
```

Revoked cert is added to certificate revocation list (`crl.pem`), so the client with the cert could no longer access.
And the cert is moved to `/etc/privcert/trash`.

ToDo
----

* Web interface
* Server certificate (to use with VPN server)
* Update CA cert (necessary?)

Copyright and License
---------------------

Copyright (c)2024 Shun-ichi TAHARA &lt;jado@flowernet.jp&gt;

Provided under MIT license, with the exception of third-party/getoptions directory, which is appropriated from [ko1nksm/getoptions](https://github.com/ko1nksm/getoptions) of CC0 license.

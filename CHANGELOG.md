# PrivCert - Changelog

## Version 1.0.3 (2025-1-4)

* Cache certs to improve performance
* Fix bug that revoking cert does not work with web interface
* Change base image of web interface container from Alpine3.20 to Debian12 due to issue on cross-building with Alpine3.21 and Docker Desktop on mac
* Some minor tweaks

## Version 1.0.2 (2024-10-20)

* Fix failure on making certs with openssl-1.1.1
* Change native confirm dialog into modal dialog of HTML standard
* Add logrotate configuration sample for web interface
* Add busy indication to lock UIs while waiting server response
* Some tweaks on web interface

## Version 1.0.1 (2024-9-16)

* Fix column label name for cn on en and de locales of web interface
* Add slash to cn restricted characters on web interface
* Update configuration shown on initialization
* Fix minor issue on build for macOS

## Version 1.0.0 (2024-9-5)

* Release version
* Update shell option parser to getoptions-3.3.2
* Some minor tweaks

## Version 0.9.91 (2024-8-31)

* Fix bug that fail to revoking cert with web interface
* Set extract password on certs to fix import issue on some OSes
* Use legacy algorithm on encrypting cert to fix issue on macOS
* Change cert name from user name to configurable fixed value

## Version 0.9.90 (2024-8-29)

* Initial version (beta)

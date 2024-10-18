all: src/privcert

DESTDIR     =
PREFIX      = /usr/local
BINDIR      = $(PREFIX)/sbin

CA_ROOT     = /etc/privcert
OPENSSL     = $(shell which openssl || echo /usr/bin/openssl)
MD5SUM      = $(shell which md5sum || which md5 || echo /usr/bin/md5sum)
BASE64      = $(shell which base64 || echo /usr/bin/base64)
DN_BASE     = /C=JP/ST=Tokyo/O=Your Company
EXTRACT_PWD = privcert
CERT_NAME   = PrivCert
UPDATE_HOOK = $(shell which apachectl || echo /usr/bin/apachectl) restart
KEYLEN      = 2048
EXPIRE      = 3650

TOOLS       = ./third-party/getoptions

PKCS12_OPTS = $(shell $(OPENSSL) pkcs12 -help 2> /dev/null | \
                grep -- '-legacy' > /dev/null && echo "'-legacy'")

src/license.sh: LICENSE.txt
	sed -e 's/\r$$//' -e 's/^/# /' -e 's/ *$$//' $< > $@

src/parser_definition.sh: src/parser_definition.sh.in
	sed -e 's/%KEYLEN%/$(KEYLEN)/' -e 's/%EXPIRE%/$(EXPIRE)/' $< > $@

src/parse.sh: src/parser_definition.sh $(TOOLS)/gengetoptions $(TOOLS)/getoptions
	$(TOOLS)/gengetoptions parser -i2 -f- parser_definition parse < $< > $@

src/privcert: src/privcert.sh.in src/license.sh src/parse.sh src/openssl.conf.in
	sed -e '/%LICENSE_HERE%/r src/license.sh' -e '/%LICENSE_HERE%/d' \
	    -e '/%PARSER_HERE%/r src/parse.sh' -e '/%PARSER_HERE%/d' \
	    -e '/%SSLCONF_HERE%/r src/openssl.conf.in' -e '/%SSLCONF_HERE%/d' \
	    -e 's/%CA_ROOT%/$(subst /,\/,$(CA_ROOT))/' \
	    -e 's/%OPENSSL%/$(subst /,\/,$(OPENSSL))/' \
	    -e 's/%MD5SUM%/$(subst /,\/,$(MD5SUM))/' \
	    -e 's/%BASE64%/$(subst /,\/,$(BASE64))/' \
	    -e 's/%DN_BASE%/$(subst /,\/,$(subst &,\&,$(DN_BASE)))/' \
	    -e 's/%EXTRACT_PWD%/$(subst /,\/,$(EXTRACT_PWD))/' \
	    -e 's/%CERT_NAME%/$(subst /,\/,$(CERT_NAME))/' \
	    -e 's/%UPDATE_HOOK%/$(subst /,\/,$(UPDATE_HOOK))/' \
	    -e "s/%PKCS12_OPTS%/$(PKCS12_OPTS)/" $< > $@

install: src/privcert
	test -d $(DESTDIR)$(BINDIR) || mkdir -p $(DESTDIR)$(BINDIR)
	install -p -o root -g root -m 700 $^ $(DESTDIR)$(BINDIR)

clean:
	rm -f src/privcert src/license.sh src/parser_definition.sh src/parse.sh

.PHONY: all install clean

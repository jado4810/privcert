all: src/privcert

CA_ROOT = /etc/privcert
OPENSSL = $(shell which openssl || echo /usr/bin/openssl)
DN_BASE = /C=JP/ST=Tokyo/O=Your Company
UPDATE_HOOK = $(shell which apachectl || echo /usr/bin/apachectl) restart

KEYLEN = 2048
EXPIRE = 3650

DESTDIR =
PREFIX = $(DESTDIR)/usr/local
BINDIR = $(PREFIX)/sbin

TOOLS = ./third-party/getoptions

src/parser_definition.sh: src/parser_definition.sh.in
	sed -e 's/%KEYLEN%/$(KEYLEN)/' -e 's/%EXPIRE%/$(EXPIRE)/' $< > $@

src/parse.sh: src/parser_definition.sh $(TOOLS)/gengetoptions $(TOOLS)/getoptions
	$(TOOLS)/gengetoptions parser -i2 -f- parser_definition parse < $< > $@

src/privcert: src/privcert.sh.in src/parse.sh
	sed -e '/%PARSER_HERE%/r src/parse.sh' -e '/%PARSER_HERE%/d' \
	    -e 's/%CA_ROOT%/$(subst /,\/,$(CA_ROOT))/' \
	    -e 's/%DN_BASE%/$(subst /,\/,$(subst &,\&,$(DN_BASE)))/' \
	    -e 's/%OPENSSL%/$(subst /,\/,$(OPENSSL))/' \
	    -e 's/%UPDATE_HOOK%/$(subst /,\/,$(UPDATE_HOOK))/' $< > $@

install: src/privcert
	test -d $(BINDIR) || mkdir -p $(BINDIR)
	install -p -o root -g root -m 700 $^ $(BINDIR)

clean:
	rm -f src/privcert src/parse.sh src/parser_definition.sh

.PHONY: all install clean

FROM ruby:3.2-alpine

RUN apk add --no-cache \
  shadow curl openssl pcre2 libpcre2-16 libpcre2-32 sqlite sqlite-libs

RUN bundle config --local without development:test
WORKDIR /opt/app

COPY Gemfile docker/Gemfile.lock .
RUN set -x && \
  apk add --no-cache --virtual build-dependencies \
    make g++ curl-dev pcre2-dev sqlite-dev && \
  bundle install && \
  passenger-config install-agent && \
  passenger-config install-standalone-runtime && \
  passenger-config build-native-support && \
  apk del --purge build-dependencies

RUN mkdir -p auth log tmp/pids
COPY *.md Rakefile config.ru .
COPY docker/bin bin/
RUN chmod +x bin/*
COPY docker/config config/
COPY db db/
COPY views views/
COPY public public/
COPY lib lib/
COPY locales locales/

ENV APP_ENV=production
CMD ["/opt/app/bin/init"]

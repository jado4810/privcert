FROM ruby:4.0-slim-trixie AS builder

RUN apt update \
 && apt install -y curl make g++ libsqlite3-dev \
 && rm -rf /var/lib/apt/lists/*

RUN bundle config --local without development:test
WORKDIR /opt/app

COPY Gemfile docker/Gemfile.lock .

RUN bundle install \
 && rm -f /usr/local/bundle/cache/*

RUN /usr/local/bundle/bin/passenger-config install-agent \
 && /usr/local/bundle/bin/passenger-config install-standalone-runtime \
 && /usr/local/bundle/bin/passenger-config build-native-support

FROM ruby:4.0-slim-trixie

RUN apt update \
 && apt install -y procps curl less sqlite3 \
 && rm -rf /var/lib/apt/lists/*

RUN echo 'SYS_UID_MAX 60000' >> /etc/login.defs \
 && echo 'SYS_GID_MAX 60000' >> /etc/login.defs

COPY --from=builder /usr/local/bundle /usr/local/bundle/

WORKDIR /opt/app

COPY --from=builder /opt/app/Gemfile /opt/app/Gemfile.lock .

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

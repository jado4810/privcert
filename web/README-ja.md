PrivCert WEBインターフェース
============================

[EN](./README.md)|JA

必要なもの
----------

### Dockerを利用 (推奨)

* Docker(CE 19.03以降)およびcomposeプラグイン
* リバースプロキシーとして使うWEBサーバー(Apache等)

### 直接実行

* Ruby(2.6以降)
* Rackを駆動できるWEBサーバー(Apache等)

PrivCertのサービス登録
----------------------

### systemd系システムの場合

[`sample/systemd`](./sample/systemd/)以下に、ソケットサービスファイル(`privcert.socket`)およびサービステンプレートファイル(`privcert@.service`)があります。

待ち受けるポートをデフォルトの26310/TCPから変更する場合、`privcert.socket`の`ListenStream`の値を変更します。

```ini
[Socket]
ListenStream = 127.0.0.1:26310
```

セキュリティ上の理由から、待ち受けるアドレスはデフォルトの127.0.0.1から変更しないことを強く推奨します。
ただし、WEBインターフェースをアクセス制御対象のWEBサーバーと異なるホストに設置する場合は、firewalld等によるアクセス制御を行なった上で、適切なインターフェースのアドレスを指定します。
この場合、WEBインターフェースのアカウント管理についても注意が必要です。

PrivCertのインストール時に`PREFIX`あるいは`BINDIR`を変更した場合、`privcert@.service`の`ExecStart`の値を変更します。

```ini
[Service]
ExecStart = /usr/local/sbin/privcert server
```

これら2つのファイルを`/etc/systemd/system`にコピーし、ソケットサービスを有効化します。

```console
$ sudo cp sample/systemd/privcert.socket /etc/systemd/system/
$ sudo cp sample/systemd/privcert@.service /etc/systemd/system/
$ sudo systemctl daemon-reload
$ sudo systemctl enable privcert.socket
$ sudo systemctl start privcert.socket
```

### inetd系システムの場合

`/usr/local/sbin/privcert server`を起動するようにinetdを設定します。

xinetdを採用していて`/etc/xinetd.d`があるシステムでは、[`sample/xinetd`](./sample/xinetd/)以下にあるサービス定義ファイル(`privcert`)を使用できますので、これを`/etc/xinetd.d`にコピーしてxinetdを再起動してください。

tcpwrapperやfirewalld等で接続元のアドレスを127.0.0.1に限定することを推奨します。
tcpwrapperを用いる場合、以下を`/etc/hosts.allow`に追記します。

```hosts
privcert:127.0.0.1 :allow
```

インストール
------------

### Dockerを利用

まず、コンテナイメージを構築し、それをロードします。

```console
$ cd web
$ docker build -t privcert .
$ docker save privcert | ssh webapp-server docker load
```

コンテナイメージファイルがある場合はそれをロードします。

```console
$ xzcat privcert-latest.tar.xz | docker load
```

[`sample/docker`](./sample/docker/)以下にある`docker-compose.yml`ファイルを編集します。

主な編集箇所は以下のとおりです。

* `CA_ROOT`を変更している場合、`volumes`配下の認証データベースパスを変更
* URLのローカルパス部分を`/privcert/`から変更している場合、`URL_PATH`を変更
* PrivCertサーバーの待ち受けポートを変更している場合、`SERVER_PORT`を変更
* PrivCertサーバーのパスワードを`SERVER_PASSWD`に設定

WEBアプリケーションのプロセスに付与する専用のアカウントを作成することを強く推奨します。
作成したアカウントのUIDとGIDを`APP_UID`と`APP_GID`に設定します。

```console
$ sudo useradd -UMd /etc/privcert privcert
$ id privcert
uid=501(privcert) gid=501(privcert) groups=501(privcert)
```

`docker-compose.yml`を置いたディレクトリーに移動してコンテナを起動します。

```console
$ cd path/to/dockerComposeYml
$ docker compose up -d
```

初回起動時のみ、認証データベースの初期化を行います。

```console
$ docker compose exec app rake db:create
$ docker compose exec app rake db:migrate
$ docker compose exec app rake db:seed
$ sudo chown privcert:privcert /etc/privcert/web/auth.db
$ sudo chmod 700 /etc/privcert/web
$ sudo chmod 600 /etc/privcert/web/auth.db
```

リバースプロキシーの設定を`ssl.conf`(Apacheの場合)に追加します。

```apache
SSLProxyEngine on
RequestHeader set X-Forwarded-Proto 'https'

ProxyPass /privcert/ http://localhost:31080/
```

> [!NOTE]
> `SSLProxyEngine`と`RequestHeader`は、既設のWEBアプリケーション用に設定済かもしれません。

続いて、`ssl.conf`の`SSLRequire`行に対して、以下のようにクライアント証明書を要求する条件を追加します。

```apache
<If "%{REQUEST_URI} !~ m!^/privcert/cert/!">
  SSLRequire %{SSL_CLIENT_S_DN_O} eq "Your Company"
</If>
```

`If`ディレクティブの`/privcert/`の部分を`ProxyPass`のローカルパス部分の値に合わせます。
これは、このアプリケーションにアクセスする際のURLとなります。
`If`の条件は、証明書をインストールしていないユーザーがダウンロードできるようにするために必要です。

その後、有効化します。

```console
$ sudo apachectl restart
```

最後に、ログファイルをローテーションさせるために、logrotateの設定を追加します。

[`sample/docker`](./sample/docker/)以下にある`privcert`ファイルを`/etc/logrotate.d`にコピーします。
通常はこれだけですが、`docker-compose.yml`でログ出力先を変更している場合は、パスが一致するように編集してください。

### 直接実行

まずrbenv、もしくはインストール先OSの公式パッケージリポジトリー等を利用して、Ruby環境をインストールします。

例えば、最近のバージョンのRHELおよび互換ディストリビューションにおいて、rbenvを用いる場合は、以下のようになります。

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

また、RHELおよび互換OSでのappstreamパッケージを用いると、以下のようになります。

```console
$ sudo su -
# dnf module reset ruby
# dnf module enable ruby:3.2
# dnf module -y install ruby:3.2
```

続いて、Apacheのpassengerモジュールをインストールします。

```console
# passenger-install-apache2-module
```

途中の質問には全て<kbd>Enter</kbd>を押していれば問題ありません。

Apacheの設定ファイルに追加する断片が表示されますので、`/etc/httpd/conf.d/passenger.conf`にコピーした後、以下を編集します。

* 1行目、3・4行目…表示された内容をそのまま貼り付け
* 5～8行目…以下のとおり、`PassengerEnabled`行以下を追加

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

その後、本ディレクトリー以下の内容を全て適当なパスに配置します。

```console
# cp -r web /usr/local/privcert-web
# cd /usr/local/privcert-web
```

`.bundle/config`を編集し、`BUNDLE_WITHOUT`の`production`の部分を`development`に変更します。

```yaml
BUNDLE_WITHOUT: "development:test"
```

`bundle install`を実行してバンドルされるパッケージをインストールします。

```console
# bundle install
```

`config/settings.yml`および`config/database.yml`の設定を適宜変更します。

認証データベースの初期化を行います。

```console
# bundle exec rake db:create APP_ENV=production
# bundle exec rake db:migrate APP_ENV=production
# bundle exec rake db:seed APP_ENV=production
# chown apache:apache /etc/privcert/web/auth.db
# chmod 700 /etc/privcert/web
# chmod 600 /etc/privcert/web/auth.db
```

以下の内容を`ssl.conf`に追加します。

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

さらに、`ssl.conf`の`SSLRequire`行に対して、以下のようにクライアント証明書を要求する条件を追加します。

```apache
<If "%{REQUEST_URI} !~ m!/privcert/cert/.*$!">
  SSLRequire %{SSL_CLIENT_S_DN_O} eq "Y̲o̲u̲r̲ ̲C̲o̲m̲p̲a̲n̲y̲"
</If>
```

`If`ディレクティブの`/privcert/`の部分を`ProxyPass`のローカルパス部分の値に合わせます。
これは、このアプリケーションにアクセスする際のURLとなります。
`If`の条件は、証明書をインストールしていないユーザーがダウンロードできるようにするために必要です。

その後、有効化します。

```console
# apachectl restart
```

デフォルトのアカウント
----------------------

`rake db:seed`によって、デフォルトアカウント "`admin`" が設定されます。
パスワードは "`PrivCertAdmin`" です。
まずこれを変更することを強く推奨します。

証明書の管理
------------

有効なユーザーの証明書がメインパネルに表示されます。
「リンク」のアイコンからダウンロードできますので、アクセスを許可したいユーザーにURLを送付してください。

ユーザーはそのURLから証明書ファイルをダウンロードできます。
これをダブルクリックまたはタップすることでインポートすることができます。
環境によっては、WEBブラウザーの証明書管理メニューからインポートする必要があるかもしれません。

固定のパスワードも必要ですので、ダウンロードURLと一緒にアナウンスするようにしてください。

証明書の作成と無効化がメインパネルから実行できます。

他に2つのパネルがあります。
それぞれ、アカウント管理、およびパスワードの変更に用います。

PrivCert - クライアント証明書を管理するためのプライベート認証局
===============================================================

[![Ruby](https://img.shields.io/github/languages/top/jado4810/privcert?logo=ruby&logoColor=fff&label=Ruby&labelColor=cc342d&color=666)](https://github.com/jado4810/privcert/search?l=Ruby)
[![Shell](https://img.shields.io/badge/Shell-4eaa25?logo=gnu-bash&logoColor=fff)](https://github.com/jado4810/privcert/search?l=Shell)
[![Sinatra](https://img.shields.io/badge/-Sinatra-000?logo=ruby-sinatra&logoColor=fff)](https://github.com/sinatra)
[![Docker](https://img.shields.io/badge/-Docker-2496ed?logo=docker&logoColor=fff)](https://github.com/docker)
[![MIT License](https://img.shields.io/github/license/jado4810/privcert?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI2ZmZiI%2BPHBhdGggZD0iTTguNzUuNzVWMmguOTg1Yy4zMDQgMCAuNjAzLjA4Ljg2Ny4yMzFsMS4yOS43MzZjLjAzOC4wMjIuMDguMDMzLjEyNC4wMzNoMi4yMzRhLjc1Ljc1IDAgMCAxIDAgMS41aC0uNDI3bDIuMTExIDQuNjkyYS43NS43NSAwIDAgMS0uMTU0LjgzOGwtLjUzLS41My41MjkuNTMxLS4wMDEuMDAyLS4wMDIuMDAyLS4wMDYuMDA2LS4wMDYuMDA1LS4wMS4wMS0uMDQ1LjA0Yy0uMjEuMTc2LS40NDEuMzI3LS42ODYuNDVDMTQuNTU2IDEwLjc4IDEzLjg4IDExIDEzIDExYTQuNDk4IDQuNDk4IDAgMCAxLTIuMDIzLS40NTQgMy41NDQgMy41NDQgMCAwIDEtLjY4Ni0uNDVsLS4wNDUtLjA0LS4wMTYtLjAxNS0uMDA2LS4wMDYtLjAwNC0uMDA0di0uMDAxYS43NS43NSAwIDAgMS0uMTU0LS44MzhMMTIuMTc4IDQuNWgtLjE2MmMtLjMwNSAwLS42MDQtLjA3OS0uODY4LS4yMzFsLTEuMjktLjczNmEuMjQ1LjI0NSAwIDAgMC0uMTI0LS4wMzNIOC43NVYxM2gyLjVhLjc1Ljc1IDAgMCAxIDAgMS41aC02LjVhLjc1Ljc1IDAgMCAxIDAtMS41aDIuNVYzLjVoLS45ODRhLjI0NS4yNDUgMCAwIDAtLjEyNC4wMzNsLTEuMjg5LjczN2MtLjI2NS4xNS0uNTY0LjIzLS44NjkuMjNoLS4xNjJsMi4xMTIgNC42OTJhLjc1Ljc1IDAgMCAxLS4xNTQuODM4bC0uNTMtLjUzLjUyOS41MzEtLjAwMS4wMDItLjAwMi4wMDItLjAwNi4wMDYtLjAxNi4wMTUtLjA0NS4wNGMtLjIxLjE3Ni0uNDQxLjMyNy0uNjg2LjQ1QzQuNTU2IDEwLjc4IDMuODggMTEgMyAxMWE0LjQ5OCA0LjQ5OCAwIDAgMS0yLjAyMy0uNDU0IDMuNTQ0IDMuNTQ0IDAgMCAxLS42ODYtLjQ1bC0uMDQ1LS4wNC0uMDE2LS4wMTUtLjAwNi0uMDA2LS4wMDQtLjAwNHYtLjAwMWEuNzUuNzUgMCAwIDEtLjE1NC0uODM4TDIuMTc4IDQuNUgxLjc1YS43NS43NSAwIDAgMSAwLTEuNWgyLjIzNGEuMjQ5LjI0OSAwIDAgMCAuMTI1LS4wMzNsMS4yODgtLjczN2MuMjY1LS4xNS41NjQtLjIzLjg2OS0uMjNoLjk4NFYuNzVhLjc1Ljc1IDAgMCAxIDEuNSAwWm0yLjk0NSA4LjQ3N2MuMjg1LjEzNS43MTguMjczIDEuMzA1LjI3M3MxLjAyLS4xMzggMS4zMDUtLjI3M0wxMyA2LjMyN1ptLTEwIDBjLjI4NS4xMzUuNzE4LjI3MyAxLjMwNS4yNzNzMS4wMi0uMTM4IDEuMzA1LS4yNzNMMyA2LjMyN1oiPjwvcGF0aD48L3N2Zz4%3D)](https://github.com/jado4810/privcert/blob/main/LICENSE.txt)

[EN](./README.md)|JA

本ツールについて
----------------

アクセス制限のかかったWEBサイトでの、クライアント認証に用いるユーザー証明書を管理するための簡単なスクリプトです。

ローカルに自己署名による認証局を立てて、ユーザー毎のクライアント証明書を生成することができます。

必要なもの
----------

* OpenSSL
* WEBサーバー(Apache等)

インストール
------------

```console
$ make
$ sudo make install
```

`make`では以下の変数を指定できます。

* `CA_ROOT` - 認証局の格納先ディレクトリー
    * デフォルト値: `/etc/privcert`
* `OPENSSL` - opensslの実行ファイルパス
    * デフォルト値: (自動認識)
* `MD5SUM` - md5sumの実行ファイルパス
    * デフォルト値: (自動認識)
* `BASE64` - base64の実行ファイルパス
    * デフォルト値: (自動認識)
* `DN_BASE` - X.509のDNプレフィクス
    * デフォルト値: `/C=JP/ST=Tokyo/O=Your Company`
    * C、STおよびOは必須
    * CNとemailAddressは指定しないこと(各証明書に個別に設定されるため)
* `EXTRACT_PWD` - ユーザーが証明書をインストールする際の展開パスワード
    * デフォルト値: `privcert`
* `CERT_NAME` - クライアント証明書のデフォルト名
    * デフォルト値: `PrivCert`
    * サイト名で設定することを推奨
* `UPDATE_HOOK` - WEBサーバーを再設定するためのフック
    * デフォルト値: `apachectl restart` (apachectlの実行ファイルパスは自動認識)
* `KEYLEN` - デフォルトの鍵サイズ(ビット単位)
    * デフォルト値: `2048`
    * `-l`オプションで変更可
* `EXPIRE` - デフォルトの証明書有効期限(日単位)
    * デフォルト値: `3650`(≒10年)
    * `-e`オプションで変更可

`make install`では以下の変数を指定できます。

* `PREFIX` - インストール先のプレフィックスパス
    * デフォルト値: `/usr/local`
* `BINDIR` - 実行ファイルのインストール先
    * デフォルト値: `$(PREFIX)/sbin`

パッケージ作成時に有用な`DESTDIR`も指定できます。

準備
----

最初に、環境の初期化を行い、ローカル認証局の自己署名証明書を作成します。

> [!NOTE]
> 多くのシステムで、`sudo`環境下においては、`/usr/local/sbin`以下にインストールされたprivcertの実行ファイルにパスが通っていない状態となります。
> これは、セキュリティ上の理由から`$PATH`の値が上書きされていることによります。
> このような場合は、`sudo`に`-i`オプションを追加してrootのログイン環境で設定されている`$PATH`の値を参照させるとよいでしょう。

```console
$ sudo -i privcert init
```

初期化が完了すると、SSLの設定の断片が表示されます。

その後、サーバーモード用のパスワードを2回入力します。

> [!NOTE]
> パスワードを省略したり、設定に失敗したりした場合、再度`init`を実行してパスワードを初期化してください。
>
> パスワード初期化後は、`sudo -i privcert passwd`で再設定できます。

表示されたSSL設定の断片をWEBサーバーの設定ファイルに追記します。
Apacheでは、以下を`ssl.conf`の`VirtualHost`ディレクティブ内に記載します。

> [!NOTE]
> `ssl.conf`は、RHELおよび互換システムでは`/etc/httpd/conf.d`以下にあります。
> 他のシステムでは格納場所やファイル名が異なる場合があります。
> 例えばUbuntu等のDebian系システムでは`/etc/apache2/sites-available`以下の`default-ssl.conf`が該当します。

```apache
SSLCACertificateFile /etc/privcert/ca/cert.pem
SSLVerifyClient optional
SSLVerifyDepth 10
SSLCARevocationCheck leaf
SSLCARevocationFile /etc/privcert/ca/crl.pem

SSLRequire %{SSL_CLIENT_S_DN_O} eq "Your Company"
```

`SSLRequire`の値は、デフォルト値である"`Your Company`"から、`DN_BASE`で指定したDNのOの値に変更することになります。
いずれにせよ、初期設定時に表示された断片の内容をそのままコピーするだけとなっています。

> [!NOTE]
> 上記に加えて、適宜サーバー証明書を指定した状態で`SSLCertificateFile`と`SSLCertificateKeyFile`は既に設定されていることが前提です。

Apacheの設定を更新して、ここまでの設定を有効化します。

```console
$ sudo apachectl restart
```

これによって、当該サイトはこの証明局で署名されたクライアント証明書をインストールしないとアクセスできない状態となっています。

WEBインターフェースの設定(オプション)
-------------------------------------

WEBインターフェースから利用するには、WEBアプリケーションを設定後、`privcert`をサービスとして登録し、一部の設定を変更する必要があります。

詳細は[web/README.md](./web/README.md)を参照してください。

ユーザー証明書の管理
--------------------

### 証明書の作成

```console
$ sudo -i privcert make ユーザー名 [フルネーム] [メールアドレス]
```

当該サイトにアクセスできるようにするには、`/etc/privcert/users/ユーザー名.pfx`として生成された証明書ファイルをユーザーの環境にインポートします。
通常は、証明書ファイルをダブルクリックまたはタップして、システムの証明書ストアにインポートするだけで済むはずですが、環境によっては、WEBブラウザーの証明書管理メニューからインポートする必要があるかもしれません。

インポート時に`EXTRACT_PWD`で指定した固定のパスワード(デフォルトでは`privcert`)を入力する必要があります。

証明書ファイルの配布には[WEBインターフェース](./web/)が有用です。

### 証明書の一覧を確認

```console
$ sudo -i privcert list
```

`/etc/privcert/users`直下にある証明書だけを表示対象としています。
ここには、現在有効な証明書のみが格納されています。

### 証明書の無効化

```console
$ sudo -i privcert revoke ユーザー名
```

無効化された証明書は証明書失効リスト(`crl.pem`)に追加され、当該証明書をインストールしたクライアントはアクセスできなくなります。
証明書ファイルは`/etc/privcert/trash`に移動されます。

ToDo
----

* サーバー証明書への対応 (VPNサーバーで双方向認証に用いるため)
* 認証局の証明書の更新 (必要?)

著作権およびライセンス
----------------------

Copyright (c)2024 Shun-ichi TAHARA &lt;jado@flowernet.jp&gt;

[MITライセンス](./LICENSE.txt)で提供します。
例外として、[third-party/getoptions](./third-party/getoptions/)ディレクトリー以下は、[ko1nksm/getoptions](https://github.com/ko1nksm/getoptions)の成果物を流用したものであるため、[CC0](./third-party/getoptions/LICENSE)が適用されます。

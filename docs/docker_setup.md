# カスタム Docker セットアップ解説

本プロジェクトでは、Laravel Sail 標準の Dockerfile ではなく、ビルドの安定性を高めるためにカスタマイズした Dockerfile を使用しています。

## なぜカスタムが必要だったのか？
Laravel Sail が標準で提供する Dockerfile は、1つの `RUN` 命令の中に「OSパッケージの更新」「PHPのインストール」「Node.jsのインストール」など、膨大な処理が詰め込まれています。

このため、**途中でネットワークエラーやタイムアウトが発生すると、それまでのダウンロードがすべて破棄され、最初からやり直しになってしまう** という問題がありました。特に日本のネットワーク環境や Docker Desktop のパスツール問題（credentials）と重なると、ビルドが完了しないリスクがあります。

## 解決策：レイヤーキャッシュの活用
Dockerfile の `RUN` 命令を機能単位（PHP、Node.js、Composer、ツール群など）で **9段階以上に分割** しました。

これにより：
*   **途中保存が可能に**: 例えば PHP のインストールが成功していれば、その後の Node.js で失敗しても、次回は PHP のインストールをスキップして Node.js から再開できます。
*   **エラー箇所の特定**: どのステップで時間がかかっているか、またはエラーが出ているかが Docker のログ上で明確になります。

## 適用した Dockerfile (docker/8.4/Dockerfile) 全容

```dockerfile
# /docker/8.4/Dockerfile
FROM ubuntu:24.04

LABEL maintainer="Taylor Otwell"

ARG WWWGROUP
ARG NODE_VERSION=22
ARG MYSQL_CLIENT="mysql-client"
ARG POSTGRES_VERSION=17

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
ENV LANG=C.UTF-8
ENV SUPERVISOR_PHP_COMMAND="/usr/bin/php -d variables_order=EGPCS /var/www/html/artisan serve --host=0.0.0.0 --port=80"
ENV SUPERVISOR_PHP_USER="sail"

# Step 1: タイムゾーン設定
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Step 2: apt プロキシ/リトライ耐性設定
RUN echo "Acquire::http::Pipeline-Depth 0;" > /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::http::No-Cache true;" >> /etc/apt/apt.conf.d/99custom && \
    echo "Acquire::BrokenProxy    true;" >> /etc/apt/apt.conf.d/99custom

# Step 3: 基本OSパッケージのインストール
RUN apt-get update && apt-get install -y \
    gnupg gosu curl ca-certificates zip unzip git \
    supervisor sqlite3 libcap2-bin libpng-dev python3 \
    dnsutils librsvg2-bin fswatch nano \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Step 4: PHP PPA (リポジトリ) の追加
RUN mkdir -p /etc/apt/keyrings && \
    curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0xb8dc7e53946656efbce4c1dd71daeaab4ad4cab6' \
    | gpg --dearmor | tee /etc/apt/keyrings/ppa_ondrej_php.gpg > /dev/null && \
    echo "deb [signed-by=/etc/apt/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble main" \
    > /etc/apt/sources.list.d/ppa_ondrej_php.list

# Step 5: PHP 8.4 のインストール (もっとも重いステップ)
RUN apt-get update && apt-get install -y \
    libgd3 php8.4-cli php8.4-dev \
    php8.4-pgsql php8.4-sqlite3 php8.4-gd \
    php8.4-curl php8.4-imap php8.4-mysql php8.4-mbstring \
    php8.4-xml php8.4-zip php8.4-bcmath php8.4-soap \
    php8.4-intl php8.4-readline php8.4-ldap \
    php8.4-msgpack php8.4-igbinary php8.4-redis \
    php8.4-memcached php8.4-pcov php8.4-xdebug \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Step 6: Composer のインストール
RUN curl -sLS https://getcomposer.org/installer | php -- --install-dir=/usr/bin/ --filename=composer

# Step 7: Node.js のインストール
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Step 8: グローバルパッケージ (pnpm, bun)
RUN npm install -g pnpm bun && corepack enable

# Step 9: MySQL クライアント
RUN apt-get update && apt-get install -y $MYSQL_CLIENT \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Step 10: ユーザー権限とディレクトリ設定
RUN setcap "cap_net_bind_service=+ep" /usr/bin/php8.4
RUN groupadd --force -g $WWWGROUP sail
RUN useradd -ms /bin/bash --no-user-group -g $WWWGROUP -u 1337 sail
RUN git config --global --add safe.directory /var/www/html

# 設定ファイルのコピー
COPY start-container /usr/local/bin/start-container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY php.ini /etc/php/8.4/cli/conf.d/99-sail.ini
RUN chmod +x /usr/local/bin/start-container

EXPOSE 80/tcp

ENTRYPOINT ["start-container"]
```

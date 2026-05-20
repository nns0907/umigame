# ========== PHP ベース ==========
FROM php:8.4-cli-bookworm AS php-base

RUN echo "==> [1/5] apt-get install" \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        git curl unzip zip \
        libpq-dev libzip-dev libicu-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN echo "==> [2/5] docker-php-ext-install" \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql zip bcmath intl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ========== Composer 依存 ==========
FROM php-base AS vendor

WORKDIR /var/www

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

COPY composer.json composer.lock ./
RUN echo "==> [3/5] composer install" \
    && composer install --no-dev --no-interaction --no-scripts --prefer-dist

# ========== フロントエンドビルド（Node 公式イメージ） ==========
FROM node:20-bookworm-slim AS frontend

WORKDIR /build

COPY package.json package-lock.json ./
RUN echo "==> [4/5] npm ci" && npm ci

COPY vite.config.js tsconfig.json postcss.config.js tailwind.config.js ./
COPY resources ./resources
COPY public ./public
COPY --from=vendor /var/www/vendor ./vendor

RUN echo "==> [5/5] npm run build" && npm run build

# ========== 本番イメージ ==========
FROM php-base

WORKDIR /var/www

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1

COPY --from=vendor /var/www/vendor ./vendor
COPY --from=frontend /build/public/build ./public/build

COPY . .

RUN composer dump-autoload --optimize --no-interaction --no-scripts \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-c", "php artisan package:discover --ansi && php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache && php -S 0.0.0.0:${PORT:-10000} -t public"]

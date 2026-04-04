# Migration Command History

プロジェクトのLaravel移行に伴い、実行した主要なコマンドの履歴を記録するファイルです。

## 1. Gitの初期設定と現行コードの保存 (完了)
```bash
git init
git add .
git commit -m "Initial commit and migration spec"
```

## 2. 旧Python環境のクリーンアップとLaravel構築 (完了)
```bash
# 旧環境のクリーンアップ
git rm -r app.py add_riddle.py sample.py templates/ static/
git commit -m "Remove old Python files before Laravel installation"

# Laravel 11 (PHP 8.4指定) でプロジェクトを生成
export PATH=$PATH:/Applications/Docker.app/Contents/Resources/bin
curl -s "https://laravel.build/tmp_laravel?php=84" | bash

# ファイルの配置移動
shopt -s dotglob
mv tmp_laravel/* ./
rmdir tmp_laravel
```

## 3. Docker環境の構築 (完了)
※当初はネットワークエラー対策のためカスタム構成を試行しましたが、最終的に標準構成でのビルドに成功しました。

```bash
# Docker Desktopを起動し、起動状況を確認
open -a Docker
docker info

# コンテナのビルド (標準の Dockerfile を使用)
export PATH=$PATH:/Applications/Docker.app/Contents/Resources/bin
./vendor/bin/sail build --no-cache

# コンテナの起動
./vendor/bin/sail up -d
```

## 4. フロントエンド環境構築 (Breeze: React + TypeScript) (完了)
```bash
./vendor/bin/sail composer require laravel/breeze --dev
./vendor/bin/sail artisan breeze:install react --typescript --dark --no-interaction
```

## 5. Vite ビルド不具合の解消と正常起動 (完了)
※初期構築時のバージョン不整合を解消し、アセットのビルドを完了させました。

```bash
# package.json の Vite 関連パッケージを安定版 (v5系) に修正
# (AIエージェント経由で修正済み)

# 依存関係のクリーンアップと再インストール
rm -rf node_modules package-lock.json
./vendor/bin/sail npm install

# アセットのビルド (manifest.json の生成)
./vendor/bin/sail npm run build

# データベースの最終初期化
./vendor/bin/sail artisan migrate:fresh --force
```

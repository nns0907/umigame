# ウミガメのスープ (Laravel版)

このプロジェクトは、Laravel 11 + React (Inertia.js) + TypeScript で構築された「ウミガメのスープ」ゲームエンジンです。

## 🚀 開発環境のセットアップ (macOS)

### 前提条件
- Docker Desktop がインストールされ、起動していること。

### 1. 初回起動とビルド
リポジトリをクローンした後、以下の手順で環境を構築します。

```bash
# 環境変数の準備 (必要に応じて .env を編集)
cp .env.example .env

# Docker コンテナの起動 (初回はイメージのビルドが行われます)
# パスが通っていない場合は export PATH=$PATH:/Applications/Docker.app/Contents/Resources/bin
./vendor/bin/sail up -d

# 依存パッケージのインストールとアセットビルド
./vendor/bin/sail npm install
./vendor/bin/sail npm run build

# データベースのマイグレーション
./vendor/bin/sail artisan migrate
```

### 2. ブラウザで確認
ブラウザで以下の URL にアクセスしてください。
- **http://localhost**

---

## 🛠️ 主要な開発コマンド

### コンテナ操作
- **起動**: `./vendor/bin/sail up -d`
- **停止**: `./vendor/bin/sail stop`
- **コンテナ再構築**: `./vendor/bin/sail build --no-cache`

### フロントエンド開発
- **HMR起動 (開発時用)**: `./vendor/bin/sail npm run dev`
- **本番ビルド**: `./vendor/bin/sail npm run build`

### データベース関連
- **マイグレーション実行**: `./vendor/bin/sail artisan migrate`
- **データベースの状態確認**: `./vendor/bin/sail artisan migrate:status`

---

## 📚 ドキュメント
詳細は `docs/` ディレクトリ内のドキュメントを参照してください。
- [移行計画書](docs/migration_plan.md)
- [実行履歴](docs/command_history.md)
- [Docker セットアップ解説](docs/docker_setup.md)
- [コミットメッセージ規約](docs/commit_convention.md)

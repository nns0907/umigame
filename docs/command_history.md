# Migration Command History

プロジェクトのLaravel移行に伴い、実行した主要なコマンドの履歴を記録するファイルです。

## 1. Gitの初期設定と現行コードの保存 (完了)
```bash
git init
git add .
git commit -m "Initial commit and migration spec"
```

## 2. ドキュメント修正のコミットとDocker起動確認 (完了)
```bash
# ドキュメントの修正をコミット
git add docs/
git commit -m "Update plan to use Docker/Sail"

# Docker Desktopを起動し、起動状況を確認する
# (このプロジェクトでLaravelコンテナを立ち上げるために必須です)
open -a Docker
docker info  # エラーが出ずに情報が出力されれば準備完了！
```

## 3. 旧Python環境のクリーンアップとLaravel構築 (完了)
```bash
# Gitに過去のコードは保存されているため、Laravelと混ざらないようPython関連のファイルを削除
# ※ただしデータ移行用に「riddles.db」だけは一時的に残します
git rm -r app.py add_riddle.py sample.py templates/ static/
git commit -m "Remove old Python files before Laravel installation"

# Laravel公式スクリプトを実行してプロジェクトを生成
curl -s "https://laravel.build/tmp_laravel?php=84" | bash
shopt -s dotglob
mv tmp_laravel/* ./
rmdir tmp_laravel
```

## 4. フロントエンド環境構築 (Breeze: React + TypeScript) (実行予定)
```bash
# compose.yamlのPHPバージョンを実際のインストール版(8.4)に修正
# (Laravel公式スクリプトが8.5で生成したが、8.5のDockerイメージは未公開のため)
sed -i '' 's/runtimes\/8.5/runtimes\/8.4/g; s/sail-8.5/sail-8.4/g' compose.yaml

# Sailコンテナをバックグラウンド起動
./vendor/bin/sail up -d

# Laravel Breeze パッケージを開発用としてインストール
./vendor/bin/sail composer require laravel/breeze --dev

# React + Inertia + TypeScript 仕様でフロントエンドの土台を一括生成
# (--dark でダークモード対応を有効化)
./vendor/bin/sail artisan breeze:install react --typescript --dark --no-interaction
```

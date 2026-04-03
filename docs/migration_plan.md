# ウミガメのスープ ゲームエンジン移行仕様書・実装計画 (更新版)

本ドキュメントは、Python (Flask) で実装されている「ウミガメのスープ」ゲームエンジンを、**Laravel** + **React (Inertia.js x TypeScript)** を用いたモダンなWebアプリケーションへ移行するための仕様および実装計画です。

## 1. 目的・背景
既存のシステムは Flask と Jinja2 テンプレートを使用し、ローカルの SQLite と Google Gemini API を連携して動作しています。
これを Laravel と React/TypeScript を用いた堅牢な構成に刷新し、チャットデータ等の永続化、およびTailwind CSSによるリッチでモダンなUI（ウミガメのスープの神秘的なテーマに合わせた表現）を実現します。

## 2. システム構成（変更後）
* **バックエンド:** Laravel 11.x, PHP
* **フロントエンド:** React + Inertia.js + **TypeScript** (保守性・堅牢性向上のため導入)
* **スタイリング:** Tailwind CSS (Laravel公式のBreeze等のScaffoldingと高相性)
* **データベース:** SQLite (開発環境向け。本番運用時はMySQL/PostgreSQLへ移行も容易)
* **データ移行:** 既存の `riddles.db` から初期データをシードバッチ、またはスクリプトで流し込む
* **LLM連携:** Google Gemini API

---

## 3. 機能要件

1. **問題一覧機能 (Index)**
   * テーブル `riddles` からデータを取得し、Reactコンポーネントでリスト表示。
2. **プレイ画面機能 (Play/Show)**
   * 選択した問題の詳細（問題文）と、ユーザーとAIの過去の「チャット履歴」をDBから取得して表示。
3. **ゲームプレイロジック (AI連携)**
   * **質問モード:** ユーザーが「はい」「いいえ」「関係ありません」で答えられる質問を入力し、Geminiに判定させて結果を返す。やり取りをDBに保存。
   * **回答モード:** ユーザーが事件の真相を入力し、Geminiに判定（正解/不正解、一致度、理由など）させる。結果をDBに保存。
   * **クリア状態の保持:** 問題を正解した場合、そのセッション/機能で「クリア済み」として真相を表示し続ける。

---

## 4. データベース設計

### テーブル: `riddles` (問題)
| カラム名 | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | bigint | 主キー |
| `question` | text | 問題文 |
| `answer` | text | 真相・解答 |
| `keywords` | text | AI判定用の重要キーワード（カンマ区切り等） |
| `image_filename` | varchar | 画像ファイル名（null可） |
| `created_at` / `updated_at` | timestamp | Laravelデフォルト |

### テーブル: `game_sessions` (ゲームのセッション管理 / 新規)
> [!NOTE]
> ユーザー登録機能がない前提のため、ブラウザのセッションID等に紐づく形でプレイ状態を管理します。
| カラム名 | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | bigint | 主キー |
| `session_id` | varchar | ユーザーのブラウザセッション識別子 |
| `riddle_id` | bigint | 対象の問題ID |
| `is_cleared` | boolean | 正解済かどうか (デフォルト: false) |
| `created_at` / `updated_at` | timestamp | - |

### テーブル: `chat_histories` (チャット履歴 / 新規)
| カラム名 | 型 | 説明 |
| :--- | :--- | :--- |
| `id` | bigint | 主キー |
| `game_session_id` | bigint | 外部キー (`game_sessions.id`) |
| `user_text` | text | プレイヤーからの送信内容 |
| `ai_response` | text | AIからの返答内容 |
| `type` | string | `question` または `answer` (真相解答) |
| `created_at` / `updated_at` | timestamp | - |

---

## 5. API・ルーティング設計

| メソッド | エンドポイント | コントローラー@アクション | 説明 |
| :--- | :--- | :--- | :--- |
| GET | `/` | `RiddleController@index` | 問題一覧画面（React+Inertia化） |
| GET | `/play/{id}` | `RiddleController@show` | プレイ画面およびチャット履歴表示 |
| POST | `/play/{id}/chat` | `GameController@chat` | 質問・回答の送信。DBの更新とGemini呼び出し |

---

## 6. プロンプト移植とデータ移行
* **プロンプト:** `app.py` 内の `ask_gemini` と `judge_answer` の内容を、Laravel の `app/Services/GeminiService.php` に再実装します。
* **データ移行 (Migrate):** Laravel の Console command (`php artisan app:import-old-riddles`) を作成し、元の `riddles.db` に接続して新DBへデータをコピーする仕組みを作成します。

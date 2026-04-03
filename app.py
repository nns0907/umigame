from flask import Flask, render_template, request, session, redirect, url_for
from dotenv import load_dotenv
import sqlite3
import os
import re
import google.generativeai as genai

load_dotenv()

# ✅ Google Gemini APIキーの設定
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# ✅ Geminiモデルの初期化
model = genai.GenerativeModel("gemini-2.5-flash")

app = Flask(__name__)
app.secret_key = "any-secret-key"  # セッション使用に必要
DB_FILE = "riddles.db"

# -----------------------------
# 一覧表示
# -----------------------------
@app.route("/")
def index():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT id, question, image_filename FROM riddles ORDER BY id DESC")
        riddles = c.fetchall()
    return render_template("riddles.html", riddles=riddles)


# -----------------------------
# 問題画面
# -----------------------------
@app.route("/play/<int:riddle_id>", methods=["GET", "POST"])
def play_riddle(riddle_id):
    # DBから問題取得
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("SELECT question, answer, keywords, image_filename FROM riddles WHERE id = ?", (riddle_id,))
        row = c.fetchone()

    if not row:
        return "指定された問題が見つかりません。", 404

    question, answer, keywords, image_filename = row

    # セッションでチャット履歴管理
    if session.get("riddle_id") != riddle_id:
        session["riddle_id"] = riddle_id
        session["chat_history"] = []

    answer_feedback = ""
    show_answer = False
    game_over = False

    if request.method == "POST":
        mode = request.form.get("mode")

        # 質問モード
        if mode == "question":
            user_question = request.form["user_question"].strip()
            ai_response = ask_gemini(answer, user_question, keywords)
            session["chat_history"].append({
                "user": user_question,
                "ai": ai_response
            })
            session.modified = True

        # 🟣 答え送信モード
        elif mode == "answer":
            user_answer = request.form["user_answer"].strip()
            is_correct, judgement_text = judge_answer(user_answer, answer, question, keywords)

            if is_correct:
                answer_feedback = f"""
                ✅ 正解です！<br>
                <strong>あなたの答え：</strong>{user_answer}<br>
                <strong>正解：</strong>{answer}<br>
                <br>{judgement_text}
                """
                show_answer = True
                game_over = True
            else:
                answer_feedback = f"""
                ❌ 不正解です。<br>
                <strong>あなたの答え：</strong>{user_answer}<br>
                <br>{judgement_text}
                """

    return render_template(
        "index.html",
        riddle_question=question,
        chat_history=session.get("chat_history", []),
        answer_feedback=answer_feedback,
        game_over=game_over,
        show_answer=show_answer,
        correct_answer=answer if show_answer else "",
        image_filename=image_filename
    )

# -----------------------------
# Gemini関連
# -----------------------------
def ask_gemini(riddle_answer, user_question, keywords=None):
    prompt = f"""あなたはウミガメのスープの出題者です。
【問題の真相】{riddle_answer}
【質問】{user_question}
正解判定用の重要キーワード：
「{keywords or '（なし）'}」

答えは「はい」「いいえ」「関係ありません」のいずれかで簡潔に答えてください。
重要キーワードを参考に正しく回答してください。"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"エラー: {str(e)}"

def judge_answer(user_answer, correct_answer, question_text, keywords=None):
    prompt = f"""
あなたはウミガメのスープの出題者です。

出題した問題です。
「{question_text}」

プレイヤーの答えです。
「{user_answer}」

正解（プレイヤーには非公開）です。
「{correct_answer}」

正解判定用の重要キーワード：
「{keywords or "（設定なし）"}」

プレイヤーの答えが正解か判定してください。
重要キーワードが多く含まれている場合は正解に近いと判断してください。
ニュアンスが異なっていてもキーワードが含まれていれば正解として下さい。
判定は「判定：正解」「判定：不正解」として下さい。

出力フォーマット：
フィードバック：1〜2文で書いて下さい。
判定：正解／不正解
何％正解に近いか
フィードバックに正解やヒントを書かないでください。

"""
    try:
        response = model.generate_content(prompt)
        judgement = response.text.strip()
        # 正規表現で「判定: 正解」「判定: 不正解」を抽出
        match = re.search(r"判定[:：]\s*(正解|不正解)", judgement)
        if match:
            result = match.group(1)
            if result == "正解":
                return True, judgement
            else:
                return False, judgement
        else:
            # 判定部分がない場合はFalseで返す
            return False, "⚠ 判定不明: " + judgement
    except Exception as e:
        return False, f"判定エラー: {str(e)}"


# # -----------------------------
# # DB関連関数
# # -----------------------------
# def get_all_riddles():
#     """一覧用: 全問題を取得"""
#     with sqlite3.connect(DB_FILE) as conn:
#         c = conn.cursor()
#         c.execute("SELECT id, question FROM riddles ORDER BY id DESC")
#         return c.fetchall()

# def get_riddle_by_id(riddle_id):
#     """特定の問題を取得"""
#     with sqlite3.connect(DB_FILE) as conn:
#         c = conn.cursor()
#         c.execute("SELECT id, question, answer FROM riddles WHERE id = ?", (riddle_id,))
#         return c.fetchone()

# @app.route("/riddle/<int:riddle_id>", methods=["GET", "POST"])
# def play_riddle(riddle_id):
#     # 問題取得
#     riddle = get_riddle_by_id(riddle_id)
#     if not riddle:
#         return "問題が見つかりません", 404

#     # セッションでチャット履歴を管理
#     if session.get("riddle_id") != riddle_id:
#         session["riddle_id"] = riddle_id
#         session["chat_history"] = []

#     answer_feedback = ""  # 正誤のフィードバック
#     show_answer = False
#     is_correct = None
#     user_answer = ""

#     if request.method == "POST":
#         mode = request.form.get("mode")

#         if mode == "question":
#             user_question = request.form["user_question"]
#             answer = session["riddle"]["answer"]
#             ai_response = ask_gemini(answer, user_question)
#             session["chat_history"].append({
#                 "user": user_question,
#                 "ai": ai_response
#             })
#             session.modified = True

#         elif mode == "answer":
#             user_answer = request.form["user_answer"].strip()
#             correct_answer = session["riddle"]["answer"].strip()
#             question_text = session["riddle"]["question"].strip()
#             is_correct, judgement_text = judge_answer(user_answer, correct_answer, question_text)

#         if is_correct is not None:
#             if is_correct:
#                 answer_feedback = f"""✅ 正解です！お見事！<br>
#                 <strong>あなたの答え：</strong>{user_answer}<br>
#                 <strong>正解：</strong>{correct_answer}<br>
#                 <strong>判定コメント：</strong>{judgement_text}"""
#             else:
#                 answer_feedback = f"""❌ 不正解です。<br>
#                 <strong>あなたの答え：</strong>{user_answer}<br>
#                 <strong>判定コメント：</strong>{judgement_text}"""

#     return render_template("index.html",
#                            riddle_question=session["riddle"]["question"],
#                            chat_history=session.get("chat_history", []),
#                            answer_feedback=answer_feedback,
#                            game_over=show_answer,
#                            show_answer=show_answer,
#                            correct_answer=session["riddle"]["answer"] if show_answer else "")

# @app.route("/reset")
# def reset():
#     session.clear()
#     return redirect(url_for("riddles_list"))

if __name__ == "__main__":
    app.run(debug=True)

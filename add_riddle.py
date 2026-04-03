import sqlite3

DB_FILE = "riddles.db"

def create_table():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS riddles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            keywords TEXT,
            image_filename TEXT
        )
        """)
        conn.commit()

def insert_riddle(question, answer, keywords, image_filename):
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO riddles (question, answer, keywords, image_filename) VALUES (?, ?, ?, ?)",
            (question, answer, keywords)
        )
        conn.commit()
        print(f"登録完了: {question[:30]}...")

def main():
    create_table()
    print("ウミガメのスープお題登録システム\n")

    while True:
        question = input("問題文を入力してください（終了するには空入力でEnter）：\n> ")
        if question.strip() == "":
            print("終了します。")
            break
        answer = input("答えを入力してください：\n> ")
        keywords = input("正解判定用のキーワード（,で区切って下さい）：\n> ")
        image_filename = input("画像ファイル名（例: 33705820_m.jpg、未設定ならEnter）：\n> ").strip()
        image_filename = image_filename if image_filename else None
        insert_riddle(question, answer, keywords)

if __name__ == "__main__":
    main()

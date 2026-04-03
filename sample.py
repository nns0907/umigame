import os
from huggingface_hub import hf_hub_download
from llama_cpp import Llama

# === モデルの設定 ===
filename = "Llama-3-8B-Japanese-Instruct-Q5_K_M.gguf"
repo_id = "second-state/Llama-3-8B-Japanese-Instruct-GGUF"
local_path = os.path.join(".", filename)

# === ダウンロード（キャッシュ確認あり） ===
if os.path.exists(local_path):
    print("モデルファイルは既に存在します:", local_path)
    model_path = local_path
else:
    model_path = hf_hub_download(
        repo_id=repo_id,
        filename=filename,
        local_dir="."
    )
    print("Downloaded model to:", model_path)

# === モデル読み込み（llama-cpp-python） ===
print("=== モデル読み込み開始 ===")
llm = Llama(model_path=model_path, n_ctx=1024)
print("=== モデル読み込み終了 ===")

# === プロンプト ===
prompt = "ユーザー：こんにちは、自己紹介をしてください。\nアシスタント："

# === 応答生成 ===
print("=== 応答生成開始 ===")
output = llm(prompt, max_tokens=50, stop=["ユーザー：", "アシスタント："])
print("=== 応答 ===")
print(output["choices"][0]["text"])

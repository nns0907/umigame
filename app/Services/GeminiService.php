<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    private string $model;
    private ?string $apiKey;
    private ?string $lastError = null;

    public function __construct(?string $model = null, ?string $apiKey = null)
    {
        $this->model = $model ?: (string) config('services.gemini.model', 'gemini-2.0-flash');
        $this->apiKey = $apiKey ?? config('services.gemini.api_key');
    }

    public function lastError(): ?string
    {
        return $this->lastError;
    }

    /**
     * 質問モード: ユーザー質問に対して「はい/いいえ/関係ありません」を判定し、必要なら補足(ヒント)も返す。
     */
    public function answerYesNoIrrelevant(string $riddleQuestion, string $riddleAnswer, string $userQuestion): string
    {
        $prompt = <<<PROMPT
あなたはウミガメのスープのGMです。
次の「問題文」と「真相」を踏まえ、ユーザーの質問に対して、まず最初の行で必ず次の3択のいずれかを返してください。

- はい
- いいえ
- 関係ありません

2行目以降は任意です。ユーザーの推理を助けるための短いヒントを1〜2文まで付けても構いません。
ただし、真相そのものを直接言い当てる内容は避けてください。

【問題文】
{$riddleQuestion}

【真相】
{$riddleAnswer}

【ユーザーの質問】
{$userQuestion}
PROMPT;

        $text = $this->generateText($prompt);
        return trim($text ?? '');
    }

    /**
     * 回答モード: ユーザーの推理が真相に一致するか判定して返す。
     *
     * @return array{reply: string, is_correct: bool}
     */
    public function judgeAnswer(string $riddleQuestion, string $riddleAnswer, string $userAnswer): array
    {
        $prompt = <<<PROMPT
あなたはウミガメのスープのGMです。
ユーザーの「回答」が「真相」と同等かを判定し、次のJSONだけを返してください（前後に説明文を付けない）。

JSON形式:
{"is_correct": true|false, "reply": "ユーザー向けの短い返答（日本語）"}

判定方針:
- 重要要素が揃っていれば正解(true)
- 一部一致でも核心が欠ければ不正解(false)

【問題文】
{$riddleQuestion}

【真相】
{$riddleAnswer}

【ユーザーの回答】
{$userAnswer}
PROMPT;

        $text = $this->generateText($prompt);
        if (! $text) {
            $reason = $this->lastError;
            return [
                'reply' => $reason ? "Geminiに接続できていません（{$reason}）" : 'Geminiに接続できていません',
                'is_correct' => false,
            ];
        }
        $parsed = $this->tryParseJson($text ?? '');

        if (is_array($parsed) && array_key_exists('is_correct', $parsed) && array_key_exists('reply', $parsed)) {
            return [
                'reply' => (string) $parsed['reply'],
                'is_correct' => (bool) $parsed['is_correct'],
            ];
        }

        return [
            'reply' => '判定に失敗しました。もう少し具体的に説明してみてください。',
            'is_correct' => false,
        ];
    }

    private function generateText(string $prompt): ?string
    {
        $this->lastError = null;

        if (! $this->apiKey) {
            $this->lastError = 'GEMINI_API_KEY が設定されていません';
            return null;
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ])->throw();
        } catch (RequestException $e) {
            $status = $e->response?->status();
            $this->lastError = $status ? "HTTP {$status}" : 'リクエストに失敗しました';
            return null;
        }

        $data = $response->json();

        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (! $text) {
            $this->lastError = 'Gemini 応答の解析に失敗しました';
        }
        return $text;
    }

    private function tryParseJson(string $text): mixed
    {
        $trimmed = trim($text);

        // 余計な前後文字列があっても拾えるように、最初の { 〜 最後の } を抽出
        $start = mb_strpos($trimmed, '{');
        $end = mb_strrpos($trimmed, '}');
        if ($start === false || $end === false || $end <= $start) {
            return null;
        }

        $json = mb_substr($trimmed, $start, $end - $start + 1);
        $decoded = json_decode($json, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }
}


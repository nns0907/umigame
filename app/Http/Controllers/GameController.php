<?php

namespace App\Http\Controllers;

use App\Models\ChatHistory;
use App\Models\GameSession;
use App\Models\Riddle;
use App\Services\GeminiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    /**
     * 質問・回答の投稿を受け取り、簡易判定結果を保存する。
     */
    public function chat(int $id, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:question,answer'],
            'text' => ['required', 'string', 'max:1000'],
        ]);

        $riddle = Riddle::findOrFail($id);
        $sessionId = $request->session()->getId();

        // ここでユーザーと問題ごとのゲームセッションを取得または新規作成しています
        $gameSession = GameSession::firstOrCreate(
            [
                'session_id' => $sessionId,
                'riddle_id' => $riddle->id,
            ],
            [
                'is_cleared' => false,
            ]
        );

        $userText = trim($validated['text']);
        $mode = $validated['mode'];
        $isCorrect = false;

        $gemini = app(GeminiService::class);

        if ($mode === 'question') {
            $aiResponse = $gemini->answerYesNoIrrelevant($riddle->question, $riddle->answer, $userText);
            if (! $aiResponse) {
                $reason = $gemini->lastError();
                $aiResponse = $reason
                    ? "Geminiに接続できていません（{$reason}）"
                    : 'Geminiに接続できていません';
            }
        } else {
            $result = $gemini->judgeAnswer($riddle->question, $riddle->answer, $userText);
            $aiResponse = $result['reply'];
            $isCorrect = $result['is_correct'];

            if (! $aiResponse) {
                $reason = $gemini->lastError();
                $aiResponse = $reason
                    ? "Geminiに接続できていません（{$reason}）"
                    : 'Geminiに接続できていません';
            }
        }

        ChatHistory::create([
            'game_session_id' => $gameSession->id,
            'user_text' => $userText,
            'ai_response' => $aiResponse,
            'type' => $mode,
        ]);

        if ($isCorrect && ! $gameSession->is_cleared) {
            $gameSession->is_cleared = true;
            $gameSession->save();
        }

        return redirect()->route('riddles.show', ['id' => $riddle->id]);
    }
}

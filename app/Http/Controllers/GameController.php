<?php

namespace App\Http\Controllers;

use App\Models\ChatHistory;
use App\Models\GameSession;
use App\Models\Riddle;
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

        if ($mode === 'question') {
            $aiResponse = $this->generateQuestionReply($userText);
        } else {
            [$aiResponse, $isCorrect] = $this->judgeAnswer($userText, $riddle->answer);
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

    /**
     * 質問モードの簡易返答（暫定ロジック）。
     */
    private function generateQuestionReply(string $question): string
    {
        if (mb_strpos($question, 'なぜ') !== false || mb_strpos($question, 'どうして') !== false) {
            return '方向性は良いです。事実関係をもう少し具体的に絞って質問してみてください。';
        }

        if (mb_strpos($question, '犯人') !== false) {
            return '現時点では「関係ありません」。まず状況の前提を確認すると真相に近づけます。';
        }

        return 'はい/いいえで答えられる形にすると判定しやすくなります。';
    }

    /**
     * 回答モードの簡易正誤判定（暫定ロジック）。
     */
    private function judgeAnswer(string $input, string $answer): array
    {
        $normalizedInput = mb_strtolower($input);
        $normalizedAnswer = mb_strtolower($answer);
        $isCorrect = mb_strpos($normalizedAnswer, $normalizedInput) !== false;

        if ($isCorrect) {
            return ['正解です。真相に到達しました。', true];
        }

        return ['不正解です。核心に触れていますが、まだ重要な要素が不足しています。', false];
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Models\Riddle;
use Inertia\Inertia;

/**
 * 問題に関する処理を管理するコントローラ
 */
class RiddleController extends Controller
{
    /**
     * 問題一覧画面を表示する
     *
     * @return \Inertia\Response
     */
    public function index(): \Inertia\Response
    {
        $riddles = Riddle::all();

        return Inertia::render('Riddles/Index', [
            'riddles' => $riddles,
        ]);
    }

    /**
     * 指定された問題のプレイ画面を表示する
     *
     * @param int $id 問題ID
     * @return \Inertia\Response
     */
    public function show(int $id): \Inertia\Response
    {
        $riddle = Riddle::findOrFail($id);
        $sessionId = session()->getId();

        $gameSession = GameSession::firstOrCreate(
            [
                'session_id' => $sessionId,
                'riddle_id' => $riddle->id,
            ],
            [
                'is_cleared' => false,
            ]
        );

        $chatHistories = $gameSession
            ->chatHistories()
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Riddles/Show', [
            'riddle' => $riddle,
            'chatHistories' => $chatHistories,
            'isCleared' => (bool) $gameSession->is_cleared,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
        $riddles = \App\Models\Riddle::all();

        return Inertia::render('Riddles/Index', [
            'riddles' => $riddles,
        ]);
    }

    /**
     * 指定された問題のプレイ画面を表示する（未実装）
     *
     * @param int $id 問題ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show(int $id): \Illuminate\Http\RedirectResponse
    {
        // 個別画面のロジックは後ほど実装
        return redirect()->route('riddles.index');
    }
}

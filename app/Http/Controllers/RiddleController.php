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
     * 指定された問題のプレイ画面を表示する
     *
     * @param int $id 問題ID
     * @return \Inertia\Response
     */
    public function show(int $id): \Inertia\Response
    {
        $riddle = \App\Models\Riddle::findOrFail($id);

        return Inertia::render('Riddles/Show', [
            'riddle' => $riddle,
        ]);
    }
}

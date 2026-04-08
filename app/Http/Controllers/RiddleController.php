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
        // 暫定的なダミーデータ
        $riddles = [
            [
                'id' => 1,
                'question' => '男は「チョコレートが7個しか入っていない」と言って困りました。一体なぜ？',
                'answer' => 'バレンタインデーに下駄箱の中身がチョコレートでいっぱいで、自分の上履きが入るスペースがなくなっていたから。',
                'image_filename' => null,
            ],
            [
                'id' => 2,
                'question' => 'ウミガメのスープを飲んだ男が自殺しました。一体なぜ？',
                'answer' => 'かつて遭難した際に食べた「ウミガメのスープ」が、実は仲間の肉だったことを悟ったから。',
                'image_filename' => null,
            ],
            [
                'id' => 3,
                'question' => 'レストランで男が「水」を注文しましたが、店員は銃を突きつけました。男は「ありがとう」と言って帰りました。一体なぜ？',
                'answer' => '男はしゃっくりを止めたくて水を頼んだが、店員が銃で驚かせてくれたことでしゃっくりが止まったから。',
                'image_filename' => null,
            ],
        ];

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

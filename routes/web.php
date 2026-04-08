<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RiddleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 問題一覧画面
Route::get('/', [RiddleController::class, 'index'])->name('riddles.index');

// 個別問題のプレイ画面 (ID指定)
Route::get('/play/{id}', [RiddleController::class, 'show'])->name('riddles.show');

// ダッシュボード (認証時のみアクセス可能)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// プロフィール関連 (認証時のみアクセス可能)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

import React from 'react';
import UmigameLayout from '@/Layouts/UmigameLayout';
import { Head, Link, useForm } from '@inertiajs/react';

interface Riddle {
    id: number;
    question: string;
    answer: string;
    image_filename: string | null;
}

interface Props {
    riddle: Riddle;
    chatHistories: ChatHistory[];
    isCleared: boolean;
}

interface ChatHistory {
    id: number;
    user_text: string;
    ai_response: string;
    type: 'question' | 'answer';
    created_at: string;
}

export default function Show({ riddle, chatHistories, isCleared }: Props) {
    const questionForm = useForm({
        mode: 'question',
        text: '',
    });

    const answerForm = useForm({
        mode: 'answer',
        text: '',
    });

    const submitQuestion = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        questionForm.post(route('riddles.chat', { id: riddle.id }), {
            preserveScroll: true,
            onSuccess: () => questionForm.reset('text'),
        });
    };

    const submitAnswer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        answerForm.post(route('riddles.chat', { id: riddle.id }), {
            preserveScroll: true,
            onSuccess: () => answerForm.reset('text'),
        });
    };

    return (
        <UmigameLayout>
            <Head title={`Case #${String(riddle.id).padStart(2, '0')}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* 戻るボタン */}
                <Link
                    href={route('riddles.index')}
                    className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    問題一覧に戻る
                </Link>

                {/* 問題カード */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-8 md:p-12 shadow-2xl backdrop-blur-sm">
                    {/* 背景のデザイン要素 */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs font-mono">
                                Case #{String(riddle.id).padStart(2, '0')}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 leading-relaxed tracking-tight">
                            {riddle.question}
                        </h2>
                    </div>
                </div>

                {isCleared && (
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 space-y-3">
                        <p className="text-emerald-300 font-semibold">クリア済みです。真相を表示します。</p>
                        <p className="text-slate-100 leading-relaxed">{riddle.answer}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-100">会話履歴</h3>

                    {chatHistories.length === 0 ? (
                        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-400">
                            まだ履歴がありません。下のフォームから最初の質問を送ってみましょう。
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-4 md:p-6 space-y-4">
                            {chatHistories.map((history) => (
                                <div key={history.id} className="space-y-2">
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] md:max-w-[75%]">
                                            <p className="text-xs text-slate-400 mb-1 text-right">あなた</p>
                                            <div className="rounded-2xl rounded-br-md bg-teal-500 text-slate-900 px-4 py-3 shadow">
                                                <p className="leading-relaxed whitespace-pre-wrap break-words">{history.user_text}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] md:max-w-[75%]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-xs text-slate-400">GM</p>
                                                <span className="px-2 py-0.5 rounded border border-slate-600 text-[10px] text-slate-300">
                                                    {history.type === 'question' ? '質問への返答' : '回答判定'}
                                                </span>
                                            </div>
                                            <div className="rounded-2xl rounded-bl-md bg-slate-800 text-slate-100 px-4 py-3 border border-slate-700 shadow">
                                                <p className="leading-relaxed whitespace-pre-wrap break-words">{history.ai_response}</p>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1">
                                                {new Date(history.created_at).toLocaleTimeString('ja-JP', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form onSubmit={submitQuestion} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
                        <h3 className="text-base font-semibold text-slate-100">GMに質問する</h3>
                        <p className="text-sm text-slate-400">「はい / いいえ」で答えられる質問が効果的です。</p>
                        <textarea
                            value={questionForm.data.text}
                            onChange={(e) => questionForm.setData('text', e.target.value)}
                            className="w-full min-h-28 rounded-lg border border-slate-700 bg-slate-950/60 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="例: 被害者は事故で亡くなりましたか？"
                            disabled={questionForm.processing}
                        />
                        {questionForm.errors.text && <p className="text-sm text-rose-400">{questionForm.errors.text}</p>}
                        <button
                            type="submit"
                            disabled={questionForm.processing}
                            className="w-full rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-semibold py-2 transition-colors"
                        >
                            {questionForm.processing ? '送信中...' : '質問を送信'}
                        </button>
                    </form>

                    <form onSubmit={submitAnswer} className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
                        <h3 className="text-base font-semibold text-slate-100">真相を答える</h3>
                        <p className="text-sm text-slate-400">推理が固まったら、真相を文章で入力してください。</p>
                        <textarea
                            value={answerForm.data.text}
                            onChange={(e) => answerForm.setData('text', e.target.value)}
                            className="w-full min-h-28 rounded-lg border border-slate-700 bg-slate-950/60 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="例: 男は保険金目的で..."
                            disabled={answerForm.processing || isCleared}
                        />
                        {answerForm.errors.text && <p className="text-sm text-rose-400">{answerForm.errors.text}</p>}
                        <button
                            type="submit"
                            disabled={answerForm.processing || isCleared}
                            className="w-full rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-semibold py-2 transition-colors"
                        >
                            {isCleared ? 'クリア済み' : answerForm.processing ? '判定中...' : '回答を判定'}
                        </button>
                    </form>
                </div>
            </div>
        </UmigameLayout>
    );
}

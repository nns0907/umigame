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
    const chatEndRef = React.useRef<HTMLDivElement | null>(null);
    const playForm = useForm({
        mode: 'question' as 'question' | 'answer',
        text: '',
    });

    const submitPlay = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        playForm.post(route('riddles.chat', { id: riddle.id }), {
            preserveScroll: true,
            onSuccess: () => playForm.reset('text'),
        });
    };

    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [chatHistories.length]);

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
                    <h3 className="text-lg font-semibold text-slate-100">チャット</h3>
                    <div className="rounded-2xl border border-emerald-400/40 bg-[#111827] overflow-hidden h-[80vh] min-h-[30rem] max-h-[58rem] flex flex-col">
                        <div className="p-4 md:p-5 flex-1 overflow-y-auto space-y-3">
                            {chatHistories.length === 0 ? (
                                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-400">
                                    まだ履歴がありません。下の入力欄から最初のメッセージを送ってみましょう。
                                </div>
                            ) : (
                                chatHistories.map((history) => (
                                    <div key={history.id} className="space-y-1.5">
                                        <div className="flex justify-end">
                                            <div className="max-w-[85%] md:max-w-[75%]">
                                                <p className="text-xs text-slate-400 mb-1 text-right">あなた</p>
                                                <div className="rounded-2xl rounded-br-md px-3.5 py-2.5 shadow bg-[#22c55e] text-slate-900">
                                                    <p className="leading-relaxed whitespace-pre-wrap break-words">{history.user_text}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] md:max-w-[75%]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-xs text-slate-400">GM</p>
                                                    <span className="px-2 py-0.5 rounded text-[10px] border border-emerald-300/40 text-emerald-200">
                                                        {history.type === 'question' ? '質問への返答' : '回答判定'}
                                                    </span>
                                                </div>
                                                <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 border shadow bg-white text-slate-900 border-slate-200">
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
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={submitPlay} className="border-t border-slate-700/80 bg-slate-900/70 p-4 md:p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="inline-flex rounded-lg border border-slate-700 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => playForm.setData('mode', 'question')}
                                        disabled={playForm.processing}
                                        className={`px-3 py-1 text-sm transition-colors ${
                                            playForm.data.mode === 'question'
                                                ? 'bg-teal-500 text-slate-900 font-semibold'
                                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        質問する
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => playForm.setData('mode', 'answer')}
                                        disabled={playForm.processing}
                                        className={`px-3 py-1 text-sm transition-colors ${
                                            playForm.data.mode === 'answer'
                                                ? 'bg-amber-400 text-slate-900 font-semibold'
                                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        回答する
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={playForm.processing || (isCleared && playForm.data.mode === 'answer')}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-sm font-bold text-slate-900 shadow-md transition-all active:translate-y-[1px] active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                        playForm.data.mode === 'question'
                                            ? 'bg-teal-500 border-teal-300 hover:bg-teal-400'
                                            : 'bg-amber-400 border-amber-200 hover:bg-amber-300'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3.105 3.105a1 1 0 011.092-.217l11 4a1 1 0 010 1.874l-11 4A1 1 0 013 11.818V8.46a1 1 0 01.684-.949L10.8 6 3.684 4.409A1 1 0 013 3.46V3.105z" />
                                    </svg>
                                    {isCleared && playForm.data.mode === 'answer'
                                        ? 'クリア済み'
                                        : playForm.processing
                                          ? playForm.data.mode === 'question'
                                              ? '送信中...'
                                              : '判定中...'
                                          : '送信'}
                                </button>
                            </div>
                            <textarea
                                value={playForm.data.text}
                                onChange={(e) => playForm.setData('text', e.target.value)}
                                className="w-full min-h-20 rounded-lg border border-slate-700 bg-slate-950/60 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder={
                                    playForm.data.mode === 'question'
                                        ? '「はい / いいえ」で答えられる質問が効果的です。 例: 被害者は事故で亡くなりましたか？'
                                        : '推理が固まったら、真相を文章で入力してください。 例: 男は保険金目的で...'
                                }
                                disabled={playForm.processing || (isCleared && playForm.data.mode === 'answer')}
                            />
                            {playForm.errors.text && <p className="text-sm text-rose-400">{playForm.errors.text}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </UmigameLayout>
    );
}

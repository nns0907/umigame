import React from 'react';
import UmigameLayout from '@/Layouts/UmigameLayout';
import { Head, useForm } from '@inertiajs/react';

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
    const [showQuestion, setShowQuestion] = React.useState(true);
    const playForm = useForm({
        mode: 'question' as 'question' | 'answer',
        text: '',
    });

    const submitPlay = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (playForm.processing || (isCleared && playForm.data.mode === 'answer')) return;

        playForm.post(route('riddles.chat', { id: riddle.id }), {
            preserveScroll: true,
            onSuccess: () => playForm.reset('text'),
        });
    };

    React.useEffect(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }, [chatHistories.length]);

    React.useLayoutEffect(() => {
        const scrollToPageBottom = () => {
            window.scrollTo({ top: document.documentElement.scrollHeight });
        };

        const id = requestAnimationFrame(scrollToPageBottom);
        const timeoutId = window.setTimeout(scrollToPageBottom, 120);

        return () => {
            cancelAnimationFrame(id);
            window.clearTimeout(timeoutId);
        };
    }, []);

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    return (
        <UmigameLayout>
            <Head title={`Case #${String(riddle.id).padStart(2, '0')}`} />

            <div className="max-w-4xl mx-auto -mt-8 relative">
                <div className="rounded-2xl bg-[#111827] relative">
                    <div className="sticky top-16 z-[5]">
                        <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur px-4 py-2 md:px-5 space-y-1 rounded-t-2xl">
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setShowQuestion((prev) => !prev)}
                                className="flex-1 min-w-0 text-left group"
                                aria-expanded={showQuestion}
                                aria-label="問題文の表示切り替え"
                            >
                                <p className="text-slate-500 text-xs font-mono flex items-center gap-2 min-w-0">
                                    <span className="shrink-0">Case #{String(riddle.id).padStart(2, '0')} |</span>
                                    <span className="min-w-0 flex-1 truncate">{riddle.question}</span>
                                    <span className="shrink-0 text-[10px] text-teal-300/90">
                                        {showQuestion ? '閉じる' : '開く'}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-3.5 w-3.5 text-slate-400 group-hover:text-slate-200 transition-transform ${
                                            showQuestion ? 'rotate-180' : ''
                                        }`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </p>
                                {showQuestion && (
                                    <h2 className="text-base md:text-lg font-semibold text-slate-100 leading-relaxed">
                                        {riddle.question}
                                    </h2>
                                )}
                            </button>
                        </div>
                        </div>
                    </div>

                    {isCleared && (
                        <div className="bg-emerald-500/10 px-4 py-3 md:px-5">
                            <p className="text-emerald-300 font-semibold text-sm">クリア済みです。真相を表示します。</p>
                            <p className="text-slate-100 leading-relaxed text-sm mt-1">{riddle.answer}</p>
                        </div>
                    )}

                    <div className="p-4 md:p-5 space-y-3 pb-56">
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

                </div>

            </div>
            <form onSubmit={submitPlay} className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/85 backdrop-blur border-t border-slate-700/70 px-4">
                <div className="max-w-4xl mx-auto p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex rounded-md overflow-hidden">
                            <button
                                type="button"
                                onClick={() => playForm.setData('mode', 'question')}
                                disabled={playForm.processing}
                                className={`px-2.5 py-1 text-xs transition-colors ${
                                    playForm.data.mode === 'question'
                                        ? 'bg-teal-500 text-slate-900 font-semibold'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                質問する
                            </button>
                            <button
                                type="button"
                                onClick={() => playForm.setData('mode', 'answer')}
                                disabled={playForm.processing}
                                className={`px-2.5 py-1 text-xs transition-colors ${
                                    playForm.data.mode === 'answer'
                                        ? 'bg-amber-400 text-slate-900 font-semibold'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                回答する
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                disabled={playForm.processing || (isCleared && playForm.data.mode === 'answer')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-bold text-slate-900 shadow-md transition-all active:translate-y-[1px] active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                    playForm.data.mode === 'question'
                                        ? 'bg-teal-500 hover:bg-teal-400'
                                        : 'bg-amber-400 hover:bg-amber-300'
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
                    </div>
                    <textarea
                        rows={1}
                        value={playForm.data.text}
                        onChange={(e) => playForm.setData('text', e.target.value)}
                        className="w-full min-h-[2.5rem] rounded-lg bg-slate-950/60 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={
                            playForm.data.mode === 'question'
                                ? '「はい / いいえ」で答えられる質問が効果的です。 例: 被害者は事故で亡くなりましたか？'
                                : '推理が固まったら、真相を文章で入力してください。 例: 男は保険金目的で...'
                        }
                        disabled={playForm.processing || (isCleared && playForm.data.mode === 'answer')}
                    />
                    {playForm.errors.text && <p className="text-sm text-rose-400">{playForm.errors.text}</p>}
                </div>
            </form>
            <button
                type="button"
                onClick={scrollToBottom}
                className="fixed bottom-28 md:bottom-32 right-6 h-10 w-10 rounded-lg bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors shadow-lg z-30"
                title="一番下へ移動"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>
        </UmigameLayout>
    );
}

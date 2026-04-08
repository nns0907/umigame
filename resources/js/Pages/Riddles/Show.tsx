import React from 'react';
import UmigameLayout from '@/Layouts/UmigameLayout';
import { Head, Link } from '@inertiajs/react';

interface Riddle {
    id: number;
    question: string;
    answer: string;
    image_filename: string | null;
}

interface Props {
    riddle: Riddle;
}

export default function Show({ riddle }: Props) {
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

                {/* 操作エリア（プレースホルダ） */}
                <div className="grid grid-cols-1 gap-8 opacity-50 pointer-events-none select-none">
                    <div className="p-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 text-center">
                        <p className="text-slate-500 font-medium">
                            AIへの質問・真相の入力機能は次のステップで実装されます
                        </p>
                    </div>
                </div>
            </div>
        </UmigameLayout>
    );
}

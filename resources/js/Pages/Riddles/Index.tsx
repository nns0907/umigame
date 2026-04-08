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
    riddles: Riddle[];
}

export default function Index({ riddles }: Props) {
    return (
        <UmigameLayout>
            <Head title="問題一覧" />

            <section className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-slate-100 uppercase tracking-tighter">
                         問題一覧
                    </h1>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                        解き明かされるのを待つ、数々の不可解な事件。
                        真相にたどり着くには、核心を突く「問い」が必要です。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {riddles.map((riddle) => (
                        <Link
                            key={riddle.id}
                            href={route('riddles.show', { id: riddle.id })}
                            className="group block p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-teal-500/50 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex flex-col h-full space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold px-2 py-1 bg-teal-500/10 text-teal-400 rounded border border-teal-500/20 uppercase tracking-widest">
                                        Case #{String(riddle.id).padStart(2, '0')}
                                    </span>
                                </div>
                                <p className="text-slate-300 line-clamp-3 leading-relaxed group-hover:text-slate-100 transition-colors">
                                    {riddle.question}
                                </p>
                                <div className="mt-auto pt-4 flex items-center text-teal-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    挑戦する
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </UmigameLayout>
    );
}

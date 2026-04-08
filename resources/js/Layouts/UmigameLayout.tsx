import React, { PropsWithChildren } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function UmigameLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
            <Head>
                <title>ウミガメのスープ - Umigame Engine</title>
                <meta name="description" content="AIと遊ぶシチュエーションパズル「ウミガメのスープ」" />
            </Head>

            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-wider text-teal-400 hover:text-teal-300 transition-colors">
                        UMIGAME
                    </Link>
                    <nav className="flex gap-6">
                        <Link href="/" className="text-sm font-medium hover:text-teal-300 transition-colors">
                            問題一覧
                        </Link>
                        {/* 将来的なメニュー用 */}
                    </nav>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="mt-auto border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Umigame Engine Project
            </footer>
        </div>
    );
}

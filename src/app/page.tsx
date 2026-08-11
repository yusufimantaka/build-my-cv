"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const principles = [
    {
        icon: "mdi:harddisk",
        title: "Local-first",
        text: "Semua data tersimpan di IndexedDB browser. Tanpa server, tanpa database, tanpa akun. CV kamu tetap di perangkatmu.",
    },
    {
        icon: "mdi:code-braces",
        title: "Arsitektur bersih",
        text: "UI berbicara lewat interface repository, bukan langsung ke penyimpanan. Ganti IndexedDB dengan backend cloud tanpa menyentuh UI.",
    },
    {
        icon: "mdi:github",
        title: "Open source",
        text: "Repo publik. Baca kodenya, belajar darinya, fork, atau kirim pull request.",
    },
];

const roadmap = [
    { icon: "mdi:cloud-outline", title: "Sinkronisasi cloud berbayar", text: "Akun dan sinkronisasi opsional. Inti local-first gratis tetap gratis selamanya." },
    { icon: "mdi:robot-outline", title: "AI chat (BYOK)", text: "Bawa kunci API sendiri untuk bantuan AI menulis bagian CV." },
    { icon: "mdi:compass-outline", title: "Explore", text: "Referensi CV dari berbagai bidang dan jurusan." },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll(): void {
            setScrolled(window.scrollY > 8);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <main className="min-h-screen bg-app font-sans text-ink">
            {/* Nav: transparan di atas, solid setelah scroll */}
            <nav
                className={
                    "sticky top-0 z-50 flex items-center justify-between px-6 py-2 transition-all duration-300 " +
                    (scrolled
                        ? "border-b border-hair bg-panel/95 backdrop-blur"
                        : "border-b border-transparent bg-transparent")
                }
            >
                <Link href="/" className="text-sm font-semibold text-ink hover:underline">
                    BuildMyCV
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href="/app"
                        className="flex items-center gap-2 rounded-none px-3 py-1.5 text-sm text-ink transition-colors hover:bg-panel2"
                    >
                        Coba aplikasi
                    </Link>
                    <a
                        href="https://github.com/yusufimantaka/build-my-cv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-none bg-[#171717] px-3 py-1.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
                    >
                        <iconify-icon icon="mdi:github" width="15" height="15" />
                        GitHub
                    </a>
                </div>
            </nav>

            {/* Hero dengan lanskap lembut di belakang produk */}
            {/* Background menjulur ke atas menutupi belakang nav, konten tetap di tempat */}
            <section className="relative isolate bg-app px-6 pb-0 pt-12 text-center sm:pt-16">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-14 bottom-0 -z-20 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/hero-sky.jpg')" }}
                />
                <div className="pointer-events-none absolute inset-x-0 -top-14 bottom-0 -z-10 bg-gradient-to-b from-[#f7f7f5]/95 via-[#f7f7f5]/72 to-[#f7f7f5]/15" />
                <div className="relative mx-auto max-w-4xl">
                    <span className="inline-flex animate-fade-up items-center gap-2 rounded-none border border-ink/20 bg-panel/75 px-3 py-1 text-xs font-medium tracking-[0.16em] text-ink backdrop-blur">
                        <span className="h-2 w-2 rounded-none bg-[#2383E2]" />
                        LOCAL-FIRST · OPEN SOURCE
                    </span>
                    <h1 className="mx-auto mt-4 max-w-4xl animate-fade-up text-3xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
                        CV yang terlihat seperti
                        <span className="block text-ink">kamu yang terbaik.</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl animate-fade-up text-sm leading-6 text-muted sm:text-base" style={{ animationDelay: "160ms" }}>
                        Buat CV dari blok yang bisa kamu susun sendiri. Simpan di browser,
                        pilih template, lalu export ke PDF tanpa membuat akun.
                    </p>
                    <div className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-3" style={{ animationDelay: "240ms" }}>
                        <Link
                            href="/app"
                            className="rounded-none bg-[#37352F] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:bg-ink/85 hover:scale-[1.03] active:scale-95"
                        >
                            Mulai buat CV <span aria-hidden="true">→</span>
                        </Link>
                        <a
                            href="https://github.com/yusufimantaka/build-my-cv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-none border border-hair bg-panel/80 px-5 py-2.5 text-sm font-medium backdrop-blur transition-transform hover:bg-panel hover:scale-[1.03] active:scale-95"
                        >
                            <iconify-icon icon="mdi:github" width="16" height="16" />
                            Lihat di GitHub
                        </a>
                    </div>
                </div>

                {/* Product screenshot mockup */}
                <div className="relative mx-auto mt-10 max-w-6xl animate-fade-up translate-y-1 overflow-hidden rounded-none-2xl border border-hair bg-panel text-left shadow-[0_18px_60px_rgba(63,99,130,0.22)]" style={{ animationDelay: "320ms" }}>
                    <div className="flex h-10 items-center gap-1.5 border-b border-hair bg-panel px-4">
                        <span className="h-2.5 w-2.5 rounded-none bg-[#d9d2c3]" />
                        <span className="h-2.5 w-2.5 rounded-none bg-[#d9d2c3]" />
                        <span className="h-2.5 w-2.5 rounded-none bg-[#d9d2c3]" />
                        <span className="ml-3 font-mono text-[10px] tracking-wide text-muted">buildmycv.app / editor</span>
                    </div>
                    <div className="grid min-h-[300px] grid-cols-[150px_1fr_190px] bg-app sm:grid-cols-[190px_1fr_260px]">
                        <div className="border-r border-hair bg-panel p-4">
                            <div className="h-2 w-20 rounded bg-[#37352F]/60" />
                            <div className="mt-6 space-y-3">
                                <div className="h-8 rounded-none bg-ink/10" />
                                <div className="h-8 rounded-none bg-panel2" />
                                <div className="h-8 rounded-none bg-panel2" />
                                <div className="h-8 rounded-none bg-panel2" />
                            </div>
                        </div>
                        <div className="flex justify-center p-6 sm:p-10">
                            <div className="w-full max-w-[390px] bg-white p-7 shadow-md sm:p-9">
                                <div className="h-4 w-40 rounded bg-[#171717]/80" />
                                <div className="mt-2 h-2 w-28 rounded bg-[#2383E2]/70" />
                                <div className="mt-7 h-2 w-24 rounded bg-[#37352F]/60" />
                                <div className="mt-3 h-2 w-full rounded bg-[#e4ddcd]" />
                                <div className="mt-2 h-2 w-11/12 rounded bg-[#e4ddcd]" />
                                <div className="mt-7 h-2 w-28 rounded bg-[#37352F]/60" />
                                <div className="mt-3 h-2 w-full rounded bg-[#e4ddcd]" />
                                <div className="mt-2 h-2 w-4/5 rounded bg-[#e4ddcd]" />
                                <div className="mt-7 flex flex-wrap gap-2"><span className="h-5 w-16 rounded-none bg-[#2383E2]/30" /><span className="h-5 w-20 rounded-none bg-[#2383E2]/30" /><span className="h-5 w-14 rounded-none bg-[#2383E2]/30" /></div>
                            </div>
                        </div>
                        <div className="border-l border-hair bg-panel p-4">
                            <div className="h-2 w-20 rounded bg-[#37352F]/60" />
                            <div className="mt-5 space-y-3"><div className="h-7 rounded bg-panel2" /><div className="h-7 rounded bg-panel2" /><div className="h-7 rounded bg-panel2" /></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Principles */}
            <section className="mx-auto mt-20 max-w-5xl px-6 pb-16 sm:mt-28">
                <h2 className="text-center text-2xl font-semibold">Kenapa local-first</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    {principles.map((p, idx) => (
                        <div key={p.title} className="animate-fade-up rounded-none border border-hair bg-panel p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md" style={{ animationDelay: `${idx * 90}ms` }}>
                            <iconify-icon icon={p.icon} width="24" height="24" className="text-ink" />
                            <h3 className="mt-3 font-semibold">{p.title}</h3>
                            <p className="mt-1 text-sm text-muted">{p.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Architecture */}
            <section className="mx-auto max-w-4xl px-6 pb-16">
                <h2 className="text-center text-2xl font-semibold">Arsitektur bersih</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
                    UI tidak pernah menyentuh penyimpanan langsung. Semua lewat interface repository,
                    jadi backend bisa berubah tanpa menyentuh UI.
                </p>
                <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "120ms" }}>
                    {["UI (React)", "→", "WorkspaceRepository", "→", "IndexedDB"].map((step, i) => (
                        <span
                            key={i}
                            className={
                                step === "→"
                                    ? "text-ink"
                                    : "rounded-none border border-hair bg-panel px-4 py-2 font-mono text-sm shadow-sm"
                            }
                        >
                            {step}
                        </span>
                    ))}
                </div>
                <p className="mt-4 text-center font-mono text-xs text-muted">
                    src/domain/repository.ts · indexed-db-repository.ts · in-memory-repository.ts
                </p>
            </section>

            {/* Roadmap */}
            <section className="mx-auto max-w-5xl px-6 pb-16">
                <h2 className="text-center text-2xl font-semibold">Roadmap</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    {roadmap.map((r, idx) => (
                        <div key={r.title} className="animate-fade-up rounded-none border border-hair bg-panel p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md" style={{ animationDelay: `${idx * 90}ms` }}>
                            <iconify-icon icon={r.icon} width="24" height="24" className="text-ink" />
                            <h3 className="mt-3 font-semibold">{r.title}</h3>
                            <p className="mt-1 text-sm text-muted">{r.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contribute */}
            <section className="border-t border-hair bg-panel">
                <div className="mx-auto max-w-3xl animate-fade-up px-6 py-14 text-center">
                    <iconify-icon icon="mdi:code-tags" width="36" height="36" className="text-ink" />
                    <h2 className="mt-3 text-2xl font-semibold">Berkontribusi</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
                        Ide, laporan bug, template baru, dan pull request diterima.
                        Repo ini punya AGENTS.md berisi panduan lengkap proyek untuk kontributor AI maupun manusia.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <a
                            href="https://github.com/yusufimantaka/build-my-cv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-none bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
                        >
                            <iconify-icon icon="mdi:star-outline" width="16" height="16" />
                            Bintang repo ini
                        </a>
                        <Link
                            href="/app"
                            className="rounded-none bg-[#37352F] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:bg-ink/85 hover:scale-[1.03] active:scale-95"
                        >
                            Coba aplikasi
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-hair px-6 py-6 text-center text-xs text-muted">
                BuildMyCV — local-first, open source. Dibuat dengan Next.js, React, dan TypeScript.
            </footer>
        </main>
    );
}

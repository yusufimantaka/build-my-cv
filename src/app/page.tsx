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
        <main className="min-h-screen bg-[#f6f3ed] font-sans text-[#171717]">
            {/* Nav: transparan di atas, solid setelah scroll */}
            <nav
                className={
                    "sticky top-0 z-50 flex items-center justify-between px-6 py-2 transition-all duration-300 " +
                    (scrolled
                        ? "border-b border-[#171717]/10 bg-white/95 backdrop-blur"
                        : "border-b border-transparent bg-transparent")
                }
            >
                <Link href="/" className="text-sm font-semibold text-[#3f6382] hover:underline">
                    BuildMyCV
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href="/app"
                        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-[#171717] transition-colors hover:bg-[#f0ece3]"
                    >
                        Coba aplikasi
                    </Link>
                    <a
                        href="https://github.com/yusufimantaka/build-my-cv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md bg-[#171717] px-3 py-1.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
                    >
                        <iconify-icon icon="mdi:github" width="15" height="15" />
                        GitHub
                    </a>
                </div>
            </nav>

            {/* Hero dengan lanskap lembut di belakang produk */}
            {/* Background menjulur ke atas menutupi belakang nav, konten tetap di tempat */}
            <section className="relative isolate bg-[#f6f3ed] px-6 pb-0 pt-12 text-center sm:pt-16">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-14 bottom-0 -z-20 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/hero-sky.jpg')" }}
                />
                <div className="pointer-events-none absolute inset-x-0 -top-14 bottom-0 -z-10 bg-gradient-to-b from-[#f6f3ed]/95 via-[#f6f3ed]/72 to-[#f6f3ed]/15" />
                <div className="relative mx-auto max-w-4xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#3f6382]/20 bg-white/75 px-3 py-1 text-xs font-medium tracking-[0.16em] text-[#3f6382] backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-[#7895b2]" />
                        LOCAL-FIRST · OPEN SOURCE
                    </span>
                    <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                        CV yang terlihat seperti
                        <span className="block text-[#3f6382]">kamu yang terbaik.</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#4c5963] sm:text-base">
                        Buat CV dari blok yang bisa kamu susun sendiri. Simpan di browser,
                        pilih template, lalu export ke PDF tanpa membuat akun.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/app"
                            className="rounded-md bg-[#3f6382] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:bg-[#355573] hover:scale-[1.03] active:scale-95"
                        >
                            Mulai buat CV <span aria-hidden="true">→</span>
                        </Link>
                        <a
                            href="https://github.com/yusufimantaka/build-my-cv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md border border-[#171717]/20 bg-white/80 px-5 py-2.5 text-sm font-medium backdrop-blur transition-transform hover:bg-white hover:scale-[1.03] active:scale-95"
                        >
                            <iconify-icon icon="mdi:github" width="16" height="16" />
                            Lihat di GitHub
                        </a>
                    </div>
                </div>

                {/* Product screenshot mockup */}
                <div className="relative mx-auto mt-10 max-w-6xl translate-y-1 overflow-hidden rounded-t-2xl border border-[#171717]/15 bg-white text-left shadow-[0_18px_60px_rgba(63,99,130,0.22)]">
                    <div className="flex h-10 items-center gap-1.5 border-b border-[#171717]/10 bg-white px-4">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#d9d2c3]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#d9d2c3]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#d9d2c3]" />
                        <span className="ml-3 font-mono text-[10px] tracking-wide text-[#8a8578]">buildmycv.app / editor</span>
                    </div>
                    <div className="grid min-h-[300px] grid-cols-[150px_1fr_190px] bg-[#f6f3ed] sm:grid-cols-[190px_1fr_260px]">
                        <div className="border-r border-[#171717]/10 bg-white p-4">
                            <div className="h-2 w-20 rounded bg-[#3f6382]/60" />
                            <div className="mt-6 space-y-3">
                                <div className="h-8 rounded-full bg-[#3f6382]/10" />
                                <div className="h-8 rounded-full bg-[#f0ece3]" />
                                <div className="h-8 rounded-full bg-[#f0ece3]" />
                                <div className="h-8 rounded-full bg-[#f0ece3]" />
                            </div>
                        </div>
                        <div className="flex justify-center p-6 sm:p-10">
                            <div className="w-full max-w-[390px] bg-white p-7 shadow-md sm:p-9">
                                <div className="h-4 w-40 rounded bg-[#171717]/80" />
                                <div className="mt-2 h-2 w-28 rounded bg-[#7895b2]/70" />
                                <div className="mt-7 h-2 w-24 rounded bg-[#3f6382]/60" />
                                <div className="mt-3 h-2 w-full rounded bg-[#e4ddcd]" />
                                <div className="mt-2 h-2 w-11/12 rounded bg-[#e4ddcd]" />
                                <div className="mt-7 h-2 w-28 rounded bg-[#3f6382]/60" />
                                <div className="mt-3 h-2 w-full rounded bg-[#e4ddcd]" />
                                <div className="mt-2 h-2 w-4/5 rounded bg-[#e4ddcd]" />
                                <div className="mt-7 flex flex-wrap gap-2"><span className="h-5 w-16 rounded-full bg-[#7895b2]/30" /><span className="h-5 w-20 rounded-full bg-[#7895b2]/30" /><span className="h-5 w-14 rounded-full bg-[#7895b2]/30" /></div>
                            </div>
                        </div>
                        <div className="border-l border-[#171717]/10 bg-white p-4">
                            <div className="h-2 w-20 rounded bg-[#3f6382]/60" />
                            <div className="mt-5 space-y-3"><div className="h-7 rounded bg-[#f0ece3]" /><div className="h-7 rounded bg-[#f0ece3]" /><div className="h-7 rounded bg-[#f0ece3]" /></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Principles */}
            <section className="mx-auto mt-20 max-w-5xl px-6 pb-16 sm:mt-28">
                <h2 className="text-center text-2xl font-semibold">Kenapa local-first</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    {principles.map((p) => (
                        <div key={p.title} className="rounded-md border border-[#171717]/15 bg-white p-5 shadow-sm">
                            <iconify-icon icon={p.icon} width="24" height="24" className="text-[#3f6382]" />
                            <h3 className="mt-3 font-semibold">{p.title}</h3>
                            <p className="mt-1 text-sm text-[#6e6a5e]">{p.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Architecture */}
            <section className="mx-auto max-w-4xl px-6 pb-16">
                <h2 className="text-center text-2xl font-semibold">Arsitektur bersih</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#6e6a5e]">
                    UI tidak pernah menyentuh penyimpanan langsung. Semua lewat interface repository,
                    jadi backend bisa berubah tanpa menyentuh UI.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {["UI (React)", "→", "WorkspaceRepository", "→", "IndexedDB"].map((step, i) => (
                        <span
                            key={i}
                            className={
                                step === "→"
                                    ? "text-[#3f6382]"
                                    : "rounded-md border border-[#171717]/15 bg-white px-4 py-2 font-mono text-sm shadow-sm"
                            }
                        >
                            {step}
                        </span>
                    ))}
                </div>
                <p className="mt-4 text-center font-mono text-xs text-[#6e6a5e]">
                    src/domain/repository.ts · indexed-db-repository.ts · in-memory-repository.ts
                </p>
            </section>

            {/* Roadmap */}
            <section className="mx-auto max-w-5xl px-6 pb-16">
                <h2 className="text-center text-2xl font-semibold">Roadmap</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    {roadmap.map((r) => (
                        <div key={r.title} className="rounded-md border border-[#171717]/15 bg-white p-5 shadow-sm">
                            <iconify-icon icon={r.icon} width="24" height="24" className="text-[#3f6382]" />
                            <h3 className="mt-3 font-semibold">{r.title}</h3>
                            <p className="mt-1 text-sm text-[#6e6a5e]">{r.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contribute */}
            <section className="border-t border-[#171717]/10 bg-white">
                <div className="mx-auto max-w-3xl px-6 py-14 text-center">
                    <iconify-icon icon="mdi:code-tags" width="36" height="36" className="text-[#3f6382]" />
                    <h2 className="mt-3 text-2xl font-semibold">Berkontribusi</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-[#6e6a5e]">
                        Ide, laporan bug, template baru, dan pull request diterima.
                        Repo ini punya AGENTS.md berisi panduan lengkap proyek untuk kontributor AI maupun manusia.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <a
                            href="https://github.com/yusufimantaka/build-my-cv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
                        >
                            <iconify-icon icon="mdi:star-outline" width="16" height="16" />
                            Bintang repo ini
                        </a>
                        <Link
                            href="/app"
                            className="rounded-md bg-[#3f6382] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:bg-[#355573] hover:scale-[1.03] active:scale-95"
                        >
                            Coba aplikasi
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#171717]/10 px-6 py-6 text-center text-xs text-[#6e6a5e]">
                BuildMyCV — local-first, open source. Dibuat dengan Next.js, React, dan TypeScript.
            </footer>
        </main>
    );
}

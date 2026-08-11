"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import { templatesContoh, templateKeDokumen } from "@/domain/templates";
import type { TemplateCategory } from "@/domain/cv";
import { NAMA_KATEGORI } from "@/domain/cv";
import TopNav from "@/app/_components/topnav";
import LandscapeBg from "@/app/_components/landscape-bg";
import TemplateThumb from "@/app/_components/template-thumb";

const repo = new IndexedDBRepository();

const SEMUA: "semua" | TemplateCategory = "semua";
const KATEGORI: ("semua" | TemplateCategory)[] = ["semua", "simple", "modern", "creative", "photo", "compact", "first-job"];

export default function LibraryPage() {
    const router = useRouter();
    const [filter, setFilter] = useState<"semua" | TemplateCategory>(SEMUA);

    async function pakaiTemplate(templateId: string): Promise<void> {
        let target = null;
        for (let i = 0; i < templatesContoh.length; i++) {
            if (templatesContoh[i].id === templateId) {
                target = templatesContoh[i];
                break;
            }
        }
        if (!target) return;
        const dokumen = templateKeDokumen(target, target.name);
        await repo.saveDocument(dokumen);
        router.push(`/build/${dokumen.id}`);
    }

    const tampil = filter === SEMUA ? templatesContoh : templatesContoh.filter((t) => t.category === filter);

    return (
        <main className="isolate min-h-screen bg-app font-sans text-ink">
            {/* Latar lanskap: fixed, tidak memengaruhi layout */}
            <LandscapeBg />
            <TopNav />
            <div className="p-8">
                <h1 className="text-2xl font-semibold">Library</h1>
                <p className="mt-1 text-sm text-muted">
                    Contoh CV siap pakai per profesi dan kegiatan. Semua data bisa kamu ubah nanti.
                </p>

                {/* Filter kategori */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {KATEGORI.map((k) => {
                        const aktif = filter === k;
                        return (
                            <button
                                key={k}
                                onClick={() => setFilter(k)}
                                className={
                                    "rounded-none px-4 py-1.5 text-sm transition-colors " +
                                    (aktif
                                        ? "bg-[#37352F] font-medium text-white"
                                        : "border border-hair bg-panel text-ink hover:bg-panel2")
                                }
                            >
                                {k === SEMUA ? "Semua" : NAMA_KATEGORI[k as TemplateCategory]}
                            </button>
                        );
                    })}
                </div>

                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tampil.map((t, idx) => (
                        <li
                            key={t.id}
                            className="flex animate-fade-up flex-col rounded-none border border-hair bg-panel p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                            style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
                        >
                            {/* Thumbnail template */}
                            <TemplateThumb template={t} />

                            <div className="mt-4 flex items-start justify-between gap-2">
                                <h2 className="font-semibold leading-tight">{t.name}</h2>
                                <span className="shrink-0 rounded-none bg-ink/10 px-2 py-0.5 text-[10px] font-medium text-ink">
                                    {NAMA_KATEGORI[t.category]}
                                </span>
                            </div>
                            <p className="mt-1 flex-1 text-sm text-muted">{t.description}</p>

                            <button
                                onClick={() => pakaiTemplate(t.id)}
                                className="mt-4 flex items-center justify-center gap-2 rounded-none bg-[#37352F] px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-ink/85 hover:scale-[1.02] active:scale-95"
                            >
                                <iconify-icon icon="mdi:plus" width="15" height="15" />
                                Pakai template
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}

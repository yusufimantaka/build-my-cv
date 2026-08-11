"use client";

import { useRouter } from "next/navigation";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import { templates, templateKeDokumen } from "@/domain/templates";
import { examples } from "@/domain/examples";
import { NAMA_KATEGORI } from "@/domain/cv";
import type { TemplateCategory } from "@/domain/cv";
import TopNav from "@/app/_components/topnav";
import LandscapeBg from "@/app/_components/landscape-bg";

const repo = new IndexedDBRepository();

// Pilih template yang paling cocok dengan industri contoh.
// Jatuh ke template pertama kalau tidak ada yang cocok.
function templateUntukIndustri(exampleId: string) {
    const mapping: Record<string, string> = {
        "software-engineer": "software-engineer",
        "data-analyst": "data-analyst",
        "ui-ux-designer": "desain-kreatif",
        kepanitiaan: "kepanitiaan-kampus",
        organisasi: "organisasi-kampus",
        "fresh-graduate": "fresh-graduate",
    };
    const id = mapping[exampleId];
    let target = null;
    for (let i = 0; i < templates.length; i++) {
        if (templates[i].id === id) {
            target = templates[i];
            break;
        }
    }
    return target ?? templates[0];
}

export default function ExplorePage() {
    const router = useRouter();

    async function pakaiContoh(exampleId: string): Promise<void> {
        const template = templateUntukIndustri(exampleId);
        const dokumen = templateKeDokumen(template, template.name);
        await repo.saveDocument(dokumen);
        router.push(`/build/${dokumen.id}`);
    }

    return (
        <main className="isolate min-h-screen bg-[#f6f3ed] font-sans text-[#171717]">
            {/* Latar lanskap: fixed, tidak memengaruhi layout */}
            <LandscapeBg />
            <TopNav />
            <div className="p-8">
                <h1 className="text-2xl font-semibold">Explore</h1>
                <p className="mt-1 text-sm text-[#6e6a5e]">
                    Contoh CV per bidang. Lihat apa yang dicari recruiter, lalu mulai dari template terkait.
                </p>

                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {examples.map((ex, idx) => (
                        <li
                            key={ex.id}
                            className="flex animate-fade-up flex-col rounded-md border border-[#171717]/15 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                            style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-semibold leading-tight">{ex.name}</h2>
                                <span className="shrink-0 rounded-full bg-[#3f6382]/10 px-2 py-0.5 text-[10px] font-medium text-[#3f6382]">
                                    {NAMA_KATEGORI[ex.category as TemplateCategory]}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-[#6e6a5e]">{ex.description}</p>

                            <ul className="mt-4 flex-1 space-y-2">
                                {ex.highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <iconify-icon
                                            icon="mdi:check"
                                            width="15"
                                            height="15"
                                            className="mt-0.5 shrink-0 text-[#3f6382]"
                                        />
                                        <span>{h}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => pakaiContoh(ex.id)}
                                className="mt-5 flex items-center justify-center gap-2 rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-[#355573] hover:scale-[1.02] active:scale-95"
                            >
                                <iconify-icon icon="mdi:plus" width="15" height="15" />
                                Mulai dari template
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}

"use client";

import { useRouter } from "next/navigation";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import { templates, templateKeDokumen } from "@/domain/templates";
import TopNav from "@/app/_components/topnav";
import LandscapeBg from "@/app/_components/landscape-bg";

const repo = new IndexedDBRepository();

export default function LibraryPage() {
    const router = useRouter();

    async function pakaiTemplate(templateId: string): Promise<void> {
        let target = null;
        for (let i = 0; i < templates.length; i++) {
            if (templates[i].id === templateId) {
                target = templates[i];
                break;
            }
        }
        if (!target) return;
        const dokumen = templateKeDokumen(target, target.name);
        await repo.saveDocument(dokumen);
        router.push(`/build/${dokumen.id}`);
    }

    return (
        <main className="isolate min-h-screen bg-[#f6f3ed] font-sans text-[#171717]">
            {/* Latar lanskap: fixed, tidak memengaruhi layout */}
            <LandscapeBg />
            <TopNav />
            <div className="p-8">
                <h1 className="text-2xl font-semibold">Library</h1>
                <p className="mt-1 text-sm text-[#6e6a5e]">
                    Mulai dari template siap pakai. Semua data bisa kamu ubah nanti.
                </p>

                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((t) => (
                        <li
                            key={t.id}
                            className="flex animate-fade-up flex-col rounded-md border border-[#171717]/15 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            {/* Miniatur blok template */}
                            <div className="rounded-sm border border-[#171717]/10 bg-[#f6f3ed] p-4">
                                <div className="h-4 w-1/2 rounded-sm bg-[#d9d2c3]" />
                                <div className="mt-3 space-y-2">
                                    {t.blocks.map((b, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="h-2 w-4 rounded-sm bg-[#3f6382]/50" />
                                            <div className="h-2 flex-1 rounded-sm bg-[#e4ddcd]" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <h2 className="mt-4 font-semibold">{t.name}</h2>
                            <p className="mt-1 flex-1 text-sm text-[#6e6a5e]">{t.description}</p>

                            <button
                                onClick={() => pakaiTemplate(t.id)}
                                className="mt-4 flex items-center justify-center gap-2 rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-[#355573] hover:scale-[1.02] active:scale-95"
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

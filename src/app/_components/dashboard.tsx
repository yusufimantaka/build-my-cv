"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument } from "@/domain/cv";

const repo = new IndexedDBRepository();

type ModalMode = "buat" | "rename";

export default function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [judul, setJudul] = useState("");

  async function muatUlang(): Promise<void> {
    const docs = await repo.loadDocuments();
    setDocuments(docs);
    setLoading(false);
  }

  useEffect(() => {
    repo.loadDocuments().then((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
  }, []);

  function bukaModalBuat(): void {
    setModalMode("buat");
    setEditId(null);
    setJudul("");
  }

  function bukaModalRename(cv: CVDocument): void {
    setModalMode("rename");
    setEditId(cv.id);
    setJudul(cv.title);
  }

  async function simpanModal(): Promise<void> {
    const judulFinal = judul.trim() === "" ? "CV Baru" : judul.trim();

    if (modalMode === "buat") {
      const baru: CVDocument = {
        id: crypto.randomUUID(),
        title: judulFinal,
        blocks: [],
        updatedAt: Date.now(),
      };
      await repo.saveDocument(baru);
      setModalMode(null);
      router.push(`/build/${baru.id}`);
      return;
    }

    if (modalMode === "rename" && editId) {
      const docs = await repo.loadDocuments();
      let target: CVDocument | null = null;
      for (let i = 0; i < docs.length; i++) {
        if (docs[i].id === editId) {
          target = docs[i];
          break;
        }
      }
      if (target) {
        const baru = { ...target, title: judulFinal, updatedAt: Date.now() };
        await repo.saveDocument(baru);
      }
      setModalMode(null);
      await muatUlang();
    }
  }

  async function hapusCV(id: string): Promise<void> {
    await repo.deleteDocument(id);
    await muatUlang();
  }

  return (
    <main className="min-h-screen bg-[#f6f3ed] p-8 font-sans text-[#171717]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={bukaModalBuat}
          className="flex items-center gap-2 rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white hover:bg-[#355573]"
        >
          <iconify-icon icon="mdi:plus" width="16" height="16" />
          Tambah CV
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-[#6e6a5e]">Memuat…</p>
      ) : documents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-[#6e6a5e]">
          <iconify-icon icon="mdi:file-document-outline" width="48" height="48" />
          <p>Belum ada CV.</p>
          <button
            onClick={bukaModalBuat}
            className="rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white hover:bg-[#355573]"
          >
            Buat CV pertama
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {documents.map((cv, idx) => (
            <li
              key={cv.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
            >
              <div className="rounded-md border border-[#171717]/15 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                <Link href={`/build/${cv.id}`} className="block">
                  {/* Miniatur kertas A4 */}
                  <div className="aspect-[210/297] w-full overflow-hidden rounded-sm border border-[#171717]/10 bg-white p-3">
                    <div className="h-3 w-2/3 rounded-sm bg-[#d9d2c3]" />
                    <div className="mt-2 h-2 w-1/3 rounded-sm bg-[#e4ddcd]" />
                    <div className="mt-4 h-2 w-full rounded-sm bg-[#e4ddcd]" />
                    <div className="mt-1.5 h-2 w-5/6 rounded-sm bg-[#e4ddcd]" />
                    <div className="mt-4 h-2 w-3/4 rounded-sm bg-[#e4ddcd]" />
                    <div className="mt-1.5 h-2 w-2/3 rounded-sm bg-[#e4ddcd]" />
                  </div>
                </Link>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Link
                    href={`/build/${cv.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                  >
                    {cv.title}
                  </Link>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => bukaModalRename(cv)}
                      title="Ubah judul"
                      className="rounded p-1 text-[#6e6a5e] hover:bg-[#e8e3d8] hover:text-[#171717]"
                    >
                      <iconify-icon icon="mdi:pencil-outline" width="15" height="15" />
                    </button>
                    <button
                      onClick={() => hapusCV(cv.id)}
                      title="Hapus"
                      className="rounded p-1 text-[#ff746c] hover:bg-[#ff746c]/10"
                    >
                      <iconify-icon icon="mdi:trash-can-outline" width="15" height="15" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40">
          <div className="w-full max-w-sm animate-pop rounded-md bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              {modalMode === "buat" ? "Judul CV" : "Ubah judul"}
            </h2>
            <input
              autoFocus
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") simpanModal();
              }}
              placeholder="Contoh: Software Engineer CV"
              className="mt-4 w-full rounded border border-[#171717]/10 bg-[#f0ece3] px-3 py-2 text-sm outline-none focus:bg-[#e8e3d8]"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setModalMode(null)}
                className="rounded-md px-4 py-2 text-sm text-[#6e6a5e] hover:text-[#171717]"
              >
                Batal
              </button>
              <button
                onClick={simpanModal}
                className="rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white hover:bg-[#355573]"
              >
                {modalMode === "buat" ? "Buat" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

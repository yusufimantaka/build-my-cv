"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument } from "@/domain/cv";

const repo = new IndexedDBRepository();

type ModalMode = "buat" | "rename";

// Waktu relatif untuk tampilan "diperbarui"
function waktuRelatif(ms: number): string {
  const detik = Math.floor((Date.now() - ms) / 1000);
  if (detik < 60) return "baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Date(ms).toLocaleDateString("id-ID");
}

// Membuat salinan dokumen dengan id baru dan judul bertanda
function buatSalinan(cv: CVDocument): CVDocument {
  return {
    ...cv,
    id: crypto.randomUUID(),
    title: cv.title + " (Salinan)",
    updatedAt: Date.now(),
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"terbaru" | "az">("terbaru");
  const [kategoriAktif, setKategoriAktif] = useState<string | null>(null);
  const [kategoriModalId, setKategoriModalId] = useState<string | null>(null);
  const [kategoriInput, setKategoriInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Daftar kategori unik dari semua dokumen + jumlahnya
  const daftarKategori: { nama: string; jumlah: number }[] = [];
  const kategoriSet = new Set<string>();
  for (const cv of documents) {
    if (cv.category) kategoriSet.add(cv.category);
  }
  for (const nama of Array.from(kategoriSet).sort()) {
    let jumlah = 0;
    for (const cv of documents) {
      if (cv.category === nama) jumlah++;
    }
    daftarKategori.push({ nama, jumlah });
  }

  // Filter by kategori + judul, lalu urutkan
  const hasil = documents
    .filter((cv) => (kategoriAktif === null ? true : cv.category === kategoriAktif))
    .filter((cv) => cv.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === "az") return a.title.localeCompare(b.title);
      return b.updatedAt - a.updatedAt;
    });

  const cvTerbaruId = sortMode === "terbaru" && hasil.length > 0 ? hasil[0].id : null;

  function bukaModalBuat(): void {
    setModalMode("buat");
    setEditId(null);
    setJudul("");
    setKategoriInput(kategoriAktif ?? "");
  }

  function bukaModalRename(cv: CVDocument): void {
    setModalMode("rename");
    setEditId(cv.id);
    setJudul(cv.title);
  }

  async function simpanModal(): Promise<void> {
    const judulFinal = judul.trim() === "" ? "CV Baru" : judul.trim();

    if (modalMode === "buat") {
      const namaKategori = kategoriInput.trim();
      const baru: CVDocument = {
        id: crypto.randomUUID(),
        title: judulFinal,
        blocks: [],
        category: namaKategori === "" ? undefined : namaKategori,
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

  async function duplikatCV(cv: CVDocument): Promise<void> {
    await repo.saveDocument(buatSalinan(cv));
    await muatUlang();
  }

  // Atur kategori CV lewat modal
  async function simpanKategori(): Promise<void> {
    if (!kategoriModalId) return;
    const docs = await repo.loadDocuments();
    let target: CVDocument | null = null;
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].id === kategoriModalId) {
        target = docs[i];
        break;
      }
    }
    if (target) {
      const nama = kategoriInput.trim();
      const baru = { ...target, category: nama === "" ? undefined : nama, updatedAt: Date.now() };
      await repo.saveDocument(baru);
    }
    setKategoriModalId(null);
    setKategoriInput("");
    await muatUlang();
  }

  // Backup: unduh semua CV sebagai file JSON
  function exportWorkspace(): void {
    const data = JSON.stringify({ dokumen: documents }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cv-builder-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Restore: baca file JSON, simpan semua CV yang valid
  async function importWorkspace(file: File): Promise<void> {
    const teks = await file.text();
    const parsed = JSON.parse(teks);
    const daftar = Array.isArray(parsed) ? parsed : parsed.dokumen;
    if (!Array.isArray(daftar)) {
      alert("File backup tidak valid.");
      return;
    }
    for (const d of daftar) {
      if (d && typeof d.id === "string" && Array.isArray(d.blocks)) {
        await repo.saveDocument(d);
      }
    }
    await muatUlang();
  }

  return (
    <main className="flex min-h-screen bg-[#f6f3ed] font-sans text-[#171717]">
      {/* Sidebar kategori */}
      <aside className="no-scrollbar flex w-56 shrink-0 flex-col overflow-y-auto border-r border-[#171717]/10 bg-white p-4">
        <h2 className="flex items-center gap-2 border-b border-[#171717]/10 pb-3 text-sm font-semibold text-[#3f6382]">
          <iconify-icon icon="mdi:folder-multiple-outline" width="16" height="16" />
          Kategori
        </h2>
        <nav className="mt-3 flex flex-col gap-1">
          <button
            onClick={() => setKategoriAktif(null)}
            className={
              "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors " +
              (kategoriAktif === null
                ? "bg-[#3f6382] text-white"
                : "text-[#171717] hover:bg-[#f0ece3]")
            }
          >
            <span className="flex items-center gap-2">
              <iconify-icon icon="mdi:folder-outline" width="15" height="15" />
              Semua
            </span>
            <span className="text-xs opacity-70">{documents.length}</span>
          </button>
          {daftarKategori.map((k) => (
            <button
              key={k.nama}
              onClick={() => setKategoriAktif(k.nama)}
              className={
                "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors " +
                (kategoriAktif === k.nama
                  ? "bg-[#3f6382] text-white"
                  : "text-[#171717] hover:bg-[#f0ece3]")
              }
            >
              <span className="flex items-center gap-2 truncate">
                <iconify-icon icon="mdi:folder-outline" width="15" height="15" />
                {k.nama}
              </span>
              <span className="text-xs opacity-70">{k.jumlah}</span>
            </button>
          ))}
          {daftarKategori.length === 0 && (
            <p className="px-3 py-2 text-xs text-[#6e6a5e]">
              Buat kategori lewat tombol folder di kartu CV.
            </p>
          )}
        </nav>
      </aside>

      {/* Konten utama */}
      <div className="min-w-0 flex-1 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {kategoriAktif === null ? "Dashboard" : kategoriAktif}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportWorkspace}
              title="Backup workspace"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#171717]/15 text-[#3f6382] transition-transform hover:bg-[#e8e3d8] hover:scale-105 active:scale-95"
            >
              <iconify-icon icon="mdi:database-export-outline" width="18" height="18" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore dari backup"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#171717]/15 text-[#3f6382] transition-transform hover:bg-[#e8e3d8] hover:scale-105 active:scale-95"
            >
              <iconify-icon icon="mdi:database-import-outline" width="18" height="18" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importWorkspace(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={bukaModalBuat}
              className="flex items-center gap-2 rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-[#355573] hover:scale-[1.02] active:scale-95"
            >
              <iconify-icon icon="mdi:plus" width="16" height="16" />
              Tambah CV
            </button>
          </div>
        </div>

        {!loading && documents.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <div className="relative">
              <iconify-icon
                icon="mdi:magnify"
                width="16"
                height="16"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6e6a5e]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari CV…"
                className="w-64 rounded-md border border-[#171717]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#3f6382]"
              />
            </div>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as "terbaru" | "az")}
              className="rounded-md border border-[#171717]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#3f6382]"
            >
              <option value="terbaru">Terbaru</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        )}

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
        ) : hasil.length === 0 ? (
          <p className="mt-8 text-[#6e6a5e]">Tidak ada CV di kategori ini.</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {hasil.map((cv, idx) => (
              <li
                key={cv.id}
                className="group animate-fade-up"
                style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
              >
                <div
                  className={
                    "relative rounded-md border bg-white p-3 shadow-sm transition-shadow hover:shadow-md " +
                    (cv.id === cvTerbaruId ? "border-[#3f6382] ring-1 ring-[#3f6382]/40" : "border-[#171717]/15")
                  }
                >
                  {cv.id === cvTerbaruId && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#3f6382] px-2 py-0.5 text-[10px] font-medium text-white">
                      Terakhir dikerjakan
                    </span>
                  )}
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
                    <div className="min-w-0">
                      <Link
                        href={`/build/${cv.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {cv.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-[#6e6a5e]">
                        {cv.category ?? "Tanpa kategori"} · {waktuRelatif(cv.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setKategoriModalId(cv.id);
                          setKategoriInput(cv.category ?? "");
                        }}
                        title="Atur kategori"
                        className="rounded p-1 text-[#6e6a5e] transition-transform hover:scale-110 hover:bg-[#e8e3d8] hover:text-[#171717] active:scale-95"
                      >
                        <iconify-icon icon="mdi:folder-cog-outline" width="15" height="15" />
                      </button>
                      <button
                        onClick={() => duplikatCV(cv)}
                        title="Duplikat"
                        className="rounded p-1 text-[#6e6a5e] transition-transform hover:scale-110 hover:bg-[#e8e3d8] hover:text-[#171717] active:scale-95"
                      >
                        <iconify-icon icon="mdi:content-copy" width="15" height="15" />
                      </button>
                      <button
                        onClick={() => bukaModalRename(cv)}
                        title="Ubah judul"
                        className="rounded p-1 text-[#6e6a5e] transition-transform hover:scale-110 hover:bg-[#e8e3d8] hover:text-[#171717] active:scale-95"
                      >
                        <iconify-icon icon="mdi:pencil-outline" width="15" height="15" />
                      </button>
                      <button
                        onClick={() => hapusCV(cv.id)}
                        title="Hapus"
                        className="rounded p-1 text-[#ff746c] transition-transform hover:scale-110 hover:bg-[#ff746c]/10 active:scale-95"
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
              {modalMode === "buat" && (
                <div className="mt-4">
                  <label className="text-xs text-[#6e6a5e]">Kategori (opsional)</label>
                  <input
                    value={kategoriInput}
                    onChange={(e) => setKategoriInput(e.target.value)}
                    placeholder="Contoh: Apply Job"
                    className="mt-1 w-full rounded border border-[#171717]/10 bg-[#f0ece3] px-3 py-2 text-sm outline-none focus:bg-[#e8e3d8]"
                  />
                  {daftarKategori.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {daftarKategori.map((k) => (
                        <button
                          key={k.nama}
                          onClick={() => setKategoriInput(k.nama)}
                          className={
                            "rounded-full border px-3 py-1 text-xs transition-colors " +
                            (kategoriInput === k.nama
                              ? "border-[#3f6382] bg-[#3f6382] text-white"
                              : "border-[#171717]/15 text-[#171717] hover:bg-[#f0ece3]")
                          }
                        >
                          {k.nama}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

        {kategoriModalId && (
          <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40">
            <div className="w-full max-w-sm animate-pop rounded-md bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold">Atur kategori</h2>
              <input
                autoFocus
                value={kategoriInput}
                onChange={(e) => setKategoriInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") simpanKategori();
                }}
                placeholder="Contoh: Apply Job"
                className="mt-4 w-full rounded border border-[#171717]/10 bg-[#f0ece3] px-3 py-2 text-sm outline-none focus:bg-[#e8e3d8]"
              />
              {daftarKategori.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {daftarKategori.map((k) => (
                    <button
                      key={k.nama}
                      onClick={() => setKategoriInput(k.nama)}
                      className={
                        "rounded-full border px-3 py-1 text-xs transition-colors " +
                        (kategoriInput === k.nama
                          ? "border-[#3f6382] bg-[#3f6382] text-white"
                          : "border-[#171717]/15 text-[#171717] hover:bg-[#f0ece3]")
                      }
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setKategoriModalId(null)}
                  className="rounded-md px-4 py-2 text-sm text-[#6e6a5e] hover:text-[#171717]"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setKategoriInput("");
                    simpanKategori();
                  }}
                  className="rounded-md px-4 py-2 text-sm text-[#ff746c] hover:bg-[#ff746c]/10"
                >
                  Tanpa kategori
                </button>
                <button
                  onClick={simpanKategori}
                  className="rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white hover:bg-[#355573]"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

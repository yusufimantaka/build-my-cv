"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument } from "@/domain/cv";
import TopNav from "@/app/_components/topnav";
import LandscapeBg from "@/app/_components/landscape-bg";

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
  const [kategoriPilihan, setKategoriPilihan] = useState("");
  const [kategoriBuatBaru, setKategoriBuatBaru] = useState(false);
  // Baca zoom grid dari localStorage saat init (lazy initializer)
  const [gridZoom, setGridZoom] = useState<"kecil" | "sedang" | "besar">(() => {
    if (typeof window === "undefined") return "sedang";
    const tersimpan = localStorage.getItem("gridZoom");
    if (tersimpan === "kecil" || tersimpan === "besar") return tersimpan;
    return "sedang";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simpan zoom grid agar tidak hilang saat pindah halaman
  useEffect(() => {
    localStorage.setItem("gridZoom", gridZoom);
  }, [gridZoom]);

  // Jumlah kolom eksplisit per level agar layout stabil
  const gridClasses =
    gridZoom === "kecil"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      : gridZoom === "besar"
        ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  const zoomPersen = gridZoom === "kecil" ? 66 : gridZoom === "besar" ? 133 : 100;

  function zoomKe(arah: -1 | 1): void {
    const urutan: Array<"kecil" | "sedang" | "besar"> = ["kecil", "sedang", "besar"];
    const index = urutan.indexOf(gridZoom);
    const baru = urutan[Math.min(Math.max(index + arah, 0), 2)];
    setGridZoom(baru);
  }

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
    setKategoriPilihan(kategoriAktif ?? "");
    setKategoriInput(kategoriAktif ?? "");
    setKategoriBuatBaru(false);
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
    <main className="isolate min-h-screen bg-[#f7f7f5] font-sans text-[#171717]">
      {/* Latar lanskap: fixed, tidak memengaruhi layout */}
      <LandscapeBg />
      <TopNav />

      {/* Floating pill kategori (melayang di sisi kiri) */}
      <aside className="fixed left-4 top-20 z-40 flex w-44 flex-col gap-1 rounded-2xl border border-[#171717]/10 bg-white p-2 shadow-lg">
        <h2 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#37352F]">
          <iconify-icon icon="mdi:folder-multiple-outline" width="14" height="14" />
          Kategori
        </h2>
        <button
          onClick={() => setKategoriAktif(null)}
          className={
            "flex items-center justify-between rounded-full px-3 py-2 text-left text-sm transition-colors " +
            (kategoriAktif === null
              ? "bg-[#37352F] text-white"
              : "text-[#171717] hover:bg-[#efefef]")
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
              "flex items-center justify-between rounded-full px-3 py-2 text-left text-sm transition-colors " +
              (kategoriAktif === k.nama
                ? "bg-[#37352F] text-white"
                : "text-[#171717] hover:bg-[#efefef]")
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
          <p className="px-3 py-2 text-xs text-[#787774]">
            Buat kategori lewat tombol folder di kartu CV.
          </p>
        )}
      </aside>

      {/* Konten utama (ruang kiri untuk pill kategori) */}
      <div className="min-w-0 p-8 pl-56">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {kategoriAktif === null ? "Dashboard" : kategoriAktif}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportWorkspace}
              title="Backup workspace"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#171717]/15 text-[#37352F] transition-transform hover:bg-[#e8e8e6] hover:scale-105 active:scale-95"
            >
              <iconify-icon icon="mdi:database-export-outline" width="18" height="18" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore dari backup"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#171717]/15 text-[#37352F] transition-transform hover:bg-[#e8e8e6] hover:scale-105 active:scale-95"
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
              className="flex items-center gap-2 rounded-md bg-[#37352F] px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-[#2f2b26] hover:scale-[1.02] active:scale-95"
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
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari CV…"
                className="w-64 rounded-md border border-[#171717]/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#37352F]"
              />
            </div>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as "terbaru" | "az")}
              className="rounded-md border border-[#171717]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#37352F]"
            >
              <option value="terbaru">Terbaru</option>
              <option value="az">A–Z</option>
            </select>
            <div className="ml-2 flex items-center gap-1 rounded-md border border-[#171717]/15 bg-white p-1">
              <button
                onClick={() => zoomKe(-1)}
                disabled={gridZoom === "kecil"}
                title="Perkecil"
                className="flex h-7 w-7 items-center justify-center rounded text-[#171717] transition-colors hover:bg-[#efefef] disabled:opacity-30"
              >
                <iconify-icon icon="mdi:magnify-minus" width="16" height="16" />
              </button>
              <span className="w-10 text-center text-xs text-[#787774]">{zoomPersen}%</span>
              <button
                onClick={() => zoomKe(1)}
                disabled={gridZoom === "besar"}
                title="Perbesar"
                className="flex h-7 w-7 items-center justify-center rounded text-[#171717] transition-colors hover:bg-[#efefef] disabled:opacity-30"
              >
                <iconify-icon icon="mdi:magnify-plus" width="16" height="16" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-[#787774]">Memuat…</p>
        ) : documents.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-[#787774]">
            <iconify-icon icon="mdi:file-document-outline" width="48" height="48" />
            <p>Belum ada CV.</p>
            <button
              onClick={bukaModalBuat}
              className="rounded-md bg-[#37352F] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f2b26]"
            >
              Buat CV pertama
            </button>
          </div>
        ) : hasil.length === 0 ? (
          <p className="mt-8 text-[#787774]">Tidak ada CV di kategori ini.</p>
        ) : (
          <ul className={"mt-8 grid gap-6 " + gridClasses}>
            {hasil.map((cv, idx) => (
              <li
                key={cv.id}
                className="group animate-fade-up"
                style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}
              >
                <div
                  className={
                    "relative rounded-md border bg-white p-3 shadow-sm transition-shadow hover:shadow-md " +
                    (cv.id === cvTerbaruId ? "border-[#37352F] ring-1 ring-[#37352F]/40" : "border-[#171717]/15")
                  }
                >
                  {cv.id === cvTerbaruId && (
                    <span className="absolute right-2 top-2 rounded-full bg-[#37352F] px-2 py-0.5 text-[10px] font-medium text-white">
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
                      <p className="mt-0.5 truncate text-xs text-[#787774]">
                        {cv.category ?? "Tanpa kategori"} · {waktuRelatif(cv.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setKategoriModalId(cv.id);
                          setKategoriPilihan(cv.category ?? "");
                          setKategoriInput(cv.category ?? "");
                          setKategoriBuatBaru(false);
                        }}
                        title="Atur kategori"
                        className="rounded p-1 text-[#787774] transition-transform hover:scale-110 hover:bg-[#e8e8e6] hover:text-[#171717] active:scale-95"
                      >
                        <iconify-icon icon="mdi:folder-cog-outline" width="15" height="15" />
                      </button>
                      <button
                        onClick={() => duplikatCV(cv)}
                        title="Duplikat"
                        className="rounded p-1 text-[#787774] transition-transform hover:scale-110 hover:bg-[#e8e8e6] hover:text-[#171717] active:scale-95"
                      >
                        <iconify-icon icon="mdi:content-copy" width="15" height="15" />
                      </button>
                      <button
                        onClick={() => bukaModalRename(cv)}
                        title="Ubah judul"
                        className="rounded p-1 text-[#787774] transition-transform hover:scale-110 hover:bg-[#e8e8e6] hover:text-[#171717] active:scale-95"
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
                className="mt-4 w-full rounded border border-[#171717]/10 bg-[#efefef] px-3 py-2 text-sm outline-none focus:bg-[#e8e8e6]"
              />
              {modalMode === "buat" && (
                <div className="mt-4">
                  <label className="text-xs text-[#787774]">Kategori (opsional)</label>
                  <select
                    value={kategoriBuatBaru ? "__baru__" : kategoriPilihan}
                    onChange={(e) => {
                      const nilai = e.target.value;
                      if (nilai === "__baru__") {
                        setKategoriBuatBaru(true);
                        setKategoriPilihan("");
                      } else {
                        setKategoriBuatBaru(false);
                        setKategoriPilihan(nilai);
                        setKategoriInput(nilai);
                      }
                    }}
                    className="mt-1 w-full rounded border border-[#171717]/10 bg-[#efefef] px-3 py-2 text-sm outline-none focus:bg-[#e8e8e6]"
                  >
                    <option value="">Tanpa kategori</option>
                    {daftarKategori.map((k) => (
                      <option key={k.nama} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                    <option value="__baru__">+ Buat kategori baru…</option>
                  </select>
                  {kategoriBuatBaru && (
                    <input
                      autoFocus
                      value={kategoriInput}
                      onChange={(e) => setKategoriInput(e.target.value)}
                      placeholder="Nama kategori baru"
                      className="mt-2 w-full rounded border border-[#171717]/10 bg-[#efefef] px-3 py-2 text-sm outline-none focus:bg-[#e8e8e6]"
                    />
                  )}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setModalMode(null)}
                  className="rounded-md px-4 py-2 text-sm text-[#787774] hover:text-[#171717]"
                >
                  Batal
                </button>
                <button
                  onClick={simpanModal}
                  className="rounded-md bg-[#37352F] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f2b26]"
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
              <label className="mt-4 block text-xs text-[#787774]">Kategori</label>
              <select
                autoFocus
                value={kategoriBuatBaru ? "__baru__" : kategoriPilihan}
                onChange={(e) => {
                  const nilai = e.target.value;
                  if (nilai === "__baru__") {
                    setKategoriBuatBaru(true);
                    setKategoriPilihan("");
                  } else {
                    setKategoriBuatBaru(false);
                    setKategoriPilihan(nilai);
                    setKategoriInput(nilai);
                  }
                }}
                className="mt-1 w-full rounded border border-[#171717]/10 bg-[#efefef] px-3 py-2 text-sm outline-none focus:bg-[#e8e8e6]"
              >
                <option value="">Tanpa kategori</option>
                {daftarKategori.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    {k.nama}
                  </option>
                ))}
                <option value="__baru__">+ Buat kategori baru…</option>
              </select>
              {kategoriBuatBaru && (
                <input
                  autoFocus
                  value={kategoriInput}
                  onChange={(e) => setKategoriInput(e.target.value)}
                  placeholder="Nama kategori baru"
                  className="mt-2 w-full rounded border border-[#171717]/10 bg-[#efefef] px-3 py-2 text-sm outline-none focus:bg-[#e8e8e6]"
                />
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setKategoriModalId(null)}
                  className="rounded-md px-4 py-2 text-sm text-[#787774] hover:text-[#171717]"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setKategoriInput("");
                    setKategoriPilihan("");
                    setKategoriBuatBaru(false);
                    simpanKategori();
                  }}
                  className="rounded-md px-4 py-2 text-sm text-[#ff746c] hover:bg-[#ff746c]/10"
                >
                  Tanpa kategori
                </button>
                <button
                  onClick={simpanKategori}
                  className="rounded-md bg-[#37352F] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f2b26]"
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

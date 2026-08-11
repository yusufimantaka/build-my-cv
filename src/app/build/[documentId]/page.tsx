"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument, CVBlock, ExperienceItem, CustomItem, BlockStyle } from "@/domain/cv";

const repo = new IndexedDBRepository();

// Membuat blok baru dengan data kosong, sesuai jenisnya
function blokBaru(type: CVBlock["type"], page: number): CVBlock {
  const id = crypto.randomUUID();
  const style: BlockStyle = { fontSize: 16, color: "#171717" };
  const name = type === "header" ? "Header" : type === "experience" ? "Pengalaman" : type === "skills" ? "Keahlian" : type === "paragraph" ? "Ringkasan" : "Section";
  if (type === "header") {
    return { id, type, order: 0, visible: true, name, page, style, data: { fullName: "", title: "", email: "", phone: "" } };
  }
  if (type === "experience") {
    return { id, type, order: 0, visible: true, name, page, style, data: { items: [] } };
  }
  if (type === "skills") {
    return { id, type, order: 0, visible: true, name, page, style, data: { skills: [] } };
  }
  if (type === "paragraph") {
    return { id, type, order: 0, visible: true, name, page, style, data: { text: "" } };
  }
  return { id, type, order: 0, visible: true, name, page, style, data: { items: [] } };
}

// Menimpa satu blok dalam daftar, mengembalikan daftar baru
function gantiBlokDalamDaftar(daftar: CVBlock[], blokBaru: CVBlock): CVBlock[] {
  const hasil: CVBlock[] = [];
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id === blokBaru.id) {
      hasil.push(blokBaru);
    } else {
      hasil.push(daftar[i]);
    }
  }
  return hasil;
}

// Menghapus satu blok dari daftar, mengembalikan daftar baru
function hapusBlokDariDaftar(daftar: CVBlock[], id: string): CVBlock[] {
  const hasil: CVBlock[] = [];
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id !== id) {
      hasil.push(daftar[i]);
    }
  }
  return hasil;
}

// Menukar posisi dua blok dalam halaman yang sama, mengembalikan daftar baru
function tukarDalamHalaman(daftar: CVBlock[], id: string, arah: number): CVBlock[] {
  let index = -1;
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id === id) {
      index = i;
      break;
    }
  }
  if (index === -1) return daftar;
  const page = daftar[index].page ?? 0;

  let target = index + arah;
  while (target >= 0 && target < daftar.length && (daftar[target].page ?? 0) !== page) {
    target += arah;
  }
  if (target < 0 || target >= daftar.length) return daftar;

  const hasil = [...daftar];
  const temp = hasil[index];
  hasil[index] = hasil[target];
  hasil[target] = temp;
  return hasil;
}

// Drag & drop: pindahkan blok ke ujung halaman tertentu
function pindahkanBlokKeHalaman(daftar: CVBlock[], draggedId: string, page: number): CVBlock[] {
  let draggedIndex = -1;
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id === draggedId) {
      draggedIndex = i;
      break;
    }
  }
  if (draggedIndex === -1) return daftar;

  const dragged = { ...daftar[draggedIndex], page };
  const sisa: CVBlock[] = [];
  for (let i = 0; i < daftar.length; i++) {
    if (i !== draggedIndex) sisa.push(daftar[i]);
  }
  return [...sisa, dragged];
}

// Drag & drop: pindahkan blok ke kolom tertentu (sidebar / konten utama),
// tetap di halaman yang sama. Dipakai template dengan layout sidebar.
function pindahkanBlokKeKolomDalamDaftar(daftar: CVBlock[], draggedId: string, keSidebar: boolean, page: number): CVBlock[] {
  let draggedIndex = -1;
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id === draggedId) {
      draggedIndex = i;
      break;
    }
  }
  if (draggedIndex === -1) return daftar;

  const dragged = { ...daftar[draggedIndex], sidebar: keSidebar, page };
  const sisa: CVBlock[] = [];
  for (let i = 0; i < daftar.length; i++) {
    if (i !== draggedIndex) sisa.push(daftar[i]);
  }
  return [...sisa, dragged];
}

// Mengganti judul dokumen dengan waktu terbaru
function dokumenDenganJudul(doc: CVDocument, judul: string): CVDocument {
  return { ...doc, title: judul, updatedAt: Date.now() };
}

// Membuat dokumen baru dengan daftar blok baru dan waktu terbaru
function dokumenBaru(doc: CVDocument, blocks: CVBlock[]): CVDocument {
  return { ...doc, blocks, updatedAt: Date.now() };
}

// Mengambil blok milik halaman tertentu
function blokDiHalaman(dokumen: CVDocument, page: number): CVBlock[] {
  return dokumen.blocks.filter((b) => (b.page ?? 0) === page);
}

// Ikon Iconify untuk tiap jenis blok (dipakai panel Layers)
function ikonTipeBlok(type: CVBlock["type"]): string {
  switch (type) {
    case "header":
      return "mdi:account-circle-outline";
    case "experience":
      return "mdi:briefcase-outline";
    case "skills":
      return "mdi:lightbulb-on-outline";
    case "paragraph":
      return "mdi:format-paragraph";
    default:
      return "mdi:text-box-outline";
  }
}

// Menghapus satu halaman: blok di halaman itu pindah ke halaman sebelumnya,
// halaman setelahnya naik satu tingkat
function hapusHalamanDariDokumen(doc: CVDocument, page: number): CVDocument {
  const jumlah = doc.pageCount ?? 1;
  const target = Math.max(0, page - 1);
  const blocks: CVBlock[] = [];
  for (let i = 0; i < doc.blocks.length; i++) {
    const p = doc.blocks[i].page ?? 0;
    if (p === page) {
      blocks.push({ ...doc.blocks[i], page: target });
    } else if (p > page) {
      blocks.push({ ...doc.blocks[i], page: p - 1 });
    } else {
      blocks.push(doc.blocks[i]);
    }
  }
  return { ...doc, pageCount: Math.max(1, jumlah - 1), blocks, updatedAt: Date.now() };
}

export default function BuildPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [doc, setDoc] = useState<CVDocument | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [notFound, setNotFound] = useState(false);
  // Baca lebar panel dari localStorage saat init (lazy initializer)
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window === "undefined") return 176;
    const kiri = localStorage.getItem("buildLeftWidth");
    if (kiri) return Number(kiri);
    return 176;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    if (typeof window === "undefined") return 320;
    const kanan = localStorage.getItem("buildRightWidth");
    if (kanan) return Number(kanan);
    return 320;
  });

  // Simpan lebar panel
  useEffect(() => {
    localStorage.setItem("buildLeftWidth", String(leftWidth));
  }, [leftWidth]);
  useEffect(() => {
    localStorage.setItem("buildRightWidth", String(rightWidth));
  }, [rightWidth]);

  // Mulai drag resize panel kiri (seret dari tepi kanan pill)
  function mulaiDragKiri(e: React.MouseEvent): void {
    e.preventDefault();
    const mulaiX = e.clientX;
    const mulaiW = leftWidth;
    function onMove(ev: MouseEvent): void {
      setLeftWidth(Math.min(Math.max(mulaiW + (ev.clientX - mulaiX), 120), 320));
    }
    function onUp(): void {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // Mulai drag resize panel kanan (seret dari tepi kiri pill)
  function mulaiDragKanan(e: React.MouseEvent): void {
    e.preventDefault();
    const mulaiX = e.clientX;
    const mulaiW = rightWidth;
    function onMove(ev: MouseEvent): void {
      setRightWidth(Math.min(Math.max(mulaiW + (mulaiX - ev.clientX), 240), 480));
    }
    function onUp(): void {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  useEffect(() => {
    async function muat(): Promise<void> {
      const docs = await repo.loadDocuments();
      let ketemu: CVDocument | null = null;
      for (let i = 0; i < docs.length; i++) {
        if (docs[i].id === documentId) {
          ketemu = docs[i];
          break;
        }
      }
      if (ketemu) {
        setDoc(ketemu);
      } else {
        setNotFound(true);
      }
    }
    muat();
  }, [documentId]);

  async function simpan(dokumen: CVDocument): Promise<void> {
    await repo.saveDocument(dokumen);
    setDoc(dokumen);
  }

  function tambahBlok(type: CVBlock["type"]): void {
    if (!doc) return;
    const blok = blokBaru(type, selectedPage);
    simpan(dokumenBaru(doc, [...doc.blocks, blok]));
    setSelectedId(blok.id);
  }

  function perbaruiBlok(blokBaru: CVBlock): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, gantiBlokDalamDaftar(doc.blocks, blokBaru)));
  }

  function perbaruiDokumen(perubahan: Partial<CVDocument>): void {
    if (!doc) return;
    simpan({ ...doc, ...perubahan, updatedAt: Date.now() });
  }

  function hapusBlok(id: string): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, hapusBlokDariDaftar(doc.blocks, id)));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }

  function pindahBlok(id: string, arah: number): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, tukarDalamHalaman(doc.blocks, id, arah)));
  }

  function ubahJudul(nilai: string): void {
    if (!doc) return;
    simpan(dokumenDenganJudul(doc, nilai));
  }

  function seretBlokKeHalaman(draggedId: string, page: number): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, pindahkanBlokKeHalaman(doc.blocks, draggedId, page)));
  }

  function pindahkanBlokKeKolom(draggedId: string, keSidebar: boolean, page: number): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, pindahkanBlokKeKolomDalamDaftar(doc.blocks, draggedId, keSidebar, page)));
  }

  function tambahHalaman(): void {
    if (!doc) return;
    const jumlahSekarang = doc.pageCount ?? 1;
    const dokumenBaruPage = { ...doc, pageCount: jumlahSekarang + 1, updatedAt: Date.now() };
    simpan(dokumenBaruPage);
    setSelectedPage(jumlahSekarang);
  }

  const blokTerpilih = doc
    ? doc.blocks.find((b) => b.id === selectedId) ?? null
    : null;

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] p-8 font-sans text-[#171717]">
        <Link href="/app" className="text-sm text-[#37352F] hover:underline">
          ← Kembali ke Dashboard
        </Link>
        <p className="mt-8 text-[#787774]">CV tidak ditemukan.</p>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] p-8 font-sans text-[#171717]">
        <p className="text-[#787774]">Memuat…</p>
      </main>
    );
  }

  // Jumlah halaman = pageCount, minimal 1, minimal mengikuti halaman tertinggi blok
  let jumlahHalaman = doc.pageCount ?? 1;
  for (let i = 0; i < doc.blocks.length; i++) {
    const halamanBlok = (doc.blocks[i].page ?? 0) + 1;
    if (halamanBlok > jumlahHalaman) jumlahHalaman = halamanBlok;
  }

  function hapusHalaman(page: number): void {
    if (!doc) return;
    simpan(hapusHalamanDariDokumen(doc, page));
    if (selectedPage > 0) {
      setSelectedPage(selectedPage - 1);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-[#f7f7f5] font-sans text-[#171717]">
      {/* Header app (sama tinggi dengan TopNav, sembunyi saat print) */}
      <div className="no-print sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-[#171717]/10 bg-white/95 px-6 py-2 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/app" className="text-sm text-[#37352F] hover:underline">
            ← Dashboard
          </Link>
          <input
            value={doc.title}
            onChange={(e) => ubahJudul(e.target.value)}
            placeholder="Judul CV"
            className="w-64 rounded-none border border-transparent bg-transparent px-2 py-1 text-base font-semibold outline-none transition-colors hover:border-[#171717]/15 focus:border-[#37352F] focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#787774]">Tersimpan lokal</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-none bg-[#37352F] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f2b26]"
          >
            <iconify-icon icon="mdi:file-pdf-box" width="16" height="16" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {/* Panel kiri: daftar blok (floating pill kiri, bisa di-resize) */}
        <aside
          className="no-print no-scrollbar fixed left-4 top-20 z-40 hidden max-h-[calc(100vh-6rem)] flex-col gap-1 overflow-y-auto rounded-none border border-[#171717]/10 bg-white p-2 shadow-lg lg:flex"
          style={{ width: leftWidth }}
        >
          <h2 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#37352F]">
            <iconify-icon icon="mdi:view-grid-plus" width="14" height="14" />
            Tambah blok
          </h2>
          <button onClick={() => tambahBlok("header")} className="flex items-center gap-2 rounded-none px-3 py-2 text-left text-sm transition-colors hover:bg-[#efefef]">
            <iconify-icon icon="mdi:account-circle-outline" width="16" height="16" className="text-[#37352F]" />
            Header
          </button>
          <button onClick={() => tambahBlok("experience")} className="flex items-center gap-2 rounded-none px-3 py-2 text-left text-sm transition-colors hover:bg-[#efefef]">
            <iconify-icon icon="mdi:briefcase-outline" width="16" height="16" className="text-[#37352F]" />
            Experience
          </button>
          <button onClick={() => tambahBlok("skills")} className="flex items-center gap-2 rounded-none px-3 py-2 text-left text-sm transition-colors hover:bg-[#efefef]">
            <iconify-icon icon="mdi:lightbulb-on-outline" width="16" height="16" className="text-[#37352F]" />
            Skills
          </button>
          <button onClick={() => tambahBlok("custom")} className="flex items-center gap-2 rounded-none px-3 py-2 text-left text-sm transition-colors hover:bg-[#efefef]">
            <iconify-icon icon="mdi:text-box-outline" width="16" height="16" className="text-[#37352F]" />
            Section
          </button>
          <button onClick={() => tambahBlok("paragraph")} className="flex items-center gap-2 rounded-none px-3 py-2 text-left text-sm transition-colors hover:bg-[#efefef]">
            <iconify-icon icon="mdi:format-paragraph" width="16" height="16" className="text-[#37352F]" />
            Paragraf
          </button>

          {/* Panel Layers: daftar blok per halaman. Klik untuk memilih,
              panah untuk mengurutkan — sama seperti kontrol di dokumen. */}
          <div className="mt-2 border-t border-[#171717]/10 pt-2">
            <h2 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#37352F]">
              <iconify-icon icon="mdi:layers-outline" width="14" height="14" />
              Layers
            </h2>
            <div className="no-scrollbar max-h-[calc(100vh-26rem)] overflow-y-auto pr-0.5">
              {Array.from({ length: jumlahHalaman }, (_, page) => (
                <div key={page} className="mb-2">
                  <p className="px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-[#9b9a97]">
                    Halaman {page + 1}
                  </p>
                  {blokDiHalaman(doc, page).length === 0 ? (
                    <p className="px-3 pb-1 text-[11px] text-[#9b9a97]">Kosong</p>
                  ) : (
                    blokDiHalaman(doc, page).map((blok, index) => (
                      <div
                        key={blok.id}
                        onClick={() => {
                          setSelectedId(blok.id);
                          setSelectedPage(page);
                        }}
                        className={
                          "flex cursor-pointer items-center gap-1.5 rounded-none px-2.5 py-1.5 transition-colors " +
                          (selectedId === blok.id ? "bg-[#37352F] text-white" : "hover:bg-[#efefef]")
                        }
                      >
                        <iconify-icon
                          icon={ikonTipeBlok(blok.type)}
                          width="14"
                          height="14"
                          className={selectedId === blok.id ? "shrink-0" : "shrink-0 text-[#37352F]"}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs">{blok.name ?? "Tanpa nama"}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            pindahBlok(blok.id, -1);
                          }}
                          disabled={index === 0}
                          title="Naik"
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-black/10 disabled:opacity-25"
                        >
                          <iconify-icon icon="mdi:chevron-up" width="13" height="13" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            pindahBlok(blok.id, 1);
                          }}
                          disabled={index === blokDiHalaman(doc, page).length - 1}
                          title="Turun"
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-black/10 disabled:opacity-25"
                        >
                          <iconify-icon icon="mdi:chevron-down" width="13" height="13" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            hapusBlok(blok.id);
                          }}
                          title="Hapus blok"
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#ff746c] hover:bg-[#ff746c]/15 disabled:opacity-25"
                        >
                          <iconify-icon icon="mdi:trash-can-outline" width="13" height="13" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Handle resize panel kiri */}
          <div
            onMouseDown={mulaiDragKiri}
            title="Seret untuk ubah lebar"
            className="absolute -right-1 top-1/2 h-10 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-none bg-[#171717]/10 transition-colors hover:bg-[#37352F]"
          />
        </aside>

        {/* Tengah: kertas A4 — satu-satunya area yang scroll */}
        <section
          className="print-area no-scrollbar h-full overflow-y-auto bg-[#f7f7f5] p-6 lg:pl-[var(--left-pad)] lg:pr-[var(--right-pad)]"
          style={
            {
              "--left-pad": `${leftWidth + 48}px`,
              "--right-pad": `${rightWidth + 48}px`,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: jumlahHalaman }, (_, page) => (
            <div
              key={page}
              onClick={() => setSelectedPage(page)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData("text/plain");
                if (draggedId) seretBlokKeHalaman(draggedId, page);
              }}
              className={
                "paper-sheet animate-fade-up mx-auto mb-6 w-[210mm] min-h-[297mm] bg-white p-9 text-[#171717] shadow-xl transition-shadow print:ring-0 " +
                (doc.font === "serif" ? "font-serif " : doc.font === "mono" ? "font-mono " : "font-sans ") +
                (selectedPage === page ? "ring-2 ring-[#2383E2]" : "")
              }
            >
              <div className="no-print mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-[#787774]">Halaman {page + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    hapusHalaman(page);
                  }}
                  disabled={jumlahHalaman <= 1}
                  title="Hapus halaman"
                  className="flex h-7 w-7 items-center justify-center rounded bg-[#ff746c] text-white transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
                >
                  <iconify-icon icon="mdi:trash-can-outline" width="16" height="16" />
                </button>
              </div>
              {blokDiHalaman(doc, page).length === 0 ? (
                <p className="no-print mt-4 text-center text-sm text-[#787774]">
                  Halaman kosong. Seret blok ke sini.
                </p>
              ) : doc.layout === "sidebar" ? (
                <div className="grid grid-cols-[32%_1fr] gap-0">
                  {/* Kolom kiri: sidebar berwarna, teks terang */}
                  <div
                    className="min-w-0 p-4"
                    style={{ background: doc.sidebarColor ?? "#17384A" }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const draggedId = e.dataTransfer.getData("text/plain");
                      if (draggedId) pindahkanBlokKeKolom(draggedId, true, page);
                    }}
                  >
                    {blokDiHalaman(doc, page)
                      .filter((b) => b.sidebar)
                      .map((blok, index) => (
                        <BlokEditor
                          key={blok.id}
                          blok={blok}
                          index={index}
                          totalDiHalaman={blokDiHalaman(doc, page).filter((b) => b.sidebar).length}
                          terpilih={selectedId === blok.id}
                          onPilih={() => setSelectedId(blok.id)}
                          onPindah={(arah) => pindahBlok(blok.id, arah)}
                          onHapus={() => hapusBlok(blok.id)}
                          onUbah={perbaruiBlok}
                          sidebarMode
                          docStyle={{ accentColor: doc.accentColor, headerStyle: doc.headerStyle, sectionStyle: doc.sectionStyle }}
                        />
                      ))}
                  </div>
                  {/* Kolom kanan: konten utama putih */}
                  <div
                    className="min-w-0 p-4"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const draggedId = e.dataTransfer.getData("text/plain");
                      if (draggedId) pindahkanBlokKeKolom(draggedId, false, page);
                    }}
                  >
                    {blokDiHalaman(doc, page)
                      .filter((b) => !b.sidebar)
                      .map((blok, index) => (
                        <BlokEditor
                          key={blok.id}
                          blok={blok}
                          index={index}
                          totalDiHalaman={blokDiHalaman(doc, page).filter((b) => !b.sidebar).length}
                          terpilih={selectedId === blok.id}
                          onPilih={() => setSelectedId(blok.id)}
                          onPindah={(arah) => pindahBlok(blok.id, arah)}
                          onHapus={() => hapusBlok(blok.id)}
                          onUbah={perbaruiBlok}
                          docStyle={{ accentColor: doc.accentColor, headerStyle: doc.headerStyle, sectionStyle: doc.sectionStyle }}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                blokDiHalaman(doc, page).map((blok, index) => (
                  <BlokEditor
                    key={blok.id}
                    blok={blok}
                    index={index}
                    totalDiHalaman={blokDiHalaman(doc, page).length}
                    terpilih={selectedId === blok.id}
                    onPilih={() => setSelectedId(blok.id)}
                    onPindah={(arah) => pindahBlok(blok.id, arah)}
                    onHapus={() => hapusBlok(blok.id)}
                    onUbah={perbaruiBlok}
                    docStyle={{ accentColor: doc.accentColor, headerStyle: doc.headerStyle, sectionStyle: doc.sectionStyle }}
                  />
                ))
              )}
            </div>
          ))}

          <div className="no-print mt-2 text-center">
            <button
              onClick={tambahHalaman}
              className="rounded-none border border-[#171717]/15 px-4 py-2 text-sm text-[#171717] hover:bg-[#e8e8e6]"
            >
              + Tambah halaman
            </button>
          </div>
        </section>

        {/* Panel kanan: properti blok (floating pill kanan, bisa di-resize) */}
        <aside
          className="no-print no-scrollbar fixed right-4 top-20 z-40 hidden max-h-[calc(100vh-6rem)] flex-col overflow-y-auto rounded-none border border-[#171717]/10 bg-white shadow-lg lg:flex"
          style={{ width: rightWidth }}
        >
          {/* Handle resize panel kanan */}
          <div
            onMouseDown={mulaiDragKanan}
            title="Seret untuk ubah lebar"
            className="absolute -left-1 top-1/2 h-10 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-none bg-[#171717]/10 transition-colors hover:bg-[#37352F]"
          />
          {/* Header menempel penuh ke tepi atas panel (tanpa padding panel
              di atasnya), jadi blur menutup seluruh lebar saat scroll. */}
          <h2 className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#171717]/10 bg-white/95 px-4 pb-3 pt-4 text-sm font-semibold text-[#37352F] backdrop-blur-lg">
            <iconify-icon icon="mdi:tune-variant" width="16" height="16" />
            Properti
          </h2>
          <div className="p-4">
            {blokTerpilih ? (
              <EditorBlok blok={blokTerpilih} onChange={perbaruiBlok} />
            ) : (
              <EditorDokumen doc={doc} onChange={perbaruiDokumen} />
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

// ===== Preview kertas =====

// Satu blok editor di dalam kertas. Props eksplisit supaya tidak menangkap
// state komponen induk.
function BlokEditor({
    blok,
    index,
    totalDiHalaman,
    terpilih,
    onPilih,
    onPindah,
    onHapus,
    onUbah,
    sidebarMode = false,
    docStyle,
}: {
    blok: CVBlock;
    index: number;
    totalDiHalaman: number;
    terpilih: boolean;
    onPilih: () => void;
    onPindah: (arah: number) => void;
    onHapus: () => void;
    onUbah: (b: CVBlock) => void;
    sidebarMode?: boolean;
    docStyle?: { accentColor?: string; headerStyle?: "center" | "band" | "topbar" | "sidebar"; sectionStyle?: "rule" | "bar" };
}) {
    return (
        <div
            onClick={onPilih}
            style={{ marginBottom: 4 }}
            className={
                "group relative animate-fade-in cursor-pointer rounded border p-1.5 print:border-transparent " +
                (terpilih ? "border-[#2383E2] bg-[#2383E2]/5" : "border-transparent hover:border-[#171717]/30")
            }
        >
            {/* Kontrol blok: absolute di luar aliran supaya tidak menambah
                tinggi blok (tidak mengganggu spacing antar blok).
                Muncul saat hover atau blok terpilih; no-print. */}
            <div
                className={
                    "no-print absolute -top-8 right-0 z-10 flex items-center gap-1.5 transition-opacity " +
                    (terpilih ? "opacity-100" : "opacity-0 group-hover:opacity-100")
                }
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPindah(-1);
                    }}
                    disabled={index === 0}
                    title="Naik"
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#171717] text-[#f7f7f5] shadow-sm transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
                >
                    <iconify-icon icon="mdi:chevron-up" width="14" height="14" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPindah(1);
                    }}
                    disabled={index === totalDiHalaman - 1}
                    title="Turun"
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#171717] text-[#f7f7f5] shadow-sm transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
                >
                    <iconify-icon icon="mdi:chevron-down" width="14" height="14" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onHapus();
                    }}
                    title="Hapus blok"
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#ff746c] text-white shadow-sm transition-transform hover:scale-110 active:scale-95"
                >
                    <iconify-icon icon="mdi:trash-can-outline" width="14" height="14" />
                </button>
            </div>
            <PreviewBlok blok={blok} onUbah={onUbah} sidebarMode={sidebarMode} docStyle={docStyle} />
        </div>
    );
}

// Input/textarea yang tampil seperti teks biasa di kertas.
// Tanpa border dan background; hanya ring tipis saat fokus.
// Saat print, nilai tercetak seperti teks normal.
// Mode rich (gaya Notion): contentEditable dengan toolbar B/I/U
// saat fokus. Nilai disimpan sebagai HTML (bold/italic ikut tercetak).
function TeksEditable({
    value,
    onUbah,
    multiline = false,
    className = "",
    placeholder = "",
    style,
    rich = true,
}: {
    value: string;
    onUbah: (nilai: string) => void;
    multiline?: boolean;
    className?: string;
    placeholder?: string;
    style?: React.CSSProperties;
    rich?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const selectionRef = useRef<{ start: number; end: number } | null>(null);
    const kelas =
        "resize-none rounded-none border-none bg-transparent p-0 outline-none transition-shadow focus:ring-1 focus:ring-[#2383E2]/60 " +
        className;
    // Input/textarea tidak mewarisi font dari parent secara default,
    // jadi font-size dan warna di-set ke inherit (bisa ditimpa via style).
    const gaya: React.CSSProperties = { fontSize: "inherit", color: "inherit", ...style };

    useLayoutEffect(() => {
        const element = inputRef.current;
        const selection = selectionRef.current;
        if (!element || !selection || document.activeElement !== element) return;
        element.setSelectionRange(selection.start, selection.end);
    }, [value]);

    // Auto-resize textarea: tinggi mengikuti isi (termasuk wrap otomatis),
    // bukan hanya jumlah newline. Tanpa ini, deskripsi panjang terpotong
    // dan scroll internalnya ikut tercetak saat export.
    useLayoutEffect(() => {
        const element = inputRef.current;
        if (!element || element.tagName !== "TEXTAREA") return;
        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
    }, [value]);

    function ubahTeks(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
        selectionRef.current = {
            start: event.target.selectionStart ?? event.target.value.length,
            end: event.target.selectionEnd ?? event.target.value.length,
        };
        onUbah(event.target.value);
    }

    if (rich) {
        return <TeksRich value={value} onUbah={onUbah} className={className} placeholder={placeholder} style={gaya} singleLine={!multiline} />;
    }

    if (multiline) {
        return (
            <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={ubahTeks}
                placeholder={placeholder}
                rows={1}
                style={gaya}
                className={kelas + " overflow-hidden"}
            />
        );
    }
    return (
        <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={ubahTeks}
            placeholder={placeholder}
            style={gaya}
            className={kelas}
        />
    );
}

// Field teks kaya (gaya Notion): contentEditable dengan toolbar B/I/U
// yang muncul saat fokus. Nilai disimpan sebagai HTML, jadi bold/italic
// tampil di kertas dan ikut tercetak di PDF.
function TeksRich({
    value,
    onUbah,
    className,
    placeholder,
    style,
    singleLine = false,
}: {
    value: string;
    onUbah: (nilai: string) => void;
    className?: string;
    placeholder?: string;
    style?: React.CSSProperties;
    singleLine?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [fokus, setFokus] = useState(false);
    const [adaSeleksi, setAdaSeleksi] = useState(false);

    // Toolbar hanya muncul saat ada teks yang dipilih (gaya Notion),
    // bukan saat sekadar mengklik field.
    function cekSeleksi(): void {
        const sel = window.getSelection();
        setAdaSeleksi(!!sel && !sel.isCollapsed && sel.rangeCount > 0);
    }

    // Sinkronkan nilai dari luar (mis. setelah load dokumen) hanya jika
    // konten DOM berbeda; jangan ganggu posisi kursor saat mengetik.
    useLayoutEffect(() => {
        const el = ref.current;
        if (el && el.innerHTML !== value && document.activeElement !== el) {
            el.innerHTML = value;
        }
    }, [value]);

    function format(perintah: string): void {
        const el = ref.current;
        if (!el) return;
        el.focus();
        document.execCommand(perintah, false);
        // execCommand tidak selalu memicu onInput; baca ulang hasilnya.
        onUbah(el.innerHTML);
    }

    // Shortcut gaya Notion: Ctrl/Cmd+B = tebal, I = miring, U = garis bawah.
    // Untuk field satu baris, Enter = selesai (pindah fokus), bukan baris baru.
    function shortcut(e: React.KeyboardEvent): void {
        if (e.key === "Enter" && singleLine) {
            e.preventDefault();
            ref.current?.blur();
            return;
        }
        if (!(e.ctrlKey || e.metaKey)) return;
        const kunci = e.key.toLowerCase();
        const perintah = kunci === "b" ? "bold" : kunci === "i" ? "italic" : kunci === "u" ? "underline" : null;
        if (!perintah) return;
        e.preventDefault();
        format(perintah);
    }

    return (
        <div className="relative">
            {fokus && adaSeleksi && (
                <div className="absolute -top-7 left-0 z-10 flex items-center gap-0.5 rounded-none border border-[#171717]/10 bg-white px-1 py-0.5 shadow-md">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format("bold")}
                        title="Tebal"
                        className="flex h-5 w-6 items-center justify-center rounded text-xs font-bold text-[#171717] hover:bg-[#efefef]"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format("italic")}
                        title="Miring"
                        className="flex h-5 w-6 items-center justify-center rounded text-xs italic text-[#171717] hover:bg-[#efefef]"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format("underline")}
                        title="Garis bawah"
                        className="flex h-5 w-6 items-center justify-center rounded text-xs underline text-[#171717] hover:bg-[#efefef]"
                    >
                        U
                    </button>
                </div>
            )}
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                    onUbah(e.currentTarget.innerHTML);
                    cekSeleksi();
                }}
                onKeyDown={shortcut}
                onKeyUp={cekSeleksi}
                onMouseUp={cekSeleksi}
                onFocus={() => setFokus(true)}
                onBlur={() => {
                    setFokus(false);
                    setAdaSeleksi(false);
                }}
                data-placeholder={placeholder}
                className={
                    "rich-teks min-w-0 outline-none transition-shadow focus:ring-1 focus:ring-[#2383E2]/60 " +
                    (className ?? "")
                }
                style={style}
            />
        </div>
    );
}

function PreviewBlok({
    blok,
    onUbah,
    sidebarMode = false,
    docStyle,
}: {
    blok: CVBlock;
    onUbah: (b: CVBlock) => void;
    sidebarMode?: boolean;
    docStyle?: { accentColor?: string; headerStyle?: "center" | "band" | "topbar" | "sidebar"; sectionStyle?: "rule" | "bar" };
}) {
  const fontSize = blok.style?.fontSize ?? 16;
  const color = blok.style?.color ?? "#171717";
  const gap = 3;
  const headerStyle = docStyle?.headerStyle ?? "center";
  const sectionStyle = docStyle?.sectionStyle ?? "rule";
  const accent = docStyle?.accentColor ?? "#3F6382";

  // Heading section: "rule" = uppercase + garis tipis;
  // "bar" = heading dalam bar abu-abu muda.
  function headingSection(nilai: string, onUbahNama: (v: string) => void): React.ReactNode {
    if (sectionStyle === "bar") {
      return (
        <TeksEditable
          value={nilai}
          onUbah={onUbahNama}
          placeholder="Nama section"
          className="mb-1.5 w-full bg-[#EEF0EE] px-2 py-1 font-semibold uppercase tracking-wide"
        />
      );
    }
    return (
      <TeksEditable
        value={nilai}
        onUbah={onUbahNama}
        placeholder="Nama section"
        className={"mb-1 w-full border-b pb-0.5 font-semibold uppercase tracking-wide " + (sidebarMode ? "border-white/30" : "border-[#171717]/20")}
      />
    );
  }

  if (blok.type === "header") {
    // Header band: latar warna aksen penuh lebar, teks putih (Cobalt Edge).
    if (headerStyle === "band") {
      return (
        <div style={{ fontSize: `${fontSize}px`, color: "#ffffff" }}>
          <div className="-m-1.5 flex items-center gap-4 p-6" style={{ background: accent }}>
            {blok.data.photo && (
              <img src={blok.data.photo} alt="Foto profil" className="h-20 w-20 shrink-0 rounded-none border-2 border-white/60 object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <TeksEditable
                value={blok.data.fullName}
                onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, fullName: v } })}
                placeholder="Nama Lengkap"
                className="w-full font-bold"
                style={{ fontSize: "1.9em" }}
              />
              <TeksEditable
                value={blok.data.title}
                onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, title: v } })}
                placeholder="Judul / Posisi"
                className="w-full"
                style={{ fontSize: "1.2em" }}
              />
              <div className="flex flex-col gap-0.5 opacity-70" style={{ fontSize: "0.85em" }}>
                <TeksEditable
                  value={blok.data.email}
                  onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, email: v } })}
                  placeholder="email@contoh.com"
                  className="w-full"
                />
                <TeksEditable
                  value={blok.data.phone}
                  onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, phone: v } })}
                  placeholder="Telepon"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Header topbar: bar abu-abu terang, foto kiri (Mercury Flow / Steady Form).
    if (headerStyle === "topbar") {
      return (
        <div style={{ fontSize: `${fontSize}px`, color }}>
          <div className="-m-1.5 mb-1.5 flex items-center gap-4 bg-[#EEF0EE] p-5">
            {blok.data.photo && (
              <img src={blok.data.photo} alt="Foto profil" className="h-16 w-16 shrink-0 rounded-none object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <TeksEditable
                value={blok.data.fullName}
                onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, fullName: v } })}
                placeholder="Nama Lengkap"
                className="w-full font-bold"
                style={{ fontSize: "1.7em" }}
              />
              <TeksEditable
                value={blok.data.title}
                onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, title: v } })}
                placeholder="Judul / Posisi"
                className="w-full"
                style={{ fontSize: "1.1em" }}
              />
              <div className="flex flex-col gap-0.5 opacity-60" style={{ fontSize: "0.85em" }}>
                <TeksEditable
                  value={blok.data.email}
                  onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, email: v } })}
                  placeholder="email@contoh.com"
                  className="w-full"
                />
                <TeksEditable
                  value={blok.data.phone}
                  onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, phone: v } })}
                  placeholder="Telepon"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Header center (Classic Clear / Editorial) atau sidebar (Atlantic Blue).
    // Di sidebar, teks mengikuti warna blok (putih dari template).
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        <div className={"flex items-center gap-4 " + (headerStyle === "center" && !sidebarMode ? "flex-col text-center" : "")}>
          {blok.data.photo && (
            <img src={blok.data.photo} alt="Foto profil" className="h-20 w-20 shrink-0 rounded-none object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <TeksEditable
              value={blok.data.fullName}
              onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, fullName: v } })}
              placeholder="Nama Lengkap"
              className={"w-full font-bold " + (headerStyle === "center" && !sidebarMode ? "text-center" : "")}
              style={{ fontSize: "1.9em" }}
            />
            <TeksEditable
              value={blok.data.title}
              onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, title: v } })}
              placeholder="Judul / Posisi"
              className={"w-full " + (headerStyle === "center" && !sidebarMode ? "text-center" : "")}
              style={{ fontSize: "1.2em" }}
            />
            <div className="flex flex-col items-center gap-0.5 opacity-60" style={{ fontSize: "0.85em" }}>
              <TeksEditable
                value={blok.data.email}
                onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, email: v } })}
                placeholder="email@contoh.com"
                className="w-full text-center"
              />
              <TeksEditable
                value={blok.data.phone}
                onUbah={(v) => onUbah({ ...blok, data: { ...blok.data, phone: v } })}
                placeholder="Telepon"
                className="w-full text-center"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (blok.type === "experience") {
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        {headingSection(blok.name ?? "", (v) => onUbah({ ...blok, name: v }))}
        {blok.data.items.length === 0 ? (
          <p className="text-sm opacity-50">Belum ada item.</p>
        ) : (
          blok.data.items.map((item, i) => (
            <div key={i} style={{ marginBottom: gap }}>
              <div className="flex items-baseline gap-3">
                <TeksEditable
                  value={item.title}
                  onUbah={(v) =>
                    onUbah({
                      ...blok,
                      data: { items: blok.data.items.map((x, j) => (j === i ? { ...x, title: v } : x)) },
                    })
                  }
                  placeholder="Posisi"
                  className="min-w-0 flex-1 font-semibold"
                />
                <TeksEditable
                  value={item.period}
                  onUbah={(v) =>
                    onUbah({
                      ...blok,
                      data: { items: blok.data.items.map((x, j) => (j === i ? { ...x, period: v } : x)) },
                    })
                  }
                  placeholder="Periode"
                  className="w-32 shrink-0 text-right opacity-60"
                />
              </div>
              <TeksEditable
                value={item.company}
                onUbah={(v) =>
                  onUbah({
                    ...blok,
                    data: { items: blok.data.items.map((x, j) => (j === i ? { ...x, company: v } : x)) },
                  })
                }
                placeholder="Perusahaan"
                className="w-full"
              />
              <TeksEditable
                value={item.description}
                onUbah={(v) =>
                  onUbah({
                    ...blok,
                    data: { items: blok.data.items.map((x, j) => (j === i ? { ...x, description: v } : x)) },
                  })
                }
                placeholder="Deskripsi"
                rich
                multiline
                className="w-full opacity-70"
              />
            </div>
          ))
        )}
      </div>
    );
  }

  if (blok.type === "skills") {
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        {headingSection(blok.name ?? "", (v) => onUbah({ ...blok, name: v }))}
        {blok.data.skills.length === 0 ? (
          <p className="text-sm opacity-50">Belum ada skill.</p>
        ) : (
          <ul>
            {blok.data.skills.map((skill, i) => (
              <li key={i} className="flex items-baseline gap-2" style={{ marginBottom: i === blok.data.skills.length - 1 ? 0 : gap }}>
                <span aria-hidden="true" className="shrink-0">•</span>
                <TeksEditable
                  value={skill}
                  onUbah={(v) =>
                    onUbah({
                      ...blok,
                      data: { skills: blok.data.skills.map((s, j) => (j === i ? v : s)) },
                    })
                  }
                  placeholder="Skill"
                  className="min-w-0 flex-1"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Blok paragraf: judul section (mis. "Ringkasan") + paragraf bebas.
  // Cocok untuk "About me" / deskripsi bebas.
  if (blok.type === "paragraph") {
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        {headingSection(blok.name ?? "", (v) => onUbah({ ...blok, name: v }))}
        <TeksEditable
          value={blok.data.text}
          onUbah={(v) => onUbah({ ...blok, data: { text: v } })}
          placeholder="Tulis paragraf di sini… (misalnya ringkasan tentang kamu)"
          rich
          multiline
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div style={{ fontSize: `${fontSize}px`, color }}>
      {headingSection(blok.name ?? "", (v) => onUbah({ ...blok, name: v }))}
      {blok.data.items.length === 0 ? (
        <p className="text-sm opacity-50">Belum ada item.</p>
        ) : (
        <ul>
          {blok.data.items.map((item, i) => (
            <li key={i} className="flex items-baseline gap-2" style={{ marginBottom: i === blok.data.items.length - 1 ? 0 : gap }}>
              <TeksEditable
                value={item.label}
                onUbah={(v) =>
                  onUbah({
                    ...blok,
                    data: { items: blok.data.items.map((x, j) => (j === i ? { ...x, label: v } : x)) },
                  })
                }
                placeholder="Label"
                className="w-1/3 shrink-0 font-semibold"
              />
              <span aria-hidden="true" className="shrink-0">: </span>
              <TeksEditable
                value={item.value}
                onUbah={(v) =>
                  onUbah({
                    ...blok,
                    data: { items: blok.data.items.map((x, j) => (j === i ? { ...x, value: v } : x)) },
                  })
                }
                placeholder="Isi"
                rich
                className="min-w-0 flex-1"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== Editor properti per jenis blok =====

// Kontrol tema dokumen: layout, warna aksen, font.
// Muncul di panel Properti saat tidak ada blok yang dipilih.
function EditorDokumen({
    doc,
    onChange,
}: {
    doc: CVDocument;
    onChange: (perubahan: Partial<CVDocument>) => void;
}) {
    const accent = doc.accentColor ?? "#3F6382";
    const font = doc.font ?? "sans";

    return (
        <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-[#787774]">Pengaturan dokumen</p>

            <div className="rounded border border-[#171717]/10 p-3">
                <p className="text-xs text-[#787774]">Warna aksen</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                    <input
                        type="color"
                        value={accent}
                        onChange={(e) => onChange({ accentColor: e.target.value })}
                        className="h-8 w-10 cursor-pointer rounded border border-[#171717]/20 bg-transparent"
                    />
                    <span className="font-mono text-xs text-[#787774]">{accent}</span>
                </label>
            </div>

            <div className="rounded border border-[#171717]/10 p-3">
                <p className="text-xs text-[#787774]">Font</p>
                <select
                    value={font}
                    onChange={(e) => onChange({ font: e.target.value as CVDocument["font"] })}
                    className="mt-2 w-full rounded bg-[#efefef] px-2 py-1.5 text-sm outline-none focus:bg-[#e8e8e6]"
                >
                    <option value="sans">Sans (Arial)</option>
                    <option value="serif">Serif (Times)</option>
                    <option value="mono">Mono (Courier)</option>
                </select>
            </div>
        </div>
    );
}

function EditorBlok({
    blok,
    onChange,
}: {
    blok: CVBlock;
    onChange: (b: CVBlock) => void;
}) {
  // Kontrol gaya berlaku untuk semua jenis blok
  const style = blok.style ?? { fontSize: 16, color: "#171717" };

  function ubahStyle(perubahan: Partial<BlockStyle>): void {
    onChange({ ...blok, style: { ...style, ...perubahan } });
  }

  function ubahNama(nilai: string): void {
    onChange({ ...blok, name: nilai });
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <LabelInput label="Nama blok" value={blok.name ?? ""} onUbah={ubahNama} />

      <div className="rounded border border-[#171717]/10 p-3">
        <p className="text-xs text-[#787774]">Ukuran & warna</p>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs">
            Font
            <input
              type="number"
              min={8}
              max={48}
              value={style.fontSize}
              onChange={(e) => ubahStyle({ fontSize: Number(e.target.value) })}
              className="w-16 rounded bg-[#efefef] px-2 py-1 text-sm outline-none focus:bg-[#e8e8e6]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            Warna
            <input
              type="color"
              value={style.color}
              onChange={(e) => ubahStyle({ color: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded border border-[#171717]/20 bg-transparent"
            />
          </label>
        </div>
      </div>

      {blok.type === "header" && <EditorHeader blok={blok} onChange={onChange} />}
      {blok.type === "experience" && <EditorExperience blok={blok} onChange={onChange} />}
      {blok.type === "skills" && <EditorSkills blok={blok} onChange={onChange} />}
      {blok.type === "custom" && <EditorCustom blok={blok} onChange={onChange} />}
      {blok.type === "paragraph" && <EditorParagraph blok={blok} onChange={onChange} />}
    </div>
  );
}

function FotoProfil({
  photo,
  onChange,
}: {
  photo?: string;
  onChange: (photo: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  function pilihFile(): void {
    inputRef.current?.click();
  }

  function prosesFile(file: File): void {
    if (!file.type.startsWith("image/")) return;
    setProcessing(true);
    resizeFoto(file).then((dataUrl) => {
      onChange(dataUrl);
      setProcessing(false);
    });
  }

  function hapusFoto(): void {
    onChange("");
  }

  return (
    <div className="rounded-none border border-[#171717]/10 bg-[#f7f7f5] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-none border border-[#2383E2]/40 bg-white text-[#2383E2]">
          {photo ? (
            <img src={photo} alt="Foto profil" className="h-full w-full object-cover" />
          ) : (
            <iconify-icon icon="mdi:account-outline" width="24" height="24" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Foto profil</p>
          <p className="mt-0.5 text-xs text-[#787774]">
            {photo ? "Foto tersimpan di perangkat ini" : "Tambahkan foto agar header lebih personal"}
          </p>
        </div>
        {photo && (
          <button
            type="button"
            onClick={hapusFoto}
            title="Hapus foto"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-[#ff746c] transition-transform hover:scale-105 hover:bg-[#ff746c]/10 active:scale-95"
          >
            <iconify-icon icon="mdi:trash-can-outline" width="17" height="17" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={pilihFile}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) prosesFile(file);
        }}
        className={
          "mt-3 flex w-full items-center justify-center gap-2 rounded-none border border-dashed px-3 py-2 text-xs transition-colors " +
          (dragging
            ? "border-[#37352F] bg-[#37352F]/10 text-[#37352F]"
            : "border-[#171717]/20 bg-white text-[#787774] hover:border-[#37352F] hover:bg-white")
        }
      >
        <iconify-icon icon={photo ? "mdi:image-edit-outline" : "mdi:cloud-upload-outline"} width="17" height="17" />
        {processing ? "Memproses foto…" : photo ? "Ganti foto" : "Upload foto"}
      </button>
      <p className="mt-2 text-center text-[11px] text-[#9b9a97]">JPG, PNG, atau WEBP · maksimal 200px</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) prosesFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function EditorHeader({
  blok,
  onChange,
}: {
  blok: Extract<CVBlock, { type: "header" }>;
  onChange: (b: CVBlock) => void;
}) {
  function ubah(field: keyof typeof blok.data, nilai: string): void {
    onChange({ ...blok, data: { ...blok.data, [field]: nilai } });
  }

  return (
    <div className="flex flex-col gap-3">
      <FotoProfil photo={blok.data.photo} onChange={(photo) => ubah("photo", photo)} />
      <LabelInput label="Nama" value={blok.data.fullName} onUbah={(v) => ubah("fullName", v)} />
      <LabelInput label="Judul" value={blok.data.title} onUbah={(v) => ubah("title", v)} />
      <LabelInput label="Email" value={blok.data.email} onUbah={(v) => ubah("email", v)} />
      <LabelInput label="Telepon" value={blok.data.phone} onUbah={(v) => ubah("phone", v)} />
    </div>
  );
}

function EditorExperience({
  blok,
  onChange,
}: {
  blok: Extract<CVBlock, { type: "experience" }>;
  onChange: (b: CVBlock) => void;
}) {
  function ubahItem(index: number, field: keyof ExperienceItem, nilai: string): void {
    const items = blok.data.items.map((item, i) =>
      i === index ? { ...item, [field]: nilai } : item
    );
    onChange({ ...blok, data: { items } });
  }

  function tambahItem(): void {
    const kosong: ExperienceItem = { title: "", company: "", period: "", description: "" };
    onChange({ ...blok, data: { items: [...blok.data.items, kosong] } });
  }

  function hapusItem(index: number): void {
    const items = blok.data.items.filter((_, i) => i !== index);
    onChange({ ...blok, data: { items } });
  }

  // Drag & drop untuk mengurutkan item pengalaman
  function pindahkanItem(dari: number, ke: number): void {
    const hasil = [...blok.data.items];
    const item = hasil.splice(dari, 1)[0];
    hasil.splice(ke, 0, item);
    onChange({ ...blok, data: { items: hasil } });
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={tambahItem} className="flex items-center justify-center gap-1.5 rounded-none bg-[#37352F] px-3 py-1 text-sm font-medium text-white hover:bg-[#2f2b26]">
        <iconify-icon icon="mdi:plus" width="14" height="14" />
        Tambah item
      </button>
      {blok.data.items.map((item, i) => (
        <div
          key={i}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dari = Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(dari) && dari !== i) pindahkanItem(dari, i);
          }}
          className="flex flex-col gap-1.5 rounded border border-[#171717]/10 p-2.5"
        >
          <div className="flex items-center justify-between">
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(i));
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab text-[#787774] active:cursor-grabbing"
              title="Seret untuk mengurutkan"
            >
            <iconify-icon icon="mdi:drag-vertical" width="16" height="16" />
            </span>
            <button onClick={() => hapusItem(i)} title="Hapus item" className="flex h-7 w-7 items-center justify-center rounded text-[#ff746c] transition-transform hover:scale-110 hover:bg-[#ff746c]/10 active:scale-95">
              <iconify-icon icon="mdi:trash-can-outline" width="16" height="16" />
            </button>
          </div>
          <LabelInput label="Posisi" value={item.title} onUbah={(v) => ubahItem(i, "title", v)} />
          <LabelInput label="Perusahaan" value={item.company} onUbah={(v) => ubahItem(i, "company", v)} />
          <LabelInput label="Periode" value={item.period} onUbah={(v) => ubahItem(i, "period", v)} />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#787774]">Deskripsi</label>
            <textarea
              value={item.description}
              onChange={(e) => ubahItem(i, "description", e.target.value)}
              rows={3}
              className="rounded bg-[#efefef] px-2 py-1.5 text-sm outline-none focus:bg-[#e8e8e6]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EditorSkills({
  blok,
  onChange,
}: {
  blok: Extract<CVBlock, { type: "skills" }>;
  onChange: (b: CVBlock) => void;
}) {
  function ubahSkill(index: number, nilai: string): void {
    const skills = blok.data.skills.map((s, i) => (i === index ? nilai : s));
    onChange({ ...blok, data: { skills } });
  }

  function tambahSkill(): void {
    onChange({ ...blok, data: { skills: [...blok.data.skills, ""] } });
  }

  function hapusSkill(index: number): void {
    const skills = blok.data.skills.filter((_, i) => i !== index);
    onChange({ ...blok, data: { skills } });
  }

  // Drag & drop untuk mengurutkan skill
  function pindahkanSkill(dari: number, ke: number): void {
    const hasil = [...blok.data.skills];
    const skill = hasil.splice(dari, 1)[0];
    hasil.splice(ke, 0, skill);
    onChange({ ...blok, data: { skills: hasil } });
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={tambahSkill} className="flex items-center justify-center gap-1.5 rounded-none bg-[#37352F] px-3 py-1 text-sm font-medium text-white hover:bg-[#2f2b26]">
        <iconify-icon icon="mdi:plus" width="14" height="14" />
        Tambah skill
      </button>
      {blok.data.skills.map((skill, i) => (
        <div
          key={i}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dari = Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(dari) && dari !== i) pindahkanSkill(dari, i);
          }}
          className="flex items-center gap-2"
        >
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", String(i));
              e.dataTransfer.effectAllowed = "move";
            }}
            className="cursor-grab text-[#9b9a97] active:cursor-grabbing"
            title="Seret untuk mengurutkan"
          >
            <iconify-icon icon="mdi:drag-vertical" width="16" height="16" />
          </span>
          <input
            value={skill}
            onChange={(e) => ubahSkill(i, e.target.value)}
            placeholder="Skill"
            className="flex-1 rounded bg-[#efefef] px-2 py-1.5 text-sm outline-none focus:bg-[#e8e8e6]"
          />
          <button onClick={() => hapusSkill(i)} title="Hapus skill" className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[#ff746c] transition-transform hover:scale-110 hover:bg-[#ff746c]/10 active:scale-95">
            <iconify-icon icon="mdi:trash-can-outline" width="16" height="16" />
          </button>
        </div>
      ))}
    </div>
  );
}

function EditorCustom({
  blok,
  onChange,
}: {
  blok: Extract<CVBlock, { type: "custom" }>;
  onChange: (b: CVBlock) => void;
}) {
  function ubahItem(index: number, field: keyof CustomItem, nilai: string): void {
    const items = blok.data.items.map((item, i) =>
      i === index ? { ...item, [field]: nilai } : item
    );
    onChange({ ...blok, data: { items } });
  }

  function tambahItem(): void {
    const kosong: CustomItem = { label: "", value: "" };
    onChange({ ...blok, data: { items: [...blok.data.items, kosong] } });
  }

  function hapusItem(index: number): void {
    const items = blok.data.items.filter((_, i) => i !== index);
    onChange({ ...blok, data: { items } });
  }

  function pindahkanItem(dari: number, ke: number): void {
    const hasil = [...blok.data.items];
    const item = hasil.splice(dari, 1)[0];
    hasil.splice(ke, 0, item);
    onChange({ ...blok, data: { items: hasil } });
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={tambahItem} className="flex items-center justify-center gap-1.5 rounded-none bg-[#37352F] px-3 py-1 text-sm font-medium text-white hover:bg-[#2f2b26]">
        <iconify-icon icon="mdi:plus" width="14" height="14" />
        Tambah item
      </button>
      {blok.data.items.map((item, i) => (
        <div
          key={i}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dari = Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(dari) && dari !== i) pindahkanItem(dari, i);
          }}
          className="flex flex-col gap-1.5 rounded border border-[#171717]/10 p-2.5"
        >
          <div className="flex items-center justify-between">
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(i));
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab text-[#787774] active:cursor-grabbing"
              title="Seret untuk mengurutkan"
            >
            <iconify-icon icon="mdi:drag-vertical" width="16" height="16" />
            </span>
            <button onClick={() => hapusItem(i)} title="Hapus item" className="flex h-7 w-7 items-center justify-center rounded text-[#ff746c] transition-transform hover:scale-110 hover:bg-[#ff746c]/10 active:scale-95">
              <iconify-icon icon="mdi:trash-can-outline" width="16" height="16" />
            </button>
          </div>
          <LabelInput label="Label" value={item.label} onUbah={(v) => ubahItem(i, "label", v)} />
          <LabelInput label="Isi" value={item.value} onUbah={(v) => ubahItem(i, "value", v)} />
        </div>
      ))}
    </div>
  );
}

// Editor blok paragraf: hanya satu textarea besar, tanpa label.
function EditorParagraph({
  blok,
  onChange,
}: {
  blok: Extract<CVBlock, { type: "paragraph" }>;
  onChange: (b: CVBlock) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#787774]">Paragraf</label>
      <textarea
        value={blok.data.text}
        onChange={(e) => onChange({ ...blok, data: { text: e.target.value } })}
        placeholder="Tulis paragraf di sini…"
        rows={6}
        className="rounded bg-[#efefef] px-2 py-1.5 text-sm outline-none focus:bg-[#e8e8e6]"
      />
    </div>
  );
}

// ===== Input kecil dengan label =====

// Membaca file gambar, mengecilkannya ke maksimal 200px, mengembalikan data URL.
// Data URL kecil supaya tidak membebani IndexedDB.
function resizeFoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 200;
        const skala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * skala);
        canvas.height = Math.round(img.height * skala);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak tersedia"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Gambar tidak valid"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("File tidak terbaca"));
    reader.readAsDataURL(file);
  });
}

function LabelInput({
  label,
  value,
  onUbah,
}: {
  label: string;
  value: string;
  onUbah: (nilai: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[11px] text-[#787774]">{label}</label>
      <input
        value={value}
        onChange={(e) => onUbah(e.target.value)}
        className="rounded bg-[#efefef] px-2 py-1 text-sm outline-none focus:bg-[#e8e8e6]"
      />
    </div>
  );
}

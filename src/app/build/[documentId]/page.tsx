"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument, CVBlock, ExperienceItem, CustomItem, BlockStyle } from "@/domain/cv";

const repo = new IndexedDBRepository();

// Membuat blok baru dengan data kosong, sesuai jenisnya
function blokBaru(type: CVBlock["type"], page: number): CVBlock {
  const id = crypto.randomUUID();
  const style: BlockStyle = { fontSize: 16, color: "#171717" };
  const name = type === "header" ? "Header" : type === "experience" ? "Pengalaman" : type === "skills" ? "Keahlian" : "Section";
  if (type === "header") {
    return { id, type, order: 0, visible: true, name, page, style, data: { fullName: "", title: "", email: "", phone: "" } };
  }
  if (type === "experience") {
    return { id, type, order: 0, visible: true, name, page, style, data: { items: [] } };
  }
  if (type === "skills") {
    return { id, type, order: 0, visible: true, name, page, style, data: { skills: [] } };
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

// Drag & drop: pindahkan blok ke posisi blok target (ikut halaman target)
function pindahkanBlokKe(daftar: CVBlock[], draggedId: string, targetId: string): CVBlock[] {
  let draggedIndex = -1;
  let targetIndex = -1;
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id === draggedId) draggedIndex = i;
    if (daftar[i].id === targetId) targetIndex = i;
  }
  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return daftar;

  const dragged = { ...daftar[draggedIndex], page: daftar[targetIndex].page ?? 0 };

  const sisa: CVBlock[] = [];
  for (let i = 0; i < daftar.length; i++) {
    if (i !== draggedIndex) sisa.push(daftar[i]);
  }

  let posisi = -1;
  for (let i = 0; i < sisa.length; i++) {
    if (sisa[i].id === targetId) {
      posisi = i;
      break;
    }
  }

  const hasil = [...sisa.slice(0, posisi + 1), dragged, ...sisa.slice(posisi + 1)];
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

// Membuat dokumen baru dengan daftar blok baru dan waktu terbaru
function dokumenBaru(doc: CVDocument, blocks: CVBlock[]): CVDocument {
  return { ...doc, blocks, updatedAt: Date.now() };
}

// Mengambil blok milik halaman tertentu
function blokDiHalaman(dokumen: CVDocument, page: number): CVBlock[] {
  return dokumen.blocks.filter((b) => (b.page ?? 0) === page);
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

  function seretBlokKeBlok(draggedId: string, targetId: string): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, pindahkanBlokKe(doc.blocks, draggedId, targetId)));
  }

  function seretBlokKeHalaman(draggedId: string, page: number): void {
    if (!doc) return;
    simpan(dokumenBaru(doc, pindahkanBlokKeHalaman(doc.blocks, draggedId, page)));
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
      <main className="min-h-screen bg-[#151515] p-8 font-sans text-[#f5f2ea]">
        <Link href="/" className="text-sm text-[#c8ff3d] hover:underline">
          ← Kembali ke Dashboard
        </Link>
        <p className="mt-8 text-[#a7a39a]">CV tidak ditemukan.</p>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="min-h-screen bg-[#151515] p-8 font-sans text-[#f5f2ea]">
        <p className="text-[#a7a39a]">Memuat…</p>
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
    <main className="flex h-screen flex-col bg-[#151515] font-sans text-[#f5f2ea]">
      {/* Header app (sticky di atas, sembunyi saat print) */}
      <div className="no-print flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[#c8ff3d] hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-semibold">{doc.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#a7a39a]">Tersimpan lokal</span>
          <button
            onClick={() => window.print()}
            className="rounded-md bg-[#c8ff3d] px-4 py-2 text-sm font-medium text-[#151515]"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Panel kiri: daftar blok (sticky, scroll sendiri jika panjang) */}
        <aside className="no-print flex w-52 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#1d1d1d] p-4">
          <h2 className="text-sm font-medium">Tambah blok</h2>
          <div className="mt-3 flex flex-col gap-2">
            <button onClick={() => tambahBlok("header")} className="rounded-md bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
              Header
            </button>
            <button onClick={() => tambahBlok("experience")} className="rounded-md bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
              Experience
            </button>
            <button onClick={() => tambahBlok("skills")} className="rounded-md bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
              Skills
            </button>
            <button onClick={() => tambahBlok("custom")} className="rounded-md bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10">
              Section
            </button>
          </div>
        </aside>

        {/* Tengah: kertas A4 — satu-satunya area yang scroll */}
        <section className="print-area min-w-0 flex-1 overflow-y-auto bg-[#1d1d1d] p-6">
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
                "paper-sheet mx-auto mb-6 w-[210mm] min-h-[297mm] bg-[#f6f3ed] p-12 text-[#171717] shadow-xl transition-shadow print:ring-0 " +
                (selectedPage === page ? "ring-2 ring-[#c8ff3d]" : "")
              }
            >
              <div className="no-print mb-4 flex items-center justify-between">
                <span className="text-xs font-medium text-[#8a8578]">Halaman {page + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    hapusHalaman(page);
                  }}
                  disabled={jumlahHalaman <= 1}
                  className="rounded bg-[#ff746c] px-2 py-0.5 text-xs text-[#171717] disabled:opacity-30"
                >
                  Hapus halaman
                </button>
              </div>
              {blokDiHalaman(doc, page).length === 0 ? (
                <p className="no-print mt-4 text-center text-sm text-[#8a8578]">
                  Halaman kosong. Seret blok ke sini.
                </p>
              ) : (
                blokDiHalaman(doc, page).map((blok, index) => (
                  <div
                    key={blok.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", blok.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const draggedId = e.dataTransfer.getData("text/plain");
                      if (draggedId && draggedId !== blok.id) seretBlokKeBlok(draggedId, blok.id);
                    }}
                    onClick={() => setSelectedId(blok.id)}
                    style={{ marginBottom: blok.style?.spacing ?? 24 }}
                    className={
                      "cursor-grab rounded border p-4 active:cursor-grabbing print:border-transparent " +
                      (selectedId === blok.id
                        ? "border-[#c8ff3d]"
                        : "border-transparent hover:border-white/30")
                    }
                  >
                    <div className="no-print mb-2 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pindahBlok(blok.id, -1);
                        }}
                        disabled={index === 0}
                        className="rounded bg-[#171717] px-2 py-0.5 text-xs text-[#f6f3ed] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pindahBlok(blok.id, 1);
                        }}
                        disabled={index === blokDiHalaman(doc, page).length - 1}
                        className="rounded bg-[#171717] px-2 py-0.5 text-xs text-[#f6f3ed] disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          hapusBlok(blok.id);
                        }}
                        className="rounded bg-[#ff746c] px-2 py-0.5 text-xs text-[#171717]"
                      >
                        Hapus
                      </button>
                    </div>
                    <PreviewBlok blok={blok} />
                  </div>
                ))
              )}
            </div>
          ))}

          <div className="no-print mt-2 text-center">
            <button
              onClick={tambahHalaman}
              className="rounded-md border border-white/15 px-4 py-2 text-sm text-[#f5f2ea] hover:bg-white/10"
            >
              + Tambah halaman
            </button>
          </div>
        </section>

        {/* Panel kanan: properti blok (sticky, scroll sendiri jika panjang) */}
        <aside className="no-print flex w-80 shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-[#1d1d1d] p-4">
          <h2 className="text-sm font-medium">Properti</h2>
          {blokTerpilih ? (
            <EditorBlok blok={blokTerpilih} onChange={perbaruiBlok} />
          ) : (
            <p className="mt-3 text-sm text-[#a7a39a]">Klik blok untuk mengedit.</p>
          )}
        </aside>
      </div>
    </main>
  );
}

// ===== Preview kertas =====

function PreviewBlok({ blok }: { blok: CVBlock }) {
  const fontSize = blok.style?.fontSize ?? 16;
  const color = blok.style?.color ?? "#171717";

  if (blok.type === "header") {
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        <h2 className="font-bold" style={{ fontSize: "1.9em" }}>
          {blok.data.fullName || "Nama Lengkap"}
        </h2>
        <p style={{ fontSize: "1.2em" }}>{blok.data.title || "Judul / Posisi"}</p>
        <p className="opacity-60" style={{ fontSize: "0.85em" }}>
          {[blok.data.email, blok.data.phone].filter(Boolean).join(" · ")}
        </p>
      </div>
    );
  }

  if (blok.type === "experience") {
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        <h3
          className="mb-2 border-b border-[#171717]/20 pb-1 font-semibold uppercase tracking-wide"
          style={{ fontSize: "0.9em" }}
        >
          {blok.name || "Pengalaman"}
        </h3>
        {blok.data.items.length === 0 ? (
          <p className="text-sm opacity-50">Belum ada item.</p>
        ) : (
          blok.data.items.map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{item.title || "Posisi"}</p>
                <p className="opacity-60" style={{ fontSize: "0.85em" }}>
                  {item.period}
                </p>
              </div>
              <p>{item.company}</p>
              <p className="opacity-70">{item.description}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  if (blok.type === "skills") {
    return (
      <div style={{ fontSize: `${fontSize}px`, color }}>
        <h3
          className="mb-2 border-b border-[#171717]/20 pb-1 font-semibold uppercase tracking-wide"
          style={{ fontSize: "0.9em" }}
        >
          {blok.name || "Keahlian"}
        </h3>
        {blok.data.skills.length === 0 ? (
          <p className="text-sm opacity-50">Belum ada skill.</p>
        ) : (
          <ul className="list-inside list-disc">
            {blok.data.skills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontSize: `${fontSize}px`, color }}>
      <h3
        className="mb-2 border-b border-[#171717]/20 pb-1 font-semibold uppercase tracking-wide"
        style={{ fontSize: "0.9em" }}
      >
        {blok.name || "Section"}
      </h3>
      {blok.data.items.length === 0 ? (
        <p className="text-sm opacity-50">Belum ada item.</p>
      ) : (
        <ul className="list-inside">
          {blok.data.items.map((item, i) => (
            <li key={i} className="mb-1">
              {item.label && <span className="font-semibold">{item.label}: </span>}
              {item.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== Editor properti per jenis blok =====

function EditorBlok({ blok, onChange }: { blok: CVBlock; onChange: (b: CVBlock) => void }) {
  // Kontrol gaya berlaku untuk semua jenis blok
  const style = blok.style ?? { fontSize: 16, color: "#171717", spacing: 24 };

  function ubahStyle(perubahan: Partial<BlockStyle>): void {
    onChange({ ...blok, style: { ...style, ...perubahan } });
  }

  function ubahNama(nilai: string): void {
    onChange({ ...blok, name: nilai });
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <LabelInput label="Nama blok" value={blok.name ?? ""} onUbah={ubahNama} />

      <div className="rounded border border-white/10 p-3">
        <p className="text-xs text-[#a7a39a]">Ukuran & warna</p>
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs">
              Font
              <input
                type="number"
                min={8}
                max={48}
                value={style.fontSize}
                onChange={(e) => ubahStyle({ fontSize: Number(e.target.value) })}
                className="w-16 rounded bg-white/5 px-2 py-1 text-sm outline-none focus:bg-white/10"
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              Warna
              <input
                type="color"
                value={style.color}
                onChange={(e) => ubahStyle({ color: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs">
            Jarak antar blok (px)
            <input
              type="number"
              min={0}
              max={120}
              value={style.spacing ?? 24}
              onChange={(e) => ubahStyle({ spacing: Number(e.target.value) })}
              className="w-16 rounded bg-white/5 px-2 py-1 text-sm outline-none focus:bg-white/10"
            />
          </label>
        </div>
      </div>

      {blok.type === "header" && <EditorHeader blok={blok} onChange={onChange} />}
      {blok.type === "experience" && <EditorExperience blok={blok} onChange={onChange} />}
      {blok.type === "skills" && <EditorSkills blok={blok} onChange={onChange} />}
      {blok.type === "custom" && <EditorCustom blok={blok} onChange={onChange} />}
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
    <div className="flex flex-col gap-4">
      <button onClick={tambahItem} className="rounded-md bg-[#c8ff3d] px-3 py-1.5 text-sm font-medium text-[#151515]">
        + Tambah item
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
          className="flex flex-col gap-2 rounded border border-white/10 p-3"
        >
          <div className="flex items-center justify-between">
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(i));
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab text-[#a7a39a] active:cursor-grabbing"
              title="Seret untuk mengurutkan"
            >
              ⠿
            </span>
            <button onClick={() => hapusItem(i)} className="text-xs text-[#ff746c] hover:underline">
              Hapus item
            </button>
          </div>
          <LabelInput label="Posisi" value={item.title} onUbah={(v) => ubahItem(i, "title", v)} />
          <LabelInput label="Perusahaan" value={item.company} onUbah={(v) => ubahItem(i, "company", v)} />
          <LabelInput label="Periode" value={item.period} onUbah={(v) => ubahItem(i, "period", v)} />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#a7a39a]">Deskripsi</label>
            <textarea
              value={item.description}
              onChange={(e) => ubahItem(i, "description", e.target.value)}
              rows={3}
              className="rounded bg-white/5 px-2 py-1.5 text-sm outline-none focus:bg-white/10"
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
    <div className="flex flex-col gap-3">
      <button onClick={tambahSkill} className="rounded-md bg-[#c8ff3d] px-3 py-1.5 text-sm font-medium text-[#151515]">
        + Tambah skill
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
            className="cursor-grab text-[#a7a39a] active:cursor-grabbing"
            title="Seret untuk mengurutkan"
          >
            ⠿
          </span>
          <input
            value={skill}
            onChange={(e) => ubahSkill(i, e.target.value)}
            placeholder="Skill"
            className="flex-1 rounded bg-white/5 px-2 py-1.5 text-sm outline-none focus:bg-white/10"
          />
          <button onClick={() => hapusSkill(i)} className="text-xs text-[#ff746c] hover:underline">
            Hapus
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
    <div className="flex flex-col gap-4">
      <button onClick={tambahItem} className="rounded-md bg-[#c8ff3d] px-3 py-1.5 text-sm font-medium text-[#151515]">
        + Tambah item
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
          className="flex flex-col gap-2 rounded border border-white/10 p-3"
        >
          <div className="flex items-center justify-between">
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(i));
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab text-[#a7a39a] active:cursor-grabbing"
              title="Seret untuk mengurutkan"
            >
              ⠿
            </span>
            <button onClick={() => hapusItem(i)} className="text-xs text-[#ff746c] hover:underline">
              Hapus item
            </button>
          </div>
          <LabelInput label="Label" value={item.label} onUbah={(v) => ubahItem(i, "label", v)} />
          <LabelInput label="Isi" value={item.value} onUbah={(v) => ubahItem(i, "value", v)} />
        </div>
      ))}
    </div>
  );
}

// ===== Input kecil dengan label =====

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
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[#a7a39a]">{label}</label>
      <input
        value={value}
        onChange={(e) => onUbah(e.target.value)}
        className="rounded bg-white/5 px-2 py-1.5 text-sm outline-none focus:bg-white/10"
      />
    </div>
  );
}

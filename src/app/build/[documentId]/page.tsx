"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument, CVBlock, ExperienceItem } from "@/domain/cv";

const repo = new IndexedDBRepository();

// Membuat blok baru dengan data kosong, sesuai jenisnya
function blokBaru(type: CVBlock["type"]): CVBlock {
  const id = crypto.randomUUID();
  if (type === "header") {
    return { id, type, order: 0, visible: true, data: { fullName: "", title: "", email: "", phone: "" } };
  }
  if (type === "experience") {
    return { id, type, order: 0, visible: true, data: { items: [] } };
  }
  return { id, type, order: 0, visible: true, data: { skills: [] } };
}

// Menimpa satu blok dalam daftar, mengembalikan daftar baru (tidak mengubah yang lama)
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

// Menukar posisi dua blok, mengembalikan daftar baru
function tukarBlok(daftar: CVBlock[], id: string, arah: number): CVBlock[] {
  let posisi = -1;
  for (let i = 0; i < daftar.length; i++) {
    if (daftar[i].id === id) {
      posisi = i;
      break;
    }
  }
  const target = posisi + arah;
  if (posisi === -1 || target < 0 || target >= daftar.length) {
    return daftar;
  }
  const hasil = [...daftar];
  const temp = hasil[posisi];
  hasil[posisi] = hasil[target];
  hasil[target] = temp;
  return hasil;
}

// Membuat dokumen baru dengan daftar blok baru dan waktu terbaru
function dokumenBaru(doc: CVDocument, blocks: CVBlock[]): CVDocument {
  return { ...doc, blocks, updatedAt: Date.now() };
}

export default function BuildPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;

  const [doc, setDoc] = useState<CVDocument | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  // Simpan ke IndexedDB setiap kali dokumen berubah (autosave)
  async function simpan(dokumen: CVDocument): Promise<void> {
    await repo.saveDocument(dokumen);
    setDoc(dokumen);
  }

  function tambahBlok(type: CVBlock["type"]): void {
    if (!doc) return;
    const blok = blokBaru(type);
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
    simpan(dokumenBaru(doc, tukarBlok(doc.blocks, id, arah)));
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

  return (
    <main className="min-h-screen bg-[#151515] p-4 font-sans text-[#f5f2ea] lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[#c8ff3d] hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-semibold">{doc.title}</h1>
        </div>
        <span className="text-xs text-[#a7a39a]">Tersimpan lokal</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr_300px]">
        {/* Panel kiri: daftar blok yang bisa ditambah */}
        <aside className="rounded-md border border-white/10 bg-[#1d1d1d] p-4">
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
          </div>
        </aside>

        {/* Tengah: preview kertas */}
        <section className="rounded-md bg-[#1d1d1d] p-6">
          <div className="mx-auto min-h-[700px] w-full max-w-[680px] bg-[#f6f3ed] p-10 text-[#171717]">
            {doc.blocks.length === 0 ? (
              <p className="text-center text-sm text-[#8a8578]">
                Belum ada blok. Tambahkan dari panel kiri.
              </p>
            ) : (
              doc.blocks.map((blok, index) => (
                <div
                  key={blok.id}
                  onClick={() => setSelectedId(blok.id)}
                  className={
                    "mb-6 cursor-pointer rounded border p-4 " +
                    (selectedId === blok.id
                      ? "border-[#c8ff3d]"
                      : "border-transparent hover:border-white/30")
                  }
                >
                  <div className="mb-2 flex items-center justify-end gap-2">
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
                      disabled={index === doc.blocks.length - 1}
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
        </section>

        {/* Panel kanan: properti blok yang dipilih */}
        <aside className="rounded-md border border-white/10 bg-[#1d1d1d] p-4">
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
  if (blok.type === "header") {
    return (
      <div>
        <h2 className="text-2xl font-bold">{blok.data.fullName || "Nama Lengkap"}</h2>
        <p className="text-lg">{blok.data.title || "Judul / Posisi"}</p>
        <p className="text-sm text-[#5a5649]">
          {[blok.data.email, blok.data.phone].filter(Boolean).join(" · ")}
        </p>
      </div>
    );
  }

  if (blok.type === "experience") {
    return (
      <div>
        <h3 className="mb-2 border-b border-[#171717]/20 pb-1 text-sm font-semibold uppercase tracking-wide">
          Pengalaman
        </h3>
        {blok.data.items.length === 0 ? (
          <p className="text-sm text-[#8a8578]">Belum ada item.</p>
        ) : (
          blok.data.items.map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">{item.title || "Posisi"}</p>
                <p className="text-xs text-[#5a5649]">{item.period}</p>
              </div>
              <p className="text-sm">{item.company}</p>
              <p className="text-sm text-[#5a5649]">{item.description}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 border-b border-[#171717]/20 pb-1 text-sm font-semibold uppercase tracking-wide">
        Keahlian
      </h3>
      {blok.data.skills.length === 0 ? (
        <p className="text-sm text-[#8a8578]">Belum ada skill.</p>
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

// ===== Editor properti per jenis blok =====

function EditorBlok({ blok, onChange }: { blok: CVBlock; onChange: (b: CVBlock) => void }) {
  if (blok.type === "header") {
    return <EditorHeader blok={blok} onChange={onChange} />;
  }
  if (blok.type === "experience") {
    return <EditorExperience blok={blok} onChange={onChange} />;
  }
  return <EditorSkills blok={blok} onChange={onChange} />;
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
    <div className="mt-3 flex flex-col gap-3">
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

  return (
    <div className="mt-3 flex flex-col gap-4">
      <button onClick={tambahItem} className="rounded-md bg-[#c8ff3d] px-3 py-1.5 text-sm font-medium text-[#151515]">
        + Tambah item
      </button>
      {blok.data.items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 rounded border border-white/10 p-3">
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
          <button onClick={() => hapusItem(i)} className="self-start text-xs text-[#ff746c] hover:underline">
            Hapus item
          </button>
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

  return (
    <div className="mt-3 flex flex-col gap-3">
      <button onClick={tambahSkill} className="rounded-md bg-[#c8ff3d] px-3 py-1.5 text-sm font-medium text-[#151515]">
        + Tambah skill
      </button>
      {blok.data.skills.map((skill, i) => (
        <div key={i} className="flex items-center gap-2">
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

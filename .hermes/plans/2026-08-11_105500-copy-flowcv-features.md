# Copy FlowCV Features — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Meniru fitur utama FlowCV (katalog template besar, kategori, layout 2 kolom, aksen warna, foto profil, contoh per industri) ke dalam CV builder local-first.

**Architecture:** Perluas model data `CVDocument` dengan opsi layout/theme global (tanpa merusak blok yang ada). Tambah katalog template dengan kategori dan thumbnail. Ubah Library jadi galeri template berkategori. Ubah Explore jadi katalog contoh CV per industri. Semua tetap local-first: tanpa server, tanpa akun, data di IndexedDB.

**Tech Stack:** Next.js App Router, React 19 + TypeScript, Tailwind v4, IndexedDB, Iconify CDN.

---

## Hasil Riset

### Tipe-tipe CV (dari riset umum)

| Tipe | Ciri | Cocok untuk |
|---|---|---|
| Chronological | Pengalaman terbaru di atas, urut waktu | Umum, ATS-friendly, recruiter tradisional |
| Functional | Fokus skill, minimalkan riwayat kerja | Career-changer, fresh grad |
| Combination/Hybrid | Ringkasan skill di atas + kronologis di bawah | Paling fleksibel |
| Targeted | Disesuaikan per lowongan, keyword match | Lamaran spesifik |
| Mini/One-page | Ringkas, 1 halaman | Aplikasi online cepat |
| Academic CV | Publikasi, riset, teaching | Akademisi (biasanya multi-halaman) |
| Creative/Infographic | Visual kuat | Desain, marketing, kreatif |
| ATS-optimized | Format polos, machine-readable | Aplikasi lewat sistem ATS |
| Photo CV | Ada foto profil | Pasar yang mengharapkan foto |
| First-job/Entry-level | Fokus pendidikan, proyek, organisasi, skill | Mahasiswa/fresh grad |

### Fitur FlowCV yang diteliti (flowcv.com + flowcv.com/resume-templates)

1. **50+ template** (klaim 100+), dikategorikan: Popular, Simple, Modern, Creative, Photo, Compact, First Job.
2. Alur: **Pilih template → Isi konten → Customize layout & design → Download PDF unlimited**.
3. **Template berkategori dengan audiens** (Simple = industri tradisional; Modern = bidang inovatif; Creative = peran kreatif; Photo = pasar yang mengharapkan foto; Compact = senior dengan banyak pengalaman; First Job = fresh grad tanpa riwayat kerja).
4. **Contoh resume per industri** (Finance, Harvard, Banking, Consultant, Software Engineer, Data Analyst, Teacher, dll).
5. **Customize structure, layout, dan design** — kontrol penuh.
6. **Import resume yang ada** (PDF/DOCX/PNG/JPG).
7. **ATS-friendly templates**.
8. **Tanpa watermark**.
9. **Auto-save draft**.
10. **Free plan: 1 resume gratis selamanya, unlimited PDF download**.

### Kondisi codebase saat ini (build-my-cv)

- Model: `CVDocument { id, title, blocks, category?, pageCount?, updatedAt }` di `src/domain/cv.ts`.
- `CVBlock` = union: `header` / `experience` / `skills` / `custom`. `BlockStyle { fontSize, color, spacing? }`.
- **Belum ada**: `templateId`, layout kolom, font family, aksen warna global, foto profil.
- Library: 3 template UGM datar (`src/domain/templates.ts`, 270 baris) tanpa kategori/thumbnail.
- Explore: placeholder "Coming soon" (`src/app/explore/page.tsx`).
- Dashboard: search, sort, duplicate, backup/restore, kategori, kartu dokumen.
- Build: editor blok, multi-halaman A4, export PDF via print CSS, drag reorder, rename, style per blok.

### Gap yang akan diisi (prioritas)

| Fitur FlowCV | Status | Rencana |
|---|---|---|
| Katalog template besar + kategori | ❌ 3 template datar | ✅ Fase 1: kategori + 12 template |
| Thumbnail template | ❌ | ✅ Fase 1: SVG mini per template |
| Layout 1/2 kolom | ❌ | ✅ Fase 2: `layout` di CVDocument + render |
| Aksen warna global | ❌ (hanya per blok) | ✅ Fase 2: `accentColor` global |
| Font family | ❌ | ✅ Fase 2: pilih font (serif/sans/mono) |
| Foto profil (Photo template) | ❌ | ✅ Fase 3: field foto di header |
| Explore = contoh per industri | ❌ placeholder | ✅ Fase 4: katalog contoh statis |
| Import resume PDF/DOCX | ❌ | ⏸️ Ditunda (mahal, butuh library OCR/parsing) |
| ATS check | ❌ | ⏸️ Ditunda (scope besar) |

---

## Fase 1 — Katalog Template + Kategori + Thumbnail

### Task 1.1: Tambah field kategori & template ke model

**Objective:** `CVDocument` tahu template asal + kategori, supaya Library bisa "Pakai template" dan dashboard bisa filter.

**Files:**
- Modify: `src/domain/cv.ts`

**Step 1:** Tambah tipe kategori dan field di `CVDocument`:

```ts
export type TemplateCategory = "simple" | "modern" | "creative" | "photo" | "compact" | "first-job";

export interface CVDocument {
    id: string;
    title: string;
    blocks: CVBlock[];
    category?: string;
    pageCount?: number;
    templateId?: string;
    templateCategory?: TemplateCategory;
    updatedAt: number;
}
```

**Step 2:** Verifikasi: `npx tsc --noEmit` — tidak boleh error (field baru optional, dokumen lama tetap valid).

**Step 3:** Commit: `feat: add template fields to CVDocument`

### Task 1.2: Refactor `CVTemplate` dengan kategori

**Objective:** Template punya kategori + warna aksen yang jadi identitas visual.

**Files:**
- Modify: `src/domain/templates.ts`

**Step 1:** Perluas `CVTemplate`:

```ts
export interface CVTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    description: string;
    accent: string;          // warna aksen khas template
    blocks: TemplateBlok[];
}
```

**Step 2:** Ubah 3 template lama: tambah `category` + `accent` (kepanitiaan → `first-job` + `#3F6382`, organisasi → `simple` + `#7895B2`, magang → `modern` + `#1D4ED8`).

**Step 3:** `templateKeDokumen(target, name)` (dipakai Library) ikut menyalin `templateId`, `templateCategory` ke dokumen baru.

**Step 4:** Verifikasi: `npm run lint && npm run build` — sukses.

**Step 5:** Commit: `feat: template categories and accent color`

### Task 1.3: Tambah 9 template baru (total 12)

**Objective:** Katalog mencakup semua kategori FlowCV: 2 per kategori × 6 kategori (3 lama + 9 baru).

**Files:**
- Modify: `src/domain/templates.ts`

**Step 1:** Buat template baru, tiap template pakai blok yang sudah ada (header/experience/skills/custom). Daftar:

- `first-job`: "CV Organisasi Kampus" (ada), "CV Kepanitiaan Kampus" (ada)
- `simple`: "CV Magang" (ada), "CV Fresh Graduate" (baru)
- `modern`: "CV Software Engineer" (baru), "CV Data Analyst" (baru)
- `creative`: "CV Desain Kreatif" (baru), "CV Marketing" (baru)
- `photo`: "CV dengan Foto" (baru) — sama seperti template lain, foto diisi di Fase 3
- `compact`: "CV Ringkas Satu Halaman" (baru)

**Step 2:** Konten tiap template realistis untuk mahasiswa UGM (contoh isi dari riwayat user: kepanitiaan, organisasi, project).

**Step 3:** Verifikasi: `npm run build` sukses; Library menampilkan 12 template.

**Step 4:** Commit: `feat: expand library to 12 templates across all categories`

### Task 1.4: Library jadi galeri berkategori + thumbnail

**Objective:** Library meniru halaman template FlowCV: kategori sebagai tab, kartu dengan thumbnail.

**Files:**
- Modify: `src/app/library/page.tsx`
- Create: `src/app/_components/template-thumb.tsx`

**Step 1:** Buat `TemplateThumb`: SVG miniatur kertas (mirip kartu dashboard) dengan warna aksen template:

```tsx
// template-thumb.tsx — prop: accent: string, category: TemplateCategory
export default function TemplateThumb({ accent }: { accent: string }) {
    return (
        <div className="aspect-[210/297] w-full overflow-hidden rounded-sm border border-[#171717]/10 bg-white p-3">
            <div className="h-2 w-1/2 rounded" style={{ background: accent }} />
            <div className="mt-1.5 h-1.5 w-1/3 rounded bg-[#d9d2c3]" />
            <div className="mt-3 h-1.5 w-full rounded bg-[#e4ddcd]" />
            <div className="mt-1 h-1.5 w-5/6 rounded bg-[#e4ddcd]" />
            <div className="mt-3 h-1.5 w-3/4 rounded bg-[#e4ddcd]" />
        </div>
    );
}
```

**Step 2:** Library: tab kategori (`Semua`, `Simple`, `Modern`, `Creative`, `Photo`, `Compact`, `First Job`) + grid kartu (thumbnail, nama, deskripsi, tombol "Pakai template").

**Step 3:** Klik "Pakai template" → tetap pakai `templateKeDokumen` + `router.push(/build/{id})`.

**Step 4:** Verifikasi di browser: tab filter bekerja, thumbnail tampil, pakai template membuka editor dengan blok terisi.

**Step 5:** Commit: `feat: library gallery with categories and thumbnails`

---

## Fase 2 — Layout, Aksen Warna, Font (Customize design)

### Task 2.1: Tambah opsi layout & tema global ke model

**Objective:** Dokumen bisa memilih layout kolom, warna aksen, dan font — gaya FlowCV "customize layout & design".

**Files:**
- Modify: `src/domain/cv.ts`

**Step 1:**

```ts
export type DocumentLayout = "single" | "two-column";
export type DocumentFont = "sans" | "serif" | "mono";

export interface CVDocument {
    // ... field yang sudah ada
    layout?: DocumentLayout;        // default "single"
    accentColor?: string;           // default "#3F6382"
    font?: DocumentFont;            // default "sans"
    updatedAt: number;
}
```

**Step 2:** Helper module-level (aturan lint React 19: fungsi murni di luar komponen):

```ts
export function dokumenBaruKosong(id: string, title: string): CVDocument {
    return { id, title, blocks: [], updatedAt: Date.now(), layout: "single", accentColor: "#3F6382", font: "sans" };
}
```

**Step 3:** `templateKeDokumen` menyalin `accentColor` dari template.

**Step 4:** Verifikasi: `npx tsc --noEmit` bersih.

**Step 5:** Commit: `feat: document layout and theme fields`

### Task 2.2: Kontrol tema di panel Properti (dokumen)

**Objective:** Saat tidak ada blok terpilih, panel kanan menampilkan kontrol dokumen: layout, aksen, font.

**Files:**
- Modify: `src/app/build/[documentId]/page.tsx`

**Step 1:** Di `EditorDokumen` (komponen baru): 3 kontrol — layout (select: 1 kolom / 2 kolom), warna aksen (input color), font (select: Sans/Serif/Mono).

**Step 2:** Saat `blokTerpilih === null`, panel kanan render `<EditorDokumen ... />` menggantikan teks "Klik blok untuk mengedit."

**Step 3:** Perubahan tema lewat `perbaruiDokumen(perubahan)` → `simpan({ ...doc, ...perubahan, updatedAt: Date.now() })`.

**Step 4:** Verifikasi di browser: pilih layout 2 kolom → preview berubah; ganti aksen → heading blok ikut berubah warna.

**Step 5:** Commit: `feat: document theme controls in properties panel`

### Task 2.3: Render layout 2 kolom + font di preview

**Objective:** Kertas mendukung 2 kolom (sidebar kiri sempit + konten kanan) dan variasi font.

**Files:**
- Modify: `src/app/build/[documentId]/page.tsx` (bagian `PreviewBlok` dan render kertas)

**Step 1:** Blok punya field `column?: "left" | "right"` (tambah di `CVBlock` di `cv.ts`, opsional). Blok tanpa field → kolom kanan.

**Step 2:** Saat `layout === "two-column"`: kertas render grid `grid-cols-[34%_1fr]`; blok `column === "left"` masuk kolom kiri, sisanya kanan.

**Step 3:** Font: kelas `font-sans` / `font-serif` / `font-mono` pada kertas sesuai `doc.font`.

**Step 4:** Di `EditorBlok`, tambah select "Kolom" (Kanan/Kiri) hanya muncul saat layout 2 kolom.

**Step 5:** Verifikasi: layout 2 kolom menampilkan sidebar; font serif mengubah huruf; blok bisa dipindah kiri/kanan; print CSS tetap A4.

**Step 6:** Commit: `feat: two-column layout and font rendering`

---

## Fase 3 — Foto Profil (Photo template)

### Task 3.1: Field foto di HeaderData

**Objective:** Header bisa menyimpan foto profil (data URL dari upload).

**Files:**
- Modify: `src/domain/cv.ts`

**Step 1:**

```ts
export interface HeaderData {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    photo?: string;   // data URL hasil upload
}
```

**Step 2:** Verifikasi: `npx tsc --noEmit` bersih.

**Step 3:** Commit: `feat: photo field in header data`

### Task 3.2: Upload foto + render di preview

**Objective:** Editor header punya input foto; preview menampilkan foto bulat; foto tersimpan di IndexedDB (data URL — tanpa server).

**Files:**
- Modify: `src/app/build/[documentId]/page.tsx`

**Step 1:** Di editor header: input file `accept="image/*"`; baca file via `FileReader` → `dataURL` → simpan ke `data.photo`.

**Step 2:** Preview header: jika `photo` ada, tampilkan `<img src={photo} className="h-20 w-20 rounded-full object-cover" />` sejajar nama.

**Step 3:** Perhatian ukuran: data URL foto besar bisa membebani IndexedDB — konversi ke ukuran kecil (max 200px) via `<canvas>` sebelum simpan.

**Step 4:** Verifikasi di browser: upload foto → muncul di preview; simpan → reload → foto masih ada (IndexedDB).

**Step 5:** Commit: `feat: profile photo upload and preview`

---

## Fase 4 — Explore jadi Contoh per Industri

### Task 4.1: Data contoh CV per industri

**Objective:** Explore meniru "Resume Examples" FlowCV: katalog contoh per industri dengan deskripsi.

**Files:**
- Create: `src/domain/examples.ts`

**Step 1:** Tipe:

```ts
export interface ExampleIndustry {
    id: string;
    name: string;          // "Software Engineer", "Data Analyst", ...
    category: TemplateCategory;
    description: string;   // apa yang dicari recruiter
    highlight: string[];   // 3-4 poin kunci contoh isi
}
```

**Step 2:** 6 contoh: Software Engineer (modern), Data Analyst (modern), UI/UX Designer (creative), Kepanitiaan (first-job), Organisasi Kampus (first-job), Fresh Graduate (simple). Konten realistis untuk mahasiswa UGM.

**Step 3:** Commit: `feat: industry example data`

### Task 4.2: Halaman Explore menampilkan contoh

**Objective:** Explore jadi galeri contoh, bukan placeholder.

**Files:**
- Modify: `src/app/explore/page.tsx`

**Step 1:** Grid kartu: nama industri, badge kategori, deskripsi, poin kunci. Tombol "Pakai sebagai template" → buat dokumen baru dari template terkait (via `templates` lookup).

**Step 2:** Verifikasi di browser: kartu tampil, tombol membuka editor dengan isi.

**Step 3:** Commit: `feat: explore industry examples page`

---

## Fase 5 — Polish & Verifikasi Akhir

### Task 5.1: Konsistensi tema & animasi

**Objective:** Semua halaman baru memakai pola visual yang ada (LandscapeBg, animasi fade-up, palet warna).

**Files:**
- Modify: `src/app/library/page.tsx`, `src/app/explore/page.tsx`

**Step 1:** Library & Explore sudah punya LandscapeBg + animasi kartu (cek konsisten).

**Step 2:** Kartu template/explore dapat `animate-fade-up` berstagger + hover lift.

**Step 3:** Commit: `style: consistent animations across library and explore`

### Task 5.2: Tes E2E penuh

**Objective:** Buktikan alur utama mirip FlowCV bekerja end-to-end.

**Step 1 (browser):** Landing → Library → pilih template "CV Software Engineer" → editor terbuka dengan blok terisi.
**Step 2:** Ganti layout 2 kolom + aksen → preview berubah.
**Step 3:** Upload foto → tampil.
**Step 4:** Export PDF → print preview 1 halaman, tanpa watermark.
**Step 5:** Kembali ke dashboard → CV baru muncul dengan kategori.

### Task 5.3: Update README & AGENTS.md

**Files:**
- Modify: `README.md`, `AGENTS.md`

**Step 1:** Tambah fitur baru ke daftar fitur README.

**Step 2:** Commit: `docs: update feature list`

---

## Files yang Berubah (ringkasan)

- `src/domain/cv.ts` — field template/layout/tema/foto
- `src/domain/templates.ts` — kategori, aksen, 9 template baru
- `src/domain/examples.ts` — (baru) data contoh industri
- `src/app/library/page.tsx` — galeri berkategori + thumbnail
- `src/app/explore/page.tsx` — galeri contoh industri
- `src/app/_components/template-thumb.tsx` — (baru) thumbnail SVG
- `src/app/build/[documentId]/page.tsx` — kontrol tema, layout 2 kolom, foto
- `README.md`, `AGENTS.md` — dokumentasi

## Verifikasi (tiap task)

1. `npm run lint` — bersih (React 19 strict: setState hanya di `.then()`, `Date.now()`/`crypto.randomUUID()` di fungsi module-level).
2. `npm run build` — sukses.
3. Uji browser untuk perubahan UI (flow: pilih template → edit → export).
4. Commit setelah tiap task.

## Risiko & Tradeoff

- **Foto sebagai data URL di IndexedDB**: bisa membengkakkan database. Mitigasi: resize ke 200px via canvas sebelum simpan. Kalau masih masalah, pindah ke object store terpisah (ditunda).
- **Layout 2 kolom vs print CSS**: kolom kiri harus tetap A4 saat print. Mitigasi: grid CSS biasa (bukan flex), print memakai layout yang sama.
- **Template baru = konten placeholder**: isi contoh bisa salah konteks. Mitigasi: konten realistis UGM, user bisa edit semua setelah dipakai.
- **Import resume PDF/DOCX ditunda**: butuh parsing kompleks (pdfjs, mammoth) dan tidak lokal-friendly murni. Keputusan sadar: dilewati dulu, JSON restore sudah ada.

## Open Questions

1. Apakah 12 template cukup, atau mau lebih banyak (misal 18)?
2. Kategori pakai bahasa Indonesia di UI ("Pertama Kerja" vs "First Job")? FlowCV pakai Inggris; app saat ini campur.
3. Fitur foto: izinkan foto di semua template, atau hanya kategori `photo`?
4. ATS check dan import PDF: mau dikerjakan setelah fase 1-4, atau ditinggalkan permanen?

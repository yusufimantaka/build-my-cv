# Plan: Template CV v2 — 8 template berdasarkan referensi (Classic Clear, True Blue, Mercury Flow, dst.)

Tanggal: 2026-08-11
Status: AKTIF — implementasi langsung setelah plan ini.

## Referensi
User mengirim 6 gambar berisi 18 contoh CV dari penyedia template
(Classic Clear, Atlantic Blue, Mercury Flow, Editorial Rule, True Blue,
Saffron Line, Steady Form, Precision Line, Hunter Green, Quicksilver,
Silver Banner, Refined, Cobalt Edge, Classic Serif, Atlantic Horizon).
Analisis vision mengidentifikasi 3 sistem layout + variasi header/section/font/foto.

## Desain keputusan (penting)

1. **Sidebar = properti template, BUKAN kontrol user.**
   User sebelumnya menghapus kontrol "Dua kolom" di EditorDokumen karena
   ribet. Template sidebar (Atlantic Blue, Hunter Green) TETAP didukung,
   tetapi layout dikunci oleh template: dokumen menyimpan
   `layout: "single" | "sidebar"` dari `templateKeDokumen()`, dan TIDAK
   ada UI untuk mengubahnya. Blok mendapat `sidebar?: boolean` dari
   TemplateBlok (juga tanpa kontrol user).
2. **Style template disalin ke dokumen saat pakai template**, jadi dokumen
   lama tanpa field ini tetap render dengan default (single, rule, center)
   tanpa migrasi.
3. **Semua teks Bahasa Indonesia** di UI (library, editor), data contoh
   bisa berbahasa Inggris seperti referensi.

## Model (src/domain/cv.ts)

CVDocument + field OPSIONAL (default aman untuk dokumen lama):
- `layout?: "single" | "sidebar"` — dikunci dari template
- `sidebarColor?: string` — warna sidebar (mis. #17384A, #1E4D3C)
- `headerStyle?: "center" | "band" | "topbar" | "sidebar"`
  - center: nama di tengah, kontak satu baris, tanpa bg (Classic Clear)
  - band: blok warna accentColor penuh lebar, teks putih (Cobalt Edge)
  - topbar: bar abu-abu terang + foto kiri (Mercury Flow)
  - sidebar: nama putih besar di sidebar (Atlantic Blue)
- `sectionStyle?: "rule" | "bar"`
  - rule: uppercase + border-b tipis (Classic Clear, Editorial, Precision)
  - bar: heading dalam bar abu-abu muda (Mercury Flow, Steady Form)

CVBlock + `sidebar?: boolean` (opsional, dikunci template).

## Template (src/domain/templates.ts)

8 template baru (2 per kategori yang relevan):
1. **Classic Clear** (simple) — single, header center, section rule, serif,
   no photo. Accent #171717.
2. **True Blue** (simple) — single, section rule biru, sans, blue headings.
   Accent #1F4E8C.
3. **Editorial Rule** (modern) — single, header center serif, section rule
   abu, dense. Accent #333333.
4. **Mercury Flow** (modern) — single, header topbar abu + foto,
   section bar abu muda, sans. Accent #4A5D4E.
5. **Steady Form** (creative) — single, header topbar abu biru + foto,
   section bar, sans. Accent #5B6B8C.
6. **Cobalt Edge** (creative) — header band teal + foto kanan, section rule
   biru, sans. Accent #1B6B7A.
7. **Atlantic Blue** (photo) — sidebar navy #17384A, foto bulat di sidebar,
   section bar di kanan, serif nama. Accent #17384A.
8. **Hunter Green** (photo) — sidebar hijau #1E4D3C, foto, section rule.
   Accent #1E4D3C.

TemplateBlok + `sidebar?: boolean` untuk template sidebar.
`templateKeDokumen()` menyalin layout/sidebarColor/headerStyle/sectionStyle
ke dokumen; blok disalin dengan field sidebar.

## Render (src/app/build/[documentId]/page.tsx)

1. Kertas: jika `doc.layout === "sidebar"` → grid `grid-cols-[32%_1fr]`,
   kolom kiri `bg-[sidebarColor] text-white p-5`, kolom kanan putih.
   Filter blok per kolom via `b.sidebar`. Drop/order tetap bekerja
   (filter per kolom seperti pola KolomDokumen lama, tanpa UI kolom).
2. Header blok: cabang `headerStyle`:
   - center: nama `text-center`, kontak `justify-center`
   - band: wrapper `bg-[accentColor] text-white p-6`
   - topbar: `bg-[#EEF0EE] p-6` + foto kiri
   - sidebar: nama putih besar (kolom kiri sudah bg warna)
3. Section heading (experience/skills/custom): `sectionStyle === "bar"`
   → heading dalam bar `bg-[#EEF0EE] px-2 py-0.5`; "rule" → seperti sekarang
   (uppercase + border-b).
4. `EditorDokumen`: TIDAK menambah kontrol layout (tetap warna aksen + font).

## Library & thumbnail

- `template-thumb.tsx`: tambah variant `sidebar` (jalur kiri berwarna) dan
  `band` (garis tebal atas) supaya miniatur mencerminkan layout.
- `library/page.tsx`: `TemplateThumb` menerima field style dari template.

## Verifikasi

- `npm run lint` + `npm run build` bersih.
- Browser: pakai template sidebar (Atlantic Blue) → blok sidebar masuk kolom
  kiri berwarna; template band (Cobalt Edge) → header berwarna; template
  bar (Mercury Flow) → heading bar abu. Export PDF tetap tanpa scrollbar.

## Non-goals (sengaja ditunda)

- Kontrol ukuran foto (photoSize) — dihapus atas permintaan user, akan
  ditambah lagi nanti dengan pendekatan yang benar.
- Import PDF/DOCX, ATS check, proficiency dots bahasa (butuh tipe data baru).

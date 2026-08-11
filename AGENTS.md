<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# BuildMyCV — Project Guide

Local-first open source CV builder. Target user: mahasiswa UGM (kepanitiaan, organisasi, magang).

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 (utility classes; no tailwind.config — use `@theme` in globals.css)
- IndexedDB untuk penyimpanan lokal (object store `"documents"`, keyPath `"id"`)
- Iconify icons via CDN (`<iconify-icon icon="mdi:...">`), script di layout.tsx
- Tidak ada auth, tidak ada server, tidak ada API key di frontend

## Menjalankan

```bash
npm run dev     # dev server di http://localhost:3000
npm run lint    # eslint (wajib bersih sebelum commit)
npm run build   # production build (wajib sukses sebelum commit)
```

## Arsitektur

UI → Repository → IndexedDB. UI tidak pernah menyentuh IndexedDB langsung.

- `src/domain/cv.ts` — model data: `CVDocument`, `CVBlock` (discriminated union: header | experience | skills | custom | paragraph), `BlockStyle` (fontSize, color), `HeaderData.photo`, gaya template (layout, sidebarColor, headerStyle, sectionStyle)
- `src/domain/repository.ts` — interface `WorkspaceRepository` (loadDocuments / saveDocument / deleteDocument)
- `src/domain/in-memory-repository.ts` — implementasi memori (tes)
- `src/domain/indexed-db-repository.ts` — implementasi IndexedDB
- `src/domain/templates.ts` — 19 template: `templatesContoh` (11 "CV ..." untuk Library) + `templatesDesain` (8 bernama untuk Explore) + `templateKeDokumen()`
- `src/domain/examples.ts` — contoh CV per industri (tidak lagi dipakai halaman; kandidat hapus)
- `src/app/_components/dashboard.tsx` — dashboard: kategori, search, sort, zoom grid, backup/restore JSON
- `src/app/_components/template-thumb.tsx` — thumbnail kertas template (akui band/sidebar/bar)
- `src/app/_components/landscape-bg.tsx` — mengembalikan null (latar polos ala Notion)
- `src/app/_components/topnav.tsx` — TopNav sticky, AI Chat "Segera" modal, CTA GitHub
- `src/app/library/page.tsx` — contoh CV siap pakai (templatesContoh) dengan filter kategori
- `src/app/explore/page.tsx` — katalog template desain (templatesDesain) dengan filter kategori
- `src/app/build/[documentId]/page.tsx` — editor blok (panel Layers, rich text contentEditable, floating controls, multi-halaman, export PDF via print CSS)

## Halaman

| Rute | Status |
|---|---|
| `/` | Landing |
| `/app` | Dashboard lengkap |
| `/library` | Contoh CV siap pakai (templatesContoh) |
| `/explore` | Katalog template desain (templatesDesain) |
| `/ai-chat` | Tidak ada halaman — AI Chat adalah modal di TopNav (coming soon) |
| `/build/[documentId]` | Editor |

## Aturan React 19 (eslint `react-hooks`)

- `setState` di dalam `useEffect` HANYA boleh di dalam callback `.then()` / event listener — tidak langsung di body effect
- `Date.now()`, `crypto.randomUUID()` TIDAK boleh dipanggil di fungsi yang didefinisikan dalam komponen → pindah ke fungsi module-level (contoh: `dokumenBaru`, `blokBaru`, `buatSalinan`, `templateKeDokumen`)
- Baca `localStorage` di `useState` via lazy initializer dengan guard `typeof window === "undefined"` — bukan di useEffect
- Immutability: state React harus referensi array baru (`[...arr, x]`), jangan push/mutate

## Konvensi kode

- Bahasa Indonesia untuk UI text, komentar kode, dan commit message
- Kode bersih dan lurus: tanpa backwards-compat shims, tanpa try/catch defensif, tanpa cruft
- Gaya belajar user: for loop biasa daripada idiom ringkas (findIndex/filter/arrow) — prefer readable beginner-friendly code
- STE (Simplified Technical English) untuk teks UI, komentar, README: kata pendek, kalimat pendek, suara aktif

## Tema

- Background app: broken white `#f7f7f5` (var `--app-bg`)
- Kertas dokumen: putih murni `#ffffff`
- Ink: `#37352f` (var `--ink`), muted `#787774`, border `--hair`
- Aksen interaksi: `#2383E2` (ring fokus) — badge kategori memakai `ink`, bukan warna aksen template
- Danger: `#ff746c`
- Sudut: semua sharp (`rounded-none`) — kontrol native select/color diratakan via CSS
- Tombol icon: fixed-size `h-7 w-7` flex-center, `hover:scale-110 active:scale-95`

## Status & Keputusan Produk

- Nama app: BuildMyCV
- Monetisasi: open source + cloud berbayar di masa depan (Phase 5). TIDAK pakai ads.
- Local-first = tanpa auth. Auth ditunda ke fase cloud.
- Export PDF via print CSS (`@media print`, `@page` A4, `break-before` antar kertas) — tanpa library tambahan
- Panel samping: floating pill (fixed), bisa di-resize (drag handle), lebar tersimpan di localStorage (`buildLeftWidth`, `buildRightWidth`)
- Zoom grid dashboard: 3 level diskrit (`gridZoom` di localStorage: kecil/sedang/besar) — jangan kembali ke auto-fill minmax (layout melompat)

## Pitfalls yang sudah dibayar

- `.paper-sheet:last-child` tidak pernah cocok (ada elemen setelah kertas) → pakai `break-before` pada kertas kedua, bukan `break-after` pada semua
- `search_files` gagal di path `/c/...` (MSYS) → pakai `cd` dulu lalu relative path, atau path Windows
- Scrollbar: `.no-scrollbar` class di globals.css (webkit + firefox)
- Print: `height:auto !important` pada textarea di print = textarea kolaps ke rows=1 + scrollbar di PDF → JANGAN timpa tinggi inline auto-resize; hanya `resize:none`
- Rich text: className lebar (`w-1/3`, `flex-1`) harus di WRAPPER luar `TeksRich`, bukan inner div — kalau di inner, `w-1/3` jadi 1/3 dari wrapper sempit → kata pecah baris
- Toolbar B/I/U hanya muncul saat ada seleksi teks (gaya Notion) — cek `window.getSelection().isCollapsed`
- Dark mode: baca `localStorage` di lazy initializer useState dengan guard `typeof document`, bukan useEffect (lint React 19)

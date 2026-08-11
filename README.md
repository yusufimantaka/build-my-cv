# BuildMyCV

Local-first open source CV builder.

Buat CV dari blok-blok. Simpan di perangkatmu. Tidak perlu akun. Tidak perlu server.

## Fitur

- **Blok CV** — tambah Header, Experience, Skills, atau Section. Susun ulang dengan drag. Ubah urutan dengan tombol.
- **Rename blok** — ubah nama blok sesuai kebutuhan.
- **Gaya per blok** — ubah ukuran font dan warna teks.
- **Multi halaman** — tambah dan hapus halaman A4.
- **Kertas A4** — preview menyerupai kertas sungguhan.
- **Export PDF** — cetak dari browser, hasil satu halaman per kertas.
- **Simpan lokal** — semua data tersimpan di IndexedDB browser. Aman tanpa akun.
- **Backup & restore** — unduh workspace sebagai file JSON, atau pulihkan dari file backup.
- **Dashboard** — cari CV, urutkan, duplikat, rename, hapus.
- **Open source** — kode tersedia bebas.

## Teknologi

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- IndexedDB (penyimpanan lokal)
- Iconify (icon dari CDN)

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000 di browser.

## Struktur proyek

```text
src/
├── app/
│   ├── _components/dashboard.tsx   # Halaman dashboard
│   └── build/[documentId]/page.tsx # Editor CV
├── domain/
│   ├── cv.ts                       # Tipe data CV dan blok
│   ├── repository.ts               # Kontrak repository
│   ├── in-memory-repository.ts     # Repository di memori
│   └── indexed-db-repository.ts    # Repository IndexedDB
└── types/
    └── iconify.d.ts                # Tipe untuk elemen iconify-icon
```

## Arsitektur

UI tidak pernah menyentuh IndexedDB langsung. Semua akses data lewat `WorkspaceRepository`.

Ada dua implementasi repository:

- `InMemoryRepository` — untuk tes dan pengembangan.
- `IndexedDBRepository` — untuk penyimpanan lokal sungguhan.

Ganti implementasi tidak mengubah UI sama sekali.

## Data

Setiap CV adalah dokumen dengan blok. Tiap blok punya tipe dan data sendiri:

- `header` — nama, judul, email, telepon.
- `experience` — daftar pengalaman kerja.
- `skills` — daftar keahlian.
- `custom` — section bebas dengan label dan isi.

Setiap blok bisa dipindah antar halaman, direname, dan diberi gaya sendiri.

## Roadmap

- Import/export workspace JSON (sudah ada di dashboard)
- Library template
- Explore referensi CV
- AI chat dengan BYOK (bawa kunci API sendiri)
- Hosting opsional berbayar untuk fitur cloud

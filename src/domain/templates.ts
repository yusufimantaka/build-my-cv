import type {
    BlockStyle,
    CustomData,
    CVDocument,
    CVBlock,
    ExperienceData,
    HeaderData,
    SkillsData,
    TemplateCategory,
} from "./cv";

// Blok template = blok CV tanpa id/order/visible/page.
// id dan urutan diisi saat template dipakai menjadi dokumen baru.
export type TemplateBlok =
    | { type: "header"; name?: string; style?: BlockStyle; data: HeaderData }
    | { type: "experience"; name?: string; style?: BlockStyle; data: ExperienceData }
    | { type: "skills"; name?: string; style?: BlockStyle; data: SkillsData }
    | { type: "custom"; name?: string; style?: BlockStyle; data: CustomData };

export interface CVTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    accent: string;
    description: string;
    blocks: TemplateBlok[];
}

const styleHeader: BlockStyle = { fontSize: 24, color: "#171717", spacing: 16 };
const styleJudul: BlockStyle = { fontSize: 16, color: "#171717", spacing: 16 };
const styleIsi: BlockStyle = { fontSize: 14, color: "#171717", spacing: 16 };

function header(
    name: string,
    title: string,
    email: string = "nama@mail.ugm.ac.id",
    phone: string = "0812-3456-7890",
): TemplateBlok {
    return { type: "header", name: "Header", style: styleHeader, data: { fullName: name, title, email, phone } };
}

function experience(name: string, items: ExperienceData["items"]): TemplateBlok {
    return { type: "experience", name, style: styleJudul, data: { items } };
}

function custom(name: string, items: CustomData["items"]): TemplateBlok {
    return { type: "custom", name, style: styleJudul, data: { items } };
}

function skills(name: string, daftar: string[]): TemplateBlok {
    return { type: "skills", name, style: styleIsi, data: { skills: daftar } };
}

export const templates: CVTemplate[] = [
    // ── First Job ──────────────────────────────────────────────
    {
        id: "kepanitiaan-kampus",
        name: "CV Kepanitiaan Kampus",
        category: "first-job",
        accent: "#3F6382",
        description: "Untuk daftar kepanitiaan dan event kampus. Fokus peran, tanggung jawab, dan kontribusi.",
        blocks: [
            header("Nama Lengkap", "Mahasiswa UGM"),
            experience("Pengalaman Kepanitiaan", [
                {
                    title: "Ketua Divisi Acara",
                    company: "Panitia Dies Natalis Fakultas",
                    period: "2025",
                    description:
                        "Memimpin tim 15 orang. Menyusun rundown acara. Mengoordinasikan antar divisi dan sponsor.",
                },
                {
                    title: "Staf Divisi Konsumsi",
                    company: "Panitia Malam Keakraban",
                    period: "2024",
                    description:
                        "Mengelola konsumsi untuk 200 peserta. Menyusun anggaran dan jadwal distribusi.",
                },
            ]),
            custom("Kontribusi", [
                { label: "Acara", value: "Mengelola acara dengan 500+ peserta" },
                { label: "Anggaran", value: "Mengelola anggaran Rp 10 juta" },
            ]),
            skills("Keahlian", ["Kepemimpinan", "Manajemen acara", "Koordinasi tim", "Komunikasi", "Microsoft Office"]),
        ],
    },
    {
        id: "organisasi-kampus",
        name: "CV Organisasi Kampus",
        category: "first-job",
        accent: "#7895B2",
        description: "Untuk lamaran kepengurusan organisasi dan UKM. Menonjolkan pengalaman berorganisasi.",
        blocks: [
            header("Nama Lengkap", "Mahasiswa Aktif UGM"),
            experience("Pengalaman Organisasi", [
                {
                    title: "Staf Divisi Media Kreatif",
                    company: "BEM Fakultas",
                    period: "2024 - 2025",
                    description:
                        "Mengelola konten media sosial. Membuat desain poster untuk kegiatan kampus.",
                },
                {
                    title: "Bendahara",
                    company: "Himpunan Mahasiswa Jurusan",
                    period: "2024",
                    description:
                        "Mengelola kas organisasi. Membuat laporan keuangan bulanan dan tahunan.",
                },
            ]),
            custom("Pencapaian", [
                { label: "Media sosial", value: "Menambah pengikut instagram 30% dalam 1 semester" },
                { label: "Keuangan", value: "Menyusun laporan keuangan yang diaudit bersih" },
            ]),
            skills("Keahlian", ["Kerja tim", "Komunikasi", "Manajemen keuangan", "Desain grafis", "Public speaking"]),
        ],
    },
    {
        id: "fresh-graduate",
        name: "CV Fresh Graduate",
        category: "first-job",
        accent: "#2E7D6B",
        description: "Untuk lulusan baru tanpa pengalaman kerja. Fokus pendidikan, proyek, dan organisasi.",
        blocks: [
            header("Nama Lengkap", "Fresh Graduate Ilmu Komputer"),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "S1 Ilmu Komputer, 2021 - 2025" },
                { label: "IPK", value: "3.7 / 4.0" },
            ]),
            experience("Proyek", [
                {
                    title: "Aplikasi Manajemen Tugas",
                    company: "Proyek Skripsi",
                    period: "2025",
                    description:
                        "Membangun aplikasi web untuk manajemen tugas dengan React dan Node.js. Dipakai 50+ mahasiswa.",
                },
                {
                    title: "Sistem Informasi UKM",
                    company: "Proyek Kelas",
                    period: "2024",
                    description:
                        "Merancang dan membangun sistem informasi untuk pendaftaran UKM. Menggunakan PHP dan MySQL.",
                },
            ]),
            skills("Keahlian", ["Python", "JavaScript", "React", "SQL", "Git", "Analisis masalah"]),
        ],
    },

    // ── Simple ────────────────────────────────────────────────
    {
        id: "magang",
        name: "CV Magang",
        category: "simple",
        accent: "#1D4ED8",
        description: "Untuk lamaran magang di perusahaan. Fokus pengalaman, keahlian teknis, dan pendidikan.",
        blocks: [
            header("Nama Lengkap", "Mahasiswa Ilmu Komputer UGM"),
            experience("Pengalaman", [
                {
                    title: "Data Analyst Intern",
                    company: "Perusahaan Teknologi",
                    period: "2025",
                    description:
                        "Mengolah data penjualan dengan Python dan SQL. Membuat dashboard laporan untuk tim manajemen.",
                },
                {
                    title: "Asisten Praktikum",
                    company: "Laboratorium Ilmu Komputer UGM",
                    period: "2024",
                    description:
                        "Membantu dosen mengajar praktikum pemrograman. Menilai tugas 100+ mahasiswa.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "S1 Ilmu Komputer, 2022 - sekarang" },
                { label: "IPK", value: "3.7 / 4.0" },
            ]),
            skills("Keahlian", ["Python", "SQL", "React", "TypeScript", "Git", "Analisis data"]),
        ],
    },
    {
        id: "administrasi",
        name: "CV Administrasi",
        category: "simple",
        accent: "#4A5568",
        description: "Untuk lamaran pekerjaan administrasi dan perkantoran. Bersih, formal, dan mudah dibaca ATS.",
        blocks: [
            header("Nama Lengkap", "Staf Administrasi"),
            experience("Pengalaman Kerja", [
                {
                    title: "Staf Administrasi",
                    company: "Kantor Desa / Instansi",
                    period: "2024 - sekarang",
                    description:
                        "Mengelola surat menyurat. Mendata arsip. Melayani tamu dan telepon kantor.",
                },
                {
                    title: "Magang Tata Usaha",
                    company: "Kantor Kecamatan",
                    period: "2023",
                    description:
                        "Membantu pengarsipan dokumen. Menginput data penduduk ke sistem.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "D3/S1 Administrasi, 2021 - 2025" },
            ]),
            skills("Keahlian", ["Microsoft Word", "Excel", "Arsip", "Komunikasi", "Manajemen waktu"]),
        ],
    },

    // ── Modern ────────────────────────────────────────────────
    {
        id: "software-engineer",
        name: "CV Software Engineer",
        category: "modern",
        accent: "#2563EB",
        description: "Untuk lamaran posisi software engineer dan developer. Menonjolkan proyek dan stack teknis.",
        blocks: [
            header("Nama Lengkap", "Software Engineer", "nama@example.com", "0812-3456-7890"),
            experience("Pengalaman", [
                {
                    title: "Software Engineer Intern",
                    company: "Startup Teknologi",
                    period: "2025",
                    description:
                        "Mengembangkan fitur frontend dengan React dan TypeScript. Mengurangi waktu load halaman 40%.",
                },
                {
                    title: "Backend Developer (Proyek)",
                    company: "Hackathon / Kompetisi",
                    period: "2024",
                    description:
                        "Membangun REST API dengan Node.js dan PostgreSQL. Meraih juara 2 kompetisi tingkat nasional.",
                },
            ]),
            custom("Proyek", [
                { label: "Portofolio", value: "Website portofolio pribadi dengan Next.js" },
                { label: "Bot Telegram", value: "Bot reminder tugas untuk 200 pengguna" },
            ]),
            skills("Keahlian", ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Docker", "Git"]),
        ],
    },
    {
        id: "data-analyst",
        name: "CV Data Analyst",
        category: "modern",
        accent: "#0E9F6E",
        description: "Untuk lamaran posisi data analyst. Menonjolkan analisis, visualisasi, dan dampak data.",
        blocks: [
            header("Nama Lengkap", "Data Analyst", "nama@example.com", "0812-3456-7890"),
            experience("Pengalaman", [
                {
                    title: "Data Analyst Intern",
                    company: "Perusahaan E-commerce",
                    period: "2025",
                    description:
                        "Menganalisis perilaku pembelian 10.000 pelanggan. Membuat dashboard dengan Tableau.",
                },
                {
                    title: "Asisten Riset",
                    company: "Fakultas Ekonomika UGM",
                    period: "2024",
                    description:
                        "Mengolah data survei 500 responden dengan Python. Membantu menyusun laporan riset.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "S1 Statistika / Ekonomi, 2022 - sekarang" },
            ]),
            skills("Keahlian", ["Python", "SQL", "Pandas", "Tableau", "Excel", "Statistika"]),
        ],
    },

    // ── Creative ──────────────────────────────────────────────
    {
        id: "desain-kreatif",
        name: "CV Desain Kreatif",
        category: "creative",
        accent: "#B45309",
        description: "Untuk lamaran posisi desain grafis dan kreatif. Menonjolkan portofolio dan karya.",
        blocks: [
            header("Nama Lengkap", "Desainer Grafis", "nama@example.com", "0812-3456-7890"),
            experience("Pengalaman", [
                {
                    title: "Desainer Grafis (Freelance)",
                    company: "Klien Perorangan & UKM",
                    period: "2024 - sekarang",
                    description:
                        "Membuat logo, poster, dan konten media sosial untuk 20+ klien.",
                },
                {
                    title: "Kepala Divisi Kreatif",
                    company: "Panitia Pekan Seni Fakultas",
                    period: "2024",
                    description:
                        "Memimpin 6 desainer. Membuat seluruh identitas visual acara.",
                },
            ]),
            custom("Portofolio", [
                { label: "Behance", value: "20+ proyek desain dipublikasikan" },
                { label: "Figma", value: "Mendesain UI mobile app untuk studi kasus" },
            ]),
            skills("Keahlian", ["Adobe Illustrator", "Photoshop", "Figma", "Canva", "Tipografi", "Warna"]),
        ],
    },
    {
        id: "marketing",
        name: "CV Marketing",
        category: "creative",
        accent: "#BE185D",
        description: "Untuk lamaran posisi marketing dan social media. Menonjolkan hasil kampanye dan kreativitas.",
        blocks: [
            header("Nama Lengkap", "Digital Marketer", "nama@example.com", "0812-3456-7890"),
            experience("Pengalaman", [
                {
                    title: "Social Media Officer",
                    company: "UKM / Organisasi Kampus",
                    period: "2024 - sekarang",
                    description:
                        "Mengelola akun Instagram 5.000 pengikut. Menaikkan engagement 60% dalam 6 bulan.",
                },
                {
                    title: "Content Creator",
                    company: "Freelance",
                    period: "2024",
                    description:
                        "Membuat konten video pendek untuk produk UMKM. 3 video mencapai 100K views.",
                },
            ]),
            custom("Hasil", [
                { label: "Engagement", value: "Menaikkan reach organik 2x lipat" },
                { label: "Kampanye", value: "Mengelola 10 kampanye promo" },
            ]),
            skills("Keahlian", ["Copywriting", "Canva", "CapCut", "Meta Ads", "SEO dasar", "Analitik"]),
        ],
    },

    // ── Photo ─────────────────────────────────────────────────
    {
        id: "dengan-foto",
        name: "CV dengan Foto",
        category: "photo",
        accent: "#0F766E",
        description: "Untuk lamaran yang mengharapkan foto profil. Ruang foto di header, rapi dan profesional.",
        blocks: [
            header("Nama Lengkap", "Mahasiswa UGM", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            experience("Pengalaman", [
                {
                    title: "Staf Humas",
                    company: "Panitia Kampus",
                    period: "2025",
                    description:
                        "Menjadi penghubung antara panitia dan pihak eksternal. Menyusun dokumentasi acara.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "S1, 2022 - sekarang" },
            ]),
            skills("Keahlian", ["Komunikasi", "Kerja tim", "Microsoft Office", "Fotografi dasar"]),
        ],
    },

    // ── Compact ───────────────────────────────────────────────
    {
        id: "ringkas-satu-halaman",
        name: "CV Ringkas Satu Halaman",
        category: "compact",
        accent: "#374151",
        description: "Untuk pengalaman banyak namun tetap satu halaman. Padat, rapi, tanpa kata berlebih.",
        blocks: [
            header("Nama Lengkap", "Professional", "nama@example.com", "0812-3456-7890"),
            experience("Pengalaman Terpilih", [
                {
                    title: "Koordinator Proyek",
                    company: "Organisasi",
                    period: "2024 - sekarang",
                    description: "Memimpin 8 orang. Menyelesaikan 5 proyek tepat waktu.",
                },
                {
                    title: "Staf",
                    company: "Panitia",
                    period: "2023",
                    description: "Menangani logistik 300 peserta.",
                },
            ]),
            skills("Keahlian", ["Kepemimpinan", "Manajemen proyek", "Komunikasi"]),
        ],
    },
];

// Mengubah template menjadi dokumen CV baru.
// Setiap blok mendapat id baru agar tidak bentrok dengan dokumen lain.
export function templateKeDokumen(template: CVTemplate, judul: string): CVDocument {
    const blocks: CVBlock[] = [];
    for (let i = 0; i < template.blocks.length; i++) {
        const blok = template.blocks[i];
        blocks.push({
            ...blok,
            id: crypto.randomUUID(),
            order: i,
            visible: true,
            page: 0,
        });
    }
    return {
        id: crypto.randomUUID(),
        title: judul,
        blocks,
        templateId: template.id,
        templateCategory: template.category,
        layout: "single",
        accentColor: template.accent,
        font: "sans",
        updatedAt: Date.now(),
    };
}

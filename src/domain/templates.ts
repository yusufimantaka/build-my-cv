import type {
    BlockStyle,
    CustomData,
    CVDocument,
    CVBlock,
    DocumentFont,
    ExperienceData,
    HeaderData,
    SkillsData,
    TemplateCategory,
} from "./cv";

// Blok template = blok CV tanpa id/order/visible/page.
// id dan urutan diisi saat template dipakai menjadi dokumen baru.
export type TemplateBlok =
    | { type: "header"; name?: string; sidebar?: boolean; style?: BlockStyle; data: HeaderData }
    | { type: "experience"; name?: string; sidebar?: boolean; style?: BlockStyle; data: ExperienceData }
    | { type: "skills"; name?: string; sidebar?: boolean; style?: BlockStyle; data: SkillsData }
    | { type: "custom"; name?: string; sidebar?: boolean; style?: BlockStyle; data: CustomData };

export interface CVTemplate {
    id: string;
    name: string;
    category: TemplateCategory;
    accent: string;
    description: string;
    blocks: TemplateBlok[];
    // Gaya template (dikunci, disalin ke dokumen saat dipakai):
    layout?: "single" | "sidebar";
    sidebarColor?: string;
    headerStyle?: "center" | "band" | "topbar" | "sidebar";
    sectionStyle?: "rule" | "bar";
    font?: DocumentFont;
}

const styleHeader: BlockStyle = { fontSize: 24, color: "#171717" };
const styleJudul: BlockStyle = { fontSize: 16, color: "#171717" };
const styleIsi: BlockStyle = { fontSize: 14, color: "#171717" };

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

// Blok untuk kolom sidebar (hanya dipakai template dengan layout "sidebar").
// Teksnya dibuat putih karena sidebar berlatar warna gelap.
function sidebar(blok: TemplateBlok): TemplateBlok {
    const gaya = { fontSize: blok.style?.fontSize ?? 14, color: "#ffffff" };
    return { ...blok, sidebar: true, style: gaya };
}

const templatesDasar: CVTemplate[] = [
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

// ── Template v2 (gaya dari referensi: header band / topbar / sidebar,
//    section rule / bar, font serif / sans) ──────────────────────

const templateV2: CVTemplate[] = [
    // Classic Clear: single, header center serif, section rule, formal.
    {
        id: "classic-clear",
        name: "Classic Clear",
        category: "simple",
        accent: "#171717",
        description: "Formal dan bersih: header tengah, garis tipis, font serif.",
        layout: "single",
        headerStyle: "center",
        sectionStyle: "rule",
        font: "serif",
        blocks: [
            header("Nama Lengkap", "Project Manager", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            custom("Ringkasan", [
                { label: "", value: "Project manager dengan 6 tahun pengalaman mengoordinasikan inisiatif lintas tim di bidang teknologi dan operasional bisnis." },
            ]),
            experience("Pengalaman Profesional", [
                {
                    title: "Project Manager",
                    company: "Perusahaan Digital",
                    period: "2022 - sekarang",
                    description: "Memimpin rencana rilis di tim produk, engineering, dan operasional. Mengoordinasikan update stakeholder dan laporan milestone.",
                },
                {
                    title: "Project Coordinator",
                    company: "Solusi Teknologi",
                    period: "2019 - 2022",
                    description: "Mendukung jadwal, anggaran, dan dokumentasi inisiatif transformasi. Memfasilitasi rapat tim dan log aksi antar divisi.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "S1 Manajemen, 2016 - 2020" },
            ]),
            skills("Keahlian", ["Perencanaan Proyek", "Manajemen Risiko", "Agile", "Jira", "Excel"]),
        ],
    },

    // True Blue: single, section rule, aksen biru korporat.
    {
        id: "true-blue",
        name: "True Blue",
        category: "simple",
        accent: "#1F4E8C",
        description: "Korporat modern: heading biru dengan garis pembatas biru.",
        layout: "single",
        headerStyle: "center",
        sectionStyle: "rule",
        font: "sans",
        blocks: [
            header("Nama Lengkap", "Sales Manager", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            custom("Ringkasan", [
                { label: "", value: "Sales professional dengan 8 tahun pengalaman mendukung pertumbuhan pendapatan di lingkungan B2B." },
            ]),
            experience("Pengalaman Profesional", [
                {
                    title: "Sales Manager",
                    company: "Solusi Nexora",
                    period: "2022 - sekarang",
                    description: "Mengelola tim account executive. Meningkatkan akurasi pipeline tracking dan laporan forecast mingguan.",
                },
                {
                    title: "Senior Sales Specialist",
                    company: "BrightPath Systems",
                    period: "2019 - 2022",
                    description: "Mencapai target kuartalan melalui consultative selling dan ekspansi akun.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Indonesia", value: "S1 Marketing, 2014 - 2018" },
            ]),
            skills("Keahlian", ["Sales Strategy", "Revenue Growth", "Negosiasi", "CRM", "Forecasting"]),
        ],
    },

    // Editorial Rule: single, serif, section rule abu, padat.
    {
        id: "editorial-rule",
        name: "Editorial Rule",
        category: "modern",
        accent: "#333333",
        description: "Gaya editorial: serif, garis abu tipis, padat dan teratur.",
        layout: "single",
        headerStyle: "center",
        sectionStyle: "rule",
        font: "serif",
        blocks: [
            header("Nama Lengkap", "Operations Manager", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            custom("Ringkasan", [
                { label: "", value: "Professional operasional dengan 7+ tahun pengalaman mendukung logistik, perbaikan proses, dan koordinasi lintas fungsi." },
            ]),
            experience("Pengalaman Profesional", [
                {
                    title: "Operations Manager",
                    company: "Nova Retail Group",
                    period: "2022 - sekarang",
                    description: "Memimpin operasi harian di gudang, procurement, dan tim pendukung. Meningkatkan akurasi pesanan 15%.",
                },
                {
                    title: "Operations Coordinator",
                    company: "Urban Freight Solutions",
                    period: "2019 - 2022",
                    description: "Mengoordinasikan jadwal transportasi dan menyelesaikan eskalasi pengiriman.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "M.Sc Manajemen, 2015 - 2017" },
            ]),
            skills("Keahlian", ["Process Improvement", "Vendor Management", "KPI Reporting", "SAP", "Excel"]),
        ],
    },

    // Mercury Flow: single, header topbar abu + foto, section bar.
    {
        id: "mercury-flow",
        name: "Mercury Flow",
        category: "modern",
        accent: "#4A5D4E",
        description: "Modern ringan: header abu-abu dengan foto, section bar lembut.",
        layout: "single",
        headerStyle: "topbar",
        sectionStyle: "bar",
        font: "sans",
        blocks: [
            header("Nama Lengkap", "Sales Manager", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            custom("Ringkasan", [
                { label: "", value: "Sales professional dengan 6 tahun pengalaman di account growth, client relationship, dan pipeline development B2B." },
            ]),
            experience("Pengalaman Profesional", [
                {
                    title: "Sales Manager",
                    company: "BrightPath Business Solutions",
                    period: "2023 - sekarang",
                    description: "Mengelola portofolio klien mid-market. Meningkatkan conversion rate tim 14%.",
                },
                {
                    title: "Account Manager",
                    company: "Horizon Office Supply",
                    period: "2020 - 2022",
                    description: "Memegang aktivitas sales inbound dan outbound untuk akun bisnis regional.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Bina Nusantara", value: "S1 Business Administration, 2014 - 2018" },
            ]),
            skills("Keahlian", ["Account Management", "Negosiasi", "CRM", "Client Retention", "Sales Forecasting"]),
        ],
    },

    // Steady Form: single, topbar abu biru + foto, section bar.
    {
        id: "steady-form",
        name: "Steady Form",
        category: "creative",
        accent: "#5B6B8C",
        description: "Terstruktur lapang: header abu-biru dengan foto, bar section pucat.",
        layout: "single",
        headerStyle: "topbar",
        sectionStyle: "bar",
        font: "sans",
        blocks: [
            header("Nama Lengkap", "Project Engineer", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            custom("Ringkasan", [
                { label: "", value: "Project engineer dengan 6 tahun pengalaman mendukung proyek industri dan infrastruktur di lingkungan engineering cepat." },
            ]),
            experience("Pengalaman Profesional", [
                {
                    title: "Project Engineer",
                    company: "PT Infrastruktur Nusantara",
                    period: "2022 - sekarang",
                    description: "Memimpin koordinasi proyek upgrade utilitas. Meningkatkan akurasi tracking proyek dan standarisasi laporan.",
                },
                {
                    title: "Mechanical Engineer",
                    company: "PT Rekayasa Mesin",
                    period: "2019 - 2021",
                    description: "Mendukung instalasi peralatan untuk proyek manufaktur. Menjaga kepatuhan standar keselamatan.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Institut Teknologi Bandung", value: "S1 Teknik Mesin, 2013 - 2017" },
            ]),
            skills("Keahlian", ["Project Coordination", "Vendor Management", "Quality Assurance", "AutoCAD"]),
        ],
    },

    // Cobalt Edge: header band teal + foto, section rule.
    {
        id: "cobalt-edge",
        name: "Cobalt Edge",
        category: "creative",
        accent: "#1B6B7A",
        description: "Korporat kontemporer: band header teal penuh lebar dengan foto.",
        layout: "single",
        headerStyle: "band",
        sectionStyle: "rule",
        font: "sans",
        blocks: [
            header("Nama Lengkap", "Sales Manager", "nama@mail.ugm.ac.id", "0812-3456-7890"),
            custom("Ringkasan", [
                { label: "", value: "Sales professional dengan 7 tahun pengalaman di B2B account growth, client relationship, dan sales execution regional." },
            ]),
            experience("Pengalaman Profesional", [
                {
                    title: "Sales Manager",
                    company: "Grupo Delta Comercial",
                    period: "2022 - sekarang",
                    description: "Mengelola akun regional dan konsisten melampaui target pendapatan kuartalan.",
                },
                {
                    title: "Senior Sales Executive",
                    company: "Nova Industrial Solutions",
                    period: "2019 - 2021",
                    description: "Memegang akun B2B kunci dan menghasilkan pertumbuhan sales year-over-year.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Gadjah Mada", value: "S1 Business Administration, 2014 - 2018" },
            ]),
            skills("Keahlian", ["Account Management", "Pipeline Forecasting", "CRM", "Revenue Growth", "Client Retention"]),
        ],
    },

    // Atlantic Blue: sidebar navy, foto di sidebar, section rule.
    {
        id: "atlantic-blue",
        name: "Atlantic Blue",
        category: "photo",
        accent: "#17384A",
        description: "Dua kolom: sidebar biru laut dengan foto dan kontak, konten utama putih.",
        layout: "sidebar",
        sidebarColor: "#17384A",
        headerStyle: "sidebar",
        sectionStyle: "rule",
        font: "sans",
        blocks: [
            sidebar(header("Nama Lengkap", "Business Development Consultant", "nama@mail.ugm.ac.id", "0812-3456-7890")),
            sidebar(custom("Profil", [{ label: "", value: "Konsultan pengembangan bisnis dengan passion membantu perusahaan mencapai potensi pertumbuhan." }])),
            sidebar(skills("Bahasa", ["Indonesia", "Inggris", "Spanyol"])),
            experience("Pengalaman Kerja", [
                {
                    title: "Business Development Consultant",
                    company: "PT Aplikasi Bisnis",
                    period: "2022 - sekarang",
                    description: "Mengembangkan dan mengimplementasikan rencana strategis yang meningkatkan peluang bisnis baru 30%.",
                },
                {
                    title: "Business Development",
                    company: "Nexus Consulting",
                    period: "2018 - 2022",
                    description: "Bekerja dengan perusahaan teknologi untuk menyediakan layanan konsultasi dan advisory.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Harvard Business School", value: "MBA, 2016 - 2018" },
            ]),
            skills("Keahlian", ["Strategic Thinking", "Relationship Building", "Negosiasi", "Team Management"]),
        ],
    },

    // Hunter Green: sidebar hijau tua, foto, section rule.
    {
        id: "hunter-green",
        name: "Hunter Green",
        category: "photo",
        accent: "#1E4D3C",
        description: "Dua kolom: sidebar hijau tua dengan kontak dan ringkasan, riwayat di kanan.",
        layout: "sidebar",
        sidebarColor: "#1E4D3C",
        headerStyle: "sidebar",
        sectionStyle: "rule",
        font: "sans",
        blocks: [
            sidebar(header("Nama Lengkap", "Sales Manager", "nama@mail.ugm.ac.id", "0812-3456-7890")),
            sidebar(custom("Ringkasan", [{ label: "", value: "Sales manager hasil-tinggi dengan 6 tahun pengalaman di B2B sales dan account development." }])),
            sidebar(skills("Bahasa", ["Indonesia", "Arab", "Inggris"])),
            experience("Pengalaman Profesional", [
                {
                    title: "Sales Manager",
                    company: "Tunisie Connect",
                    period: "2022 - sekarang",
                    description: "Mengelola portofolio akun bisnis kunci. Memimpin perencanaan sales kuartalan.",
                },
                {
                    title: "Senior Sales Executive",
                    company: "Maghreb Business Solutions",
                    period: "2019 - 2021",
                    description: "Memegang siklus sales penuh dari prospecting sampai negosiasi dan closing.",
                },
            ]),
            custom("Pendidikan", [
                { label: "Universitas Indonesia", value: "S1 Marketing, 2015 - 2017" },
            ]),
            skills("Keahlian", ["Account Management", "Lead Generation", "Negosiasi", "CRM", "Sales Forecasting"]),
        ],
    },
];

// Semua template: yang lama (dasar, Bahasa Indonesia) + template v2
// (gaya dari referensi). Library menampilkan keduanya.
export const templates: CVTemplate[] = [...templatesDasar, ...templateV2];

// Mengubah template menjadi dokumen CV baru.
// Setiap blok mendapat id baru agar tidak bentrok dengan dokumen lain.
// Gaya template (layout/sidebar/header/section/font) ikut disalin —
// dikunci dari template, bukan kontrol user.
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
        accentColor: template.accent,
        font: template.font ?? "sans",
        layout: template.layout ?? "single",
        sidebarColor: template.sidebarColor,
        headerStyle: template.headerStyle ?? "center",
        sectionStyle: template.sectionStyle ?? "rule",
        updatedAt: Date.now(),
    };
}

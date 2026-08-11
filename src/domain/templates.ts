import type {
    BlockStyle,
    CustomData,
    CVDocument,
    CVBlock,
    ExperienceData,
    HeaderData,
    SkillsData,
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
    description: string;
    blocks: TemplateBlok[];
}

const styleHeader: BlockStyle = { fontSize: 24, color: "#171717", spacing: 16 };
const styleJudul: BlockStyle = { fontSize: 16, color: "#171717", spacing: 16 };
const styleIsi: BlockStyle = { fontSize: 14, color: "#171717", spacing: 16 };

export const templates: CVTemplate[] = [
    {
        id: "kepanitiaan-kampus",
        name: "CV Kepanitiaan Kampus",
        description: "Untuk daftar kepanitiaan dan event kampus. Fokus peran, tanggung jawab, dan kontribusi.",
        blocks: [
            {
                type: "header",
                name: "Header",
                style: styleHeader,
                data: {
                    fullName: "Nama Lengkap",
                    title: "Mahasiswa UGM",
                    email: "nama@mail.ugm.ac.id",
                    phone: "0812-3456-7890",
                },
            },
            {
                type: "experience",
                name: "Pengalaman Kepanitiaan",
                style: styleJudul,
                data: {
                    items: [
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
                    ],
                },
            },
            {
                type: "custom",
                name: "Kontribusi",
                style: styleJudul,
                data: {
                    items: [
                        {
                            label: "Acara",
                            value: "Mengelola acara dengan 500+ peserta",
                        },
                        {
                            label: "Anggaran",
                            value: "Mengelola anggaran Rp 10 juta",
                        },
                    ],
                },
            },
            {
                type: "skills",
                name: "Keahlian",
                style: styleIsi,
                data: {
                    skills: [
                        "Kepemimpinan",
                        "Manajemen acara",
                        "Koordinasi tim",
                        "Komunikasi",
                        "Microsoft Office",
                    ],
                },
            },
        ],
    },
    {
        id: "organisasi-kampus",
        name: "CV Organisasi Kampus",
        description: "Untuk lamaran kepengurusan organisasi dan UKM. Menonjolkan pengalaman berorganisasi.",
        blocks: [
            {
                type: "header",
                name: "Header",
                style: styleHeader,
                data: {
                    fullName: "Nama Lengkap",
                    title: "Mahasiswa Aktif UGM",
                    email: "nama@mail.ugm.ac.id",
                    phone: "0812-3456-7890",
                },
            },
            {
                type: "experience",
                name: "Pengalaman Organisasi",
                style: styleJudul,
                data: {
                    items: [
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
                    ],
                },
            },
            {
                type: "custom",
                name: "Pencapaian",
                style: styleJudul,
                data: {
                    items: [
                        {
                            label: "Media sosial",
                            value: "Menambah pengikut instagram 30% dalam 1 semester",
                        },
                        {
                            label: "Keuangan",
                            value: "Menyusun laporan keuangan yang diaudit bersih",
                        },
                    ],
                },
            },
            {
                type: "skills",
                name: "Keahlian",
                style: styleIsi,
                data: {
                    skills: [
                        "Kerja tim",
                        "Komunikasi",
                        "Manajemen keuangan",
                        "Desain grafis",
                        "Public speaking",
                    ],
                },
            },
        ],
    },
    {
        id: "magang",
        name: "CV Magang",
        description: "Untuk lamaran magang di perusahaan. Fokus pengalaman, keahlian teknis, dan pendidikan.",
        blocks: [
            {
                type: "header",
                name: "Header",
                style: styleHeader,
                data: {
                    fullName: "Nama Lengkap",
                    title: "Mahasiswa Ilmu Komputer UGM",
                    email: "nama@mail.ugm.ac.id",
                    phone: "0812-3456-7890",
                },
            },
            {
                type: "experience",
                name: "Pengalaman",
                style: styleJudul,
                data: {
                    items: [
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
                    ],
                },
            },
            {
                type: "custom",
                name: "Pendidikan",
                style: styleJudul,
                data: {
                    items: [
                        {
                            label: "Universitas Gadjah Mada",
                            value: "S1 Ilmu Komputer, 2022 - sekarang",
                        },
                        {
                            label: "IPK",
                            value: "3.7 / 4.0",
                        },
                    ],
                },
            },
            {
                type: "skills",
                name: "Keahlian",
                style: styleIsi,
                data: {
                    skills: [
                        "Python",
                        "SQL",
                        "React",
                        "TypeScript",
                        "Git",
                        "Analisis data",
                    ],
                },
            },
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
        updatedAt: Date.now(),
    };
}

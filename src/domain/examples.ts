import type { TemplateCategory } from "./cv";

// Contoh CV per industri — meniru "Resume Examples" FlowCV.
// Statis: isi ditampilkan sebagai referensi, bukan template yang bisa dipakai langsung.
export interface ExampleIndustry {
    id: string;
    name: string;
    category: TemplateCategory;
    description: string;
    highlights: string[];
}

export const examples: ExampleIndustry[] = [
    {
        id: "software-engineer",
        name: "Software Engineer",
        category: "modern",
        description:
            "Recruiter mencari stack yang dikuasai, dampak nyata, dan cara kamu memecahkan masalah teknis.",
        highlights: [
            "Sebutkan proyek nyata dengan angka: 'mengurangi load 40%'",
            "Tulis stack teknis lengkap (React, Node, PostgreSQL, Docker)",
            "Tunjukkan peranmu di tim: frontend, backend, atau fullstack",
            "Sertakan link portofolio atau GitHub",
        ],
    },
    {
        id: "data-analyst",
        name: "Data Analyst",
        category: "modern",
        description:
            "Fokus pada kemampuan mengolah data, alat yang dipakai, dan hasil analisis yang bisa diukur.",
        highlights: [
            "Tulis tools: Python, SQL, Pandas, Tableau, Excel",
            "Sebutkan ukuran data dan dampak: 'menganalisis 10.000 pelanggan'",
            "Tunjukkan cara menyajikan temuan (dashboard, laporan)",
            "Sertakan dasar statistika dan pengalaman riset",
        ],
    },
    {
        id: "ui-ux-designer",
        name: "UI/UX Designer",
        category: "creative",
        description:
            "Portofolio adalah raja. CV harus bersih, visual, dan menunjukkan proses desain.",
        highlights: [
            "Link ke Behance, Dribbble, atau portofolio pribadi",
            "Sebutkan tools: Figma, Adobe XD, prototyping",
            "Ceritakan proses: riset pengguna, wireframe, testing",
            "Tunjukkan dampak: peningkatan engagement atau konversi",
        ],
    },
    {
        id: "kepanitiaan",
        name: "Kepanitiaan Kampus",
        category: "first-job",
        description:
            "Panitia mencari orang yang bisa dipercaya: peran jelas, tanggung jawab, dan kontribusi nyata.",
        highlights: [
            "Tulis peran spesifik: ketua divisi, staf, bendahara",
            "Sebutkan skala: berapa orang tim, berapa peserta",
            "Tunjukkan kontribusi: mengelola anggaran, menyusun rundown",
            "Sertakan soft skills: koordinasi, komunikasi, manajemen waktu",
        ],
    },
    {
        id: "organisasi",
        name: "Organisasi Kampus",
        category: "first-job",
        description:
            "Kepengurusan organisasi melihat komitmen, peran, dan pencapaian yang bisa dibuktikan.",
        highlights: [
            "Sebutkan jabatan dan masa kepengurusan",
            "Tulis pencapaian terukur: menambah pengikut 30%",
            "Bedakan peran: eksekutor, perencana, atau pengelola",
            "Sertakan bukti: laporan, dokumen, atau karya",
        ],
    },
    {
        id: "fresh-graduate",
        name: "Fresh Graduate",
        category: "simple",
        description:
            "Tanpa pengalaman kerja, fokus ke pendidikan, proyek, dan organisasi yang menunjukkan kemampuan.",
        highlights: [
            "Pendidikan di atas: universitas, jurusan, IPK",
            "Ganti 'pengalaman kerja' dengan proyek dan tugas besar",
            "Sertakan organisasi dan kepanitiaan sebagai bukti soft skills",
            "Tulis keahlian yang relevan dengan lowongan",
        ],
    },
];

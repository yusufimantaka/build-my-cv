export interface HeaderData {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    photo?: string; // data URL hasil upload
}

export interface ExperienceItem {
    title: string;
    company: string;
    period: string;
    description: string;
}

export interface ExperienceData {
    items: ExperienceItem[];
}

export interface SkillsData {
    skills: string[];
}

export interface CustomItem {
    label: string;
    value: string;
}

export interface CustomData {
    items: CustomItem[];
}

export interface BlockStyle {
    fontSize: number;
    color: string;
    spacing?: number;
}

export type CVBlock =
| {id: string; type: 'header'; order: number; visible: boolean; name?: string; page?: number; style?: BlockStyle; data: HeaderData}
| {id: string; type: 'experience'; order: number; visible: boolean; name?: string; page?: number; style?: BlockStyle; data: ExperienceData}
| {id: string; type: 'skills'; order: number; visible: boolean; name?: string; page?: number; style?: BlockStyle; data: SkillsData}
| {id: string; type: 'custom'; order: number; visible: boolean; name?: string; page?: number; style?: BlockStyle; data: CustomData}

export interface CVDocument {
    id: string;
    title: string;
    blocks: CVBlock[];
    category?: string;
    pageCount?: number;
    templateId?: string;
    templateCategory?: TemplateCategory;
    accentColor?: string;
    font?: DocumentFont;
    updatedAt: number;
}

export type TemplateCategory = "simple" | "modern" | "creative" | "photo" | "compact" | "first-job";

export type DocumentFont = "sans" | "serif" | "mono";

export const NAMA_KATEGORI: Record<TemplateCategory, string> = {
    simple: "Simple",
    modern: "Modern",
    creative: "Creative",
    photo: "Photo",
    compact: "Compact",
    "first-job": "First Job",
};
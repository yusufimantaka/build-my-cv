export interface HeaderData {
    fullName: string;
    title: string;
    email: string;
    phone: string;
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
    pageCount?: number;
    updatedAt: number;
}
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

export type CVBlock =
| {id: string; type: 'header'; order: number; visible: boolean; data: HeaderData}
| {id: string; type: 'experience'; order: number; visible: boolean; data: ExperienceData}
| {id: string; type: 'skills'; order: number; visible: boolean; data: SkillsData}

export interface CVDocument {
    id: string;
    title: string;
    blocks: CVBlock[];
    updatedAt: number;
}
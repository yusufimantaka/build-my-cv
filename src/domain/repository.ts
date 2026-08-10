import type { CVDocument } from "./cv";

export interface WorkspaceRepository {
    loadDocuments(): Promise<CVDocument[]>;
    saveDocument(document: CVDocument): Promise<void>;
    deleteDocument(id: string): Promise<void>;
}
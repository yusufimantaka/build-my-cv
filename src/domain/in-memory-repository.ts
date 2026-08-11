import type { WorkspaceRepository } from "./repository";
import type { CVDocument } from "./cv";

export class InMemoryRepository implements WorkspaceRepository {
    private documents: CVDocument[] = [];

    async loadDocuments(): Promise<CVDocument[]> {
        return this.documents;
    }

    async saveDocument(document: CVDocument): Promise<void> {
        let foundPosition = -1;

        for (let i = 0; i < this.documents.length; i++) {
            const cv = this.documents[i];
            if (cv.id === document.id) {
                foundPosition = i;
                break;
            }
        }

        if (foundPosition === -1) {
            this.documents = [...this.documents, document]
        } else {
            this.documents[foundPosition] = document;
        }
    }

    async deleteDocument(id: string): Promise<void> {
        const result: CVDocument[] = [];

        for (let i = 0; i < this.documents.length; i++) {
            const cv = this.documents[i]
            if (cv.id !== id) {
                result.push(cv)
            }
        }

        this.documents = result;
    }
}
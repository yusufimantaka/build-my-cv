import { CVDocument } from "./cv";
import { WorkspaceRepository } from "./repository";

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('cv-builder', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore('documents', {keyPath: "id"});
        }

        request.onsuccess = () => {
            resolve(request.result)
        };

        request.onerror = () => {
            reject(request.error)
        };


    })
}

export class IndexedDBRepository implements WorkspaceRepository {
    async loadDocuments(): Promise<CVDocument[]> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("documents", 'readonly');
            const store = transaction.objectStore("documents");
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            }

            request.onerror = () => {
                reject(request.error);
            }
        })
    }

    async saveDocument(document: CVDocument): Promise<void> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("documents", "readwrite");
            const store = transaction.objectStore("documents");
            const request = store.put(document);

            request.onsuccess = () => {
                resolve();
            }

            request.onerror = () => {
                reject(request.error);
            }
        })
    }

    async deleteDocument(id: string): Promise<void> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("documents", "readwrite");
            const store = transaction.objectStore("documents");
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            }

            request.onerror = () => {
                reject(request.error);
            }
        })
    }
}
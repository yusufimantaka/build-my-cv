import { InMemoryRepository } from "./in-memory-repository";

async function main() {
    const repo = new InMemoryRepository;

    const cvPertama = {
        id: 'cv-1',
        title: "CV Pertama",
        blocks: [],
        updatedAt: Date.now(),
    }

    await repo.saveDocument(cvPertama);
    const afterSave = await repo.loadDocuments()
    console.log('Setelah simpan, jumlah CV: ', afterSave.length);

    const cvPertamaUpdate = {...cvPertama, title: 'CV Pertama (Updated)'};
    await repo.saveDocument(cvPertamaUpdate);
    const afterUpdate = await repo.loadDocuments()
    console.log('Setelah update, jumlah CV: ', afterUpdate.length);
    console.log('Judul terbaru: ', afterUpdate[0].title);

    await repo.deleteDocument('cv-1');
    const afterRemove = await repo.loadDocuments();
    console.log('Setelah hapus, jumlah CV: ', afterRemove.length);

    await repo.deleteDocument('bodong');
    console.log('Hapus id tidak ada, aman: ', (await repo.loadDocuments()).length)

}

main();
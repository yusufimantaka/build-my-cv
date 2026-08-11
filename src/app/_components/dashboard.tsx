"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IndexedDBRepository } from "@/domain/indexed-db-repository";
import type { CVDocument } from "@/domain/cv";

const repo = new IndexedDBRepository();

export default function Dashboard() {
  const [documents, setDocuments] = useState<CVDocument[]>([]);
  const [loading, setLoading] = useState(true);

  async function muatUlang(): Promise<void> {
    const docs = await repo.loadDocuments();
    setDocuments(docs);
    setLoading(false);
  }

  useEffect(() => {
    repo.loadDocuments().then((docs) => {
      setDocuments(docs);
      setLoading(false);
    });
  }, []);

  async function tambahCV(): Promise<void> {
    const baru: CVDocument = {
      id: crypto.randomUUID(),
      title: "CV Baru",
      blocks: [],
      updatedAt: Date.now(),
    };
    await repo.saveDocument(baru);
    await muatUlang();
  }

  async function hapusCV(id: string): Promise<void> {
    await repo.deleteDocument(id);
    await muatUlang();
  }

  return (
    <main className="min-h-screen bg-[#151515] p-8 font-sans text-[#f5f2ea]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={tambahCV}
          className="rounded-md bg-[#c8ff3d] px-4 py-2 text-sm font-medium text-[#151515]"
        >
          Tambah CV
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-[#a7a39a]">Memuat…</p>
      ) : documents.length === 0 ? (
        <p className="mt-8 text-[#a7a39a]">Belum ada CV.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {documents.map((cv) => (
            <li key={cv.id} className="rounded-md border border-white/10 bg-[#1d1d1d] p-4">
              <Link href={`/build/${cv.id}`}>
                <p className="font-medium">{cv.title}</p>
                <p className="mt-1 text-sm text-[#a7a39a]">{cv.id}</p>
              </Link>
              <button
                onClick={() => hapusCV(cv.id)}
                className="mt-3 text-sm text-[#ff746c] hover:underline"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

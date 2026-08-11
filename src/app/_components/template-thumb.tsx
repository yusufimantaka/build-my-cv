// Miniatur kertas template. Warna aksen template jadi garis nama.
// Ukuran dibatasi tinggi (h-44) supaya kartu tidak terlalu tinggi.
export default function TemplateThumb({ accent }: { accent: string }) {
    return (
        <div className="mx-auto aspect-[210/297] h-44 w-auto overflow-hidden rounded-sm border border-[#171717]/10 bg-white p-3">
            <div className="h-2.5 w-1/2 rounded-sm" style={{ background: accent }} />
            <div className="mt-1.5 h-1.5 w-1/3 rounded-sm bg-[#d9d2c3]" />
            <div className="mt-3 h-1.5 w-full rounded-sm bg-[#e4ddcd]" />
            <div className="mt-1 h-1.5 w-5/6 rounded-sm bg-[#e4ddcd]" />
            <div className="mt-3 h-1.5 w-full rounded-sm bg-[#e4ddcd]" />
            <div className="mt-1 h-1.5 w-2/3 rounded-sm bg-[#e4ddcd]" />
            <div className="mt-3 h-1.5 w-1/3 rounded-sm" style={{ background: accent, opacity: 0.5 }} />
            <div className="mt-1 h-1.5 w-4/5 rounded-sm bg-[#e4ddcd]" />
            <div className="mt-1 h-1.5 w-3/5 rounded-sm bg-[#e4ddcd]" />
        </div>
    );
}

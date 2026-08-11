import type { CVTemplate } from "@/domain/templates";

// Miniatur kertas template. Warna aksen template jadi garis nama.
// Variasi layout ditiru secara ringkas:
// - headerStyle "band" → garis tebal atas berwarna aksen
// - layout "sidebar" → jalur kiri berwarna aksen
// - sectionStyle "bar" → beberapa garis abu yang lebih tebal
export default function TemplateThumb({ template }: { template: CVTemplate }) {
    const accent = template.accent;
    const band = template.headerStyle === "band";
    const sidebarLayout = template.layout === "sidebar";
    const bar = template.sectionStyle === "bar";

    return (
        <div className="relative mx-auto aspect-[210/297] h-44 w-auto overflow-hidden rounded-none border border-hair bg-white">
            {/* Jalur sidebar kiri */}
            {sidebarLayout && (
                <div className="absolute inset-y-0 left-0 w-1/4" style={{ background: template.sidebarColor ?? accent }} />
            )}
            <div className={sidebarLayout ? "pl-1/4" : ""}>
                {/* Band header */}
                <div
                    className={band ? "h-8 w-full" : "px-3 pt-3"}
                    style={band ? { background: accent } : undefined}
                >
                    {!band && (
                        <>
                            <div className="h-2.5 w-1/2 rounded-none" style={{ background: accent }} />
                            <div className="mt-1.5 h-1.5 w-1/3 rounded-none bg-[#d9d2c3]" />
                        </>
                    )}
                </div>
                <div className="px-3 pb-3">
                    <div className="mt-3 h-1.5 w-full rounded-none bg-[#e4ddcd]" />
                    <div className="mt-1 h-1.5 w-5/6 rounded-none bg-[#e4ddcd]" />
                    {bar && <div className="mt-3 h-2 w-full rounded-none bg-[#ddd8cd]" />}
                    <div className="mt-1.5 h-1.5 w-full rounded-none bg-[#e4ddcd]" />
                    <div className="mt-1 h-1.5 w-2/3 rounded-none bg-[#e4ddcd]" />
                    {!bar && <div className="mt-3 h-1.5 w-1/3 rounded-none" style={{ background: accent, opacity: 0.5 }} />}
                    <div className="mt-1 h-1.5 w-4/5 rounded-none bg-[#e4ddcd]" />
                    <div className="mt-1 h-1.5 w-3/5 rounded-none bg-[#e4ddcd]" />
                </div>
            </div>
        </div>
    );
}

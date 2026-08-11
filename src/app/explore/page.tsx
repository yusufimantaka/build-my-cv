import TopNav from "@/app/_components/topnav";

export default function ExplorePage() {
    return (
        <main className="min-h-screen bg-[#f6f3ed] font-sans text-[#171717]">
            <TopNav />
            <div className="flex flex-col items-center gap-4 p-16 text-center">
                <iconify-icon icon="mdi:compass-outline" width="56" height="56" className="text-[#3f6382]" />
                <h1 className="text-2xl font-semibold">Explore</h1>
                <p className="max-w-md text-sm text-[#6e6a5e]">
                    Katalog referensi CV dari berbagai bidang dan jurusan. Segera hadir.
                </p>
                <span className="rounded-full bg-[#3f6382]/10 px-3 py-1 text-xs font-medium text-[#3f6382]">
                    Coming soon
                </span>
            </div>
        </main>
    );
}

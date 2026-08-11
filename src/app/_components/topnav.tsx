"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { href: "/app", label: "Dashboard", icon: "mdi:view-dashboard-outline" },
    { href: "/library", label: "Library", icon: "mdi:book-open-variant" },
    { href: "/explore", label: "Explore", icon: "mdi:compass-outline" },
];

export default function TopNav() {
    const pathname = usePathname();
    const [showAiChat, setShowAiChat] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll(): void {
            setScrolled(window.scrollY > 8);
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <nav
                className={
                    "sticky top-0 z-50 flex items-center gap-1 px-6 py-2 transition-all duration-300 " +
                    (scrolled
                        ? "border-b border-hair bg-panel/95 backdrop-blur"
                        : "border-b border-transparent bg-transparent")
                }
            >
                <Link href="/" className="mr-4 text-sm font-semibold text-ink hover:underline">
                    BuildMyCV
                </Link>
                {items.map((item) => {
                    const aktif = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                "flex items-center gap-2 rounded-none px-3 py-1.5 text-sm transition-colors " +
                                (aktif
                                    ? "bg-ink text-panel"
                                    : "text-ink hover:bg-panel2")
                            }
                        >
                            <iconify-icon icon={item.icon} width="15" height="15" />
                            {item.label}
                        </Link>
                    );
                })}
                <button
                    onClick={() => setShowAiChat(true)}
                    className="ml-auto flex items-center gap-2 rounded-none px-3 py-1.5 text-sm text-ink transition-colors hover:bg-panel2"
                >
                    <iconify-icon icon="mdi:robot-outline" width="15" height="15" className="text-ink" />
                    AI Chat
                    <span className="rounded-none bg-ink/10 px-2 py-0.5 text-[10px] font-medium text-ink">
                        Segera
                    </span>
                </button>
                <a
                    href="https://github.com/yusufimantaka/build-my-cv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 flex items-center gap-2 rounded-none bg-[#171717] px-3 py-1.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
                >
                    <iconify-icon icon="mdi:github" width="15" height="15" />
                    GitHub
                </a>
            </nav>

            {showAiChat && (
                <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm animate-pop rounded-none bg-panel p-6 text-center shadow-xl">
                        <iconify-icon icon="mdi:robot-outline" width="48" height="48" className="text-ink" />
                        <h2 className="mt-3 text-lg font-semibold">AI Chat</h2>
                        <p className="mt-2 text-sm text-muted">
                            Bantu tulis dan perbaiki CV dengan AI. Segera hadir.
                        </p>
                        <span className="mt-3 inline-block rounded-none bg-ink/10 px-3 py-1 text-xs font-medium text-ink">
                            Coming soon
                        </span>
                        <div className="mt-5 flex justify-center">
                            <button
                                onClick={() => setShowAiChat(false)}
                                className="rounded-none bg-[#37352F] px-4 py-2 text-sm font-medium text-white hover:bg-ink/85"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

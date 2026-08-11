"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { href: "/", label: "Dashboard", icon: "mdi:view-dashboard-outline" },
    { href: "/library", label: "Library", icon: "mdi:book-open-variant" },
    { href: "/explore", label: "Explore", icon: "mdi:compass-outline" },
];

export default function TopNav() {
    const pathname = usePathname();
    const [showAiChat, setShowAiChat] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 flex items-center gap-1 border-b border-[#171717]/10 bg-white/95 px-6 py-2 backdrop-blur">
                <span className="mr-4 text-sm font-semibold text-[#3f6382]">
                    BuildMyCV
                </span>
                {items.map((item) => {
                    const aktif = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors " +
                                (aktif
                                    ? "bg-[#3f6382] text-white"
                                    : "text-[#171717] hover:bg-[#f0ece3]")
                            }
                        >
                            <iconify-icon icon={item.icon} width="15" height="15" />
                            {item.label}
                        </Link>
                    );
                })}
                <button
                    onClick={() => setShowAiChat(true)}
                    className="ml-auto flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-[#171717] transition-colors hover:bg-[#f0ece3]"
                >
                    <iconify-icon icon="mdi:robot-outline" width="15" height="15" className="text-[#3f6382]" />
                    AI Chat
                    <span className="rounded-full bg-[#3f6382]/10 px-2 py-0.5 text-[10px] font-medium text-[#3f6382]">
                        Segera
                    </span>
                </button>
            </nav>

            {showAiChat && (
                <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm animate-pop rounded-md bg-white p-6 text-center shadow-xl">
                        <iconify-icon icon="mdi:robot-outline" width="48" height="48" className="text-[#3f6382]" />
                        <h2 className="mt-3 text-lg font-semibold">AI Chat</h2>
                        <p className="mt-2 text-sm text-[#6e6a5e]">
                            Bantu tulis dan perbaiki CV dengan AI. Segera hadir.
                        </p>
                        <span className="mt-3 inline-block rounded-full bg-[#3f6382]/10 px-3 py-1 text-xs font-medium text-[#3f6382]">
                            Coming soon
                        </span>
                        <div className="mt-5 flex justify-center">
                            <button
                                onClick={() => setShowAiChat(false)}
                                className="rounded-md bg-[#3f6382] px-4 py-2 text-sm font-medium text-white hover:bg-[#355573]"
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

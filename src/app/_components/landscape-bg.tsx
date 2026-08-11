// Latar lanskap lembut untuk halaman app.
// Fixed, tidak memengaruhi layout. Dipakai di Dashboard, Library, Explore.
// Overlay gradient memastikan teks di atas tetap terbaca.
export default function LandscapeBg() {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-bottom bg-no-repeat"
                style={{ backgroundImage: "url('/hero-landscape.svg')" }}
            />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#f6f3ed] via-[#f6f3ed]/80 to-[#f6f3ed]/30" />
            <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-t from-[#f6f3ed] via-[#f6f3ed]/70 to-transparent" />
        </>
    );
}

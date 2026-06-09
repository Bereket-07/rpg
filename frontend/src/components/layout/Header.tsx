"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { X, Menu, ArrowRight, ChevronDown } from "lucide-react";
import { getApiUrl } from "@/lib/api";


const navItems = [
    { name: "Home", href: "/", number: "01" },
    { name: "Our Approach", href: "/approach", number: "02" },
    { name: "Meet the Team", href: "/team", number: "03" },
    { name: "Specialties", href: "/specialties", number: "04" },
    { name: "Services and Fees", href: "/services", number: "05" },
    { name: "Blog", href: "/blog", number: "06" },
];

interface TeamNavProfile {
    slug: string;
    name: string;
    role: string;
    image: string;
}

export function Header() {
    const pathname = usePathname();
    const [logoUrl, setLogoUrl] = useState("/assets/RPG Logo_Main Landscape.png");
    const [btnText, setBtnText] = useState("Contact Us");
    const [teamProfiles, setTeamProfiles] = useState<TeamNavProfile[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch dynamic settings
    useEffect(() => {
        async function fetchHeaderSettings() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/settings/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.logo_url) setLogoUrl(data.logo_url);
                    if (data.header_button_text) setBtnText(data.header_button_text);
                }
            } catch (err) {
                console.error("Failed to load header settings:", err);
            }
        }
        fetchHeaderSettings();
    }, []);

    useEffect(() => {
        async function fetchTeamProfiles() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/authors?team_only=true`);
                if (!res.ok) return;
                const data = await res.json();
                if (!Array.isArray(data)) return;
                setTeamProfiles(data.map((author: any) => {
                    const name = String(author.name || "");
                    return {
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                        name,
                        role: author.role || "Clinical Psychologist",
                        image: author.profile_image_url || "/assets/RPG Logo_Main Portrait.png",
                    };
                }).filter((profile: TeamNavProfile) => profile.name && profile.slug));
            } catch (err) {
                console.error("Failed to load team menu:", err);
            }
        }
        fetchTeamProfiles();
    }, []);

    // Scroll shadow effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when menu open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <>
            {/* ── Main header bar ── */}
            <header
                className={`w-full bg-[#FDF8F5] border-b border-black/[0.04] fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-300 ${
                    scrolled ? "shadow-[0_2px_24px_rgba(0,0,0,0.07)]" : ""
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl h-20 sm:h-24 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center flex-shrink-0 relative z-10">
                        <img
                            src={logoUrl}
                            alt="Reframe Psychology Group Logo"
                            className="object-contain h-11 sm:h-14 w-auto"
                        />
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        <nav className="flex items-center gap-8">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const isTeam = item.href === "/team";
                                if (isTeam) {
                                    return (
                                        <div key={item.href} className="relative py-2 group">
                                            <Link
                                                href={item.href}
                                                className={`text-sm font-medium text-[#5c6670] hover:text-[#333a42] transition-all duration-200 relative py-2 flex items-center gap-1.5 ${
                                                    isActive ? "text-[#333a42] font-semibold" : ""
                                                }`}
                                            >
                                                {item.name}
                                                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                                                <span className={`absolute bottom-[-2px] left-0 h-[1.5px] bg-[#5c6670] transition-all duration-300 ${
                                                    isActive ? "w-full" : "w-0 group-hover:w-full"
                                                }`} />
                                            </Link>

                                            <div className="absolute left-1/2 top-full w-[310px] -translate-x-1/2 pt-4 opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-200">
                                                <div className="bg-[#FDF8F5] border border-black/[0.06] shadow-[0_18px_45px_rgba(30,28,24,0.14)] rounded-[8px] overflow-hidden">
                                                    <Link
                                                        href="/team"
                                                        className="flex items-center justify-between px-4 py-3 border-b border-black/[0.05] text-[12px] font-bold uppercase tracking-[0.18em] text-[#5c6670] hover:bg-white/50 transition-colors"
                                                    >
                                                        View All
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <div className="max-h-[420px] overflow-y-auto">
                                                        {teamProfiles.map(profile => (
                                                            <Link
                                                                key={profile.slug}
                                                                href={`/team/${profile.slug}`}
                                                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/60 transition-colors border-b border-black/[0.04] last:border-b-0"
                                                            >
                                                                <span className="w-11 h-11 rounded-full overflow-hidden bg-[#d2c9b7] border border-white shrink-0">
                                                                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                                                </span>
                                                                <span className="min-w-0">
                                                                    <span className="block text-[13px] font-bold text-[#333a42] leading-tight truncate">{profile.name}</span>
                                                                    <span className="block text-[11px] text-[#5c6670]/75 leading-snug truncate">{profile.role}</span>
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`text-sm font-medium text-[#5c6670] hover:text-[#333a42] transition-all duration-200 relative py-2 group ${
                                            isActive ? "text-[#333a42] font-semibold" : ""
                                        }`}
                                    >
                                        {item.name}
                                        {/* Active underline */}
                                        <span className={`absolute bottom-[-2px] left-0 h-[1.5px] bg-[#5c6670] transition-all duration-300 ${
                                            isActive ? "w-full" : "w-0 group-hover:w-full"
                                        }`} />
                                    </Link>
                                );
                            })}
                        </nav>
                        <Link
                            href="/contact"
                            className="bg-[#5c6670] hover:bg-[#424c56] text-white rounded-[2px] font-semibold text-sm h-11 px-6 flex items-center transition-all duration-300 shadow-none hover:shadow-[0_4px_16px_rgba(66,76,86,0.25)]"
                        >
                            {btnText}
                        </Link>
                    </div>

                    {/* Mobile right side — hamburger only */}
                    <div className="flex lg:hidden items-center">

                        {/* Hamburger button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                            className="relative w-10 h-10 flex items-center justify-center rounded-[4px] text-[#5c6670] hover:bg-[#5c6670]/8 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ebac8]"
                        >
                            {/* Animated hamburger → X */}
                            <span className="relative w-6 h-5 flex flex-col justify-between">
                                <span className={`block h-[1.5px] bg-[#5c6670] rounded-full transition-all duration-300 origin-center ${
                                    menuOpen ? "rotate-45 translate-y-[9px]" : ""
                                }`} />
                                <span className={`block h-[1.5px] bg-[#5c6670] rounded-full transition-all duration-300 ${
                                    menuOpen ? "opacity-0 scale-x-0" : ""
                                }`} />
                                <span className={`block h-[1.5px] bg-[#5c6670] rounded-full transition-all duration-300 origin-center ${
                                    menuOpen ? "-rotate-45 -translate-y-[9px]" : ""
                                }`} />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Spacer so content isn't hidden behind fixed header ── */}
            <div className="h-20 sm:h-24 lg:h-24" />

            {/* ── Mobile full-screen overlay menu ── */}
            {/* Backdrop blur */}
            <div
                onClick={() => setMenuOpen(false)}
                className={`fixed inset-0 bg-[#333a42]/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-400 ${
                    menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Slide-in drawer from right */}
            <div
                ref={menuRef}
                className={`fixed top-0 right-0 h-full w-[85vw] max-w-[360px] bg-[#FDF8F5] z-50 lg:hidden flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[-12px_0_48px_rgba(0,0,0,0.12)] ${
                    menuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Drawer top bar */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
                    <img
                        src={logoUrl}
                        alt="Reframe Psychology Group"
                        className="h-10 w-auto object-contain"
                    />
                    <button
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className="w-9 h-9 rounded-full bg-[#5c6670]/8 hover:bg-[#5c6670]/15 flex items-center justify-center text-[#5c6670] transition-all duration-200"
                    >
                        <X className="w-4 h-4 stroke-[2]" />
                    </button>
                </div>

                {/* Nav links list */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="space-y-1">
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        transitionDelay: menuOpen ? `${index * 45 + 80}ms` : "0ms",
                                    }}
                                    className={`group flex items-center justify-between px-4 py-4 rounded-[8px] transition-all duration-300 ${
                                        menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                                    } ${
                                        isActive
                                            ? "bg-[#5c6670]/10 text-[#333a42]"
                                            : "text-[#5c6670] hover:bg-[#5c6670]/6 hover:text-[#333a42]"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-bold tracking-widest transition-colors duration-200 ${
                                            isActive ? "text-[#7ebac8]" : "text-[#5c6670]/30 group-hover:text-[#7ebac8]"
                                        }`}>
                                            {item.number}
                                        </span>
                                        <span className={`text-[15px] font-medium tracking-wide transition-all duration-200 ${
                                            isActive ? "font-semibold text-[#333a42]" : ""
                                        }`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <ArrowRight className={`w-3.5 h-3.5 transition-all duration-200 ${
                                        isActive
                                            ? "text-[#7ebac8] translate-x-0 opacity-100"
                                            : "text-[#5c6670]/25 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#7ebac8]"
                                    }`} />
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Drawer bottom CTA */}
                <div
                    style={{ transitionDelay: menuOpen ? "380ms" : "0ms" }}
                    className={`px-6 py-6 border-t border-black/[0.06] space-y-3 transition-all duration-300 ${
                        menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                >
                    <Link
                        href="/contact"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full bg-[#5c6670] hover:bg-[#424c56] active:scale-[0.98] text-white font-semibold text-sm h-13 py-4 rounded-[4px] transition-all duration-200 shadow-[0_4px_16px_rgba(66,76,86,0.2)]"
                    >
                        {btnText}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-center text-[11px] text-[#5c6670]/40 tracking-wide">
                        Reframe Psychology Group · California
                    </p>
                </div>
            </div>
        </>
    );
}

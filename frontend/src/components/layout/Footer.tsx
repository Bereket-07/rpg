"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, Send, CheckCircle2, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";


const footerLinks = [
    { name: "Home", href: "/" },
    { name: "Our Approach", href: "/approach" },
    { name: "Meet the Team", href: "/team" },
    { name: "Specialties", href: "/specialties" },
    { name: "Services and Fees", href: "/services" },
    { name: "Blog", href: "/blog" },
];

export function Footer() {
    const pathname = usePathname();
    const [logoUrl, setLogoUrl] = useState("/assets/RPG Logo_Main Landscape.png");
    const [readyText, setReadyText] = useState("Ready to start?");
    const [btnText, setBtnText] = useState("Schedule a Consultation");

    // Newsletter state
    const [email, setEmail] = useState("");
    const [nlLoading, setNlLoading] = useState(false);
    const [nlDone, setNlDone] = useState(false);
    const [nlError, setNlError] = useState("");

    useEffect(() => {
        async function fetchFooterSettings() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/settings/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.logo_url) setLogoUrl(data.logo_url);
                    if (data.footer_ready_text) setReadyText(data.footer_ready_text);
                    if (data.footer_button_text) setBtnText(data.footer_button_text);
                }
            } catch (err) {
                console.error("Failed to load footer settings:", err);
            }
        }
        fetchFooterSettings();
    }, []);

    async function handleSubscribe(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setNlLoading(true); setNlError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/newsletter/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setNlDone(true);
                setEmail("");
            } else {
                const data = await res.json().catch(() => ({}));
                setNlError(data.detail || "Something went wrong. Please try again.");
            }
        } catch {
            setNlError("Could not connect. Please try again.");
        } finally {
            setNlLoading(false);
        }
    }

    // Hide footer on the approach page
    if (pathname === "/approach") return null;

    return (
        <footer className="bg-[#424c56] text-white font-sans">

            {/* ── Main footer grid ─────────────────────────────────────────── */}
            <div className="container mx-auto px-6 sm:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start">

                    {/* Column 1: Logo */}
                    <div className="flex flex-col items-start sm:col-span-2 lg:col-span-1">
                        <img
                            src={logoUrl}
                            alt="Reframe Psychology Group Logo"
                            className="object-contain h-14 sm:h-16 w-auto brightness-0 invert"
                        />
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="flex flex-col space-y-1">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-2 py-1.5 text-[15px] sm:text-[16px] font-medium tracking-wide transition-all duration-200 ${
                                    pathname === link.href
                                        ? "text-white"
                                        : "text-[#e1ddd3] hover:text-white"
                                }`}
                            >
                                <span className={`w-3 h-px bg-[#7ebac8] transition-all duration-300 ${
                                    pathname === link.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Column 3: CTA block */}
                    <div className="flex flex-col items-start lg:items-end space-y-5 lg:pt-2 sm:col-span-2 lg:col-span-1">
                        <div className="lg:text-right space-y-2">
                            <p className="text-[#e1ddd3] font-normal text-[16px] sm:text-[18px] tracking-wide leading-snug max-w-[240px] lg:max-w-none">
                                {readyText}
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="group flex items-center gap-3 bg-white hover:bg-[#fdf8f5] text-[#424c56] font-semibold px-7 sm:px-8 rounded-none h-14 border-none shadow-[0_4px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.24)] transition-all duration-300 text-[15px] sm:text-[16px] tracking-wide active:scale-[0.98]"
                        >
                            {btnText}
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </div>

                </div>
            </div>

            {/* ── Bottom bar ───────────────────────────────────────────────── */}
            <div className="border-t border-white/[0.06]">
                <div className="container mx-auto px-6 sm:px-8 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[#e1ddd3]/40 text-[11px] tracking-wide text-center sm:text-left">
                        © {new Date().getFullYear()} Reframe Psychology Group. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link href="/contact" className="text-[#e1ddd3]/40 hover:text-[#e1ddd3]/70 text-[11px] tracking-wide transition-colors duration-200">
                            Privacy Policy
                        </Link>
                        <span className="text-white/10">·</span>
                        <Link href="/contact" className="text-[#e1ddd3]/40 hover:text-[#e1ddd3]/70 text-[11px] tracking-wide transition-colors duration-200">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

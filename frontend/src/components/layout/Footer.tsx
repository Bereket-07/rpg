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

            {/* ── Newsletter band ─────────────────────────────────────────── */}
            <div className="border-b border-white/[0.07]">
                <div className="container mx-auto px-6 sm:px-8 max-w-7xl py-10 sm:py-12">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-1 max-w-sm">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7ebac8]">
                                Stay Informed
                            </p>
                            <p className="text-[#e1ddd3] text-[16px] sm:text-[17px] font-medium leading-snug">
                                Mental health insights, directly to your inbox.
                            </p>
                            <p className="text-[#e1ddd3]/50 text-[12px] leading-relaxed">
                                No spam. Practical tools and expert perspectives, monthly.
                            </p>
                        </div>

                        {nlDone ? (
                            <div className="flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-400/25 rounded-xl px-5 py-3.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div>
                                    <p className="text-emerald-300 font-semibold text-sm">You're subscribed!</p>
                                    <p className="text-emerald-400/70 text-xs mt-0.5">Check your inbox for a welcome email.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[380px]">
                                <div className="flex gap-2">
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="flex-1 bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.12] border border-white/[0.1] focus:border-[#7ebac8]/60 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={nlLoading}
                                        className="bg-[#7ebac8] hover:bg-[#6aaab8] active:scale-[0.97] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-60 shadow-lg shadow-black/20"
                                    >
                                        {nlLoading
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <><Send className="w-3.5 h-3.5" /> Subscribe</>
                                        }
                                    </button>
                                </div>
                                {nlError && (
                                    <p className="text-rose-400 text-xs px-1">{nlError}</p>
                                )}
                                <p className="text-[#e1ddd3]/30 text-[11px] px-1">
                                    By subscribing you agree to our privacy policy. Unsubscribe anytime.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main footer grid ─────────────────────────────────────────── */}
            <div className="container mx-auto px-6 sm:px-8 max-w-7xl py-16 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start">

                    {/* Column 1: Logo + tagline */}
                    <div className="flex flex-col items-start space-y-4 sm:col-span-2 lg:col-span-1">
                        <img
                            src={logoUrl}
                            alt="Reframe Psychology Group Logo"
                            className="object-contain h-12 sm:h-14 w-auto opacity-100"
                        />
                        <p className="text-[#e1ddd3]/70 text-sm leading-relaxed max-w-[260px]">
                            Attuned, evidence-based psychological care for adults and couples across California.
                        </p>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="flex flex-col space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7ebac8] mb-4">
                            Navigation
                        </p>
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
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7ebac8]">
                                Get Started
                            </p>
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

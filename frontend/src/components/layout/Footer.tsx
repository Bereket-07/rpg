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
        <footer className="bg-[#4E5762] text-white font-sans">

            {/* ── Main footer grid ─────────────────────────────────────────── */}
            <div className="w-full px-8 xl:px-14 pt-16 sm:pt-20 pb-6 sm:pb-8">
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
                    <div className="flex flex-col space-y-2">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-[15px] sm:text-[16px] font-normal tracking-wide transition-all duration-200 ${
                                    pathname === link.href
                                        ? "text-white font-medium"
                                        : "text-white/80 hover:text-white"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Column 3: CTA block */}
                    <div className="flex flex-col items-start space-y-4 sm:col-span-2 lg:col-span-1 lg:self-end">
                        <div className="space-y-2">
                            <p className="text-white/85 font-normal text-[15px] sm:text-[17px] tracking-wide leading-snug">
                                {readyText}
                            </p>
                        </div>
                        <a
                            href="https://reframe.clientsecure.me"
                            data-spwidget-scope-id="64787fd5-84f6-42ba-9955-816d91404e11"
                            data-spwidget-scope-uri="reframe"
                            data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
                            data-spwidget-type="OAR"
                            data-spwidget-scope-global
                            data-spwidget-autobind
                            className="flex items-center justify-center bg-white hover:bg-white/95 text-[#4E5762] font-semibold px-7 sm:px-8 rounded-[4px] h-12 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.18)] transition-all duration-300 text-[15px] sm:text-[16px] tracking-wide active:scale-[0.98] cursor-pointer"
                        >
                            {btnText}
                        </a>
                    </div>

                </div>

                {/* ── Bottom bar merged inside main container ────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/50 text-[11px] tracking-wide mt-12 sm:mt-16">
                    <p className="text-center sm:text-left">
                        © {new Date().getFullYear()} Reframe Psychology Group. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <Link href="/contact" className="hover:text-white transition-colors duration-200">
                            Privacy Policy
                        </Link>
                        <span className="text-white/20">·</span>
                        <Link href="/contact" className="hover:text-white transition-colors duration-200">
                            Terms of Service
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}

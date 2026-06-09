"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";


interface Props {
    heading?: string;
    subheading?: string;
    dark?: boolean; // true = dark #424c56 bg, false = teal #7ebac8 bg
}

export function NewsletterSignup({
    heading = "Get mental health insights in your inbox.",
    subheading = "Practical tools and expert perspectives from our clinicians — delivered monthly. No spam, ever.",
    dark = false,
}: Props) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setLoading(true); setError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/newsletter/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) { setDone(true); setEmail(""); }
            else {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Something went wrong. Please try again.");
            }
        } catch {
            setError("Could not connect. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const bg = dark ? "bg-[#424c56]" : "bg-[#7ebac8]";
    const textPrimary = "text-white";
    const textMuted = dark ? "text-white/60" : "text-white/80";
    const inputBg = dark ? "bg-white/[0.08] border-white/[0.12] focus:border-[#7ebac8]/60" : "bg-white/20 border-white/30 focus:border-white/70";

    return (
        <section className={`${bg} py-14 sm:py-16`}>
            <div className="container mx-auto max-w-4xl px-6 sm:px-8">
                {done ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-white text-xl font-bold">You're subscribed!</p>
                            <p className={`${textMuted} text-sm mt-0.5`}>Check your inbox for a welcome email from us.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-14">
                        <div className="flex-1 space-y-2">
                            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${dark ? "text-[#7ebac8]" : "text-white/70"}`}>
                                Newsletter
                            </p>
                            <h2 className={`text-2xl sm:text-[28px] font-serif font-normal leading-snug ${textPrimary}`}>
                                {heading}
                            </h2>
                            <p className={`text-sm leading-relaxed ${textMuted}`}>{subheading}</p>
                        </div>
                        <div className="w-full lg:w-auto lg:min-w-[360px] space-y-2">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className={`flex-1 ${inputBg} border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all`}
                                />
                                <button type="submit" disabled={loading}
                                    className="bg-white hover:bg-white/90 text-[#424c56] font-bold px-5 py-3 rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-60 shadow-lg shadow-black/15 active:scale-[0.97]">
                                    {loading
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <><Send className="w-3.5 h-3.5" /> Subscribe</>
                                    }
                                </button>
                            </form>
                            {error && <p className="text-rose-300 text-xs px-1">{error}</p>}
                            <p className={`text-[11px] px-1 ${textMuted}`}>
                                By subscribing you agree to our privacy policy. Unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
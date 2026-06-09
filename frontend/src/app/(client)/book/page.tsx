"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, CalendarIcon, Clock, User, Search, Star } from "lucide-react";
import { getApiUrl } from "@/lib/api";


interface Specialty { title: string; description?: string; desc?: string; }
interface Clinician {
    id: number; name: string; credentials?: string; role?: string;
    bio?: string; profile_image_url?: string; specialties_list?: Specialty[];
    calendar_type?: string; booking_link?: string;
}

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

const CONCERNS = [
    { label: "Anxiety & Stress", icon: "🧠", keywords: ["anxiety", "stress", "panic", "worry"] },
    { label: "Trauma & PTSD", icon: "💙", keywords: ["trauma", "ptsd", "emdr", "abuse"] },
    { label: "Depression", icon: "🌧️", keywords: ["depression", "mood", "grief", "loss"] },
    { label: "Relationships", icon: "❤️", keywords: ["relationship", "couples", "family", "attachment"] },
    { label: "Work & Burnout", icon: "💼", keywords: ["burnout", "work", "career", "stress"] },
    { label: "Life Transitions", icon: "🌱", keywords: ["transition", "change", "identity", "growth"] },
    { label: "Child & Teen", icon: "🧒", keywords: ["child", "teen", "adolescent", "youth", "family"] },
    { label: "Not Sure", icon: "💬", keywords: [] },
];

function matchClinicians(clinicians: Clinician[], concern: string): Clinician[] {
    if (concern === "Not Sure") return clinicians;
    const kw = CONCERNS.find(c => c.label === concern)?.keywords || [];
    const scored = clinicians.map(c => {
        const text = [
            c.bio || "", c.role || "",
            ...(c.specialties_list || []).map(s => `${s.title} ${s.description || s.desc || ""}`),
        ].join(" ").toLowerCase();
        const score = kw.filter(k => text.includes(k)).length;
        return { c, score };
    });
    const matched = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.c);
    return matched.length > 0 ? matched : clinicians; // fallback: show all
}

// ── Calendly / Cal.com embed ─────────────────────────────────────────────────
function CalendarEmbed({ type, link }: { type: string; link: string }) {
    useEffect(() => {
        if (type === "calendly") {
            const s = document.createElement("script");
            s.src = "https://assets.calendly.com/assets/external/widget.js";
            s.async = true; document.head.appendChild(s);
            return () => { document.head.removeChild(s); };
        }
    }, [type]);

    if (type === "calendly") {
        return (
            <div className="w-full rounded-xl overflow-hidden border border-black/[0.07] bg-white"
                style={{ minHeight: 600 }}>
                <div className="calendly-inline-widget w-full h-[620px]"
                    data-url={link}
                    style={{ minWidth: 320 }} />
            </div>
        );
    }
    if (type === "cal_com") {
        const calUser = link.replace("https://cal.com/", "").replace(/\/$/, "");
        return (
            <iframe
                src={`https://cal.com/${calUser}?embed=true&layout=month_view`}
                className="w-full rounded-xl border border-black/[0.07]"
                style={{ height: 620, minWidth: 320 }}
                frameBorder="0"
            />
        );
    }
    // Generic / other link
    return (
        <div className="text-center py-12 bg-white rounded-xl border border-black/[0.07] space-y-4">
            <CalendarIcon className="w-10 h-10 text-[#7ebac8] mx-auto" />
            <p className="text-sm font-semibold text-[#333a42]">Book directly with this clinician</p>
            <a href={link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
                Open Booking Calendar <ChevronRight className="w-4 h-4" />
            </a>
        </div>
    );
}

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [concern, setConcern] = useState("");
    const [clinicians, setClinicians] = useState<Clinician[]>([]);
    const [matched, setMatched] = useState<Clinician[]>([]);
    const [selected, setSelected] = useState<Clinician | null>(null);
    const [loading, setLoading] = useState(true);

    // Step 3 custom form (fallback when no booking link)
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        fetch(`${getApiUrl()}/api/v1/authors?team_only=true`)
            .then(r => r.ok ? r.json() : [])
            .then((data: Clinician[]) => {
                setClinicians(data);
                setMatched(data);
            })
            .finally(() => setLoading(false));
    }, []);

    function handleConcernSelect(label: string) {
        setConcern(label);
        setMatched(matchClinicians(clinicians, label));
        setStep(2);
    }

    function handleClinicianSelect(c: Clinician) {
        setSelected(c);
        setStep(3);
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!date || !time) { setSubmitError("Please select both a date and a time."); return; }
        setSubmitting(true); setSubmitError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/consultations/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName, last_name: lastName, email, phone: phone || undefined,
                    requested_date: format(date, "yyyy-MM-dd"), requested_time: time,
                    therapist_preference: selected?.name, notes: notes || undefined,
                })
            });
            if (res.ok) setSubmitted(true);
            else setSubmitError("Something went wrong. Please try again.");
        } catch { setSubmitError("Could not reach the server."); }
        finally { setSubmitting(false); }
    }

    // ── Step indicators ──────────────────────────────────────────────────────
    const steps = ["What brings you here?", "Choose your clinician", "Book your time"];

    if (submitted) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-24">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Booking Request Received!</h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                Thank you, <strong>{firstName}</strong>. Your request to see{" "}
                <strong>{selected?.name}</strong> on{" "}
                <strong>{date ? format(date, "MMMM d, yyyy") : ""} at {time}</strong>{" "}
                has been submitted. We'll confirm within 24 business hours.
            </p>
        </div>
    );

    return (
        <div className="container mx-auto max-w-3xl px-4 py-14">
            {/* Step progress bar */}
            <div className="mb-10">
                <div className="flex items-center justify-center gap-0 mb-4">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-primary text-white ring-4 ring-primary/20" : "bg-black/[0.06] text-muted-foreground"}`}>
                                {step > i + 1 ? "✓" : i + 1}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-16 sm:w-24 h-0.5 mx-1 transition-colors ${step > i + 1 ? "bg-emerald-400" : "bg-black/[0.08]"}`} />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-center text-sm font-semibold text-muted-foreground">{steps[step - 1]}</p>
            </div>

            {/* ── Step 1: Concern selection ─────────────────────────────── */}
            {step === 1 && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">What brings you here?</h1>
                        <p className="text-muted-foreground">We'll match you with the right specialist for your needs.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CONCERNS.map(c => (
                            <button key={c.label} onClick={() => handleConcernSelect(c.label)}
                                className="flex flex-col items-center gap-2 bg-white hover:bg-primary/5 hover:border-primary/40 border border-black/[0.07] rounded-2xl px-4 py-5 transition-all hover:shadow-md group text-center">
                                <span className="text-3xl">{c.icon}</span>
                                <span className="text-[13px] font-semibold text-[#333a42] group-hover:text-primary leading-tight">{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Step 2: Clinician matching ────────────────────────────── */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Your matched clinicians</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {matched.length} specialist{matched.length !== 1 ? "s" : ""} for <strong>{concern}</strong>
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="space-y-3">
                            {matched.map(c => (
                                <button key={c.id} onClick={() => handleClinicianSelect(c)}
                                    className="w-full flex items-center gap-5 bg-white hover:bg-primary/5 border border-black/[0.07] hover:border-primary/30 rounded-2xl p-5 transition-all hover:shadow-md text-left group">
                                    {c.profile_image_url ? (
                                        <img src={c.profile_image_url} alt={c.name}
                                            className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white shadow" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-xl font-bold text-primary">{c.name?.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[15px] text-[#1e2328] group-hover:text-primary transition-colors">{c.name}</p>
                                        {c.credentials && <p className="text-[12px] text-primary font-semibold">{c.credentials}</p>}
                                        {c.role && <p className="text-[12px] text-muted-foreground">{c.role}</p>}
                                        {c.specialties_list && c.specialties_list.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {c.specialties_list.slice(0, 3).map((s, i) => (
                                                    <span key={i} className="text-[10px] font-semibold bg-primary/8 text-primary px-2 py-0.5 rounded-full border border-primary/15">
                                                        {s.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                                </button>
                            ))}
                            <button onClick={() => { setSelected(null); setStep(3); }}
                                className="w-full text-center text-sm text-muted-foreground hover:text-primary py-3 transition-colors font-medium">
                                Skip — I'll decide later
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 3: Booking ───────────────────────────────────────── */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {selected ? `Book with ${selected.name}` : "Book a Consultation"}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {selected?.role || "Initial 15-minute consultation · Free"}
                            </p>
                        </div>
                    </div>

                    {/* If clinician has a booking link, embed it */}
                    {selected?.booking_link ? (
                        <CalendarEmbed type={selected.calendar_type || "other"} link={selected.booking_link} />
                    ) : (
                        /* Otherwise show our custom form */
                        <div className="bg-white rounded-2xl border border-black/[0.07] p-6 shadow-sm">
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                                        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" required
                                            className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                                        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" required
                                            className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" required
                                            className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone (optional)</label>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000"
                                            className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Preferred Date</label>
                                        <div className="rounded-xl border border-black/[0.08] p-2.5 flex justify-center">
                                            <Calendar mode="single" selected={date} onSelect={setDate}
                                                disabled={d => d < new Date() || d.getDay() === 0 || d.getDay() === 6} />
                                        </div>
                                        {date && <p className="text-xs text-center text-primary font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Preferred Time</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TIME_SLOTS.map(slot => (
                                                <button key={slot} type="button" onClick={() => setTime(slot)}
                                                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${time === slot ? "border-primary bg-primary/10 text-primary" : "border-black/[0.08] hover:border-primary/40 text-muted-foreground"}`}>
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space-y-1.5 mt-3">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</label>
                                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                                                placeholder="Anything you'd like us to know beforehand…"
                                                className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        </div>
                                    </div>
                                </div>
                                {submitError && <p className="text-sm text-red-500 font-medium">{submitError}</p>}
                                <button type="submit" disabled={submitting || !date || !time}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50">
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><ChevronRight className="w-4 h-4" /> Request Appointment</>}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

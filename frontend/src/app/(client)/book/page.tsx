"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    AlertCircle,
    Brain,
    Briefcase,
    CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    HeartHandshake,
    Loader2,
    MessageCircle,
    Sprout,
    UsersRound,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { getApiUrl } from "@/lib/api";

interface Specialty {
    title: string;
    description?: string;
    desc?: string;
}

interface Clinician {
    id: number;
    name: string;
    credentials?: string;
    role?: string;
    bio?: string;
    profile_image_url?: string;
    specialties_list?: Specialty[];
    calendar_type?: string;
    booking_link?: string;
    accepting_new_clients?: boolean;
    availability_timezone?: string;
    available_weekdays?: number[];
    consultation_modes?: string[];
    intake_note?: string;
}

// ── SimplePractice widget constants (same integration as team profile pages) ──
const SP_SCOPE_ID = "64787fd5-84f6-42ba-9955-816d91404e11";
const SP_APP_ID   = "7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b";
const SP_BASE_URL = "https://reframe.clientsecure.me";

// Per-clinician SimplePractice IDs
const CLINICIAN_SP_IDS: Record<string, string> = {
    "anat-cohen":      "1332279",
    "tamara-eromo":    "1356467",
    "wendy-eifert":    "1412589",
    "hedieh-hakakian": "1426654",
    "valarie-gardner": "1750330",
};

function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Match "Tamara Eromo, Psy.D." → "tamara-eromo" key
function spIdFor(name?: string): string | undefined {
    if (!name) return undefined;
    const slug = toSlug(name);
    const entry = Object.entries(CLINICIAN_SP_IDS).find(([key]) => slug.startsWith(key));
    return entry?.[1];
}

// Static fallback — replaced dynamically when clinician + date are selected
const FALLBACK_SLOTS = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];
const URGENCY_OPTIONS = ["Flexible", "Within 1-2 weeks", "As soon as available"];
const CONTACT_OPTIONS = ["Email", "Phone", "Text"];

const CONCERNS = [
    { label: "Anxiety & Stress", icon: Brain, keywords: ["anxiety", "stress", "panic", "worry"] },
    { label: "Trauma & PTSD", icon: HeartHandshake, keywords: ["trauma", "ptsd", "emdr", "abuse"] },
    { label: "Depression", icon: MessageCircle, keywords: ["depression", "mood", "grief", "loss"] },
    { label: "Relationships", icon: UsersRound, keywords: ["relationship", "couples", "family", "attachment"] },
    { label: "Work & Burnout", icon: Briefcase, keywords: ["burnout", "work", "career", "stress"] },
    { label: "Life Transitions", icon: Sprout, keywords: ["transition", "change", "identity", "growth"] },
    { label: "Child & Teen", icon: UsersRound, keywords: ["child", "teen", "adolescent", "youth", "family"] },
    { label: "Not Sure", icon: MessageCircle, keywords: [] },
];

function matchClinicians(clinicians: Clinician[], concern: string): Clinician[] {
    const availableClinicians = clinicians.filter((clinician) => clinician.accepting_new_clients !== false);
    if (concern === "Not Sure") return availableClinicians.length ? availableClinicians : clinicians;
    const keywords = CONCERNS.find((item) => item.label === concern)?.keywords || [];
    const scored = (availableClinicians.length ? availableClinicians : clinicians).map((clinician) => {
        const text = [
            clinician.bio || "",
            clinician.role || "",
            ...(clinician.specialties_list || []).map((specialty) => `${specialty.title} ${specialty.description || specialty.desc || ""}`),
        ].join(" ").toLowerCase();
        const score = keywords.filter((keyword) => text.includes(keyword)).length;
        return { clinician, score };
    });
    const matched = scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.clinician);
    return matched.length > 0 ? matched : clinicians;
}

// ── SimplePractice appointment panel for the matched clinician ───────────────
function SimplePracticePanel({ clinician, clinicianId }: { clinician: Clinician | null; clinicianId?: string }) {
    // Re-inject the SP integration script so autobind picks up these
    // dynamically-mounted widget buttons
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://widget-cdn.simplepractice.com/assets/integration-1.0.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, [clinicianId]);

    const clinicianScope = clinicianId
        ? { "data-spwidget-clinician-id": clinicianId }
        : { "data-spwidget-scope-global": true };
    const firstName = clinician?.name?.split(",")[0];

    return (
        <div className="bg-white rounded-2xl border border-black/[0.07] p-8 shadow-sm text-center space-y-5">
            {clinician?.profile_image_url && (
                <img src={clinician.profile_image_url} alt={clinician.name} className="w-20 h-20 rounded-full object-cover object-top mx-auto border-2 border-white shadow" />
            )}
            <div className="space-y-1">
                <h2 className="font-bold text-[18px] text-[#1e2328]">
                    {firstName ? `Request an appointment with ${firstName}` : "Request an appointment"}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Scheduling is handled through our secure SimplePractice portal — pick a time that works for you.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                {/* Schedule a Consultation — OAR widget, scoped to the matched clinician */}
                <a
                    href={SP_BASE_URL}
                    data-spwidget-scope-id={SP_SCOPE_ID}
                    data-spwidget-scope-uri="reframe"
                    data-spwidget-application-id={SP_APP_ID}
                    data-spwidget-type="OAR"
                    {...clinicianScope}
                    data-spwidget-autobind
                    className="inline-flex items-center gap-2.5 bg-[#7ebac8] hover:bg-[#5aabb8] text-white font-semibold text-[14px] tracking-wide px-8 py-4 rounded-xl transition-all duration-200 cursor-pointer"
                >
                    <CalendarIcon className="w-4 h-4" />
                    Schedule a Consultation
                </a>
                {/* Contact form widget */}
                <a
                    href={SP_BASE_URL}
                    data-spwidget-scope-id={SP_SCOPE_ID}
                    data-spwidget-scope-uri="reframe"
                    data-spwidget-application-id={SP_APP_ID}
                    data-spwidget-channel="embedded_widget"
                    data-spwidget-type="Contact form"
                    data-spwidget-contact
                    {...clinicianScope}
                    data-spwidget-autobind
                    className="inline-flex items-center gap-2.5 bg-white hover:bg-black/[0.03] text-[#333a42] border border-black/[0.12] font-semibold text-[14px] tracking-wide px-8 py-4 rounded-xl transition-all duration-200 cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4" />
                    {firstName ? `Contact ${firstName}` : "Contact Us"}
                </a>
            </div>
            <p className="text-[11px] text-muted-foreground/60">
                Secured by SimplePractice · HIPAA-compliant · Encrypted
            </p>
        </div>
    );
}

function CalendarEmbed({ type, link }: { type: string; link: string }) {
    useEffect(() => {
        if (type !== "calendly") return;
        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, [type]);

    if (type === "calendly") {
        return (
            <div className="w-full rounded-xl overflow-hidden border border-black/[0.07] bg-white" style={{ minHeight: 600 }}>
                <div className="calendly-inline-widget w-full h-[620px]" data-url={link} style={{ minWidth: 320 }} />
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

    return (
        <div className="text-center py-12 bg-white rounded-xl border border-black/[0.07] space-y-4">
            <CalendarIcon className="w-10 h-10 text-[#7ebac8] mx-auto" />
            <p className="text-sm font-semibold text-[#333a42]">Book directly with this clinician</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
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

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [urgency, setUrgency] = useState(URGENCY_OPTIONS[0]);
    const [contactMethod, setContactMethod] = useState(CONTACT_OPTIONS[0]);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Real-time availability
    const [liveSlots, setLiveSlots] = useState<{ time: string; available: boolean; reason: string | null }[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        fetch(`${getApiUrl()}/api/v1/authors?team_only=true`)
            .then((res) => (res.ok ? res.json() : []))
            .then((data: Clinician[]) => {
                setClinicians(data);
                setMatched(data);
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch live slots whenever clinician + date both change
    useEffect(() => {
        if (!selected?.id || !date) {
            setLiveSlots([]);
            setTime("");
            return;
        }
        const dateStr = format(date, "yyyy-MM-dd");
        setSlotsLoading(true);
        setTime("");
        fetch(`${getApiUrl()}/api/v1/availability/${selected.id}/available-slots?date=${dateStr}`)
            .then(r => r.ok ? r.json() : [])
            .then(setLiveSlots)
            .catch(() => setLiveSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [selected?.id, date]);

    function handleConcernSelect(label: string) {
        setConcern(label);
        setMatched(matchClinicians(clinicians, label));
        setStep(2);
    }

    function handleClinicianSelect(clinician: Clinician) {
        if (clinician.accepting_new_clients === false) return;
        setSelected(clinician);
        setStep(3);
    }

    function isDateUnavailable(day: Date) {
        if (day < new Date()) return true;
        const weekday = day.getDay() === 0 ? 7 : day.getDay();
        const availableDays = selected?.available_weekdays?.length ? selected.available_weekdays : [1, 2, 3, 4, 5];
        return !availableDays.includes(weekday);
    }

    async function handleFormSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!date || !time) {
            setSubmitError("Please select both a date and a time.");
            return;
        }

        setSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/consultations/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone: phone || undefined,
                    requested_date: format(date, "yyyy-MM-dd"),
                    requested_time: time,
                    therapist_preference: selected?.name,
                    presenting_concern: concern || undefined,
                    urgency,
                    preferred_contact_method: contactMethod,
                    notes: notes || undefined,
                }),
            });
            if (res.ok) setSubmitted(true);
            else setSubmitError("Something went wrong. Please try again.");
        } catch {
            setSubmitError("Could not reach the server.");
        } finally {
            setSubmitting(false);
        }
    }

    const steps = ["What brings you here?", "Choose your clinician", "Book your time"];

    if (submitted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-24">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Booking Request Received</h1>
                <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                    Thank you, <strong>{firstName}</strong>. Your request
                    {selected ? <> to see <strong>{selected.name}</strong></> : ""} on{" "}
                    <strong>{date ? format(date, "MMMM d, yyyy") : ""} at {time}</strong> has been submitted.
                    We will confirm within 24 business hours.
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                    Concern: <strong>{concern || "Not specified"}</strong> - Timing: <strong>{urgency}</strong>
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-14">
            <div className="mb-10">
                <div className="flex items-center justify-center gap-0 mb-4">
                    {steps.map((label, index) => (
                        <div key={label} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${step > index + 1 ? "bg-emerald-500 text-white" : step === index + 1 ? "bg-primary text-white ring-4 ring-primary/20" : "bg-black/[0.06] text-muted-foreground"}`}>
                                {step > index + 1 ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-16 sm:w-24 h-0.5 mx-1 transition-colors ${step > index + 1 ? "bg-emerald-400" : "bg-black/[0.08]"}`} />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-center text-sm font-semibold text-muted-foreground">{steps[step - 1]}</p>
            </div>

            {step === 1 && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">What brings you here?</h1>
                        <p className="text-muted-foreground">Choose the closest fit so we can route your request thoughtfully.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CONCERNS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleConcernSelect(item.label)}
                                    className="flex flex-col items-center gap-2 bg-white hover:bg-primary/5 hover:border-primary/40 border border-black/[0.07] rounded-2xl px-4 py-5 transition-all hover:shadow-md group text-center"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <span className="text-[13px] font-semibold text-[#333a42] group-hover:text-primary leading-tight">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-left">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs leading-relaxed text-amber-800">
                            This request form is not for emergencies. If you are in immediate danger or crisis, call emergency services or a local crisis line.
                        </p>
                    </div>
                </div>
            )}

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
                    ) : matched.length === 0 ? (
                        /* No matches — offer a different concern or a general team appointment */
                        <div className="bg-white rounded-2xl border border-black/[0.07] p-8 shadow-sm text-center space-y-5">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <UsersRound className="w-7 h-7 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-bold text-[17px] text-[#1e2328]">No specific match found</h2>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    We couldn&apos;t match a clinician to this concern right now. You can try a different concern, or request an appointment with our team and we&apos;ll route you to the right clinician.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-2 bg-white hover:bg-black/[0.03] text-[#333a42] border border-black/[0.12] font-semibold text-[14px] px-6 py-3.5 rounded-xl transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Choose a different concern
                                </button>
                                <button
                                    onClick={() => { setSelected(null); setStep(3); }}
                                    className="inline-flex items-center gap-2 bg-[#7ebac8] hover:bg-[#5aabb8] text-white font-semibold text-[14px] px-6 py-3.5 rounded-xl transition-all"
                                >
                                    Book with our team <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {matched.map((clinician) => (
                                <button
                                    key={clinician.id}
                                    onClick={() => handleClinicianSelect(clinician)}
                                    disabled={clinician.accepting_new_clients === false}
                                    className={`w-full flex items-center gap-5 bg-white border border-black/[0.07] rounded-2xl p-5 transition-all text-left group ${clinician.accepting_new_clients === false ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary/30 hover:shadow-md"}`}
                                >
                                    {clinician.profile_image_url ? (
                                        <img src={clinician.profile_image_url} alt={clinician.name} className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-white shadow" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-xl font-bold text-primary">{clinician.name?.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[15px] text-[#1e2328] group-hover:text-primary transition-colors">{clinician.name}</p>
                                        {clinician.credentials && <p className="text-[12px] text-primary font-semibold">{clinician.credentials}</p>}
                                        {clinician.role && <p className="text-[12px] text-muted-foreground">{clinician.role}</p>}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${clinician.accepting_new_clients === false ? "bg-slate-50 text-slate-500 border-slate-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                                {clinician.accepting_new_clients === false ? "Not accepting new clients" : "Accepting requests"}
                                            </span>
                                            {(clinician.consultation_modes || ["Telehealth"]).map((mode) => (
                                                <span key={mode} className="text-[10px] font-semibold bg-primary/8 text-primary px-2 py-0.5 rounded-full border border-primary/15">
                                                    {mode}
                                                </span>
                                            ))}
                                        </div>
                                        {clinician.specialties_list && clinician.specialties_list.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {clinician.specialties_list.slice(0, 3).map((specialty) => (
                                                    <span key={specialty.title} className="text-[10px] font-semibold bg-primary/8 text-primary px-2 py-0.5 rounded-full border border-primary/15">
                                                        {specialty.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                                </button>
                            ))}
                            <button
                                onClick={() => { setSelected(null); setStep(3); }}
                                className="w-full text-center text-sm text-muted-foreground hover:text-primary py-3 transition-colors font-medium"
                            >
                                Skip - I'll decide later
                            </button>
                        </div>
                    )}
                </div>
            )}

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
                                {selected?.role || "Initial 15-minute consultation - Free"}
                            </p>
                            {selected?.intake_note && (
                                <p className="text-xs text-muted-foreground mt-1">{selected.intake_note}</p>
                            )}
                        </div>
                    </div>

                    {/* Always SimplePractice — scoped to the matched clinician, global scope otherwise */}
                    <SimplePracticePanel clinician={selected} clinicianId={spIdFor(selected?.name)} />
                </div>
            )}
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border border-black/[0.1] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    );
}

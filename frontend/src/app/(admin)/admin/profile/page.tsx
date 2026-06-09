"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Plus, Trash2, Loader2, CheckCircle2, User, Eye, EyeOff } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { getApiUrl } from "@/lib/api";


interface Specialty { title: string; description: string; }
interface ProfileData {
    name: string;
    bio: string;
    credentials: string;
    role: string;
    profile_image_url: string;
    beyond_therapy: string;
    approach_paragraphs: string[];
    background_paragraphs: string[];
    specialties_list: Specialty[];
    calendar_type: string;
    booking_link: string;
}

const EMPTY: ProfileData = {
    name: "", bio: "", credentials: "", role: "",
    profile_image_url: "", beyond_therapy: "",
    approach_paragraphs: [""], background_paragraphs: [""],
    specialties_list: [{ title: "", description: "" }],
    calendar_type: "", booking_link: "",
};

type TabKey = "basic" | "approach" | "specialties" | "background" | "beyond" | "calendar";

const TABS: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "approach", label: "Approach" },
    { key: "specialties", label: "Specialties" },
    { key: "background", label: "Background" },
    { key: "beyond", label: "Beyond Therapy" },
    { key: "calendar", label: "📅 Calendar" },
];

export default function AdminProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<ProfileData>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [preview, setPreview] = useState(false);
    const token = (session as any)?.accessToken;

    useEffect(() => {
        if (!token) return;
        fetch(`${getApiUrl()}/api/v1/authors/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) setProfile({
                    name: data.name || "",
                    bio: data.bio || "",
                    credentials: data.credentials || "",
                    role: data.role || "",
                    profile_image_url: data.profile_image_url || "",
                    beyond_therapy: data.beyond_therapy || "",
                    approach_paragraphs: data.approach_paragraphs?.length ? data.approach_paragraphs : [""],
                    background_paragraphs: data.background_paragraphs?.length ? data.background_paragraphs : [""],
                    specialties_list: data.specialties_list?.length ? data.specialties_list : [{ title: "", description: "" }],
                    calendar_type: data.calendar_type || "",
                    booking_link: data.booking_link || "",
                });
            })
            .finally(() => setLoading(false));
    }, [token]);

    async function handleSave() {
        setSaving(true); setError(""); setSaved(false);
        try {
            const res = await fetch(`${getApiUrl()}/api/v1/authors/me`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...profile,
                    approach_paragraphs: profile.approach_paragraphs.filter(p => p.trim()),
                    background_paragraphs: profile.background_paragraphs.filter(p => p.trim()),
                    specialties_list: profile.specialties_list.filter(s => s.title.trim()),
                })
            });
            if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
            else { setError("Save failed. Please try again."); }
        } catch { setError("Server error. Please try again."); }
        finally { setSaving(false); }
    }

    // Array helpers
    const setParagraphs = (key: "approach_paragraphs" | "background_paragraphs", idx: number, val: string) =>
        setProfile(p => ({ ...p, [key]: p[key].map((v, i) => i === idx ? val : v) }));
    const addParagraph = (key: "approach_paragraphs" | "background_paragraphs") =>
        setProfile(p => ({ ...p, [key]: [...p[key], ""] }));
    const removeParagraph = (key: "approach_paragraphs" | "background_paragraphs", idx: number) =>
        setProfile(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
    const setSpecialty = (idx: number, field: keyof Specialty, val: string) =>
        setProfile(p => ({ ...p, specialties_list: p.specialties_list.map((s, i) => i === idx ? { ...s, [field]: val } : s) }));
    const addSpecialty = () => setProfile(p => ({ ...p, specialties_list: [...p.specialties_list, { title: "", description: "" }] }));
    const removeSpecialty = (idx: number) => setProfile(p => ({ ...p, specialties_list: p.specialties_list.filter((_, i) => i !== idx) }));

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e2328] tracking-tight">My Profile</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">This is your public clinical profile shown on the team page</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setPreview(p => !p)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-black/[0.1] bg-white hover:bg-gray-50 text-sm font-semibold text-[#333a42] transition-colors">
                        {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {preview ? "Edit" : "Preview"}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

            <div className={`flex gap-6 ${preview ? "flex-row" : ""}`}>
                {/* ── Edit Panel ────────────────────────────────────── */}
                {!preview && (
                    <div className="flex-1 bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b overflow-x-auto">
                            {TABS.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-3 text-[12px] font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.key ? "border-[#7ebac8] text-[#7ebac8]" : "border-transparent text-muted-foreground hover:text-[#333a42]"}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-5">
                            {/* BASIC INFO */}
                            {activeTab === "basic" && (
                                <>
                                    <div className="flex items-start gap-6">
                                        <div className="shrink-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Profile Photo</p>
                                            <ImageUploader
                                                currentImageUrl={profile.profile_image_url}
                                                onUpload={url => setProfile(p => ({ ...p, profile_image_url: url }))}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                                                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                                    placeholder="Dr. Jane Smith" className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credentials</label>
                                                <input value={profile.credentials} onChange={e => setProfile(p => ({ ...p, credentials: e.target.value }))}
                                                    placeholder="PhD, LMFT, EMDR-Certified" className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role / Title</label>
                                                <input value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                                                    placeholder="Licensed Clinical Psychologist" className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Short Bio (2-3 sentences)</label>
                                        <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
                                            placeholder="A brief overview of your clinical focus and philosophy…"
                                            className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                    </div>
                                </>
                            )}

                            {/* APPROACH */}
                            {activeTab === "approach" && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground">Each paragraph appears separately in your Approach section on the team page.</p>
                                    {profile.approach_paragraphs.map((para, i) => (
                                        <div key={i} className="flex gap-2">
                                            <textarea value={para} onChange={e => setParagraphs("approach_paragraphs", i, e.target.value)} rows={3}
                                                placeholder={`Approach paragraph ${i + 1}…`}
                                                className="flex-1 border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            {profile.approach_paragraphs.length > 1 && (
                                                <button onClick={() => removeParagraph("approach_paragraphs", i)} className="shrink-0 text-rose-400 hover:text-rose-500 mt-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addParagraph("approach_paragraphs")}
                                        className="flex items-center gap-1.5 text-sm text-[#7ebac8] hover:underline font-semibold">
                                        <Plus className="w-3.5 h-3.5" /> Add paragraph
                                    </button>
                                </div>
                            )}

                            {/* SPECIALTIES */}
                            {activeTab === "specialties" && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground">Each specialty shows as a card with a title and description on your profile.</p>
                                    {profile.specialties_list.map((sp, i) => (
                                        <div key={i} className="bg-[#f7f5f2] rounded-lg p-4 space-y-3 relative">
                                            <button onClick={() => removeSpecialty(i)} className="absolute top-3 right-3 text-rose-400 hover:text-rose-500">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <input value={sp.title} onChange={e => setSpecialty(i, "title", e.target.value)}
                                                placeholder="Specialty title e.g. Anxiety & Stress"
                                                className="w-full border border-black/[0.1] rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            <textarea value={sp.description} onChange={e => setSpecialty(i, "description", e.target.value)} rows={2}
                                                placeholder="Short description of this specialty area…"
                                                className="w-full border border-black/[0.1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                        </div>
                                    ))}
                                    <button onClick={addSpecialty}
                                        className="flex items-center gap-1.5 text-sm text-[#7ebac8] hover:underline font-semibold">
                                        <Plus className="w-3.5 h-3.5" /> Add specialty
                                    </button>
                                </div>
                            )}

                            {/* BACKGROUND */}
                            {activeTab === "background" && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground">Your education and professional background paragraphs.</p>
                                    {profile.background_paragraphs.map((para, i) => (
                                        <div key={i} className="flex gap-2">
                                            <textarea value={para} onChange={e => setParagraphs("background_paragraphs", i, e.target.value)} rows={3}
                                                placeholder={`Background paragraph ${i + 1}…`}
                                                className="flex-1 border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            {profile.background_paragraphs.length > 1 && (
                                                <button onClick={() => removeParagraph("background_paragraphs", i)} className="shrink-0 text-rose-400 hover:text-rose-500 mt-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addParagraph("background_paragraphs")}
                                        className="flex items-center gap-1.5 text-sm text-[#7ebac8] hover:underline font-semibold">
                                        <Plus className="w-3.5 h-3.5" /> Add paragraph
                                    </button>
                                </div>
                            )}

                            {/* BEYOND THERAPY */}
                            {activeTab === "beyond" && (
                                <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground">A personal quote or note about who you are outside of the therapy room.</p>
                                    <textarea value={profile.beyond_therapy} onChange={e => setProfile(p => ({ ...p, beyond_therapy: e.target.value }))} rows={5}
                                        placeholder="Outside of the therapy room, I enjoy…"
                                        className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                </div>
                            )}

                            {/* CALENDAR */}
                            {activeTab === "calendar" && (
                                <div className="space-y-5">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Connect your booking calendar so clients can schedule directly with you from the <strong>/book</strong> page.
                                        Choose your platform and paste your booking link.
                                    </p>

                                    {/* Platform selector */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calendar Platform</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { key: "calendly", label: "Calendly", desc: "Most popular", icon: "📅" },
                                                { key: "cal_com", label: "Cal.com", desc: "Open source", icon: "🗓️" },
                                                { key: "google_calendar", label: "Google Calendar", desc: "Connect via OAuth", icon: "🔵" },
                                                { key: "other", label: "Custom Link", desc: "Any booking URL", icon: "🔗" },
                                            ].map(opt => (
                                                <button key={opt.key} type="button"
                                                    onClick={() => setProfile(p => ({ ...p, calendar_type: opt.key }))}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${profile.calendar_type === opt.key ? "border-[#7ebac8] bg-[#7ebac8]/10 ring-2 ring-[#7ebac8]/20" : "border-black/[0.08] hover:border-[#7ebac8]/40 bg-white"}`}>
                                                    <span className="text-xl">{opt.icon}</span>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-[#1e2328]">{opt.label}</p>
                                                        <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Calendly */}
                                    {profile.calendar_type === "calendly" && (
                                        <div className="space-y-2 bg-[#f7f5f2] rounded-xl p-4">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Calendly URL</label>
                                            <input value={profile.booking_link}
                                                onChange={e => setProfile(p => ({ ...p, booking_link: e.target.value }))}
                                                placeholder="https://calendly.com/yourname/consultation"
                                                className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            <p className="text-[11px] text-muted-foreground">Sign up free at <a href="https://calendly.com" target="_blank" className="text-[#7ebac8] underline">calendly.com</a> → copy your event link</p>
                                        </div>
                                    )}

                                    {/* Cal.com */}
                                    {profile.calendar_type === "cal_com" && (
                                        <div className="space-y-2 bg-[#f7f5f2] rounded-xl p-4">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Cal.com URL</label>
                                            <input value={profile.booking_link}
                                                onChange={e => setProfile(p => ({ ...p, booking_link: e.target.value }))}
                                                placeholder="https://cal.com/yourname/consultation"
                                                className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            <p className="text-[11px] text-muted-foreground">Sign up free at <a href="https://cal.com" target="_blank" className="text-[#7ebac8] underline">cal.com</a> → share your booking link</p>
                                        </div>
                                    )}

                                    {/* Google Calendar */}
                                    {profile.calendar_type === "google_calendar" && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">🔵</span>
                                                <div>
                                                    <p className="text-sm font-bold text-blue-800">Connect Google Calendar</p>
                                                    <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                                                        Clients will see your real-time availability from Google Calendar.
                                                        Click below to authorize — you'll be redirected to Google.
                                                    </p>
                                                </div>
                                            </div>
                                            <a href={`${getApiUrl()}/api/v1/auth/google/calendar/connect?token=${encodeURIComponent((session as any)?.accessToken || "")}`}
                                                className="flex items-center justify-center gap-2 w-full bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold text-sm py-2.5 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                                Connect Google Calendar
                                            </a>
                                            <p className="text-[10px] text-blue-500 text-center">Read-only access to check availability · Revoke anytime from Google Account settings</p>
                                        </div>
                                    )}

                                    {/* Other / Custom */}
                                    {profile.calendar_type === "other" && (
                                        <div className="space-y-2 bg-[#f7f5f2] rounded-xl p-4">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom Booking URL</label>
                                            <input value={profile.booking_link}
                                                onChange={e => setProfile(p => ({ ...p, booking_link: e.target.value }))}
                                                placeholder="https://your-booking-platform.com/yourname"
                                                className="w-full border border-black/[0.1] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7ebac8]/40" />
                                            <p className="text-[11px] text-muted-foreground">Works with Acuity, Doxy.me, SimplePractice, Jane App, or any booking page URL</p>
                                        </div>
                                    )}

                                    {profile.booking_link && profile.calendar_type !== "google_calendar" && (
                                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-lg">
                                            ✅ Booking link saved — clients will see your calendar embedded on the /book page
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Live Preview ───────────────────────────────────── */}
                {preview && (
                    <div className="flex-1 bg-white rounded-xl border border-black/[0.06] p-6 overflow-y-auto max-h-[700px]">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-5">Preview — as shown on /team</p>
                        <div className="flex flex-col items-center text-center gap-3 pb-6 border-b border-black/[0.05]">
                            {profile.profile_image_url ? (
                                <img src={profile.profile_image_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover shadow-md" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-[#7ebac8]/15 flex items-center justify-center">
                                    <User className="w-10 h-10 text-[#7ebac8]/40" />
                                </div>
                            )}
                            <div>
                                <p className="text-lg font-bold text-[#1e2328]">{profile.name || "Your Name"}</p>
                                <p className="text-sm text-[#7ebac8] font-semibold">{profile.credentials}</p>
                                <p className="text-xs text-muted-foreground">{profile.role}</p>
                            </div>
                        </div>
                        {profile.bio && <div className="py-4 border-b border-black/[0.05]"><p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p></div>}
                        {profile.approach_paragraphs.some(p => p) && (
                            <div className="py-4 border-b border-black/[0.05]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7ebac8] mb-2">My Approach</p>
                                {profile.approach_paragraphs.filter(p => p).map((p, i) => <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">{p}</p>)}
                            </div>
                        )}
                        {profile.specialties_list.some(s => s.title) && (
                            <div className="py-4 border-b border-black/[0.05]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7ebac8] mb-3">Specialties</p>
                                <div className="space-y-2">
                                    {profile.specialties_list.filter(s => s.title).map((s, i) => (
                                        <div key={i} className="bg-[#f7f5f2] rounded-lg p-3">
                                            <p className="text-xs font-bold text-[#333a42]">{s.title}</p>
                                            {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {profile.beyond_therapy && (
                            <div className="py-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7ebac8] mb-2">Beyond Therapy</p>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">"{profile.beyond_therapy}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
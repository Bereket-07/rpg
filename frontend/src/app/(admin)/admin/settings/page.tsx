"use client";
// Image upload supported — files upload to backend and return a hosted URL

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import {
    Loader2, Check, Mail, Phone, MapPin, Send, HelpCircle,
    Pencil, X, Save, Image as ImageIcon, Upload,
    Home, ClipboardList, HeartHandshake, ShieldCheck, PhoneCall, Palette,
    Eye, EyeOff, CheckCircle2, AlertCircle, Plus, Trash2
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface EditField {
    key: string;
    label: string;
    type: "text" | "textarea" | "image" | "color" | "list";
    value: string | string[];
    placeholder?: string;
}

interface EditPanel {
    sectionLabel: string;
    fields: EditField[];
    onSave: (vals: Record<string, string | string[]>) => void;
}

interface UploadState {
    [key: string]: "idle" | "uploading" | "done" | "error";
}

// ─── Static data (mirrors client-side) ───────────────────────────────────────
const STATIC_SPECIALTIES = [
    { id: "mood", title: "Improving Mood and Well-being", paragraphs: ["It's not that your life isn't working.", "From the outside, it probably looks like it is. But internally, the energy isn't the same. Things that used to feel engaging and meaningful no longer bring you pleasure or joy.", "Depression doesn't always look like sadness. It can feel like disconnection, exhaustion, or going through the motions without really being there."], image: "/assets/RPG_Images for UI/mockup-wall-in-the-children-s-room-on-wall-white-c-2026-03-24-01-09-26-utc.jpg" },
    { id: "anxiety", title: "Working Through Anxiety And Stress", paragraphs: ["You're managing a lot, your career, your relationships, your responsibilities..", "and yet, beneath the surface, it feels like your mind never stops racing."], image: "/assets/RPG_Images for UI/stress-theme-concept-paper-with-inscription-and-n-2026-03-24-15-36-15-utc.jpg" },
    { id: "couples", title: "Couples Therapy: Rebuilding Intimacy And Connections", paragraphs: ["You may find yourselves having the same conversation over and over, one pushing, the other pulling away.. both of you leaving feeling unheard, frustrated, or alone.", "At a certain point, it's no longer about the surface issue. It's the cycle you can't seem to get out of."], image: "/assets/RPG_Images for UI/modern-ceramic-vases-on-a-white-marble-table-2026-03-16-02-08-02-utc.jpg" },
    { id: "infants", title: "Parenting Infants & Young Children", paragraphs: ["Becoming a parent can be deeply meaningful and unexpectedly disorienting.", "You may find yourself second-guessing decisions you once made with ease, feeling stretched thin, or unsure how to respond in the moments that matter most."], image: "/assets/RPG_Images for UI/portrait-of-four-young-children-in-a-row-one-cryi-2026-03-11-00-57-01-utc.jpg" },
    { id: "teens", title: "Parenting Teens & Young Adults", paragraphs: ["As children grow, the relationship changes, often in ways no one fully prepares you for.", "Conversations become more complex. Reactions feel less predictable."], image: "/assets/RPG_Images for UI/little-kid-playing-with-joystick-in-front-of-pc-2026-03-24-14-20-02-utc.jpg" },
    { id: "transitions", title: "Navigating Life Transitions", paragraphs: ["Life transitions have a way of disrupting what used to feel clear.", "What once worked—how you made decisions, handled stress, or found direction—may not hold up in the same way anymore."], image: "/assets/RPG_Images for UI/closeup-shot-of-a-beautiful-butterfly-metamorpho-2026-03-18-06-39-46-utc.jpeg" },
    { id: "trauma", title: "Overcoming Adverse Life Events And Trauma", paragraphs: ["Trauma doesn't always show up in obvious ways.", "From the outside, it may seem like you've moved on. But internally, something still feels reactive, guarded, or hard to fully settle."], image: "/assets/RPG_Images for UI/rubber-band-ball-2026-03-19-06-59-46-utc.jpg" },
];
interface TeamMember { id?: number; slug: string; name: string; role: string; specialties: string; image: string; }

const DEFAULT_THERAPISTS: TeamMember[] = [
    { slug: "anat-cohen", name: "Anat Cohen, Ph.D.", role: "Clinical Psychologist, Co-Founder", specialties: "Individual Therapy, Parenting Support", image: "/assets/RPG_Images for UI/Anat copy.jpg" },
    { slug: "tamara-eromo", name: "Tamara Eromo, Psy.D.", role: "Clinical Psychologist, Co-Founder", specialties: "Couples Therapy, Parenting Support, Individual Therapy", image: "/assets/RPG_Images for UI/Tamara copy.jpg" },
    { slug: "wendy-eifert", name: "Wendy Eifert, Psy.D.", role: "Clinical Psychologist", specialties: "Individual Therapy, Couples Therapy", image: "/assets/RPG_Images for UI/Wendy copy.jpg" },
    { slug: "hedieh-hakakian", name: "Hedieh Hakakian, Psy.D.", role: "Clinical Psychologist", specialties: "Individual Therapy, Couples Therapy, Parenting Support", image: "/assets/RPG_Images for UI/Hedieh copy.jpg" },
    { slug: "valarie-gardner", name: "Valarie Gardner, M.A., AMFT", role: "Marriage and Family Therapy Associate", specialties: "Individual Therapy, Couples Therapy, Parenting Support, EMDR", image: "/assets/RPG_Images for UI/Valarie copy.jpg" },
];

const DEFAULT_NAV = [
    { name: "Home", href: "/" },
    { name: "Our Approach", href: "/approach" },
    { name: "Meet the Team", href: "/team" },
    { name: "Specialties", href: "/specialties" },
    { name: "Services and Fees", href: "/services" },
    { name: "Blog", href: "/blog" },
];

// ─── Editable wrapper component ───────────────────────────────────────────────
function Editable({ label, onClick, children, className = "" }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className={`relative group cursor-pointer ${className}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {children}
            {hovered && (
                <div className="absolute inset-0 border-2 border-[#7ebac8] rounded pointer-events-none z-[100]">
                    <div className="absolute top-1 right-1 bg-[#7ebac8] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 whitespace-nowrap shadow-md">
                        <Pencil className="w-2 h-2" />
                        {label}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Edit Drawer component ────────────────────────────────────────────────────
function EditDrawer({ panel, onClose, token }: { panel: EditPanel | null; onClose: () => void; token?: string }) {
    const [vals, setVals] = useState<Record<string, string | string[]>>({});
    const [uploadState, setUploadState] = useState<UploadState>({});
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleFileUpload = async (fieldKey: string, file: File) => {
        setUploadState(s => ({ ...s, [fieldKey]: "uploading" }));
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${getApiUrl()}/api/v1/upload/`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setVals(v => ({ ...v, [fieldKey]: data.url }));
            setUploadState(s => ({ ...s, [fieldKey]: "done" }));
            setTimeout(() => setUploadState(s => ({ ...s, [fieldKey]: "idle" })), 2500);
        } catch (err) {
            console.error("Upload failed:", err);
            setUploadState(s => ({ ...s, [fieldKey]: "error" }));
            setTimeout(() => setUploadState(s => ({ ...s, [fieldKey]: "idle" })), 3000);
        }
    };

    useEffect(() => {
        if (panel) {
            const init: Record<string, string | string[]> = {};
            panel.fields.forEach(f => { init[f.key] = f.value; });
            setVals(init);
        }
    }, [panel]);

    if (!panel) return null;

    const handleSave = () => {
        panel.onSave(vals);
        onClose();
    };

    return (
        <div className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)] z-[200] flex flex-col border-l border-black/[0.06]">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] bg-[#f9f9f9] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#7ebac8]/15 flex items-center justify-center">
                        <Pencil className="w-3.5 h-3.5 text-[#7ebac8]" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Editing Section</p>
                        <h3 className="font-serif text-sm font-semibold text-[#333a42]">{panel.sectionLabel}</h3>
                    </div>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {panel.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#333a42] uppercase tracking-wider flex items-center gap-1.5">
                            {field.type === "image" && <ImageIcon className="w-3 h-3 text-[#7ebac8]" />}
                            {field.label}
                        </label>

                        {field.type === "image" && (
                            <div className="space-y-2">
                                {/* Live thumbnail preview */}
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-muted/20 border border-black/[0.06] relative">
                                    {(vals[field.key] as string) ? (
                                        <img
                                            src={(vals[field.key] as string)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    {/* Upload overlay spinner */}
                                    {uploadState[field.key] === "uploading" && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* Status badge */}
                                {uploadState[field.key] === "done" && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Image uploaded successfully!
                                    </div>
                                )}
                                {uploadState[field.key] === "error" && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500">
                                        <AlertCircle className="w-3.5 h-3.5" /> Upload failed — check the backend is running.
                                    </div>
                                )}

                                {/* Upload from computer button */}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                    className="hidden"
                                    ref={el => { fileRefs.current[field.key] = el; }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(field.key, file);
                                        e.target.value = "";
                                    }}
                                />
                                <button
                                    type="button"
                                    disabled={uploadState[field.key] === "uploading"}
                                    onClick={() => fileRefs.current[field.key]?.click()}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#7ebac8]/50 hover:border-[#7ebac8] hover:bg-[#7ebac8]/5 text-[#7ebac8] rounded-lg py-2.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadState[field.key] === "uploading"
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                                        : <><Upload className="w-3.5 h-3.5" /> Upload from Computer</>}
                                </button>

                                {/* Manual URL fallback */}
                                <div className="relative">
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Or paste URL / file path</p>
                                    <Input
                                        value={(vals[field.key] as string) || ""}
                                        onChange={(e) => setVals(v => ({ ...v, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder || "/assets/image.jpg or https://…"}
                                        className="text-xs font-mono"
                                    />
                                </div>
                            </div>
                        )}

                        {field.type === "text" && (
                            <Input
                                value={(vals[field.key] as string) || ""}
                                onChange={(e) => setVals(v => ({ ...v, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="text-sm"
                            />
                        )}

                        {field.type === "textarea" && (
                            <Textarea
                                value={(vals[field.key] as string) || ""}
                                onChange={(e) => setVals(v => ({ ...v, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                rows={4}
                                className="text-sm resize-y"
                            />
                        )}

                        {field.type === "color" && (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={(vals[field.key] as string) || "#000000"}
                                    onChange={(e) => setVals(v => ({ ...v, [field.key]: e.target.value }))}
                                    className="w-10 h-10 rounded cursor-pointer border border-black/10 p-0.5"
                                />
                                <Input
                                    value={(vals[field.key] as string) || ""}
                                    onChange={(e) => setVals(v => ({ ...v, [field.key]: e.target.value }))}
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        {field.type === "list" && (
                            <div className="space-y-2">
                                <Textarea
                                    value={((vals[field.key] as string[]) || []).join("\n")}
                                    onChange={(e) => setVals(v => ({ ...v, [field.key]: e.target.value.split("\n").map(l => l.trim()).filter(Boolean) }))}
                                    placeholder={field.placeholder || "One item per line…"}
                                    rows={5}
                                    className="text-sm"
                                />
                                <p className="text-[10px] text-muted-foreground">One item per line</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-black/[0.06] shrink-0 space-y-2">
                <Button onClick={handleSave} className="w-full bg-[#424c56] hover:bg-[#333a42] text-white rounded-none gap-2">
                    <Check className="w-4 h-4" /> Apply Changes
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full rounded-none text-muted-foreground">
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SiteCustomizerPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("home");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editPanel, setEditPanel] = useState<EditPanel | null>(null);
    const [showEditMode, setShowEditMode] = useState(true);

    // ─── All CMS State ───────────────────────────────────────────────────────
    // Branding
    const [primaryColor, setPrimaryColor] = useState("#7ebac8");
    const [backgroundColor, setBackgroundColor] = useState("#FDF8F5");
    const [secondaryColor, setSecondaryColor] = useState("#4a535e");
    const [textColor, setTextColor] = useState("#4a535e");
    const [fontSans, setFontSans] = useState("Raleway");
    const [fontSerif, setFontSerif] = useState("Merriweather");
    const [logoUrl, setLogoUrl] = useState("/assets/RPG Logo_Main Landscape.png");
    const [headerBtnText, setHeaderBtnText] = useState("Contact Us");
    const [footerReadyText, setFooterReadyText] = useState("Ready to start?");
    const [footerBtnText, setFooterBtnText] = useState("Schedule a Consultation");

    // Homepage
    const [homeHeroTitle, setHomeHeroTitle] = useState("You're Not Stuck Because You're Doing Something Wrong");
    const [homeHeroSubheading, setHomeHeroSubheading] = useState("You've Simply Outgrown the Way You Learned to Cope");
    const [homeHeroDesc, setHomeHeroDesc] = useState("Move beyond insight to change the patterns that shape your life.");
    const [homeHeroCta, setHomeHeroCta] = useState("Request a Consultation");
    const [homeHeroImg, setHomeHeroImg] = useState("/assets/RPG_Images for UI/Homepage_Image 1 copy.jpg");
    const [homeBannerTitle, setHomeBannerTitle] = useState("Online Therapy Across California");
    const [homeBannerDesc, setHomeBannerDesc] = useState("For adults and couples who manage life well on the surface yet feel stuck in familiar emotional or relational patterns.");
    const [homeShowcaseTitle, setHomeShowcaseTitle] = useState("Meet the Team");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_THERAPISTS);
    const [deletedAuthorIds, setDeletedAuthorIds] = useState<number[]>([]);
    const [footerTagline, setFooterTagline] = useState("Attuned, evidence-based psychological care for adults and couples across California.");
    const [navItems, setNavItems] = useState(DEFAULT_NAV);

    // Full /team page profiles
    interface FullProfile { id?: number; slug: string; name: string; role: string; credentials: string; image: string; approach: string[]; beyondTherapy: string; specialties: {title:string;desc:string}[]; background: string[]; }
    const STATIC_FULL: FullProfile[] = [
        { slug: "tamara-eromo", name: "Tamara Eromo, Psy.D.", role: "Clinical Psychologist, Co-Founder", credentials: "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY31798)", image: "/assets/RPG_Images for UI/Tamara copy.jpg", approach: ["Many couples who come to work with me are thoughtful, capable people who care deeply about their relationship but find themselves caught in the same painful cycles.", "In therapy, we slow these moments down and explore the emotional and relational dynamics underneath them. My work is grounded in attachment science and relational systems.", "As these dynamics become clearer, couples often begin to communicate more openly and rebuild a stronger sense of connection."], beyondTherapy: "Relationships are central to my life outside the therapy room. I'm a wife and mother of two, and my family life continually reminds me how important patience, repair, and connection are.", specialties: [{title:"Couples Therapy & Relationship Repair",desc:"Breaking out of recurring conflict cycles, communication breakdowns, and patterns of disconnection."},{title:"Emotional Intimacy & Attachment",desc:"Using an attachment-based approach to deepen connection and create meaningful repair."},{title:"Parenting & Family Dynamics",desc:"Supporting parents in navigating child behavior, parent-child connection, and co-parenting stress."}], background: ["Dr. Tamara Eromo is a licensed clinical psychologist (PSY31798) and has been working in the mental health field since 2006.","She received her doctorate in clinical psychology from Pepperdine University, accredited by the APA."] },
        { slug: "anat-cohen", name: "Anat Cohen, Ph.D.", role: "Clinical Psychologist, Co-Founder", credentials: "CSPP PH.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY15800)", image: "/assets/RPG_Images for UI/Anat copy.jpg", approach: ["I help people who manage life well on the surface feel more grounded and connected to themselves and others.","Many of my clients are self-aware, yet they still struggle with self-doubt, persistent internal pressure, and emotional exhaustion."], beyondTherapy: "Outside of therapy, I try to spend my time in ways that reflect what I value most: connection, curiosity, and meaningful conversation.", specialties: [{title:"Functional Anxiety",desc:"Perfectionism, overthinking, burnout, and high-achievement stress."},{title:"Functional Depression",desc:"Grief and loss, midlife dissatisfaction, emotional numbness."},{title:"Women's Issues Across the Lifespan",desc:"Role and identity shift at various stages of womanhood."}], background: ["Dr. Anat Cohen is a licensed clinical psychologist (PSY15800) with over two decades of experience.","She received her Ph.D. from the California School of Professional Psychology (CSPP), accredited by the APA, in 1996."] },
        { slug: "wendy-eifert", name: "Wendy Eifert, Psy.D.", role: "Clinical Psychologist", credentials: "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY34367)", image: "/assets/RPG_Images for UI/Wendy copy.jpg", approach: ["Many of the individuals who seek my help are high-functioning, thoughtful, and deeply capable.","My work helps clients understand the emotional logic behind how they learned to cope, while gently challenging the strategies that no longer serve them."], beyondTherapy: "Outside the therapy room, I deeply value the beauty of slow and intentional processes. About a year ago, I started my own sourdough starter, Penelope.", specialties: [{title:"High-Achieving Professionals",desc:"Burnout, perfectionism, and the gap between success and fulfillment."},{title:"Trauma, Avoidance & Attachment",desc:"Helping resilient adults move beyond survival patterns."},{title:"Life in Medicine",desc:"Supporting providers and partners through burnout and the emotional cost of medical culture."}], background: ["Dr. Wendy Eifert is a licensed clinical psychologist (PSY34367) and has been working in the mental health field since 2015.","She received her doctorate in clinical psychology from Pepperdine University, accredited by the APA."] },
        { slug: "hedieh-hakakian", name: "Hedieh Hakakian, Psy.D.", role: "Clinical Psychologist", credentials: "LICENSED CLINICAL PSYCHOLOGIST (PSY32551)", image: "/assets/RPG_Images for UI/Hedieh copy.jpg", approach: ["I focus on helping individuals, couples, and parents decode their interpersonal dynamics.","We work together to slow down high-conflict triggers, identify hidden relational needs, and create new ways of interacting."], beyondTherapy: "Outside the therapy room, my favorite moments are spent over long family dinners, discovering new books, and traveling to explore new cultures.", specialties: [{title:"Couples Therapy",desc:"Breaking conflict cycles and improving deep emotional communication."},{title:"Parenting & Co-Parenting Stress",desc:"Supporting parent-child bonding and managing co-parenting roles."},{title:"Interpersonal Growth",desc:"Identifying recurring attachment habits and consciously replacing them."}], background: ["Dr. Hedieh Hakakian is a licensed clinical psychologist (PSY32551) with years of training in family systems and attachment dynamics."] },
        { slug: "valarie-gardner", name: "Valarie Gardner, M.A., AMFT", role: "Marriage and Family Therapy Associate", credentials: "REGISTERED ASSOCIATE MFT (AMFT140224)", image: "/assets/RPG_Images for UI/Valarie copy.jpg", approach: ["I believe that every individual holds the capacity for deep healing when provided with a safe, non-judgmental, and attuned clinical environment.","I work closely with individuals and couples to process unresolved hurt and rebuild structural trust."], beyondTherapy: "Outside of the clinical setting, I love spending time outdoors, staying active, and exploring California's hiking trails.", specialties: [{title:"Individual Therapy",desc:"Navigating self-esteem, attachment styles, anxiety, and depression."},{title:"EMDR & Trauma Recovery",desc:"Processing adverse childhood events via certified EMDR protocols."},{title:"Couples & Relationship Growth",desc:"Strengthening emotional responsiveness, repair, and trust."}], background: ["Valarie received her master's degree in clinical psychology and is currently a Registered Associate Marriage and Family Therapist (AMFT140224)."] },
    ];
    const [fullProfiles, setFullProfiles] = useState<FullProfile[]>(STATIC_FULL);

    // Approach
    const [approachHeroTitle, setApproachHeroTitle] = useState("Patterns learned earlier in life can quietly shape how we relate, react, and make decisions.");
    const [approachHeroImg, setApproachHeroImg] = useState("/assets/RPG_Images for UI/Our Approach_Img.jpg");
    const [approachInsightTitle, setApproachInsightTitle] = useState("But change doesn't happen through insight alone.");
    const [approachConnectionTitle, setApproachConnectionTitle] = useState("Change happens in connection.");
    const [approachSec2Btn, setApproachSec2Btn] = useState("Request a Consultation");
    const [approachAttunementImg, setApproachAttunementImg] = useState("/assets/RPG_Images for UI/modern-window-with-pillows-trees-and-sky-behind-2026-03-16-04-30-14-utc.jpg");
    const [approachAttunementTitle, setApproachAttunementTitle] = useState("In a space that is attuned, structured, and grounded in evidence-based approaches, we help you:");
    const [approachAttunementPoints, setApproachAttunementPoints] = useState<string[]>(["Feel understood without having to overexplain", "Recognize automatic responses as they happen", "Understand what purpose they serve", "Shift them through new emotional experiences"]);
    const [approachBeyondInsight, setApproachBeyondInsight] = useState("This is what allows change to move from something you understand to something you feel and live.");
    const [approachFlexibilityTitle, setApproachFlexibilityTitle] = useState("Over time, what once felt automatic becomes flexible.");
    const [approachStucknessDesc, setApproachStucknessDesc] = useState("You don't have to force change or try harder. You begin to feel unstuck, because something deeper has shifted.");
    const [approachLeftCardImg, setApproachLeftCardImg] = useState("/assets/RPG_Images for UI/modern-window-with-pillows-trees-and-sky-behind-2026-03-16-04-30-14-utc.jpg");
    const [approachLeftCardTitle, setApproachLeftCardTitle] = useState("Develop a different relationship with your emotions:");
    const [approachLeftCardPoints, setApproachLeftCardPoints] = useState<string[]>(["Greater clarity", "More choice", "Less reactivity"]);
    const [approachRightCardImg, setApproachRightCardImg] = useState("/assets/RPG_Images for UI/window-natural-shadow-2026-03-17-14-48-39-utc.jpg");
    const [approachRightCardTitle, setApproachRightCardTitle] = useState("Move out of familiar relationship cycles of disconnection and into new ways of responding:");
    const [approachRightCardPoints, setApproachRightCardPoints] = useState<string[]>(["Greater trust", "More responsiveness", "Genuine closeness"]);
    const [approachCtaTitle, setApproachCtaTitle] = useState("Book a consultation and we'll explore what's keeping you stuck, and how to help you move forward.");
    const [approachSec6Btn, setApproachSec6Btn] = useState("Schedule a Consultation");

    // Specialties
    const [specialtiesPageTitle, setSpecialtiesPageTitle] = useState("Specialties");
    const [specialtiesPageDesc, setSpecialtiesPageDesc] = useState("Core Practice Areas");
    const [specialtiesContent, setSpecialtiesContent] = useState<Record<string, any>>({});
    const [specialtiesCtaTitle, setSpecialtiesCtaTitle] = useState("When You're Ready for Something Different");
    const [specialtiesCtaDesc, setSpecialtiesCtaDesc] = useState("If you're ready to move beyond just getting through your days and want to feel more fully present in your life again, we invite you to take the next step.");
    const [specialtiesCtaButton, setSpecialtiesCtaButton] = useState("Book a Consultation");

    // Services
    const [servicesHeroTitle, setServicesHeroTitle] = useState("Telehealth Services");
    const [servicesHeroDesc, setServicesHeroDesc] = useState("Reframe Psychology Group provides all services online via our HIPAA compliant, encrypted video platform called SimplePractice.");
    const [servicesHeroImg, setServicesHeroImg] = useState("/assets/RPG_Images for UI/asian-senior-older-woman-video-call-with-doctor-in-2026-03-16-04-23-55-utc.jpg");
    const [servicesFeesTitle, setServicesFeesTitle] = useState("Fees");
    const [servicesFeesSubtitle, setServicesFeesSubtitle] = useState("Please review our team members and the standard fee for their services.\nLimited sliding scale fees when available.");
    const [servicesOonTitle, setServicesOonTitle] = useState("Out-of-Network Policy");
    const [servicesOonDesc, setServicesOonDesc] = useState("Reframe Psychology Group is an out-of-network provider. This means that our therapists cannot bill your insurance company directly. We have chosen to practice independently of insurance companies in order to provide you with care that is based on your specific therapy goals and not on the limitations imposed by insurance companies.");
    const [servicesReimbursement, setServicesReimbursement] = useState("Your insurance company and your particular coverage determine if and how you can be reimbursed. At your request, we will do our best to provide information that will support your claim.");

    // Contact
    const [contactHeroTitle, setContactHeroTitle] = useState("Request a Consultation");
    const [contactHeroDesc, setContactHeroDesc] = useState("Ready to start your journey? Fill out our secure contact form to request a consultation with one of our licensed clinical specialists.");
    const [contactIntakeTagline, setContactIntakeTagline] = useState("Intake & Inquiry");
    const [contactEmail, setContactEmail] = useState("care@reframepsychology.com");
    const [contactPhone, setContactPhone] = useState("(555) 123-4567");
    const [contactAddress, setContactAddress] = useState("Online across California");
    const [contactHours, setContactHours] = useState("Mon - Fri, 9:00 AM - 5:00 PM PST.");
    const [contactEmailLabel, setContactEmailLabel] = useState("Secure Direct Email");
    const [contactEmailSub, setContactEmailSub] = useState("Encrypted communications portal.");
    const [contactPhoneLabel, setContactPhoneLabel] = useState("Practice Phone Line");
    const [contactPhoneSub, setContactPhoneSub] = useState("Mon - Fri, 9:00 AM - 5:00 PM PST.");
    const [contactAddressLabel, setContactAddressLabel] = useState("Online Operations");
    const [contactAddressSub, setContactAddressSub] = useState("Serving clients digitally throughout all cities in California.");
    const [contactQaTitle, setContactQaTitle] = useState("Is it secure?");
    const [contactQaDesc, setContactQaDesc] = useState("Yes! All clinical data and intake document transmissions are handled directly through SimplePractice—our secure, fully encrypted, HIPAA-compliant patient dashboard.");
    const [contactFormTitle, setContactFormTitle] = useState("Send a Secure Inquiry");
    const [contactFormDesc, setContactFormDesc] = useState("Please avoid including highly confidential Protected Health Information (PHI) in this public form. Full intakes are managed privately inside SimplePractice.");
    const [contactFormButton, setContactFormButton] = useState("Send Message");
    const [contactInfoTitle, setContactInfoTitle] = useState("Get in Touch");
    const [contactInfoDesc, setContactInfoDesc] = useState("We offer secure, encrypted virtual care across all of California. If you have questions about billing, SimplePractice portals, scheduling, or specific therapists, feel free to drop us a line.");

    // ─── Load all data from API ───────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const [sRes, hRes, aRes, spRes, svRes, cRes, authRes] = await Promise.allSettled([
                    fetch(`${getApiUrl()}/api/v1/settings/settings`),
                    fetch(`${getApiUrl()}/api/v1/settings/pages/home`),
                    fetch(`${getApiUrl()}/api/v1/settings/pages/approach`),
                    fetch(`${getApiUrl()}/api/v1/settings/pages/specialties`),
                    fetch(`${getApiUrl()}/api/v1/settings/pages/services`),
                    fetch(`${getApiUrl()}/api/v1/settings/pages/contact`),
                    fetch(`${getApiUrl()}/api/v1/authors?team_only=true`),
                ]);
                if (!mounted) return;
                if (sRes.status === "fulfilled" && sRes.value.ok) {
                    const d = await sRes.value.json();
                    setPrimaryColor(d.primary_color || "#7ebac8");
                    setBackgroundColor(d.background_color || "#FDF8F5");
                    setSecondaryColor(d.secondary_color || "#4a535e");
                    setTextColor(d.text_color || "#4a535e");
                    setFontSans(d.font_sans || "Raleway");
                    setFontSerif(d.font_serif || "Merriweather");
                    setLogoUrl(d.logo_url || "/assets/RPG Logo_Main Landscape.png");
                    setHeaderBtnText(d.header_button_text || "Contact Us");
                    setFooterReadyText(d.footer_ready_text || "Ready to start?");
                    setFooterBtnText(d.footer_button_text || "Schedule a Consultation");
                }
                if (hRes.status === "fulfilled" && hRes.value.ok) {
                    const d = await hRes.value.json();
                    if (d.hero_title) setHomeHeroTitle(d.hero_title);
                    if (d.content?.hero_subheading) setHomeHeroSubheading(d.content.hero_subheading);
                    if (d.hero_description) setHomeHeroDesc(d.hero_description);
                    if (d.content?.hero_cta_text) setHomeHeroCta(d.content.hero_cta_text);
                    if (d.hero_image_url) setHomeHeroImg(d.hero_image_url);
                    if (d.content?.banner_title) setHomeBannerTitle(d.content.banner_title);
                    if (d.content?.banner_description) setHomeBannerDesc(d.content.banner_description);
                    if (d.content?.showcase_title) setHomeShowcaseTitle(d.content.showcase_title);
                }
                if (aRes.status === "fulfilled" && aRes.value.ok) {
                    const d = await aRes.value.json();
                    if (d.hero_title) setApproachHeroTitle(d.hero_title);
                    if (d.hero_image_url) setApproachHeroImg(d.hero_image_url);
                    if (d.content?.insight_title) setApproachInsightTitle(d.content.insight_title);
                    if (d.content?.connection_title) setApproachConnectionTitle(d.content.connection_title);
                    if (d.content?.sec2_btn_text) setApproachSec2Btn(d.content.sec2_btn_text);
                    if (d.content?.attunement_image) setApproachAttunementImg(d.content.attunement_image);
                    if (d.content?.attunement_title) setApproachAttunementTitle(d.content.attunement_title);
                    if (d.content?.attunement_points?.length) setApproachAttunementPoints(d.content.attunement_points);
                    if (d.content?.beyond_insight) setApproachBeyondInsight(d.content.beyond_insight);
                    if (d.content?.flexibility_title) setApproachFlexibilityTitle(d.content.flexibility_title);
                    if (d.content?.stuckness_desc) setApproachStucknessDesc(d.content.stuckness_desc);
                    if (d.content?.left_card_image) setApproachLeftCardImg(d.content.left_card_image);
                    if (d.content?.left_card_title) setApproachLeftCardTitle(d.content.left_card_title);
                    if (d.content?.left_card_points?.length) setApproachLeftCardPoints(d.content.left_card_points);
                    if (d.content?.right_card_image) setApproachRightCardImg(d.content.right_card_image);
                    if (d.content?.right_card_title) setApproachRightCardTitle(d.content.right_card_title);
                    if (d.content?.right_card_points?.length) setApproachRightCardPoints(d.content.right_card_points);
                    if (d.content?.call_to_action_title) setApproachCtaTitle(d.content.call_to_action_title);
                    if (d.content?.sec6_btn_text) setApproachSec6Btn(d.content.sec6_btn_text);
                }
                if (spRes.status === "fulfilled" && spRes.value.ok) {
                    const d = await spRes.value.json();
                    if (d.title) setSpecialtiesPageTitle(d.title);
                    if (d.hero_description) setSpecialtiesPageDesc(d.hero_description);
                    if (d.content) setSpecialtiesContent(d.content);
                    if (d.content?.cta_card_title) setSpecialtiesCtaTitle(d.content.cta_card_title);
                    if (d.content?.cta_card_desc) setSpecialtiesCtaDesc(d.content.cta_card_desc);
                    if (d.content?.cta_card_button) setSpecialtiesCtaButton(d.content.cta_card_button);
                }
                if (svRes.status === "fulfilled" && svRes.value.ok) {
                    const d = await svRes.value.json();
                    if (d.hero_title) setServicesHeroTitle(d.hero_title);
                    if (d.hero_description) setServicesHeroDesc(d.hero_description);
                    if (d.hero_image_url) setServicesHeroImg(d.hero_image_url);
                    if (d.content?.fees_title) setServicesFeesTitle(d.content.fees_title);
                    if (d.content?.fees_subtitle) setServicesFeesSubtitle(d.content.fees_subtitle);
                    if (d.content?.out_of_network_title) setServicesOonTitle(d.content.out_of_network_title);
                    if (d.content?.out_of_network_desc) setServicesOonDesc(d.content.out_of_network_desc);
                    if (d.content?.reimbursement_info) setServicesReimbursement(d.content.reimbursement_info);
                }
                if (cRes.status === "fulfilled" && cRes.value.ok) {
                    const d = await cRes.value.json();
                    const c = d.content || {};
                    if (d.hero_title) setContactHeroTitle(d.hero_title);
                    if (d.hero_description) setContactHeroDesc(d.hero_description);
                    if (c.intake_tagline) setContactIntakeTagline(c.intake_tagline);
                    if (c.email) setContactEmail(c.email);
                    if (c.phone) setContactPhone(c.phone);
                    if (c.address) setContactAddress(c.address);
                    if (c.hours) setContactHours(c.hours);
                    if (c.email_label) setContactEmailLabel(c.email_label);
                    if (c.email_sub) setContactEmailSub(c.email_sub);
                    if (c.phone_label) setContactPhoneLabel(c.phone_label);
                    if (c.phone_sub) setContactPhoneSub(c.phone_sub);
                    if (c.address_label) setContactAddressLabel(c.address_label);
                    if (c.address_sub) setContactAddressSub(c.address_sub);
                    if (c.qa_title) setContactQaTitle(c.qa_title);
                    if (c.qa_desc) setContactQaDesc(c.qa_desc);
                    if (c.form_title) setContactFormTitle(c.form_title);
                    if (c.form_desc) setContactFormDesc(c.form_desc);
                    if (c.form_button) setContactFormButton(c.form_button);
                    if (c.info_title) setContactInfoTitle(c.info_title);
                    if (c.info_desc) setContactInfoDesc(c.info_desc);
                }
                if (authRes.status === "fulfilled" && authRes.value.ok) {
                    const data = await authRes.value.json();
                    if (Array.isArray(data)) {
                        const mapped: TeamMember[] = data.map((auth: any) => {
                            const fb = DEFAULT_THERAPISTS.find(f => f.name.includes(auth.name) || auth.name.includes(f.name.split(",")[0]));
                            const slug = auth.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                            let specialties = fb?.specialties || "Individual Therapy";
                            if (auth.specialties_list?.length) specialties = auth.specialties_list.map((s: any) => s.title).join(", ");
                            return { id: auth.id, slug, name: auth.name, role: auth.role || fb?.role || "Clinical Psychologist", specialties, image: auth.profile_image_url || fb?.image || "/assets/RPG Logo_Main Portrait.png" };
                        });
                        if (mounted) {
                            setTeamMembers(mapped);
                            setDeletedAuthorIds([]);
                            // Also build full profiles from API data
                            const fullMapped = data.map((auth: any) => {
                                const fb = STATIC_FULL.find(f => f.name.includes(auth.name) || auth.name.includes(f.name.split(",")[0]));
                                const slug = auth.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                return {
                                    id: auth.id, slug, name: auth.name,
                                    role: auth.role || fb?.role || "Clinical Psychologist",
                                    credentials: auth.credentials || fb?.credentials || "",
                                    image: auth.profile_image_url || fb?.image || "/assets/RPG Logo_Main Portrait.png",
                                    approach: auth.approach_paragraphs?.length ? auth.approach_paragraphs : (fb?.approach || []),
                                    beyondTherapy: auth.beyond_therapy || fb?.beyondTherapy || "",
                                    specialties: auth.specialties_list?.length ? auth.specialties_list : (fb?.specialties || []),
                                    background: auth.background_paragraphs?.length ? auth.background_paragraphs : (fb?.background || []),
                                };
                            });
                            setFullProfiles(fullMapped);
                        }
                    }
                }
            } catch (e) {
                console.error("Error loading CMS:", e);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    // ─── Save all ────────────────────────────────────────────────────────────
    const saveAll = async () => {
        setIsSaving(true);
        try {
            if (!session?.accessToken) {
                throw new Error("Your admin session is missing. Please sign in again.");
            }
            const auth = { "Content-Type": "application/json", Authorization: `Bearer ${session?.accessToken}` };
            const saveJson = async (label: string, path: string, body: unknown, method = "PUT") => {
                const res = await fetch(`${getApiUrl()}${path}`, {
                    method,
                    headers: auth,
                    body: JSON.stringify(body),
                });
                if (!res.ok) {
                    const detail = await res.text().catch(() => "");
                    throw new Error(`${label} failed to save${detail ? `: ${detail}` : ""}`);
                }
                return res.json();
            };
            const fullById = new Map(fullProfiles.filter(p => p.id).map(p => [p.id, p]));
            const fullBySlug = new Map(fullProfiles.map(p => [p.slug, p]));
            const buildAuthorPayload = (member: TeamMember) => {
                const full = (member.id ? fullById.get(member.id) : undefined) || fullBySlug.get(member.slug);
                const specialties = full?.specialties?.length
                    ? full.specialties
                    : member.specialties.split(",").map(title => ({ title: title.trim(), desc: "" })).filter(s => s.title);

                return {
                    name: full?.name || member.name,
                    role: full?.role || member.role,
                    credentials: full?.credentials || "",
                    profile_image_url: full?.image || member.image,
                    beyond_therapy: full?.beyondTherapy || "",
                    approach_paragraphs: full?.approach || [],
                    background_paragraphs: full?.background || [],
                    specialties_list: specialties,
                    is_team_member: true,
                };
            };
            const authorSaves = teamMembers.map(member => {
                const payload = buildAuthorPayload(member);
                return member.id
                    ? saveJson(`Website team profile ${payload.name}`, `/api/v1/authors/${member.id}`, payload)
                    : saveJson(`New website team profile ${payload.name}`, "/api/v1/authors/", payload, "POST");
            });
            const authorRemoves = deletedAuthorIds.map(id => saveJson("Website team profile", `/api/v1/authors/${id}`, { is_team_member: false }));
            const publishResults = await Promise.all([
                fetch(`${getApiUrl()}/api/v1/settings/settings`, { method: "PUT", headers: auth, body: JSON.stringify({ font_sans: fontSans, font_serif: fontSerif, primary_color: primaryColor, background_color: backgroundColor, secondary_color: secondaryColor, text_color: textColor, logo_url: logoUrl, header_button_text: headerBtnText, footer_ready_text: footerReadyText, footer_button_text: footerBtnText }) }),
                fetch(`${getApiUrl()}/api/v1/settings/pages/home`, { method: "PUT", headers: auth, body: JSON.stringify({ hero_title: homeHeroTitle, hero_description: homeHeroDesc, hero_image_url: homeHeroImg, content: { hero_subheading: homeHeroSubheading, hero_cta_text: homeHeroCta, banner_title: homeBannerTitle, banner_description: homeBannerDesc, showcase_title: homeShowcaseTitle } }) }),
                fetch(`${getApiUrl()}/api/v1/settings/pages/approach`, { method: "PUT", headers: auth, body: JSON.stringify({ hero_title: approachHeroTitle, hero_image_url: approachHeroImg, content: { insight_title: approachInsightTitle, connection_title: approachConnectionTitle, attunement_image: approachAttunementImg, attunement_title: approachAttunementTitle, attunement_points: approachAttunementPoints, beyond_insight: approachBeyondInsight, flexibility_title: approachFlexibilityTitle, stuckness_desc: approachStucknessDesc, left_card_image: approachLeftCardImg, left_card_title: approachLeftCardTitle, left_card_points: approachLeftCardPoints, right_card_image: approachRightCardImg, right_card_title: approachRightCardTitle, right_card_points: approachRightCardPoints, call_to_action_title: approachCtaTitle, sec2_btn_text: approachSec2Btn, sec6_btn_text: approachSec6Btn } }) }),
                fetch(`${getApiUrl()}/api/v1/settings/pages/specialties`, { method: "PUT", headers: auth, body: JSON.stringify({ title: specialtiesPageTitle, hero_description: specialtiesPageDesc, content: { ...specialtiesContent, cta_card_title: specialtiesCtaTitle, cta_card_desc: specialtiesCtaDesc, cta_card_button: specialtiesCtaButton } }) }),
                fetch(`${getApiUrl()}/api/v1/settings/pages/services`, { method: "PUT", headers: auth, body: JSON.stringify({ hero_title: servicesHeroTitle, hero_description: servicesHeroDesc, hero_image_url: servicesHeroImg, content: { fees_title: servicesFeesTitle, fees_subtitle: servicesFeesSubtitle, out_of_network_title: servicesOonTitle, out_of_network_desc: servicesOonDesc, reimbursement_info: servicesReimbursement } }) }),
                fetch(`${getApiUrl()}/api/v1/settings/pages/contact`, { method: "PUT", headers: auth, body: JSON.stringify({ hero_title: contactHeroTitle, hero_description: contactHeroDesc, content: { email: contactEmail, phone: contactPhone, address: contactAddress, hours: contactHours, intake_tagline: contactIntakeTagline, email_label: contactEmailLabel, email_sub: contactEmailSub, phone_label: contactPhoneLabel, phone_sub: contactPhoneSub, address_label: contactAddressLabel, address_sub: contactAddressSub, qa_title: contactQaTitle, qa_desc: contactQaDesc, form_title: contactFormTitle, form_desc: contactFormDesc, form_button: contactFormButton, info_title: contactInfoTitle, info_desc: contactInfoDesc } }) }),
                ...authorSaves,
                ...authorRemoves,
            ]);
            const failedResponse = publishResults.find((result): result is Response => result instanceof Response && !result.ok);
            if (failedResponse) {
                const detail = await failedResponse.text().catch(() => "");
                throw new Error(`Publish failed with status ${failedResponse.status}${detail ? `: ${detail}` : ""}`);
            }
            alert("All changes published to the live site!");
            setDeletedAuthorIds([]);
        } catch (e) {
            console.error("CMS publish failed:", e);
            alert(e instanceof Error ? e.message : "Error saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Helper to open edit drawer ──────────────────────────────────────────
    const saveTeamCardEdit = (memberSlug: string, values: Record<string, string | string[]>) => {
        const image = values.image as string;
        const name = values.name as string;
        const role = values.role as string;
        const specialtiesText = values.specialties as string;
        const specialties = specialtiesText
            .split(",")
            .map(title => ({ title: title.trim(), desc: "" }))
            .filter(item => item.title);

        setTeamMembers(prev => prev.map(member => (
            member.slug === memberSlug
                ? { ...member, image, name, role, specialties: specialtiesText }
                : member
        )));

        setFullProfiles(prev => prev.map(profile => (
            profile.slug === memberSlug
                ? { ...profile, image, name, role, specialties: specialties.length ? specialties : profile.specialties }
                : profile
        )));
    };

    const makeTeamSlug = (name: string) => {
        const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new-team-member";
        const used = new Set([...teamMembers.map(m => m.slug), ...fullProfiles.map(p => p.slug)]);
        if (!used.has(base)) return base;
        let index = 2;
        while (used.has(`${base}-${index}`)) index += 1;
        return `${base}-${index}`;
    };

    const addTeamMember = () => {
        const slug = makeTeamSlug("New Team Member");
        const member: TeamMember = {
            slug,
            name: "New Team Member",
            role: "Clinical Psychologist",
            specialties: "Individual Therapy",
            image: "/assets/RPG Logo_Main Portrait.png",
        };
        const profile: FullProfile = {
            slug,
            name: member.name,
            role: member.role,
            credentials: "",
            image: member.image,
            approach: ["Add this clinician's approach here."],
            beyondTherapy: "",
            specialties: [{ title: "Individual Therapy", desc: "" }],
            background: ["Add background and education here."],
        };
        setTeamMembers(prev => [...prev, member]);
        setFullProfiles(prev => [...prev, profile]);
        setActiveTab("team");
        setShowEditMode(true);
    };

    const deleteTeamMember = (profile: FullProfile) => {
        const ok = window.confirm(`Remove ${profile.name} from the website team? This will stop showing them on the live site after you publish changes.`);
        if (!ok) return;
        setTeamMembers(prev => prev.filter(member => member.id !== profile.id && member.slug !== profile.slug));
        setFullProfiles(prev => prev.filter(item => item.id !== profile.id && item.slug !== profile.slug));
        if (profile.id) {
            setDeletedAuthorIds(prev => prev.includes(profile.id!) ? prev : [...prev, profile.id!]);
        }
        setEditPanel(null);
    };

    const openEdit = (panel: EditPanel) => setEditPanel(panel);

    // ─── Build merged specialties ────────────────────────────────────────────
    const previewSpecialties = STATIC_SPECIALTIES.map(s => {
        const cms = specialtiesContent[s.id] || {};
        return { ...s, title: cms.title || s.title, paragraphs: (cms.paragraphs?.length > 0) ? cms.paragraphs : s.paragraphs, image: cms.image || s.image };
    });

    const TABS = [
        { id: "home", label: "Home", icon: <Home className="w-3.5 h-3.5" /> },
        { id: "team", label: "Meet the Team", icon: <ClipboardList className="w-3.5 h-3.5" /> },
        { id: "approach", label: "Our Approach", icon: <ClipboardList className="w-3.5 h-3.5" /> },
        { id: "specialties", label: "Specialties", icon: <HeartHandshake className="w-3.5 h-3.5" /> },
        { id: "services", label: "Services & Fees", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        { id: "contact", label: "Contact", icon: <PhoneCall className="w-3.5 h-3.5" /> },
        { id: "branding", label: "Branding", icon: <Palette className="w-3.5 h-3.5" /> },
    ];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#7ebac8]" />
                <p className="text-sm text-muted-foreground font-medium">Loading site content…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f4f4f4]">

            {/* ═══ ADMIN TOP BAR ═══════════════════════════════════════════════ */}
            <div className="shrink-0 bg-[#1e2328] text-white px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg z-50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#7ebac8] animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase text-white/60">CMS Editor</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    {/* Page Tabs */}
                    <div className="flex gap-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${activeTab === tab.id ? "bg-[#7ebac8] text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === "team" && (
                        <button
                            onClick={addTeamMember}
                            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all"
                        >
                            <Plus className="w-3 h-3" /> Add Website Team Profile
                        </button>
                    )}
                    <button
                        onClick={() => setShowEditMode(!showEditMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${showEditMode ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/10"}`}
                    >
                        {showEditMode ? <><Eye className="w-3 h-3" /> Edit Mode</> : <><EyeOff className="w-3 h-3" /> Preview Only</>}
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button
                        onClick={saveAll}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-60"
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        {isSaving ? "Publishing…" : "Publish Changes"}
                    </button>
                </div>
            </div>

            {/* ═══ BROWSER CHROME + PAGE PREVIEW ══════════════════════════════ */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Browser address bar */}
                <div className="shrink-0 bg-[#f0f0f0] border-b border-black/[0.08] px-4 py-2 flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 bg-white border border-black/[0.08] rounded-[5px] px-3 py-1 text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                        <span className="text-muted-foreground/40">https://</span>
                        reframepsychology.com/{activeTab === "home" ? "" : activeTab === "branding" ? "admin/branding" : activeTab}
                    </div>
                    {showEditMode && (
                        <div className="flex items-center gap-1 bg-[#7ebac8]/15 border border-[#7ebac8]/30 rounded px-2 py-0.5">
                            <Pencil className="w-2.5 h-2.5 text-[#7ebac8]" />
                            <span className="text-[10px] font-bold text-[#7ebac8] uppercase tracking-wider">Click to edit</span>
                        </div>
                    )}
                </div>

                {/* Scrollable page content */}
                <div className="flex-1 overflow-y-auto relative" onClick={() => editPanel && setEditPanel(null)}>

                    {/* ═══ SHARED HEADER (exact mirror of Header.tsx) ═══════════ */}
                    {showEditMode ? (
                        <Editable label="Header" onClick={() => openEdit({
                            sectionLabel: "Site Header & Navigation",
                            fields: [
                                { key: "logoUrl", label: "Logo Image", type: "image", value: logoUrl },
                                { key: "headerBtnText", label: "Contact Button Text", type: "text", value: headerBtnText, placeholder: "Contact Us" },
                                { key: "nav1", label: "Nav Link 1 Label", type: "text", value: navItems[0]?.name || "Home" },
                                { key: "nav2", label: "Nav Link 2 Label", type: "text", value: navItems[1]?.name || "Our Approach" },
                                { key: "nav3", label: "Nav Link 3 Label", type: "text", value: navItems[2]?.name || "Meet the Team" },
                                { key: "nav4", label: "Nav Link 4 Label", type: "text", value: navItems[3]?.name || "Specialties" },
                                { key: "nav5", label: "Nav Link 5 Label", type: "text", value: navItems[4]?.name || "Services and Fees" },
                                { key: "nav6", label: "Nav Link 6 Label", type: "text", value: navItems[5]?.name || "Blog" },
                            ],
                            onSave: (v) => {
                                setLogoUrl(v.logoUrl as string);
                                setHeaderBtnText(v.headerBtnText as string);
                                setNavItems([
                                    { ...navItems[0], name: v.nav1 as string },
                                    { ...navItems[1], name: v.nav2 as string },
                                    { ...navItems[2], name: v.nav3 as string },
                                    { ...navItems[3], name: v.nav4 as string },
                                    { ...navItems[4], name: v.nav5 as string },
                                    { ...navItems[5], name: v.nav6 as string },
                                ]);
                            }
                        })}>
                            <SiteHeader logoUrl={logoUrl} btnText={headerBtnText} navItems={navItems} />
                        </Editable>
                    ) : <SiteHeader logoUrl={logoUrl} btnText={headerBtnText} navItems={navItems} />}

                    {/* ═══════ HOME PAGE ═══════════════════════════════════════ */}
                    {activeTab === "home" && (
                        <div className="w-full bg-[#FCF9F6]">
                            {/* Hero */}
                            {showEditMode ? (
                                <Editable label="Hero Section" onClick={() => openEdit({
                                    sectionLabel: "Homepage Hero",
                                    fields: [
                                        { key: "img", label: "Hero Background Image", type: "image", value: homeHeroImg },
                                        { key: "title", label: "Main Headline", type: "textarea", value: homeHeroTitle },
                                        { key: "sub", label: "Italic Subheading", type: "text", value: homeHeroSubheading },
                                        { key: "desc", label: "Supporting Description", type: "text", value: homeHeroDesc },
                                        { key: "cta", label: "CTA Button Text", type: "text", value: homeHeroCta },
                                    ],
                                    onSave: (v) => { setHomeHeroImg(v.img as string); setHomeHeroTitle(v.title as string); setHomeHeroSubheading(v.sub as string); setHomeHeroDesc(v.desc as string); setHomeHeroCta(v.cta as string); }
                                })}>
                                    <HomeHeroSection heroImg={homeHeroImg} heroTitle={homeHeroTitle} heroSubheading={homeHeroSubheading} heroDesc={homeHeroDesc} heroCtaText={homeHeroCta} />
                                </Editable>
                            ) : <HomeHeroSection heroImg={homeHeroImg} heroTitle={homeHeroTitle} heroSubheading={homeHeroSubheading} heroDesc={homeHeroDesc} heroCtaText={homeHeroCta} />}

                            {/* California Banner */}
                            {showEditMode ? (
                                <Editable label="California Banner" onClick={() => openEdit({
                                    sectionLabel: "California Banner Section",
                                    fields: [
                                        { key: "title", label: "Banner Title", type: "text", value: homeBannerTitle },
                                        { key: "desc", label: "Banner Description", type: "textarea", value: homeBannerDesc },
                                    ],
                                    onSave: (v) => { setHomeBannerTitle(v.title as string); setHomeBannerDesc(v.desc as string); }
                                })}>
                                    <CaliforniaBannerSection bannerTitle={homeBannerTitle} bannerDesc={homeBannerDesc} />
                                </Editable>
                            ) : <CaliforniaBannerSection bannerTitle={homeBannerTitle} bannerDesc={homeBannerDesc} />}

                            {/* Team Showcase */}
                            {showEditMode ? (
                                <Editable label="Section Title" onClick={() => openEdit({
                                    sectionLabel: "Team — Section Title",
                                    fields: [
                                        { key: "title", label: "Section Title", type: "text", value: homeShowcaseTitle, placeholder: "Meet the Team" },
                                    ],
                                    onSave: (v) => { setHomeShowcaseTitle(v.title as string); }
                                })}>
                                    <TeamShowcaseTitleBar title={homeShowcaseTitle} />
                                </Editable>
                            ) : <TeamShowcaseTitleBar title={homeShowcaseTitle} />}

                            {/* Individual team member cards — exact client-side replica */}
                            <section className="bg-[#fdf8f5] pb-28 lg:pb-36 font-sans text-[#333a42]">
                                <div className="container mx-auto px-4 max-w-6xl">
                                    <div className="space-y-24">
                                        {/* Row 1 */}
                                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-28 lg:gap-x-12">
                                            {teamMembers.slice(0, 3).map((member) => (
                                                showEditMode ? (
                                                    <Editable key={member.slug} label={`Edit ${member.name.split(",")[0]}`} onClick={() => openEdit({
                                                        sectionLabel: `Team Member: ${member.name}`,
                                                        fields: [
                                                            { key: "image", label: "Profile Photo", type: "image", value: member.image },
                                                            { key: "name", label: "Full Name & Credentials", type: "text", value: member.name },
                                                            { key: "role", label: "Title / Role", type: "text", value: member.role },
                                                            { key: "specialties", label: "Specialties", type: "text", value: member.specialties },
                                                        ],
                                                        onSave: (v) => saveTeamCardEdit(member.slug, v)
                                                    })}>
                                                        <TeamMemberCard member={member} />
                                                    </Editable>
                                                ) : <TeamMemberCard key={member.slug} member={member} />
                                            ))}
                                        </div>
                                        {/* Row 2 */}
                                        {teamMembers.length > 3 && (
                                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-28 lg:gap-x-12">
                                                {teamMembers.slice(3).map((member) => (
                                                    showEditMode ? (
                                                        <Editable key={member.slug} label={`Edit ${member.name.split(",")[0]}`} onClick={() => openEdit({
                                                            sectionLabel: `Team Member: ${member.name}`,
                                                            fields: [
                                                                { key: "image", label: "Profile Photo", type: "image", value: member.image },
                                                                { key: "name", label: "Full Name & Credentials", type: "text", value: member.name },
                                                                { key: "role", label: "Title / Role", type: "text", value: member.role },
                                                                { key: "specialties", label: "Specialties", type: "text", value: member.specialties },
                                                            ],
                                                            onSave: (v) => saveTeamCardEdit(member.slug, v)
                                                        })}>
                                                            <TeamMemberCard member={member} />
                                                        </Editable>
                                                    ) : <TeamMemberCard key={member.slug} member={member} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ═══════ TEAM PAGE — exact /team replica ═════════════════ */}
                    {activeTab === "team" && (
                        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-24">

                            {/* Page header */}
                            <div className="w-full text-center mt-20 mb-16">
                                <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">OUR SPECIALISTS</p>
                                <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">Meet the Team</h1>
                                {showEditMode && (
                                    <button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="mt-6 inline-flex items-center gap-2 bg-[#7ebac8] hover:bg-[#6aaab8] text-white px-4 py-2 rounded text-xs font-bold transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Website Team Profile
                                    </button>
                                )}
                            </div>

                            {/* Each clinician full profile */}
                            <div className="space-y-0">
                                {fullProfiles.map((profile) => {
                                    const half = Math.ceil(profile.background.length / 2);
                                    const leftCol = profile.background.slice(0, half);
                                    const rightCol = profile.background.slice(half);
                                    return (
                                        <div key={profile.slug} className="w-full border-t border-black/[0.04] relative">
                                            {showEditMode && (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        deleteTeamMember(profile);
                                                    }}
                                                    className="absolute right-4 top-4 z-[120] flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded text-xs font-bold transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Remove from Team
                                                </button>
                                            )}

                                            {/* Section 1: Portrait + Approach */}
                                            {showEditMode ? (
                                                <Editable label={`${profile.name.split(",")[0]} — Portrait & Approach`} onClick={() => openEdit({
                                                    sectionLabel: `${profile.name} — Approach`,
                                                    fields: [
                                                        { key: "image", label: "Portrait Photo", type: "image", value: profile.image },
                                                        { key: "name", label: "Full Name & Credentials", type: "text", value: profile.name },
                                                        { key: "role", label: "Role / Title", type: "text", value: profile.role },
                                                        { key: "credentials", label: "Credential Line", type: "text", value: profile.credentials },
                                                        { key: "approach", label: "Approach Paragraphs", type: "list", value: profile.approach },
                                                    ],
                                                    onSave: (v) => setFullProfiles(prev => prev.map(p => p.slug === profile.slug ? { ...p, image: v.image as string, name: v.name as string, role: v.role as string, credentials: v.credentials as string, approach: v.approach as string[] } : p))
                                                })}>
                                                    <TeamPortraitApproach profile={profile} />
                                                </Editable>
                                            ) : <TeamPortraitApproach profile={profile} />}

                                            {/* Section 2: Beyond Therapy */}
                                            {profile.beyondTherapy && (
                                                showEditMode ? (
                                                    <Editable label="Beyond Therapy" onClick={() => openEdit({
                                                        sectionLabel: `${profile.name} — Beyond Therapy`,
                                                        fields: [
                                                            { key: "beyondTherapy", label: "Beyond Therapy Quote", type: "textarea", value: profile.beyondTherapy },
                                                        ],
                                                        onSave: (v) => setFullProfiles(prev => prev.map(p => p.slug === profile.slug ? { ...p, beyondTherapy: v.beyondTherapy as string } : p))
                                                    })}>
                                                        <TeamBeyondTherapy beyondTherapy={profile.beyondTherapy} />
                                                    </Editable>
                                                ) : <TeamBeyondTherapy beyondTherapy={profile.beyondTherapy} />
                                            )}

                                            {/* Section 3: Specialty Areas */}
                                            {profile.specialties?.length > 0 && (
                                                showEditMode ? (
                                                    <Editable label="Specialty Areas" onClick={() => openEdit({
                                                        sectionLabel: `${profile.name} — Specialties`,
                                                        fields: profile.specialties.flatMap((s, i) => [
                                                            { key: `spec_title_${i}`, label: `Specialty ${i+1} Title`, type: "text" as const, value: s.title },
                                                            { key: `spec_desc_${i}`, label: `Specialty ${i+1} Description`, type: "textarea" as const, value: s.desc },
                                                        ]),
                                                        onSave: (v) => setFullProfiles(prev => prev.map(p => p.slug === profile.slug ? {
                                                            ...p,
                                                            specialties: profile.specialties.map((s, i) => ({ title: (v[`spec_title_${i}`] as string) || s.title, desc: (v[`spec_desc_${i}`] as string) || s.desc }))
                                                        } : p))
                                                    })}>
                                                        <TeamSpecialties specialties={profile.specialties} />
                                                    </Editable>
                                                ) : <TeamSpecialties specialties={profile.specialties} />
                                            )}

                                            {/* Section 4: Background & Education */}
                                            {profile.background?.length > 0 && (
                                                showEditMode ? (
                                                    <Editable label="Background & Education" onClick={() => openEdit({
                                                        sectionLabel: `${profile.name} — Background`,
                                                        fields: [{ key: "background", label: "Background Paragraphs", type: "list", value: profile.background }],
                                                        onSave: (v) => setFullProfiles(prev => prev.map(p => p.slug === profile.slug ? { ...p, background: v.background as string[] } : p))
                                                    })}>
                                                        <TeamBackground leftCol={leftCol} rightCol={rightCol} />
                                                    </Editable>
                                                ) : <TeamBackground leftCol={leftCol} rightCol={rightCol} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ═══════ APPROACH PAGE ═══════════════════════════════════ */}
                    {activeTab === "approach" && (
                        <div className="bg-white min-h-screen font-sans">
                            {/* Section 1: Hero */}
                            {showEditMode ? (
                                <Editable label="Hero Section" onClick={() => openEdit({
                                    sectionLabel: "Approach Hero",
                                    fields: [
                                        { key: "img", label: "Hero Background Image", type: "image", value: approachHeroImg },
                                        { key: "title", label: "Hero Title", type: "textarea", value: approachHeroTitle },
                                    ],
                                    onSave: (v) => { setApproachHeroImg(v.img as string); setApproachHeroTitle(v.title as string); }
                                })}>
                                    <ApproachHeroSection heroImg={approachHeroImg} heroTitle={approachHeroTitle} />
                                </Editable>
                            ) : <ApproachHeroSection heroImg={approachHeroImg} heroTitle={approachHeroTitle} />}

                            {/* Section 2: Beige Banner */}
                            {showEditMode ? (
                                <Editable label="Beige Banner" onClick={() => openEdit({
                                    sectionLabel: "Approach — Insight Banner",
                                    fields: [
                                        { key: "insight", label: "Italic Insight Title", type: "text", value: approachInsightTitle },
                                        { key: "connection", label: "Connection Tagline", type: "text", value: approachConnectionTitle },
                                        { key: "btn", label: "Consultation Button Text", type: "text", value: approachSec2Btn },
                                    ],
                                    onSave: (v) => { setApproachInsightTitle(v.insight as string); setApproachConnectionTitle(v.connection as string); setApproachSec2Btn(v.btn as string); }
                                })}>
                                    <ApproachBeigeBanner insightTitle={approachInsightTitle} connectionTitle={approachConnectionTitle} btnText={approachSec2Btn} />
                                </Editable>
                            ) : <ApproachBeigeBanner insightTitle={approachInsightTitle} connectionTitle={approachConnectionTitle} btnText={approachSec2Btn} />}

                            {/* Section 3: Pillows Checklist */}
                            {showEditMode ? (
                                <Editable label="Checklist Section" onClick={() => openEdit({
                                    sectionLabel: "Approach — Attunement Checklist",
                                    fields: [
                                        { key: "img", label: "Background Image", type: "image", value: approachAttunementImg },
                                        { key: "title", label: "Checklist Title", type: "textarea", value: approachAttunementTitle },
                                        { key: "points", label: "Checklist Items", type: "list", value: approachAttunementPoints },
                                        { key: "beyond", label: "Beyond Insight Paragraph", type: "textarea", value: approachBeyondInsight },
                                    ],
                                    onSave: (v) => { setApproachAttunementImg(v.img as string); setApproachAttunementTitle(v.title as string); setApproachAttunementPoints(v.points as string[]); setApproachBeyondInsight(v.beyond as string); }
                                })}>
                                    <ApproachChecklistSection attunementImg={approachAttunementImg} attunementTitle={approachAttunementTitle} attunementPoints={approachAttunementPoints} beyondInsight={approachBeyondInsight} />
                                </Editable>
                            ) : <ApproachChecklistSection attunementImg={approachAttunementImg} attunementTitle={approachAttunementTitle} attunementPoints={approachAttunementPoints} beyondInsight={approachBeyondInsight} />}

                            {/* Section 4: Flexibility Banner */}
                            {showEditMode ? (
                                <Editable label="Flexibility Banner" onClick={() => openEdit({
                                    sectionLabel: "Approach — Flexibility Banner",
                                    fields: [
                                        { key: "flex", label: "Flexibility Title", type: "text", value: approachFlexibilityTitle },
                                        { key: "stuck", label: "Stuckness Description", type: "textarea", value: approachStucknessDesc },
                                    ],
                                    onSave: (v) => { setApproachFlexibilityTitle(v.flex as string); setApproachStucknessDesc(v.stuck as string); }
                                })}>
                                    <ApproachFlexibilityBanner flexibilityTitle={approachFlexibilityTitle} stucknessDesc={approachStucknessDesc} />
                                </Editable>
                            ) : <ApproachFlexibilityBanner flexibilityTitle={approachFlexibilityTitle} stucknessDesc={approachStucknessDesc} />}

                            {/* Section 5: Dual Cards */}
                            {showEditMode ? (
                                <Editable label="Dual Cards" onClick={() => openEdit({
                                    sectionLabel: "Approach — Dual Attunement Cards",
                                    fields: [
                                        { key: "leftImg", label: "Left Card Background Image", type: "image", value: approachLeftCardImg },
                                        { key: "leftTitle", label: "Left Card Title", type: "textarea", value: approachLeftCardTitle },
                                        { key: "leftPoints", label: "Left Card Points", type: "list", value: approachLeftCardPoints },
                                        { key: "rightImg", label: "Right Card Background Image", type: "image", value: approachRightCardImg },
                                        { key: "rightTitle", label: "Right Card Title", type: "textarea", value: approachRightCardTitle },
                                        { key: "rightPoints", label: "Right Card Points", type: "list", value: approachRightCardPoints },
                                    ],
                                    onSave: (v) => { setApproachLeftCardImg(v.leftImg as string); setApproachLeftCardTitle(v.leftTitle as string); setApproachLeftCardPoints(v.leftPoints as string[]); setApproachRightCardImg(v.rightImg as string); setApproachRightCardTitle(v.rightTitle as string); setApproachRightCardPoints(v.rightPoints as string[]); }
                                })}>
                                    <ApproachDualCards leftImg={approachLeftCardImg} leftTitle={approachLeftCardTitle} leftPoints={approachLeftCardPoints} rightImg={approachRightCardImg} rightTitle={approachRightCardTitle} rightPoints={approachRightCardPoints} />
                                </Editable>
                            ) : <ApproachDualCards leftImg={approachLeftCardImg} leftTitle={approachLeftCardTitle} leftPoints={approachLeftCardPoints} rightImg={approachRightCardImg} rightTitle={approachRightCardTitle} rightPoints={approachRightCardPoints} />}

                            {/* Section 6: CTA */}
                            {showEditMode ? (
                                <Editable label="Bottom CTA" onClick={() => openEdit({
                                    sectionLabel: "Approach — Bottom Call-to-Action",
                                    fields: [
                                        { key: "cta", label: "CTA Text", type: "textarea", value: approachCtaTitle },
                                        { key: "btn", label: "Button Text", type: "text", value: approachSec6Btn },
                                    ],
                                    onSave: (v) => { setApproachCtaTitle(v.cta as string); setApproachSec6Btn(v.btn as string); }
                                })}>
                                    <ApproachCtaSection ctaTitle={approachCtaTitle} btnText={approachSec6Btn} />
                                </Editable>
                            ) : <ApproachCtaSection ctaTitle={approachCtaTitle} btnText={approachSec6Btn} />}
                        </div>
                    )}

                    {/* ═══════ SPECIALTIES PAGE ════════════════════════════════ */}
                    {activeTab === "specialties" && (
                        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-12">
                            {showEditMode ? (
                                <Editable label="Page Header" onClick={() => openEdit({
                                    sectionLabel: "Specialties Page Header",
                                    fields: [
                                        { key: "title", label: "Page Title", type: "text", value: specialtiesPageTitle },
                                        { key: "desc", label: "Page Tagline", type: "text", value: specialtiesPageDesc },
                                    ],
                                    onSave: (v) => { setSpecialtiesPageTitle(v.title as string); setSpecialtiesPageDesc(v.desc as string); }
                                })}>
                                    <div className="w-full text-center pt-24 pb-16 px-6 bg-white">
                                        <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">{specialtiesPageDesc}</p>
                                        <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">{specialtiesPageTitle}</h1>
                                    </div>
                                </Editable>
                            ) : (
                                <div className="w-full text-center pt-24 pb-16 px-6 bg-white">
                                    <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">{specialtiesPageDesc}</p>
                                    <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">{specialtiesPageTitle}</h1>
                                </div>
                            )}
                            <div className="space-y-0">
                                {previewSpecialties.map((spec, index) => {
                                    const bgClass = (spec.id === "anxiety" || spec.id === "infants" || spec.id === "trauma") ? "bg-[#f2ede4]" : "bg-white";
                                    const ctaBgClass = (spec.id === "anxiety" || spec.id === "infants" || spec.id === "trauma") ? "bg-white" : "bg-[#f2ede4]";
                                    const section = (
                                        <section key={spec.id} className={`${bgClass} py-24 border-t border-black/[0.03]`}>
                                            <div className="container mx-auto px-6 max-w-6xl">
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                                                    <div className="lg:col-span-6 space-y-8 text-left">
                                                        <h2 className="text-[32px] sm:text-[38px] font-serif text-[#333a42] font-normal leading-tight">{spec.title}</h2>
                                                        <div className="space-y-5 text-sm sm:text-base text-[#4a535e] leading-relaxed font-normal">
                                                            {spec.paragraphs.map((p: string, i: number) => <p key={i}>{p}</p>)}
                                                        </div>
                                                        <div className={`${ctaBgClass} p-8 sm:p-10 rounded-none border border-black/[0.02] shadow-sm space-y-6`}>
                                                            <div className="space-y-2">
                                                                <p className="text-[14px] font-bold text-[#333a42] tracking-wide font-sans">{specialtiesCtaTitle}</p>
                                                                <p className="text-[12px] sm:text-[13px] text-[#4a535e]/85 leading-relaxed">{specialtiesCtaDesc}</p>
                                                            </div>
                                                            <div className="inline-flex bg-[#333a42] text-white rounded-none font-semibold h-12 px-8 items-center text-[13px] cursor-default">{specialtiesCtaButton}</div>
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-6 w-full flex justify-center">
                                                        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-[20px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-black/[0.02]">
                                                            <img src={spec.image} alt={spec.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    );
                                    if (!showEditMode) return section;
                                    return (
                                        <Editable key={spec.id} label={`Edit "${spec.title}"`} onClick={() => openEdit({
                                            sectionLabel: `Specialty: ${spec.id}`,
                                            fields: [
                                                { key: "title", label: "Section Title", type: "text", value: spec.title },
                                                { key: "image", label: "Section Image", type: "image", value: spec.image },
                                                { key: "paragraphs", label: "Description Paragraphs", type: "list", value: spec.paragraphs, placeholder: "One paragraph per line" },
                                                { key: "ctaTitle", label: "CTA Card Title", type: "text", value: specialtiesCtaTitle },
                                                { key: "ctaDesc", label: "CTA Card Description", type: "textarea", value: specialtiesCtaDesc },
                                                { key: "ctaBtn", label: "CTA Button Text", type: "text", value: specialtiesCtaButton },
                                            ],
                                            onSave: (v) => {
                                                const updated = { ...specialtiesContent };
                                                updated[spec.id] = { ...updated[spec.id], title: v.title, image: v.image, paragraphs: v.paragraphs };
                                                setSpecialtiesContent(updated);
                                                setSpecialtiesCtaTitle(v.ctaTitle as string);
                                                setSpecialtiesCtaDesc(v.ctaDesc as string);
                                                setSpecialtiesCtaButton(v.ctaBtn as string);
                                            }
                                        })}>{section}</Editable>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ═══════ SERVICES PAGE ═══════════════════════════════════ */}
                    {activeTab === "services" && (
                        <div className="bg-[#f2ede4] min-h-screen font-sans text-[#4a535e]">
                            {showEditMode ? (
                                <Editable label="Hero Section" onClick={() => openEdit({
                                    sectionLabel: "Services — Hero Banner",
                                    fields: [
                                        { key: "img", label: "Hero Background Image", type: "image", value: servicesHeroImg },
                                        { key: "title", label: "Hero Title", type: "text", value: servicesHeroTitle },
                                        { key: "desc", label: "Hero Description", type: "textarea", value: servicesHeroDesc },
                                    ],
                                    onSave: (v) => { setServicesHeroImg(v.img as string); setServicesHeroTitle(v.title as string); setServicesHeroDesc(v.desc as string); }
                                })}>
                                    <ServicesHeroSection heroImg={servicesHeroImg} heroTitle={servicesHeroTitle} heroDesc={servicesHeroDesc} />
                                </Editable>
                            ) : <ServicesHeroSection heroImg={servicesHeroImg} heroTitle={servicesHeroTitle} heroDesc={servicesHeroDesc} />}

                            {showEditMode ? (
                                <Editable label="Fees Section" onClick={() => openEdit({
                                    sectionLabel: "Services — Fees & Policies",
                                    fields: [
                                        { key: "feesTitle", label: "Fees Section Title", type: "text", value: servicesFeesTitle },
                                        { key: "feesSubtitle", label: "Fees Subtitle / Rate Disclosure", type: "textarea", value: servicesFeesSubtitle },
                                        { key: "oonTitle", label: "Out-of-Network Statement Header", type: "text", value: servicesOonTitle },
                                        { key: "oonDesc", label: "Out-of-Network Description", type: "textarea", value: servicesOonDesc },
                                        { key: "reimburse", label: "Reimbursement Information", type: "textarea", value: servicesReimbursement },
                                    ],
                                    onSave: (v) => { setServicesFeesTitle(v.feesTitle as string); setServicesFeesSubtitle(v.feesSubtitle as string); setServicesOonTitle(v.oonTitle as string); setServicesOonDesc(v.oonDesc as string); setServicesReimbursement(v.reimburse as string); }
                                })}>
                                    <ServicesFeesSection feesTitle={servicesFeesTitle} feesSubtitle={servicesFeesSubtitle} oonTitle={servicesOonTitle} oonDesc={servicesOonDesc} reimbursement={servicesReimbursement} />
                                </Editable>
                            ) : <ServicesFeesSection feesTitle={servicesFeesTitle} feesSubtitle={servicesFeesSubtitle} oonTitle={servicesOonTitle} oonDesc={servicesOonDesc} reimbursement={servicesReimbursement} />}
                        </div>
                    )}

                    {/* ═══════ CONTACT PAGE ════════════════════════════════════ */}
                    {activeTab === "contact" && (
                        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#5c6670] pb-24">
                            {showEditMode ? (
                                <Editable label="Hero Header" onClick={() => openEdit({
                                    sectionLabel: "Contact — Hero Header",
                                    fields: [
                                        { key: "tagline", label: "Small Tagline", type: "text", value: contactIntakeTagline },
                                        { key: "title", label: "Page Title", type: "text", value: contactHeroTitle },
                                        { key: "desc", label: "Page Description", type: "textarea", value: contactHeroDesc },
                                    ],
                                    onSave: (v) => { setContactIntakeTagline(v.tagline as string); setContactHeroTitle(v.title as string); setContactHeroDesc(v.desc as string); }
                                })}>
                                    <ContactHeroSection tagline={contactIntakeTagline} title={contactHeroTitle} desc={contactHeroDesc} />
                                </Editable>
                            ) : <ContactHeroSection tagline={contactIntakeTagline} title={contactHeroTitle} desc={contactHeroDesc} />}

                            <section className="container mx-auto px-4 max-w-5xl py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                <div className="lg:col-span-5 space-y-8">
                                    {showEditMode ? (
                                        <Editable label="Info Block" onClick={() => openEdit({
                                            sectionLabel: "Contact — Info & Coordinates",
                                            fields: [
                                                { key: "infoTitle", label: "Info Block Title", type: "text", value: contactInfoTitle },
                                                { key: "infoDesc", label: "Info Description", type: "textarea", value: contactInfoDesc },
                                                { key: "emailLabel", label: "Email Block Header", type: "text", value: contactEmailLabel },
                                                { key: "email", label: "Email Address", type: "text", value: contactEmail },
                                                { key: "emailSub", label: "Email Subtext", type: "text", value: contactEmailSub },
                                                { key: "phoneLabel", label: "Phone Block Header", type: "text", value: contactPhoneLabel },
                                                { key: "phone", label: "Phone Number", type: "text", value: contactPhone },
                                                { key: "hours", label: "Business Hours", type: "text", value: contactHours },
                                                { key: "phoneSub", label: "Phone Subtext", type: "text", value: contactPhoneSub },
                                                { key: "addrLabel", label: "Address Block Header", type: "text", value: contactAddressLabel },
                                                { key: "addr", label: "Address / Location", type: "text", value: contactAddress },
                                                { key: "addrSub", label: "Address Subtext", type: "text", value: contactAddressSub },
                                            ],
                                            onSave: (v) => {
                                                setContactInfoTitle(v.infoTitle as string); setContactInfoDesc(v.infoDesc as string);
                                                setContactEmailLabel(v.emailLabel as string); setContactEmail(v.email as string); setContactEmailSub(v.emailSub as string);
                                                setContactPhoneLabel(v.phoneLabel as string); setContactPhone(v.phone as string); setContactHours(v.hours as string); setContactPhoneSub(v.phoneSub as string);
                                                setContactAddressLabel(v.addrLabel as string); setContactAddress(v.addr as string); setContactAddressSub(v.addrSub as string);
                                            }
                                        })}>
                                            <ContactInfoBlock infoTitle={contactInfoTitle} infoDesc={contactInfoDesc} emailLabel={contactEmailLabel} email={contactEmail} emailSub={contactEmailSub} phoneLabel={contactPhoneLabel} phone={contactPhone} hours={contactHours} phoneSub={contactPhoneSub} addrLabel={contactAddressLabel} addr={contactAddress} addrSub={contactAddressSub} />
                                        </Editable>
                                    ) : <ContactInfoBlock infoTitle={contactInfoTitle} infoDesc={contactInfoDesc} emailLabel={contactEmailLabel} email={contactEmail} emailSub={contactEmailSub} phoneLabel={contactPhoneLabel} phone={contactPhone} hours={contactHours} phoneSub={contactPhoneSub} addrLabel={contactAddressLabel} addr={contactAddress} addrSub={contactAddressSub} />}

                                    {showEditMode ? (
                                        <Editable label="Q&A Card" onClick={() => openEdit({
                                            sectionLabel: "Contact — Q&A Security Card",
                                            fields: [
                                                { key: "qaTitle", label: "Q&A Title", type: "text", value: contactQaTitle },
                                                { key: "qaDesc", label: "Q&A Answer", type: "textarea", value: contactQaDesc },
                                            ],
                                            onSave: (v) => { setContactQaTitle(v.qaTitle as string); setContactQaDesc(v.qaDesc as string); }
                                        })}>
                                            <ContactQaCard qaTitle={contactQaTitle} qaDesc={contactQaDesc} />
                                        </Editable>
                                    ) : <ContactQaCard qaTitle={contactQaTitle} qaDesc={contactQaDesc} />}
                                </div>

                                <div className="lg:col-span-7">
                                    {showEditMode ? (
                                        <Editable label="Inquiry Form" onClick={() => openEdit({
                                            sectionLabel: "Contact — Inquiry Form",
                                            fields: [
                                                { key: "formTitle", label: "Form Title", type: "text", value: contactFormTitle },
                                                { key: "formDesc", label: "Form Disclaimer", type: "textarea", value: contactFormDesc },
                                                { key: "formBtn", label: "Submit Button Text", type: "text", value: contactFormButton },
                                            ],
                                            onSave: (v) => { setContactFormTitle(v.formTitle as string); setContactFormDesc(v.formDesc as string); setContactFormButton(v.formBtn as string); }
                                        })}>
                                            <ContactFormCard formTitle={contactFormTitle} formDesc={contactFormDesc} formButton={contactFormButton} />
                                        </Editable>
                                    ) : <ContactFormCard formTitle={contactFormTitle} formDesc={contactFormDesc} formButton={contactFormButton} />}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ═══════ BRANDING PAGE ═══════════════════════════════════ */}
                    {activeTab === "branding" && (
                        <div style={{ backgroundColor: backgroundColor, fontFamily: `'${fontSans}', sans-serif`, color: textColor }} className="min-h-screen">
                            {showEditMode ? (
                                <Editable label="Brand Colors & Fonts" onClick={() => openEdit({
                                    sectionLabel: "Brand Colors & Typography",
                                    fields: [
                                        { key: "primary", label: "Primary Accent Color", type: "color", value: primaryColor },
                                        { key: "bg", label: "Background Color", type: "color", value: backgroundColor },
                                        { key: "secondary", label: "Secondary / Header Color", type: "color", value: secondaryColor },
                                        { key: "text", label: "Body Text Color", type: "color", value: textColor },
                                    ],
                                    onSave: (v) => { setPrimaryColor(v.primary as string); setBackgroundColor(v.bg as string); setSecondaryColor(v.secondary as string); setTextColor(v.text as string); }
                                })}>
                                    <BrandColorSwatches primary={primaryColor} bg={backgroundColor} secondary={secondaryColor} text={textColor} />
                                </Editable>
                            ) : <BrandColorSwatches primary={primaryColor} bg={backgroundColor} secondary={secondaryColor} text={textColor} />}

                            {showEditMode ? (
                                <Editable label="Typography" onClick={() => openEdit({
                                    sectionLabel: "Typography",
                                    fields: [
                                        { key: "serif", label: "Serif Font (headings)", type: "text", value: fontSerif, placeholder: "Merriweather" },
                                        { key: "sans", label: "Sans Font (body)", type: "text", value: fontSans, placeholder: "Raleway" },
                                    ],
                                    onSave: (v) => { setFontSerif(v.serif as string); setFontSans(v.sans as string); }
                                })}>
                                    <BrandTypographyShowcase fontSerif={fontSerif} fontSans={fontSans} secondaryColor={secondaryColor} textColor={textColor} primaryColor={primaryColor} />
                                </Editable>
                            ) : <BrandTypographyShowcase fontSerif={fontSerif} fontSans={fontSans} secondaryColor={secondaryColor} textColor={textColor} primaryColor={primaryColor} />}
                        </div>
                    )}

                    {activeTab !== "approach" && activeTab !== "team" && (
                        showEditMode ? (
                            <Editable label="Footer" onClick={() => openEdit({
                                sectionLabel: "Site Footer",
                                fields: [
                                    { key: "logo", label: "Logo Image", type: "image", value: logoUrl },
                                    { key: "tagline", label: "Brand Tagline (under logo)", type: "text", value: footerTagline },
                                    { key: "readyText", label: "CTA Tagline", type: "text", value: footerReadyText },
                                    { key: "btnText", label: "CTA Button Text", type: "text", value: footerBtnText },
                                    { key: "fn1", label: "Footer Link 1", type: "text", value: navItems[0]?.name || "Home" },
                                    { key: "fn2", label: "Footer Link 2", type: "text", value: navItems[1]?.name || "Our Approach" },
                                    { key: "fn3", label: "Footer Link 3", type: "text", value: navItems[2]?.name || "Meet the Team" },
                                    { key: "fn4", label: "Footer Link 4", type: "text", value: navItems[3]?.name || "Specialties" },
                                    { key: "fn5", label: "Footer Link 5", type: "text", value: navItems[4]?.name || "Services and Fees" },
                                    { key: "fn6", label: "Footer Link 6", type: "text", value: navItems[5]?.name || "Blog" },
                                ],
                                onSave: (v) => {
                                    setLogoUrl(v.logo as string);
                                    setFooterTagline(v.tagline as string);
                                    setFooterReadyText(v.readyText as string);
                                    setFooterBtnText(v.btnText as string);
                                    setNavItems([
                                        { ...navItems[0], name: v.fn1 as string },
                                        { ...navItems[1], name: v.fn2 as string },
                                        { ...navItems[2], name: v.fn3 as string },
                                        { ...navItems[3], name: v.fn4 as string },
                                        { ...navItems[4], name: v.fn5 as string },
                                        { ...navItems[5], name: v.fn6 as string },
                                    ]);
                                }
                            })}>
                                <SiteFooter logoUrl={logoUrl} tagline={footerTagline} readyText={footerReadyText} btnText={footerBtnText} navItems={navItems} />
                            </Editable>
                        ) : <SiteFooter logoUrl={logoUrl} tagline={footerTagline} readyText={footerReadyText} btnText={footerBtnText} navItems={navItems} />
                    )}
                </div>
            </div>

            {/* ═══ EDIT DRAWER ═════════════════════════════════════════════════ */}
            {editPanel && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-[190] backdrop-blur-[1px]" onClick={() => setEditPanel(null)} />
                    <EditDrawer panel={editPanel} onClose={() => setEditPanel(null)} token={session?.accessToken as string} />
                </>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS (exact mirrors of client-side pages)
// ═══════════════════════════════════════════════════════════════════════════════

function SiteHeader({ logoUrl, btnText, navItems }: { logoUrl: string; btnText: string; navItems: {name:string;href:string}[] }) {
    return (
        <header className="w-full bg-[#FDF8F5] border-b border-black/[0.04] py-2 relative z-40 font-sans">
            <div className="container mx-auto px-4 max-w-6xl h-24 flex items-center justify-between">
                <img src={logoUrl} alt="Logo" className="object-contain h-14 w-auto max-w-[220px]" />
                <div className="flex items-center gap-10">
                    <nav className="flex items-center gap-8">
                        {navItems.map(n => (
                            <span key={n.href} className="text-sm font-medium text-[#5c6670]">{n.name}</span>
                        ))}
                    </nav>
                    <div className="bg-[#5c6670] text-white rounded-[2px] font-semibold text-sm h-11 px-6 flex items-center cursor-default">{btnText}</div>
                </div>
            </div>
        </header>
    );
}

function SiteFooter({ logoUrl, tagline, readyText, btnText, navItems }: { logoUrl: string; tagline: string; readyText: string; btnText: string; navItems: {name:string;href:string}[] }) {
    return (
        <footer className="bg-[#424c56] text-white/95 font-sans">
            <div className="container mx-auto px-6 max-w-7xl py-16 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
                    <div className="flex flex-col items-start space-y-4">
                        <img src={logoUrl} alt="Logo" className="object-contain h-12 sm:h-14 w-auto" />
                        <p className="text-[#e1ddd3]/70 text-sm leading-relaxed max-w-[260px]">{tagline}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7ebac8] mb-4">Navigation</p>
                        {navItems.map(link => (
                            <span key={link.href} className="text-[15px] font-medium tracking-wide text-[#e1ddd3] py-1">{link.name}</span>
                        ))}
                    </div>
                    <div className="flex flex-col items-start lg:items-end space-y-5">
                        <div className="lg:text-right space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7ebac8]">Get Started</p>
                            <p className="text-[#e1ddd3] font-normal text-[16px] sm:text-[18px] tracking-wide">{readyText}</p>
                        </div>
                        <div className="bg-white text-[#424c56] font-semibold px-8 py-4 rounded-none cursor-default text-[15px] tracking-wide">{btnText}</div>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/[0.06]">
                <div className="container mx-auto px-6 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[#e1ddd3]/40 text-[11px] tracking-wide">© {new Date().getFullYear()} Reframe Psychology Group. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

function HomeHeroSection({ heroImg, heroTitle, heroSubheading, heroDesc, heroCtaText }: any) {
    return (
        <section className="relative min-h-[90vh] w-full flex items-center justify-center bg-cover bg-center font-sans border-b border-black/[0.04] py-28 lg:py-36" style={{ backgroundImage: `url('${heroImg}')` }}>
            <div className="absolute inset-0 bg-white/5" />
            <div className="container relative z-10 mx-auto px-4 max-w-7xl text-center">
                <div className="space-y-10">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-serif text-[#333a42] leading-[1.08] tracking-tight max-w-[1150px] mx-auto font-medium text-balance">{heroTitle}</h1>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[38px] xl:text-[42px] font-serif italic text-[#333a42] max-w-4xl mx-auto font-light leading-relaxed mt-6">{heroSubheading}</h2>
                    <p className="mx-auto max-w-3xl text-base sm:text-lg lg:text-[24px] xl:text-[26px] text-[#333a42] leading-relaxed font-medium tracking-wide pt-4">{heroDesc}</p>
                    <div className="pt-8"><div className="inline-flex bg-[#4a535e] text-white rounded-none font-semibold text-sm tracking-widest uppercase h-14 px-12 items-center cursor-default">{heroCtaText}</div></div>
                </div>
            </div>
        </section>
    );
}

function CaliforniaBannerSection({ bannerTitle, bannerDesc }: any) {
    return (
        <section className="bg-[#e1ddd3] py-24 lg:py-28 font-sans text-[#333a42] border-b border-black/[0.04]">
            <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif italic font-light tracking-wide text-[#333a42] leading-tight">{bannerTitle}</h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-[23px] leading-[1.65] text-[#333a42]/90 max-w-4xl mx-auto font-medium">{bannerDesc}</p>
            </div>
        </section>
    );
}

/* ── TeamShowcaseTitleBar: just the heading row ── */
function TeamShowcaseTitleBar({ title }: { title: string }) {
    return (
        <div className="bg-[#fdf8f5] pt-28 lg:pt-36 pb-0 text-center">
            <h2 className="text-[44px] md:text-[48px] font-serif text-[#333a42] font-normal tracking-wide leading-tight">
                {title || "Meet the Team"}
            </h2>
        </div>
    );
}

/* ── TeamMemberCard: exact replica of the client-side card ── */
function TeamMemberCard({ member }: { member: TeamMember }) {
    return (
        <div className="w-[320px] sm:w-[340px] h-[330px] sm:h-[345px] bg-[#d2c9b7] border border-[#c4b9a3]/40 rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.14)] p-6 pt-[110px] sm:pt-[120px] relative flex flex-col items-center text-center pb-6">
            {/* Circular overlapping photo — exact match to client side */}
            <div className="w-[185px] h-[185px] sm:w-[200px] sm:h-[200px] rounded-full border-[8px] border-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] absolute top-[-92px] sm:top-[-100px] left-1/2 -translate-x-1/2 overflow-hidden bg-muted">
                <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover scale-[1.3] origin-center"
                />
            </div>
            {/* Card body */}
            <div className="flex-grow flex flex-col justify-between w-full h-full pb-1">
                <div className="flex flex-col items-center">
                    <h3 className="text-[20px] sm:text-[21px] md:text-[22px] font-sans font-extrabold text-[#333a42] leading-tight tracking-wide">{member.name}</h3>
                    <div className="w-10 h-[1.5px] bg-[#333a42]/30 my-2.5" />
                    <p className="text-[13px] font-sans font-semibold text-[#4a535e] leading-snug tracking-wide">{member.role}</p>
                    <p className="text-[12px] font-sans text-[#4a535e]/90 leading-relaxed max-w-[270px] pt-1 font-medium tracking-wide">{member.specialties}</p>
                </div>
                <div className="pt-2">
                    <span className="font-serif italic text-[14px] sm:text-[15px] text-[#333a42]">Read More</span>
                </div>
            </div>
        </div>
    );
}

/* ── TeamPortraitApproach: Section 1 of /team page ── */
function TeamPortraitApproach({ profile }: { profile: { name: string; role: string; credentials: string; image: string; approach: string[] } }) {
    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
                    <div className="md:col-span-5 lg:col-span-4 space-y-6 text-left">
                        <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-black/[0.03]">
                            <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="pb-6 max-w-[280px]">
                            <h2 className="text-[22px] font-serif text-[#333a42] font-semibold leading-tight">{profile.name}</h2>
                            <p className="text-[15px] font-sans text-[#4a535e] mt-1">{profile.role}</p>
                            {profile.credentials && <p className="text-[10px] tracking-widest font-bold text-[#7ebac8] uppercase mt-2">{profile.credentials}</p>}
                            <div className="w-12 h-[1px] bg-[#333a42]/30 mt-5" />
                        </div>
                    </div>
                    <div className="md:col-span-7 lg:col-span-8 space-y-6 text-left md:pt-2">
                        <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Approach</h2>
                        <div className="space-y-5 text-base sm:text-[17px] text-[#4a535e] leading-relaxed font-normal">
                            {profile.approach.map((para, idx) => <p key={idx}>{para}</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── TeamBeyondTherapy: Section 2 of /team page ── */
function TeamBeyondTherapy({ beyondTherapy }: { beyondTherapy: string }) {
    return (
        <section className="bg-[#dbded7] py-20 border-t border-b border-black/[0.02]">
            <div className="container mx-auto px-6 max-w-5xl text-center space-y-6">
                <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal tracking-tight">Beyond Therapy</h2>
                <div className="relative max-w-4xl mx-auto px-12 sm:px-16 flex items-start gap-4">
                    <span className="text-[54px] font-serif font-bold text-[#424c56]/60 leading-none select-none absolute left-0 top-0">&ldquo;</span>
                    <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-[#4a535e] leading-relaxed font-medium text-left">{beyondTherapy}</p>
                    <span className="text-[54px] font-serif font-bold text-[#424c56]/60 leading-none select-none absolute right-0 bottom-0">&rdquo;</span>
                </div>
            </div>
        </section>
    );
}

/* ── TeamSpecialties: Section 3 of /team page ── */
function TeamSpecialties({ specialties }: { specialties: { title: string; desc: string }[] }) {
    return (
        <section className="bg-[#fdf8f5] py-24 border-b border-black/[0.03]">
            <div className="container mx-auto px-6 max-w-6xl text-center">
                <h2 className="text-2xl lg:text-[30px] font-serif text-[#333a42] mb-16 font-normal">Specialty Areas of Practice</h2>
                <div className={specialties.length === 4 ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                    {specialties.map((spec, idx) => (
                        <div key={idx} className="bg-[#f2ede4] p-8 flex flex-col justify-between items-center text-center rounded-none border border-[#e5e0d8]/40 shadow-sm">
                            <div className="space-y-4 w-full">
                                <h3 className="font-serif text-[17px] text-[#333a42] font-semibold tracking-wide leading-snug">{spec.title}</h3>
                                <div className="w-8 h-[1px] bg-[#333a42]/30 mx-auto" />
                                <p className="text-[14px] text-[#4a535e] leading-relaxed">{spec.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── TeamBackground: Section 4 of /team page ── */
function TeamBackground({ leftCol, rightCol }: { leftCol: string[]; rightCol: string[] }) {
    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-6 max-w-5xl text-center">
                <div className="flex flex-col items-center mb-12">
                    <div className="w-14 h-14 rounded-full bg-[#f2ede4] flex items-center justify-center text-[#333a42] mb-4 shadow-sm border border-black/[0.01]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
                    </div>
                    <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Background and Education</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 text-left text-sm sm:text-base leading-relaxed text-[#4a535e] font-normal">
                    <div className="space-y-4">{leftCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                    <div className="space-y-4">{rightCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                </div>
            </div>
        </section>
    );
}

function ApproachHeroSection({ heroImg, heroTitle }: any) {
    return (
        <section className="relative min-h-[60vh] sm:min-h-[70vh] w-full flex flex-col items-center justify-start bg-cover border-b border-black/[0.04] pt-28 lg:pt-36 pb-20 px-4" style={{ backgroundImage: `url('${heroImg}')`, backgroundPosition: "center 65%" }}>
            <div className="absolute inset-0 bg-white/5 pointer-events-none" />
            <div className="relative z-10 max-w-[1050px] mx-auto text-center">
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] xl:text-[58px] font-serif text-[#333a42] leading-[1.2] tracking-tight font-normal text-balance" dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, "<br/>") }} />
            </div>
        </section>
    );
}

function ApproachBeigeBanner({ insightTitle, connectionTitle, btnText }: any) {
    return (
        <section className="bg-[#dbd4c7] py-20 lg:py-24 text-center border-b border-black/[0.04] px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif italic text-[#333a42] leading-tight font-light">{insightTitle}</h2>
                <p className="text-base sm:text-lg lg:text-[17px] text-[#4a535e] font-medium tracking-wide">{connectionTitle}</p>
                <div className="pt-4"><div className="inline-flex bg-[#424c56] text-white rounded-none font-semibold text-sm h-12 px-8 items-center cursor-default">{btnText}</div></div>
            </div>
        </section>
    );
}

function ApproachChecklistSection({ attunementImg, attunementTitle, attunementPoints, beyondInsight }: any) {
    return (
        <section className="relative py-24 lg:py-32 bg-cover bg-center px-6" style={{ backgroundImage: `url('${attunementImg}')` }}>
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="container mx-auto max-w-7xl relative z-10 flex justify-end">
                <div className="w-full lg:w-1/2 bg-white/95 p-8 sm:p-10 lg:p-12 rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.12)] border border-[#e5e0d8] space-y-8">
                    <h3 className="text-[22px] sm:text-[26px] lg:text-[30px] font-serif text-[#333a42] leading-[1.25] font-normal text-left">{attunementTitle}</h3>
                    <ul className="space-y-4 sm:space-y-5 text-left">
                        {attunementPoints.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-4 text-[15px] sm:text-[16px] lg:text-[17px] font-sans font-medium text-[#4a535e] leading-snug">
                                <div className="w-6 h-6 rounded-full bg-[#424c56] flex items-center justify-center text-white shrink-0 mt-0.5"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-[15px] sm:text-[16px] lg:text-[17px] font-sans text-[#4a535e]/90 leading-relaxed border-t border-[#333a42]/10 pt-6 font-medium text-left">{beyondInsight}</p>
                </div>
            </div>
        </section>
    );
}

function ApproachFlexibilityBanner({ flexibilityTitle, stucknessDesc }: any) {
    return (
        <section className="py-16 lg:py-20 bg-white border-t border-black/[0.04] px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-serif italic text-[#333a42] leading-tight font-light">{flexibilityTitle}</h2>
                <div className="text-base sm:text-lg lg:text-[18px] text-[#4a535e] leading-relaxed font-medium">
                    {stucknessDesc.split("\n").map((line: string, idx: number) => <p key={idx}>{line}</p>)}
                </div>
            </div>
        </section>
    );
}

function ApproachDualCards({ leftImg, leftTitle, leftPoints, rightImg, rightTitle, rightPoints }: any) {
    return (
        <section className="py-24 lg:py-32 bg-[#fdf8f5] px-6 border-t border-b border-black/[0.04]">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[16px] overflow-hidden shadow-[0_24px_48px_rgba(30,28,24,0.12)] border border-[#e5e0d8]">
                    {[{ img: leftImg, title: leftTitle, points: leftPoints }, { img: rightImg, title: rightTitle, points: rightPoints }].map((card, i) => (
                        <div key={i} className={`relative h-[420px] sm:h-[450px] p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-cover bg-center ${i === 0 ? "border-b md:border-b-0 md:border-r border-[#e5e0d8]" : ""}`} style={{ backgroundImage: `url('${card.img}')` }}>
                            <div className="absolute inset-0 bg-white/75 pointer-events-none" />
                            <div className="relative z-10 space-y-6 text-left">
                                <h3 className="text-[21px] sm:text-[23px] lg:text-[27px] font-serif text-[#333a42] leading-[1.25] font-semibold max-w-md">{card.title}</h3>
                                <ul className="space-y-3.5">
                                    {card.points.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3.5 text-[15px] sm:text-[16px] lg:text-[17px] font-sans font-bold text-[#333a42]">
                                            <div className="w-6 h-6 rounded-full bg-white border border-[#333a42]/30 flex items-center justify-center text-[#333a42] shrink-0 shadow-sm"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ApproachCtaSection({ ctaTitle, btnText }: any) {
    return (
        <section className="bg-[#424c56] text-white py-20 px-8 sm:px-12 lg:px-16 border-t border-black/[0.04]">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <h3 className="font-serif text-xl sm:text-2xl lg:text-[26px] text-white font-normal leading-relaxed max-w-2xl text-left">{ctaTitle}</h3>
                <div className="inline-flex bg-white text-[#424c56] font-semibold px-8 h-14 items-center rounded-none cursor-default text-[16px] tracking-wide shrink-0">{btnText}</div>
            </div>
        </section>
    );
}

function ServicesHeroSection({ heroImg, heroTitle, heroDesc }: any) {
    return (
        <section className="relative w-full min-h-[45vh] lg:min-h-[50vh] flex items-center bg-cover bg-center" style={{ backgroundImage: `url('${heroImg}')` }}>
            <div className="absolute inset-0 bg-white/40 lg:bg-gradient-to-r lg:from-white/80 lg:via-white/50 lg:to-transparent" />
            <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10 max-w-6xl w-full text-left py-24">
                <div className="max-w-2xl space-y-4">
                    <h1 className="text-[36px] sm:text-[44px] font-serif text-[#333a42] font-normal leading-tight tracking-tight">{heroTitle}</h1>
                    <p className="text-[15px] sm:text-[17px] text-[#4a535e] leading-relaxed font-normal">{heroDesc}</p>
                </div>
            </div>
        </section>
    );
}

function ServicesFeesSection({ feesTitle, feesSubtitle, oonTitle, oonDesc, reimbursement }: any) {
    return (
        <section className="bg-[#f2ede4] py-24 sm:py-28 px-6">
            <div className="container mx-auto max-w-4xl text-center space-y-8 sm:space-y-10 text-[#4a535e]">
                <h2 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">{feesTitle}</h2>
                <div className="text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed space-y-8 font-normal max-w-3xl mx-auto">
                    <p className="whitespace-pre-line">{feesSubtitle}</p>
                    <p className="font-medium text-[#333a42]">{oonTitle}</p>
                    <p>{oonDesc}</p>
                    <p>{reimbursement}</p>
                </div>
            </div>
        </section>
    );
}

function ContactHeroSection({ tagline, title, desc }: any) {
    return (
        <section className="bg-white border-b border-black/5 py-16">
            <div className="container mx-auto px-4 max-w-4xl text-center space-y-4">
                <p className="text-xs tracking-widest uppercase font-semibold text-[#7ebac8]">{tagline}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#5c6670] tracking-tight">{title}</h1>
                <p className="text-[#5c6670]/80 text-base max-w-xl mx-auto">{desc}</p>
            </div>
        </section>
    );
}

function ContactInfoBlock({ infoTitle, infoDesc, emailLabel, email, emailSub, phoneLabel, phone, hours, phoneSub, addrLabel, addr, addrSub }: any) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-serif text-[#5c6670]">{infoTitle}</h2>
                <p className="text-sm leading-relaxed text-[#5c6670]/80 text-left">{infoDesc}</p>
            </div>
            <div className="space-y-6">
                {[
                    { icon: <MapPin className="w-5 h-5" />, label: addrLabel, main: addr, sub: addrSub },
                    { icon: <Mail className="w-5 h-5" />, label: emailLabel, main: email, sub: emailSub },
                    { icon: <Phone className="w-5 h-5" />, label: phoneLabel, main: phone, sub: hours || phoneSub },
                ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4 bg-white p-5 rounded-2xl border border-black/[0.02] shadow-sm text-left">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-[#7ebac8]/10 text-[#7ebac8]">{item.icon}</div>
                        <div>
                            <h3 className="font-semibold text-base text-[#5c6670]">{item.label}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.main}</p>
                            {item.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactQaCard({ qaTitle, qaDesc }: any) {
    return (
        <div className="bg-[#5c6670] text-white p-6 rounded-3xl space-y-3 relative overflow-hidden text-left">
            <HelpCircle className="w-6 h-6 text-[#7ebac8] relative z-10" />
            <h4 className="font-semibold text-sm relative z-10 uppercase tracking-widest text-[#7ebac8]">{qaTitle}</h4>
            <p className="text-xs leading-relaxed text-white/90 relative z-10">{qaDesc}</p>
            <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-white/5 skew-x-12 pointer-events-none" />
        </div>
    );
}

function ContactFormCard({ formTitle, formDesc, formButton }: any) {
    return (
        <div className="border-t-4 border-t-[#7ebac8] rounded-3xl shadow-sm bg-white border border-black/[0.02] p-6 sm:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-serif text-[#5c6670]">{formTitle}</h2>
                <p className="text-xs text-muted-foreground mt-2">{formDesc}</p>
            </div>
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">First name</label><div className="h-10 rounded-md border border-black/[0.08] px-3 flex items-center text-sm text-muted-foreground/60">Jane</div></div>
                    <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Last name</label><div className="h-10 rounded-md border border-black/[0.08] px-3 flex items-center text-sm text-muted-foreground/60">Doe</div></div>
                </div>
                <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Email Address</label><div className="h-10 rounded-md border border-black/[0.08] px-3 flex items-center text-sm text-muted-foreground/60">jane@example.com</div></div>
                <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Subject</label><div className="h-10 rounded-md border border-black/[0.08] px-3 flex items-center text-sm text-muted-foreground/60">e.g. Schedule Intake...</div></div>
                <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Your Inquiry</label><div className="h-[120px] rounded-md border border-black/[0.08] p-3 text-sm text-muted-foreground/60">Tell us a little bit about what you are seeking...</div></div>
                <div className="w-full h-12 text-base font-semibold rounded-sm bg-[#7ebac8] text-white flex items-center justify-center gap-2 cursor-default">
                    <Send className="w-4 h-4" /><span>{formButton}</span>
                </div>
            </div>
        </div>
    );
}

function BrandColorSwatches({ primary, bg, secondary, text }: any) {
    return (
        <div className="px-8 py-16">
            <h2 className="text-2xl font-bold mb-8 text-[#333a42]">Brand Color Palette</h2>
            <div className="grid grid-cols-4 gap-6 max-w-2xl">
                {[{ label: "Primary Accent", color: primary }, { label: "Background", color: bg }, { label: "Secondary / Headers", color: secondary }, { label: "Body Text", color: text }].map(s => (
                    <div key={s.label} className="text-center">
                        <div className="w-full h-24 rounded-xl border border-black/10 mb-3 shadow-sm" style={{ backgroundColor: s.color }} />
                        <p className="text-xs font-mono text-[#333a42] font-bold">{s.color}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BrandTypographyShowcase({ fontSerif, fontSans, secondaryColor, textColor, primaryColor }: any) {
    return (
        <div className="px-8 py-12 border-t border-black/[0.06] space-y-8">
            <h2 className="text-2xl font-bold text-[#333a42]">Typography System</h2>
            <div className="space-y-4">
                <p className="text-xs tracking-widest uppercase font-bold" style={{ color: primaryColor }}>Serif Heading Font: {fontSerif}</p>
                <h1 className="text-6xl font-normal leading-tight" style={{ fontFamily: `'${fontSerif}', serif`, color: secondaryColor }}>Attuned, Relational Clinical Psychology</h1>
                <h2 className="text-3xl font-light italic" style={{ fontFamily: `'${fontSerif}', serif`, color: secondaryColor }}>You've Simply Outgrown the Way You Learned to Cope</h2>
            </div>
            <div className="space-y-4 border-t border-black/[0.04] pt-8">
                <p className="text-xs tracking-widest uppercase font-bold" style={{ color: primaryColor }}>Sans Body Font: {fontSans}</p>
                <p className="text-xl leading-relaxed" style={{ fontFamily: `'${fontSans}', sans-serif`, color: textColor }}>This paragraph demonstrates the body font. It uses modern layout hierarchies, generous line height, and comfortable spacing to match the real site experience.</p>
                <div className="flex gap-4 mt-4">
                    <div className="px-8 py-3 text-white font-semibold text-sm cursor-default" style={{ backgroundColor: primaryColor, fontFamily: `'${fontSans}', sans-serif` }}>Primary CTA Button</div>
                    <div className="px-8 py-3 font-semibold text-sm cursor-default border-2" style={{ borderColor: primaryColor, color: primaryColor, fontFamily: `'${fontSans}', sans-serif` }}>Outline Button</div>
                </div>
            </div>
        </div>
    );
}

import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/api";
import { STATIC_TEAM_MEMBERS } from "../page";

// SimplePractice widget constants
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

export const dynamic = "force-dynamic";

interface TherapistData {
    slug: string;
    name: string;
    role: string;
    credentials: string;
    image: string;
    beyondTherapy: string;
    approach: string[];
    background: string[];
    specialties: { title: string; desc: string }[];
}

function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function QuoteMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 60 44" aria-hidden="true" className={className} fill="currentColor">
            <path d="M0 44V22C0 9.85 8.5 1.1 24 0v9.5c-7.7 1-11.5 5-11.6 12.5H24V44H0Z" />
            <path d="M34 44V22C34 9.85 42.5 1.1 58 0v9.5c-7.7 1-11.5 5-11.6 12.5H58V44H34Z" />
        </svg>
    );
}

function GraduationCapIcon() {
    return (
        <svg
            viewBox="0 0 64 44"
            aria-hidden="true"
            className="h-[44px] w-[64px] shrink-0 text-[#EEEAE0]"
            fill="currentColor"
        >
            <path d="M32 0 0 13l32 13 26-10.6V30h4V13L32 0Z" />
            <path d="M12 21.5V32c0 4.6 9 8 20 8s20-3.4 20-8V21.5L32 30 12 21.5Z" />
            <path d="M56.6 30.5h2.8L61 43h-6l1.6-12.5Z" />
        </svg>
    );
}

async function getProfile(slug: string): Promise<TherapistData | null> {
    const staticMatch = STATIC_TEAM_MEMBERS.find(item => item.slug === slug) ?? null;

    try {
        const res = await fetch(`${getApiUrl()}/api/v1/authors?team_only=true`, { cache: "no-store" });
        if (!res.ok) return staticMatch;
        const data = await res.json();
        const author = data.find((item: any) => toSlug(String(item.name || "")) === slug);
        if (!author) return staticMatch;

        const specialties = author.specialties_list?.length
            ? author.specialties_list.map((item: any) => ({
                title: item.title || "",
                desc: item.desc || item.description || "",
            })).filter((item: { title: string; desc: string }) => item.title)
            : [];

        return {
            slug,
            name: author.name,
            role: author.role || staticMatch?.role || "Clinical Psychologist",
            credentials: author.credentials || staticMatch?.credentials || "",
            image: author.profile_image_url || staticMatch?.image || "/assets/RPG Logo_Main Portrait.png",
            beyondTherapy: author.beyond_therapy || staticMatch?.beyondTherapy || "",
            approach: author.approach_paragraphs?.length ? author.approach_paragraphs : (staticMatch?.approach || []),
            background: author.background_paragraphs?.length ? author.background_paragraphs : (staticMatch?.background || []),
            specialties: specialties.length ? specialties : (staticMatch?.specialties || []),
        };
    } catch (err) {
        console.error("Failed to load therapist profile, using static data:", err);
        return staticMatch;
    }
}

export default async function TherapistDetailPage({ params }: { params: { slug: string } }) {
    const profile = await getProfile(params.slug);

    if (!profile) {
        notFound();
    }

    const approach = profile.approach.length ? profile.approach : ["Profile details will appear here after they are added in the CMS."];
    const background = profile.background.length ? profile.background : [];

    // Height of the two-column flow. Raleway 22px in a 544px column fits ~53.7 chars/line,
    // at 30px leading with 26px between paragraphs. Taking 58% of the total puts roughly
    // that share in the left column, so it fills first and one paragraph splits across —
    // the design's behaviour, rather than CSS's default balanced columns.
    const CHARS_PER_LINE = 53.7;
    const backgroundFlowHeight = Math.round(
        (background.reduce((n, p) => n + Math.max(1, Math.ceil(p.length / CHARS_PER_LINE)), 0) * 30
            + Math.max(0, background.length - 1) * 26) * 0.58
    );

    return (
        <div className="bg-[#FFFAF5] min-h-screen font-sans text-[#4a535e]">
            {/* ── Approach ─────────────────────────────────────────────── */}
            <section className="bg-[#FFFAF5] pb-[92px] pt-[18px]">
                <h1 className="text-center font-serif font-semibold text-[29px] sm:text-[39px] lg:text-[52px] leading-[1.1] tracking-[-0.015em] text-[#333a42]">
                    Meet the Team
                </h1>
                <div className="mx-auto mt-[86px] grid w-full max-w-[1194px] grid-cols-1 gap-x-[105px] gap-y-[48px] px-8 md:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
                    <div>
                        {profile.image ? (
                            <img
                                src={profile.image}
                                alt={profile.name}
                                loading="lazy"
                                className="aspect-[5/6] w-full rounded-[16px] object-cover object-top shadow-[0_10px_24px_-16px_rgba(0,0,0,0.4)]"
                            />
                        ) : (
                            <div className="aspect-[5/6] w-full rounded-[16px] bg-[#EEEAE0]" />
                        )}
                        <h2 className="mt-[34px] font-serif font-semibold text-[21px] sm:text-[26px] lg:text-[30px] leading-[1.2] text-[#333a42]">
                            {profile.name}
                        </h2>
                        <p className="mt-[16px] font-sans text-[20px] text-[#4a535e]">{profile.role}</p>
                        <div className="mt-[34px] ml-[36px] h-px w-[88px] bg-[#333a42]/40" />
                    </div>
                    <div>
                        <h3 className="font-sans text-[21px] sm:text-[27px] lg:text-[34px] font-bold leading-[1.2] text-[#333a42]">
                            Approach
                        </h3>
                        <div className="mt-[30px] space-y-[26px]">
                            {approach.map((text, idx) => (
                                <p
                                    key={idx}
                                    className="text-justify font-sans text-[21px] leading-[30px] text-[#4a535e] hyphens-auto [hyphens:auto] [-webkit-hyphens:auto]"
                                    lang="en"
                                >
                                    {text}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {profile.beyondTherapy && (
                <section className="bg-[#D7DBCE] py-[62px]">
                    <div className="mx-auto w-full max-w-[1160px] px-8">
                        <h2 className="text-center font-sans text-[21px] sm:text-[27px] lg:text-[34px] font-bold leading-[1.2] text-[#333a42]">
                            Beyond Therapy
                        </h2>
                        <div className="mt-[46px] grid grid-cols-[26px_minmax(0,1fr)_26px] gap-x-[10px] sm:grid-cols-[40px_minmax(0,1fr)_40px] sm:gap-x-[24px] lg:grid-cols-[60px_minmax(0,1fr)_60px] lg:gap-x-[45px]">
                            <QuoteMark className="mt-[6px] h-[22px] w-[26px] sm:h-[32px] sm:w-[38px] lg:h-[44px] lg:w-[52px] text-[#333a42]" />
                            <div className="space-y-[26px]">
                                {profile.beyondTherapy.split("\n\n").filter(p => p.trim()).map((para, idx) => (
                                    <p
                                        key={idx}
                                        lang="en"
                                        className="text-justify font-sans text-[21px] leading-[30px] text-[#4a535e] hyphens-auto [hyphens:auto] [-webkit-hyphens:auto]"
                                    >
                                        {para.trim()}
                                    </p>
                                ))}
                            </div>
                            <QuoteMark className="mt-auto h-[22px] w-[26px] sm:h-[32px] sm:w-[38px] lg:h-[44px] lg:w-[52px] rotate-180 text-[#333a42]" />
                        </div>
                    </div>
                </section>
            )}

            {profile.specialties.length > 0 && (
                <section className="bg-[#FFFAF5] pt-[92px] pb-[56px]">
                    {/* <=4 cards sit 2-up in a narrow container; 5+ go 3-up with any
                        remainder row centred (flex-wrap, not grid, so 5 renders 3 + 2 centred). */}
                    <div className={`mx-auto w-full px-8 ${profile.specialties.length > 4 ? "max-w-[1159px]" : "max-w-[790px]"}`}>
                        <h2 className="text-center font-sans font-bold text-[#333a42] text-[21px] sm:text-[27px] lg:text-[34px] leading-[1.2] mb-[42px]">
                            Specialty Areas of Practice
                        </h2>
                        <div className="flex flex-wrap justify-center gap-[12px] items-stretch">
                            {profile.specialties.map((spec, idx) => (
                                <article
                                    key={idx}
                                    className={`bg-[#EEEAE0] px-[23px] pt-[34px] pb-[30px] text-center flex flex-col w-full sm:w-[calc((100%-12px)/2)] ${profile.specialties.length > 4 ? "lg:w-[calc((100%-24px)/3)]" : ""}`}
                                >
                                    <h3 className="font-serif font-normal text-[#333a42] text-[20px] leading-[1.37] whitespace-pre-line">
                                        {spec.title}
                                    </h3>
                                    <div className="w-[36px] h-px bg-[#333a42]/30 mx-auto mt-[18px] mb-[20px]" />
                                    {spec.desc && (
                                        <p className="font-sans font-light text-[#4a535e] text-[20px] leading-[1.5] whitespace-pre-line">
                                            {spec.desc}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {background.length > 0 && (
                <section className="bg-[#FFFAF5] pt-[64px] pb-[110px]">
                    <div className="mx-auto w-full max-w-[1226px] px-8">
                        <div className="flex items-center justify-center gap-[26px]">
                            <GraduationCapIcon />
                            <h2 className="font-sans font-bold text-[#333a42] text-[21px] sm:text-[27px] lg:text-[34px] leading-[1.2]">
                                Background and Education
                            </h2>
                        </div>
                        {/* column-fill:auto (not the default "balance") so the left column fills
                            first and a paragraph breaks across the boundary, as in the design.
                            Height is estimated from the copy so the left column carries ~58%. */}
                        <div
                            lang="en"
                            className="mt-[70px] columns-1 gap-x-[75px] text-justify hyphens-auto md:columns-2 md:h-[var(--bg-flow-h)] md:[column-fill:auto] [hyphens:auto] [-webkit-hyphens:auto]"
                            style={{ ["--bg-flow-h" as string]: `${backgroundFlowHeight}px` }}
                        >
                            {background.map((para, idx) => (
                                <p
                                    key={idx}
                                    className="mb-[26px] font-sans font-normal text-[#4a535e] text-[22px] leading-[30px]"
                                >
                                    {para}
                                </p>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── SimplePractice CTA section ───────────────────────────── */}
            {(() => {
                const clinicianId = CLINICIAN_SP_IDS[profile.slug];
                return (
                    <section className="bg-[#333a42] py-16">
                        <div className="container mx-auto px-8 max-w-3xl text-center space-y-6">
                            <h2 className="font-sans font-bold text-white" style={{ fontSize: "clamp(16px, 2.8vw, 28px)" }}>
                                Ready to Work with {profile.name.split(",")[0]}?
                            </h2>
                            <p className="font-sans font-normal text-white/70" style={{ fontSize: "16px" }}>
                                Reach out directly or request an appointment. All communications go through our secure SimplePractice portal.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                                {/* Contact Me */}
                                <a
                                    href={SP_BASE_URL}
                                    data-spwidget-scope-id={SP_SCOPE_ID}
                                    data-spwidget-scope-uri="reframe"
                                    data-spwidget-application-id={SP_APP_ID}
                                    data-spwidget-channel="embedded_widget"
                                    data-spwidget-type="Contact form"
                                    data-spwidget-contact
                                    {...(clinicianId ? { "data-spwidget-clinician-id": clinicianId } : { "data-spwidget-scope-global": true })}
                                    data-spwidget-autobind
                                    className="inline-flex items-center gap-2.5 bg-white hover:bg-white/90 text-[#333a42] font-sans font-semibold text-[14px] tracking-wide px-8 py-4 transition-all duration-200 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    Contact Me
                                </a>
                                {/* Schedule a Consultation */}
                                <a
                                    href={SP_BASE_URL}
                                    data-spwidget-scope-id={SP_SCOPE_ID}
                                    data-spwidget-scope-uri="reframe"
                                    data-spwidget-application-id={SP_APP_ID}
                                    data-spwidget-type="OAR"
                                    {...(clinicianId ? { "data-spwidget-clinician-id": clinicianId } : { "data-spwidget-scope-global": true })}
                                    data-spwidget-autobind
                                    className="inline-flex items-center gap-2.5 bg-[#7ebac8] hover:bg-[#5aabb8] text-white font-sans font-semibold text-[14px] tracking-wide px-8 py-4 transition-all duration-200 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                    Schedule a Consultation
                                </a>
                            </div>
                            <p className="text-[11px] text-white/30 pt-2">
                                Secured by SimplePractice · HIPAA-compliant · Encrypted
                            </p>
                        </div>
                    </section>
                );
            })()}
        </div>
    );
}

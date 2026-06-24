import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { STATIC_TEAM_MEMBERS } from "../page";

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
    const half = Math.ceil(background.length / 2);
    const leftCol = background.slice(0, half);
    const rightCol = background.slice(half);

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-24">
            <section className="bg-[#FDF8F5] pt-16 pb-24 border-b border-black/[0.03]">
                <div className="container mx-auto px-8 max-w-6xl">
                    <div className="w-full text-center mb-16">
                        {/* H1 — 52px Merriweather Semibold */}
                        <h1 className="font-serif font-semibold text-[#333a42]" style={{ fontSize: "52px", lineHeight: "1.2" }}>Meet the Team</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                        <div className="md:col-span-5 space-y-4 text-left">
                            <div className="relative w-full aspect-[3/4] rounded-[12px] overflow-hidden">
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="pb-4">
                                {/* H4 — 28px Merriweather Semibold */}
                                <h2 className="font-serif font-semibold text-[#333a42] leading-tight" style={{ fontSize: "28px" }}>{profile.name}</h2>
                                {/* Role — 17px Raleway Regular */}
                                <p className="font-sans font-normal text-[#4a535e] mt-1" style={{ fontSize: "17px" }}>{profile.role}</p>
                                <div className="w-10 h-[1.5px] bg-[#333a42]/30 mt-4" />
                            </div>
                        </div>

                        <div className="md:col-span-7 space-y-6 text-left pr-10 lg:pr-16">
                            {/* B3 — 35px Raleway Bold */}
                            <h2 className="font-sans font-bold text-[#333a42]" style={{ fontSize: "35px" }}>Approach</h2>
                            {/* B2.2 — 25px Raleway Regular */}
                            <div className="space-y-4 font-sans font-normal text-[#4a535e] leading-[1.55] text-justify hyphens-auto" style={{ fontSize: "20px" }} lang="en">
                                {approach.map((para, idx) => <p key={idx}>{para}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {profile.beyondTherapy && (
                <section className="bg-[#D7DBCE] py-16 border-t border-b border-black/[0.02]">
                    <div className="container mx-auto px-8 max-w-5xl space-y-8">
                        {/* B3 — 35px Raleway Bold */}
                        <h2 className="font-sans font-bold text-[#333a42] text-center" style={{ fontSize: "35px" }}>Beyond Therapy</h2>
                        <div className="relative px-16">
                            {/* Opening quote */}
                            <span className="font-sans font-bold text-[#424c56] leading-none select-none absolute left-0 top-0" style={{ fontSize: "96px", lineHeight: 1 }}>&ldquo;</span>
                            {/* B2.2 — 25px Raleway Regular, justified with hyphens */}
                            <div className="space-y-5 font-sans font-normal text-[#4a535e] leading-[1.55] text-justify hyphens-auto" style={{ fontSize: "20px" }} lang="en">
                                {profile.beyondTherapy.split('\n\n').filter(p => p.trim()).map((para, idx) => (
                                    <p key={idx}>{para.trim()}</p>
                                ))}
                            </div>
                            {/* Closing quote */}
                            <span className="font-sans font-bold text-[#424c56] leading-none select-none absolute right-0 bottom-0" style={{ fontSize: "96px", lineHeight: 1 }}>&rdquo;</span>
                        </div>
                    </div>
                </section>
            )}

            {profile.specialties.length > 0 && (
                <section className="bg-[#FDF8F5] py-20 border-b border-black/[0.03]">
                    <div className="container mx-auto px-8 max-w-6xl text-center">
                        {/* B3 — 35px Raleway Bold */}
                        <h2 className="font-sans font-bold text-[#333a42] mb-14" style={{ fontSize: "35px" }}>Specialty Areas of Practice</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.specialties.map((spec, idx) => (
                                <div key={idx} className="bg-[#F0EAE2] p-10 flex flex-col items-center text-center min-h-[320px]">
                                    <div className="space-y-4 w-full">
                                        {/* H5 — 25px Merriweather Semibold */}
                                        <h3 className="font-serif font-semibold text-[#333a42] leading-snug" style={{ fontSize: "25px" }}>{spec.title}</h3>
                                        <div className="w-8 h-[1.5px] bg-[#333a42]/25 mx-auto" />
                                        {/* B2.3 — 22px Raleway Light */}
                                        {spec.desc && <p className="font-sans font-light text-[#4a535e] leading-relaxed" style={{ fontSize: "22px" }}>{spec.desc}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {background.length > 0 && (
                <section className="bg-[#fdf8f5] py-20">
                    <div className="container mx-auto px-8 max-w-5xl">
                        {/* Header: large icon + title, centered */}
                        <div className="flex items-center justify-center gap-5 mb-14">
                            <div className="w-16 h-16 rounded-full bg-[#F0EAE2] flex items-center justify-center shrink-0">
                                <GraduationCap className="w-9 h-9 text-[#333a42]/40" strokeWidth={1.5} />
                            </div>
                            {/* B3 — 35px Raleway Bold */}
                            <h2 className="font-sans font-bold text-[#333a42]" style={{ fontSize: "35px" }}>Background and Education</h2>
                        </div>
                        {/* Raleway Regular, justified with hyphens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 text-left font-sans font-normal text-[#4a535e] leading-[1.6] text-justify hyphens-auto" style={{ fontSize: "20px" }} lang="en">
                            <div className="space-y-5">{leftCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                            <div className="space-y-5">{rightCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

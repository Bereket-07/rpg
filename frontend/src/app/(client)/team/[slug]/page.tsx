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
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="w-full text-center mb-16">
                        <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-semibold tracking-tight">Meet the Team</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
                        <div className="md:col-span-5 lg:col-span-5 space-y-5 text-left">
                            <div className="relative w-full aspect-[4/5] rounded-[12px] overflow-hidden">
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="pb-4">
                                <h2 className="text-[22px] sm:text-[24px] font-serif text-[#333a42] font-bold leading-tight">{profile.name}</h2>
                                <p className="text-[14px] font-sans text-[#4a535e] mt-1.5">{profile.role}</p>
                                <div className="w-10 h-[1.5px] bg-[#333a42]/30 mt-4" />
                            </div>
                        </div>

                        <div className="md:col-span-7 lg:col-span-7 space-y-6 text-left md:pt-2">
                            <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Approach</h2>
                            <div className="space-y-5 text-base sm:text-[17px] text-[#4a535e] leading-relaxed font-normal text-justify">
                                {approach.map((para, idx) => <p key={idx}>{para}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {profile.beyondTherapy && (
                <section className="bg-[#dbded7] py-20 border-t border-b border-black/[0.02]">
                    <div className="container mx-auto px-6 max-w-5xl text-center space-y-6">
                        <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-bold tracking-tight">Beyond Therapy</h2>
                        <div className="relative max-w-4xl mx-auto px-14 sm:px-18 flex items-start gap-4">
                            <span className="font-serif font-bold text-[#424c56]/50 leading-none select-none absolute left-0 top-0" style={{fontSize:'68px'}}>&ldquo;</span>
                            <div className="space-y-4 text-[15px] sm:text-[16px] lg:text-[17px] text-[#4a535e] leading-relaxed font-normal text-left">
                                {profile.beyondTherapy.split('\n\n').filter(p => p.trim()).map((para, idx) => (
                                    <p key={idx}>{para.trim()}</p>
                                ))}
                            </div>
                            <span className="font-serif font-bold text-[#424c56]/50 leading-none select-none absolute right-0 bottom-[-16px]" style={{fontSize:'68px'}}>&rdquo;</span>
                        </div>
                    </div>
                </section>
            )}

            {profile.specialties.length > 0 && (
                <section className="bg-[#fdf8f5] py-24 border-b border-black/[0.03]">
                    <div className="container mx-auto px-6 max-w-6xl text-center">
                        <h2 className="text-2xl lg:text-[30px] font-serif text-[#333a42] mb-16 font-semibold">Specialty Areas of Practice</h2>
                        <div className={profile.specialties.length === 4 ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                            {profile.specialties.map((spec, idx) => (
                                <div key={idx} className="bg-[#f2ede4] p-8 flex flex-col justify-between items-center text-center rounded-[12px] border border-[#e5e0d8]/50">
                                    <div className="space-y-4 w-full">
                                        <h3 className="font-serif text-[17px] text-[#333a42] font-semibold tracking-wide leading-snug">{spec.title}</h3>
                                        <div className="w-8 h-[1px] bg-[#333a42]/30 mx-auto" />
                                        {spec.desc && <p className="text-[14px] text-[#4a535e] leading-relaxed">{spec.desc}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {background.length > 0 && (
                <section className="bg-[#fdf8f5] py-24">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-14 h-14 rounded-full bg-[#e8e2d8] flex items-center justify-center text-[#333a42] mb-4">
                                <GraduationCap className="w-8 h-8 stroke-[2]" />
                            </div>
                            <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-bold">Background and Education</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 text-left text-sm sm:text-base leading-relaxed text-[#4a535e] font-normal text-justify">
                            <div className="space-y-4">{leftCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                            <div className="space-y-4">{rightCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

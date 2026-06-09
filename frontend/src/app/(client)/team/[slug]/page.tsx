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
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/authors?team_only=true`, { cache: "no-store" });
        if (!res.ok) return null;
        const data = await res.json();
        const author = data.find((item: any) => toSlug(String(item.name || "")) === slug);
        if (!author) return null;
        const fallback = STATIC_TEAM_MEMBERS.find(item => item.slug === slug);
        const specialties = author.specialties_list?.length
            ? author.specialties_list.map((item: any) => ({
                title: item.title || "",
                desc: item.desc || item.description || "",
            })).filter((item: { title: string; desc: string }) => item.title)
            : [];

        return {
            slug,
            name: author.name,
            role: author.role || fallback?.role || "Clinical Psychologist",
            credentials: author.credentials || fallback?.credentials || "",
            image: author.profile_image_url || fallback?.image || "/assets/RPG Logo_Main Portrait.png",
            beyondTherapy: author.beyond_therapy || fallback?.beyondTherapy || "",
            approach: author.approach_paragraphs?.length ? author.approach_paragraphs : (fallback?.approach || []),
            background: author.background_paragraphs?.length ? author.background_paragraphs : (fallback?.background || []),
            specialties: specialties.length ? specialties : (fallback?.specialties || []),
        };
    } catch (err) {
        console.error("Failed to load therapist profile:", err);
        return null;
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
            <section className="bg-white pt-16 pb-24 border-b border-black/[0.03]">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="w-full text-center mb-16">
                        <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">OUR SPECIALISTS</p>
                        <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">Meet the Team</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
                        <div className="md:col-span-5 lg:col-span-4 space-y-6 text-left">
                            <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-black/[0.03]">
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                    className="w-full h-full object-cover grayscale-[8%] hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <div className="pb-6 max-w-[280px]">
                                <h2 className="text-[22px] font-serif text-[#333a42] font-semibold leading-tight">{profile.name}</h2>
                                <p className="text-[15px] font-sans text-[#4a535e] mt-1">{profile.role}</p>
                                {profile.credentials && (
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#7ebac8] mt-3 font-bold">{profile.credentials}</p>
                                )}
                                <div className="w-12 h-[1px] bg-[#333a42]/30 mt-5" />
                            </div>
                        </div>

                        <div className="md:col-span-7 lg:col-span-8 space-y-6 text-left md:pt-2">
                            <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Approach</h2>
                            <div className="space-y-5 text-base sm:text-[17px] text-[#4a535e] leading-relaxed font-normal">
                                {approach.map((para, idx) => <p key={idx}>{para}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {profile.beyondTherapy && (
                <section className="bg-[#dbded7] py-20 border-t border-b border-black/[0.02]">
                    <div className="container mx-auto px-6 max-w-5xl text-center space-y-6">
                        <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal tracking-tight">Beyond Therapy</h2>
                        <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-[#4a535e] leading-relaxed font-medium text-left max-w-4xl mx-auto">
                            {profile.beyondTherapy}
                        </p>
                    </div>
                </section>
            )}

            {profile.specialties.length > 0 && (
                <section className="bg-[#fdf8f5] py-24 border-b border-black/[0.03]">
                    <div className="container mx-auto px-6 max-w-6xl text-center">
                        <h2 className="text-2xl lg:text-[30px] font-serif text-[#333a42] mb-16 font-normal">Specialty Areas of Practice</h2>
                        <div className={profile.specialties.length === 4 ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                            {profile.specialties.map((spec, idx) => (
                                <div key={idx} className="bg-[#f2ede4] p-8 flex flex-col justify-between items-center text-center rounded-none border border-[#e5e0d8]/40 shadow-sm">
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
                <section className="bg-white py-24">
                    <div className="container mx-auto px-6 max-w-5xl text-center">
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-14 h-14 rounded-full bg-[#f2ede4] flex items-center justify-center text-[#333a42] mb-4 shadow-sm border border-black/[0.01]">
                                <GraduationCap className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Background and Education</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 text-left text-sm sm:text-base leading-relaxed text-[#4a535e] font-normal">
                            <div className="space-y-4">{leftCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                            <div className="space-y-4">{rightCol.map((para, idx) => <p key={idx}>{para}</p>)}</div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

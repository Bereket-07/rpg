"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";


const therapistsRow1Fallback = [
    {
        slug: "anat-cohen",
        name: "Anat Cohen, Ph.D.",
        role: "Clinical Psychologist, Co-Founder",
        specialties: "Individual Therapy, Parenting Support",
        image: "/assets/RPG_Images for UI/Anat copy.jpg"
    },
    {
        slug: "tamara-eromo",
        name: "Tamara Eromo, Psy.D.",
        role: "Clinical Psychologist, Co-Founder",
        specialties: "Couples Therapy, Parenting Support, Individual Therapy",
        image: "/assets/RPG_Images for UI/Tamara copy.jpg"
    },
    {
        slug: "wendy-eifert",
        name: "Wendy Eifert, Psy.D.",
        role: "Clinical Psychologist",
        specialties: "Individual Therapy, Couples Therapy",
        image: "/assets/RPG_Images for UI/Wendy copy.jpg"
    }
];

const therapistsRow2Fallback = [
    {
        slug: "hedieh-hakakian",
        name: "Hedieh Hakakian, Psy.D.",
        role: "Clinical Psychologist",
        specialties: "Individual Therapy, Couples Therapy, Parenting Support",
        image: "/assets/RPG_Images for UI/Hedieh copy.jpg"
    },
    {
        slug: "valarie-gardner",
        name: "Valarie Gardner, M.A., AMFT",
        role: "Marriage and Family Therapy Associate",
        specialties: "Individual Therapy, Couples Therapy, Parenting Support, EMDR",
        image: "/assets/RPG_Images for UI/Valarie copy.jpg"
    }
];

interface TherapistShowcaseProps {
    title?: string;
}

function getTherapistImageClass(slug: string) {
    if (slug && slug.includes("valarie-gardner")) {
        // Valarie's photo has her face higher up in the frame.
        // We use object-top and a softer zoom level to make her face fully visible.
        return "w-full h-full object-cover scale-[1.05] object-top origin-top group-hover:scale-[1.1] transition-all duration-500";
    }
    return "w-full h-full object-cover scale-[1.3] origin-center group-hover:scale-[1.35] transition-all duration-500";
}

export function TherapistShowcase({ title }: TherapistShowcaseProps) {
    const [row1, setRow1] = useState(therapistsRow1Fallback);
    const [row2, setRow2] = useState(therapistsRow2Fallback);

    useEffect(() => {
        let isMounted = true;
        async function fetchTherapists() {
            try {
                const res = await fetch(`${getApiUrl()}/api/v1/authors?team_only=true`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const mapped = data.map((auth: any) => {
                            const combinedFallback = [...therapistsRow1Fallback, ...therapistsRow2Fallback];
                            const fallback = combinedFallback.find(f => f.name.includes(auth.name) || auth.name.includes(f.name));
                            
                            // Map specialties list to string for overview
                            let specialtiesStr = fallback?.specialties || "Individual Therapy";
                            if (auth.specialties_list && auth.specialties_list.length > 0) {
                                specialtiesStr = auth.specialties_list.map((s: any) => s.title).join(", ");
                            }

                            const slug = auth.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

                            return {
                                slug: slug,
                                name: auth.name,
                                role: auth.role || fallback?.role || "Clinical Psychologist",
                                specialties: specialtiesStr,
                                image: auth.profile_image_url || fallback?.image || "/assets/RPG Logo_Main Portrait.png"
                            };
                        });

                        if (isMounted) {
                            setRow1(mapped.slice(0, 3));
                            setRow2(mapped.slice(3));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load dynamic team members for home showcase:", err);
            }
        }
        fetchTherapists();
        return () => { isMounted = false; };
    }, []);

    return (
        <section className="py-28 bg-[#fdf8f5] font-sans text-[#333a42] border-b border-black/[0.04]">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Title */}
                <div className="text-center mb-32">
                    <h2 className="text-[44px] md:text-[48px] font-serif text-[#333a42] font-normal tracking-wide leading-tight">
                        {title || "Meet the Team"}
                    </h2>
                </div>

                {/* Grid Layout: Row 1 (3 Columns) and Row 2 (2 Columns) */}
                <div className="space-y-24">
                    
                    {/* Row 1 (3 therapists) */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-28 lg:gap-x-12">
                        {row1.map((member, index) => (
                            <motion.div
                                key={member.slug}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="w-[320px] sm:w-[340px] h-[330px] sm:h-[345px] bg-[#d2c9b7] border border-[#c4b9a3]/40 rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.14)] p-6 pt-[110px] sm:pt-[120px] relative flex flex-col items-center text-center pb-6 hover:shadow-[0_28px_56px_rgba(30,28,24,0.22)] hover:-translate-y-1 transition-all duration-300 group"
                            >
                                {/* Circular Overlapping Photo */}
                                <div className="w-[185px] h-[185px] sm:w-[200px] sm:h-[200px] rounded-full border-[8px] border-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] absolute top-[-92px] sm:top-[-100px] left-1/2 -translate-x-1/2 overflow-hidden bg-muted">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className={getTherapistImageClass(member.slug)}
                                    />
                                </div>

                                {/* Card Body */}
                                <div className="flex-grow flex flex-col justify-between w-full h-full pb-1">
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-[20px] sm:text-[21px] md:text-[22px] font-sans font-extrabold text-[#333a42] leading-tight tracking-wide">
                                            {member.name}
                                        </h3>
                                        
                                        {/* Divider horizontal line */}
                                        <div className="w-10 h-[1.5px] bg-[#333a42]/30 my-2.5" />
                                        
                                        <p className="text-[13px] sm:text-[13px] md:text-[14px] font-sans font-semibold text-[#4a535e] leading-snug tracking-wide">
                                            {member.role}
                                        </p>
                                        <p className="text-[12px] sm:text-[12px] md:text-[13px] font-sans text-[#4a535e]/90 leading-relaxed max-w-[270px] pt-1 font-medium tracking-wide">
                                            {member.specialties}
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <Link 
                                            href={`/team/${member.slug}`} 
                                            className="font-serif italic text-[14px] sm:text-[15px] text-[#333a42] hover:text-[#5c6670] transition-colors"
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Row 2 (2 therapists - centered) */}
                    {row2.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-28 lg:gap-x-12">
                            {row2.map((member, index) => (
                                <motion.div
                                    key={member.slug}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    className="w-[320px] sm:w-[340px] h-[330px] sm:h-[345px] bg-[#d2c9b7] border border-[#c4b9a3]/40 rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.14)] p-6 pt-[110px] sm:pt-[120px] relative flex flex-col items-center text-center pb-6 hover:shadow-[0_28px_56px_rgba(30,28,24,0.22)] hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    {/* Circular Overlapping Photo */}
                                    <div className="w-[185px] h-[185px] sm:w-[200px] sm:h-[200px] rounded-full border-[8px] border-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] absolute top-[-92px] sm:top-[-100px] left-1/2 -translate-x-1/2 overflow-hidden bg-muted">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className={getTherapistImageClass(member.slug)}
                                        />
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex-grow flex flex-col justify-between w-full h-full pb-1">
                                        <div className="flex flex-col items-center">
                                            <h3 className="text-[20px] sm:text-[21px] md:text-[22px] font-sans font-extrabold text-[#333a42] leading-tight tracking-wide">
                                                {member.name}
                                            </h3>
                                            
                                            {/* Divider horizontal line */}
                                            <div className="w-10 h-[1.5px] bg-[#333a42]/30 my-2.5" />
                                            
                                            <p className="text-[13px] sm:text-[13px] md:text-[14px] font-sans font-semibold text-[#4a535e] leading-snug tracking-wide">
                                                {member.role}
                                            </p>
                                            <p className="text-[12px] sm:text-[12px] md:text-[13px] font-sans text-[#4a535e]/90 leading-relaxed max-w-[270px] pt-1 font-medium tracking-wide">
                                                {member.specialties}
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <Link 
                                                href={`/team/${member.slug}`} 
                                                className="font-serif italic text-[14px] sm:text-[15px] text-[#333a42] hover:text-[#5c6670] transition-colors"
                                            >
                                                Read More
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </section>
    );
}

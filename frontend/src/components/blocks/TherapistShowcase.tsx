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

/* Photo: 170px diameter, 85px above card top = 85px overlapping into card body */

function TherapistCard({ member, index }: { member: typeof therapistsRow1Fallback[0]; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative w-[380px] group"
            style={{ height: "525px" }}
        >
            {/* Card body with gradient stroke border */}
            <div
                className="absolute bottom-0 left-0 right-0 rounded-[16px] flex flex-col items-center text-center shadow-[0_24px_48px_rgba(30,28,24,0.14)] group-hover:shadow-[0_28px_56px_rgba(30,28,24,0.22)] group-hover:-translate-y-1 transition-all duration-300"
                style={{
                    top: "100px",
                    background: "linear-gradient(#D6CFC2, #D6CFC2) padding-box, linear-gradient(to bottom, #D6CFC2, #FFFAF5) border-box",
                    border: "1px solid transparent",
                    padding: "120px 24px 24px 24px",
                }}
            >
                <div className="flex-grow flex flex-col justify-between w-full h-full pb-1">
                    <div className="flex flex-col items-center">
                        {/* Name — 30px Raleway Bold */}
                        <h3
                            className="font-sans font-bold text-[#333a42] leading-tight tracking-wide"
                            style={{ fontSize: "30px" }}
                        >
                            {member.name}
                        </h3>

                        {/* Divider */}
                        <div className="w-10 h-[1.5px] bg-[#333a42]/45 my-2" />

                        {/* Role — 22px Raleway Medium */}
                        <p
                            className="font-sans font-medium text-[#333a42]/85 leading-snug tracking-wide"
                            style={{ fontSize: "22px" }}
                        >
                            {member.role}
                        </p>

                        {/* Specialties — 20px Raleway Light */}
                        <p
                            className="font-sans font-light text-[#4a535e] leading-snug max-w-[320px] pt-1 tracking-wide"
                            style={{ fontSize: "20px" }}
                        >
                            {member.specialties}
                        </p>
                    </div>

                    {/* Read More — 14px Merriweather Italic */}
                    <div className="pt-2">
                        <Link
                            href={`/team/${member.slug}`}
                            className="font-serif italic text-[#333a42] hover:text-[#5c6670] transition-colors"
                            style={{ fontSize: "14px" }}
                        >
                            Read More
                        </Link>
                    </div>
                </div>
            </div>

            {/* Circular photo — 200px, white border, transparent outside */}
            <div
                className="absolute left-1/2 -translate-x-1/2 z-10 rounded-full overflow-hidden bg-transparent group-hover:-translate-y-1 transition-all duration-300"
                style={{
                    width: "200px",
                    height: "200px",
                    top: "0px",
                    border: "8px solid white",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                }}
            >
                <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 group-hover:scale-[1.05]"
                />
            </div>
        </motion.div>
    );
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
                            const specialtiesStr = fallback?.specialties || "Individual Therapy";
                            const slug = auth.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

                            return {
                                slug,
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
        <section className="py-24 bg-[#fdf8f5] font-sans text-[#333a42]">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Section title — 52px Merriweather Semibold */}
                <div className="text-center mb-28">
                    <h2
                        className="font-serif font-semibold text-[#333a42]"
                        style={{ fontSize: "52px", lineHeight: "1.2" }}
                    >
                        {title || "Meet the Team"}
                    </h2>
                </div>

                {/* Row 1 — 3 therapists centered using flex */}
                <div className="flex flex-wrap sm:flex-nowrap justify-center gap-x-4 md:gap-x-8 lg:gap-x-12 gap-y-28">
                    {row1.map((member, index) => (
                        <TherapistCard key={member.slug} member={member} index={index} />
                    ))}
                </div>

                {/* Row 2 — remaining therapists centered using flex */}
                {row2.length > 0 && (
                    <div className="flex flex-wrap sm:flex-nowrap justify-center gap-x-4 md:gap-x-8 lg:gap-x-12 gap-y-28 mt-28">
                        {row2.map((member, index) => (
                            <TherapistCard key={member.slug} member={member} index={index} />
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}

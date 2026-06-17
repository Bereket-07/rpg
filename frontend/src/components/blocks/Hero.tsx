"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroProps {
    data?: any;
}

export function Hero({ data }: HeroProps) {
    const heroTitle = data?.hero_title || "You're Not Stuck Because You're Doing Something Wrong";
    const heroSubheading = data?.content?.hero_subheading || "You've Simply Outgrown the Way You Learned to Cope";
    const heroDesc = data?.hero_description || "Move beyond insight to change the patterns that shape your life.";
    const heroCtaText = data?.content?.hero_cta_text || "Request a Consultation";
    const heroImage = data?.hero_image_url || "/assets/RPG_Images for UI/Homepage_Image 1 copy.jpg";

    return (
        <section
            className="relative min-h-[88vh] w-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url('${heroImage}')` }}
        >
            {/* Very light overlay — the image is naturally bright, barely tint it */}
            <div className="absolute inset-0 bg-white/10" />

            <div className="container relative z-10 mx-auto px-6 sm:px-8 max-w-5xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="space-y-6"
                >
                    {/* H1 — Merriweather semibold serif, 2-line layout matching reference design */}
                    <h1
                        className="font-serif font-semibold text-[#333a42] leading-[1.1] tracking-tight text-balance"
                        style={{ fontSize: "clamp(28px, 3.5vw, 50px)" }}
                    >
                        {heroTitle}
                    </h1>

                    {/* Italic serif subheading — Merriweather italic, lighter weight */}
                    <h2
                        className="font-serif italic font-light text-[#333a42] leading-snug max-w-3xl mx-auto"
                        style={{ fontSize: "clamp(20px, 2.8vw, 32px)" }}
                    >
                        {heroSubheading}
                    </h2>

                    {/* Body text — Raleway, modest size matching screenshot */}
                    <p
                        className="font-sans text-[#333a42] leading-relaxed max-w-xl mx-auto pt-1"
                        style={{ fontSize: "clamp(14px, 1.4vw, 17px)" }}
                    >
                        {heroDesc}
                    </p>

                    {/* CTA — dark charcoal, square corners, Raleway */}
                    <div className="pt-4">
                        <Button
                            asChild
                            className="bg-[#3d4853] hover:bg-[#2d3740] text-white rounded-none font-sans font-semibold text-sm tracking-wide h-12 px-10 border-none shadow-none transition-colors duration-200"
                        >
                            <Link href="/contact">{heroCtaText}</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

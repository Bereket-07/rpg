"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroProps {
    data?: any;
}

export function Hero({ data }: HeroProps) {
    const heroTitle = data?.hero_title || "You’re Not Stuck Because You’re Doing Something Wrong";
    const heroSubheading = data?.content?.hero_subheading || "You’ve Simply Outgrown the Way You Learned to Cope";
    const heroDesc = data?.hero_description || "Move beyond insight to change the patterns that shape your life.";
    const heroCtaText = data?.content?.hero_cta_text || "Request a Consultation";
    const heroImage = data?.hero_image_url || "/assets/RPG_Images for UI/Homepage_Image 1 copy.jpg";

    return (
        <section 
            className="relative min-h-[90vh] w-full flex items-center justify-center bg-cover bg-center font-sans border-b border-black/[0.04] py-28 lg:py-36"
            style={{ 
                backgroundImage: `url('${heroImage}')`,
            }}
        >
            {/* Absolute overlay for lighting */}
            <div className="absolute inset-0 bg-white/5" />

            <div className="container relative z-10 mx-auto px-4 max-w-7xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="space-y-10 md:space-y-12"
                >
                    {/* Big Serif Heading */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-serif text-[#333a42] leading-[1.08] tracking-tight max-w-[1150px] mx-auto font-medium text-balance">
                        {heroTitle}
                    </h1>
                    
                    {/* Italic Serif Subheading */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[38px] xl:text-[42px] font-serif italic text-[#333a42] max-w-4xl mx-auto font-light leading-relaxed mt-6">
                        {heroSubheading}
                    </h2>

                    {/* Supporting Description text */}
                    <p className="mx-auto max-w-3xl text-base sm:text-lg lg:text-[24px] xl:text-[26px] text-[#333a42] leading-relaxed font-medium tracking-wide pt-4">
                        {heroDesc}
                    </p>

                    {/* consultation request CTA Button */}
                    <div className="pt-8">
                        <Button 
                            asChild 
                            className="bg-[#4a535e] hover:bg-[#333a42] text-white rounded-none font-semibold text-sm tracking-widest uppercase h-14 px-12 border-none shadow-lg transition-all duration-300"
                        >
                            <Link href="/contact">{heroCtaText}</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

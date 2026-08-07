"use client";

import { motion } from "framer-motion";

interface HeroProps {
    data?: any;
}

export function Hero({ data }: HeroProps) {
    const heroTitle = data?.hero_title || "You\u2019re Not Stuck Because You\u2019re Doing Something Wrong";
    const heroSubheading = data?.content?.hero_subheading || "You\u2019ve Simply Outgrown the Way You Learned to Cope";
    const heroDesc = data?.hero_description || "Move beyond insight to change the patterns that shape your life.";
    const heroCtaText = data?.content?.hero_cta_text || "Request a Consultation";
    const heroImage = data?.hero_image_url || "/assets/RPG_Images for UI/Homepage_Image 1 copy.jpg";

    return (
        <section
            className="home-hero relative w-full bg-cover bg-top"
            style={{
                backgroundImage: `url('${heroImage}')`,
            }}
        >
            {/* Very light overlay */}
            <div className="absolute inset-0 bg-white/10" />

            {/* 760px keeps the H1 breaking after "You’re" at 44px, as in the design
                (needs >=690px for that line, <831px or "Doing" pulls up onto line 1) */}
            <div className="home-hero-copy relative z-10 mx-auto px-6 w-full max-w-[760px] text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    {/* H1 — 44px, Merriweather Semibold, 120% line-height */}
                    <h1
                        className="font-serif text-[#4B5563]"
                        style={{ fontSize: "clamp(25px, 4.4vw, 44px)", lineHeight: "1.2", fontWeight: 600 }}
                    >
                        {heroTitle}
                    </h1>

                    {/* H3 — 22px, Merriweather Italic */}
                    <h3
                        className="mt-8 lg:mt-[18px] font-serif italic font-normal text-[#4B5563]"
                        style={{ fontSize: "clamp(16px, 2.2vw, 22px)", lineHeight: "1.2" }}
                    >
                        {heroSubheading}
                    </h3>

                    {/* B2 body — 25px, Raleway Medium */}
                    <p
                        className="mt-12 lg:mt-[60px] font-sans font-medium text-[#333a42] max-w-[420px]"
                        style={{ fontSize: "clamp(16px, 2.5vw, 25px)", lineHeight: "1.5" }}
                    >
                        {heroDesc}
                    </p>

                    {/* Button — SimplePractice appointment widget */}
                    <div className="mt-8 lg:mt-[30px]">
                        <a
                            href="https://reframe.clientsecure.me"
                            data-spwidget-scope-id="64787fd5-84f6-42ba-9955-816d91404e11"
                            data-spwidget-scope-uri="reframe"
                            data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
                            data-spwidget-type="OAR"
                            data-spwidget-scope-global
                            data-spwidget-autobind
                            className="inline-flex items-center justify-center bg-[#3d4853] hover:bg-[#2d3740] text-white font-sans font-medium transition-colors duration-200 cursor-pointer shadow-[0_4px_12px_rgba(30,40,50,0.22)]"
                            style={{ fontSize: "14.5px", height: "40px", paddingLeft: "28px", paddingRight: "28px" }}
                        >
                            {heroCtaText}
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

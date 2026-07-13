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
            className="relative w-full flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: `url('${heroImage}')`,
                minHeight: "calc(100vh - 72px)",
            }}
        >
            {/* Very light overlay */}
            <div className="absolute inset-0 bg-white/10" />

            <div className="relative z-10 mx-auto px-6 w-full max-w-[860px] text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    {/* H1 — 52px, Merriweather Semibold Italic, 120% line-height */}
                    <h1
                        className="font-serif italic text-[#333a42]"
                        style={{ fontSize: "52px", lineHeight: "1.2", fontWeight: 600 }}
                    >
                        {heroTitle}
                    </h1>

                    {/* H3 — 28px, Merriweather Italic */}
                    <h3
                        className="font-serif italic font-normal text-[#333a42]"
                        style={{ fontSize: "28px", lineHeight: "1.2", marginTop: "24px" }}
                    >
                        {heroSubheading}
                    </h3>

                    {/* B2 body — 25px, Raleway Medium */}
                    <p
                        className="font-sans font-medium text-[#333a42] max-w-[420px]"
                        style={{ fontSize: "25px", lineHeight: "1.5", marginTop: "40px" }}
                    >
                        {heroDesc}
                    </p>

                    {/* Button — SimplePractice appointment widget */}
                    <div style={{ marginTop: "32px" }}>
                        <a
                            href="https://reframe.clientsecure.me"
                            data-spwidget-scope-id="64787fd5-84f6-42ba-9955-816d91404e11"
                            data-spwidget-scope-uri="reframe"
                            data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
                            data-spwidget-type="OAR"
                            data-spwidget-scope-global
                            data-spwidget-autobind
                            className="inline-flex items-center justify-center bg-[#3d4853] hover:bg-[#2d3740] text-white font-sans font-medium transition-colors duration-200 cursor-pointer"
                            style={{ fontSize: "16px", height: "44px", paddingLeft: "32px", paddingRight: "32px" }}
                        >
                            {heroCtaText}
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

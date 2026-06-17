"use client";

interface CaliforniaBannerProps {
    data?: any;
}

export function CaliforniaBanner({ data }: CaliforniaBannerProps) {
    const bannerTitle = data?.content?.banner_title || "Online Therapy Across California";
    const bannerDesc = data?.content?.banner_description || "For adults and couples who manage life well on the surface yet feel stuck in familiar emotional or relational patterns.";

    return (
        /* Warm sand/taupe background — matched precisely from screenshot */
        <section className="bg-[#cec9be] py-14 lg:py-16 font-sans text-[#333a42]">
            <div className="container mx-auto px-6 max-w-3xl text-center space-y-4">
                {/* Merriweather italic — screenshot shows ~36px, proportional weight */}
                <h3
                    className="font-serif italic font-light text-[#333a42] leading-snug tracking-wide"
                    style={{ fontSize: "clamp(24px, 3vw, 38px)" }}
                >
                    {bannerTitle}
                </h3>
                {/* Raleway body — screenshot shows ~16px, regular weight */}
                <p className="font-sans text-[15px] sm:text-[16px] leading-[1.7] text-[#333a42]/90 max-w-2xl mx-auto">
                    {bannerDesc}
                </p>
            </div>
        </section>
    );
}

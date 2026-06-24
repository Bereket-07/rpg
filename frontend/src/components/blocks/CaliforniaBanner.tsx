"use client";

interface CaliforniaBannerProps {
    data?: any;
}

export function CaliforniaBanner({ data }: CaliforniaBannerProps) {
    const bannerTitle = data?.content?.banner_title || "Online Therapy Across California";
    const bannerDesc = data?.content?.banner_description || "For adults and couples who manage life well on the surface yet feel stuck in familiar emotional or relational patterns.";

    return (
        <section className="bg-[#D6CFC2] py-14 lg:py-16 font-sans text-[#333a42]">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                {/* H2 — 46px, Merriweather 120pt Italic */}
                <h2
                    className="font-serif italic font-normal text-[#333a42]"
                    style={{ fontSize: "46px", lineHeight: "1.2" }}
                >
                    {bannerTitle}
                </h2>
                {/* B1 — Raleway Medium */}
                <p
                    className="font-sans font-medium text-[#333a42]/90 mx-auto"
                    style={{ fontSize: "18px", lineHeight: "1.7", marginTop: "24px", maxWidth: "540px" }}
                >
                    {bannerDesc}
                </p>
            </div>
        </section>
    );
}

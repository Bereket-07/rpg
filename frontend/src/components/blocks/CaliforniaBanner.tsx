"use client";

interface CaliforniaBannerProps {
    data?: any;
}

export function CaliforniaBanner({ data }: CaliforniaBannerProps) {
    const bannerTitle = data?.content?.banner_title || "Online Therapy Across California";
    const bannerDesc = data?.content?.banner_description || "For adults and couples who manage life well on the surface yet feel stuck in familiar emotional or relational patterns.";

    return (
        <section className="bg-[#e1ddd3] py-24 lg:py-28 font-sans text-[#333a42] border-b border-black/[0.04]">
            <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif italic font-light tracking-wide text-[#333a42] leading-tight">
                    {bannerTitle}
                </h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-[23px] leading-[1.65] text-[#333a42]/90 max-w-4xl mx-auto font-medium">
                    {bannerDesc}
                </p>
            </div>
        </section>
    );
}

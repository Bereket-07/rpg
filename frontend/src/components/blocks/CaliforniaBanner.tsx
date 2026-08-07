"use client";

interface CaliforniaBannerProps {
    data?: any;
}

export function CaliforniaBanner({ data }: CaliforniaBannerProps) {
    const bannerTitle = data?.content?.banner_title || "Online Therapy Across California";
    const bannerDesc = data?.content?.banner_description || "For adults and couples who manage life well on the surface yet feel stuck in familiar emotional or relational patterns.";

    // Every value scales with viewport width, pinned to the design's proportions
    // (50px / 30px / 1000px measure / 72-48px padding at its 1739px artboard).
    // Font AND measure scale together, so the line breaks never change; all clamps
    // cap at the same 1739px so the ratios hold above and below that width too.
    return (
        <section
            className="bg-[#D6CFC2] font-sans text-[#333a42]"
            style={{
                paddingTop: "clamp(40px, 4.14vw, 72px)",
                paddingBottom: "clamp(28px, 2.76vw, 48px)",
            }}
        >
            <div className="mx-auto px-6 max-w-[1180px] text-center">
                {/* H2 — Merriweather Italic, 2.875vw (= 50px at 1739) */}
                <h2
                    className="font-serif italic font-normal text-[#333a42]"
                    style={{ fontSize: "clamp(28px, 2.875vw, 50px)", lineHeight: "1.2" }}
                >
                    {bannerTitle}
                </h2>
                {/* B1 — Raleway Medium, 1.725vw (= 30px at 1739) */}
                <p
                    className="font-sans font-medium text-[#333a42]/90 mx-auto"
                    style={{
                        fontSize: "clamp(18px, 1.725vw, 30px)",
                        lineHeight: "1.45",
                        marginTop: "clamp(20px, 1.84vw, 32px)",
                        // min(100%, …) so the 600px floor can never exceed a narrow screen
                        maxWidth: "min(100%, clamp(600px, 57.5vw, 1000px))",
                    }}
                >
                    {bannerDesc}
                </p>
            </div>
        </section>
    );
}

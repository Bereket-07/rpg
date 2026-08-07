import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getApproachData() {
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/approach`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch approach data from FastAPI:", err);
        return null;
    }
}

export default async function ApproachPage() {
    const data = await getApproachData();

    // Section 1: Hero
    const heroTitle = data?.hero_title || "Patterns learned earlier in life can quietly shape how we relate, react, and make decisions.";
    const heroImage = data?.hero_image_url || "/assets/RPG_Images for UI/Our Approach_Img.jpg";

    // Section 2: Insight Banner
    const insightTitle = data?.content?.insight_title || "But change doesn’t happen through insight alone.";
    const connectionTitle = data?.content?.connection_title || "Change happens in connection.";
    const sec2BtnText = data?.content?.sec2_btn_text || "Request a Consultation";

    // Section 3: Pillows and Checklist
    const attunementImage = data?.content?.attunement_image || "/assets/RPG_Images for UI/modern-window-with-pillows-trees-and-sky-behind-2026-03-16-04-30-14-utc.jpg";
    const attunementTitle = data?.content?.attunement_title || "In a space that is attuned, structured, and grounded in evidence-based approaches, we help you:";
    const attunementPoints = data?.content?.attunement_points || [
        "Feel understood without having to overexplain",
        "Recognize automatic responses as they happen",
        "Understand what purpose they serve",
        "Shift them through new emotional experiences"
    ];
    const beyondInsight = data?.content?.beyond_insight || "This is what allows change to move from something you understand to something you feel and live.";

    // Section 4: Flexibility Banner
    const flexibilityTitle = data?.content?.flexibility_title || "Over time, what once felt automatic becomes flexible.";
    const stucknessDesc = data?.content?.stuckness_desc || "You don’t have to force change or try harder. You begin to feel unstuck, because something deeper has shifted.";

    // Section 5: Dual Attunement Cards
    const leftCardImage = data?.content?.left_card_image || "/assets/RPG_Images for UI/98cc3fad-ed2c-4348-ad89-cb67ef1e9445-2026-04-17.png";
    const leftCardTitle = data?.content?.left_card_title || "Develop a different relationship with your emotions:";
    const leftCardPoints = data?.content?.left_card_points || ["Greater clarity", "More choice", "Less reactivity"];

    const rightCardImage = data?.content?.right_card_image || "/assets/RPG_Images for UI/window-natural-shadow-2026-03-17-14-48-39-utc.jpg";
    const rightCardTitle = data?.content?.right_card_title || "Move out of familiar relationship cycles of disconnection and into new ways of responding:";
    const rightCardPoints = data?.content?.right_card_points || ["Greater trust", "More responsiveness", "Genuine closeness"];

    // Section 6: Bottom Call-to-Action
    const callToActionTitle = data?.content?.call_to_action_title || "Book a consultation and we'll explore what's keeping you stuck, and how to help you move forward.";
    const sec6BtnText = data?.content?.sec6_btn_text || "Schedule a Consultation";

    return (
        <div className="bg-white min-h-screen font-sans text-foreground">
            
            {/* Section 1: Hero Block */}
            <section
                className="relative w-full flex flex-col items-center justify-start bg-cover border-b border-black/[0.04] px-4"
                style={{
                    backgroundImage: `url('${heroImage}')`,
                    backgroundPosition: "center 60%",
                    backgroundSize: "cover",
                    // Height tracks width (1.746:1 = the design's 947/1654) so the cover crop is
                    // identical at every viewport — the source is portrait (1782x1920), so cover
                    // always scales by width and a fixed pixel height would re-crop on resize.
                    aspectRatio: "1.746",
                    // min-height governs on phones; aspect only matters once wide
                    minHeight: "560px",
                    paddingTop: "13.4%",
                    paddingBottom: "40px",
                }}
            >
                <div className="absolute inset-0 bg-white/0 pointer-events-none" />

                <div className="relative z-10 max-w-[860px] mx-auto text-center">
                    <h1
                        className="font-serif font-semibold text-[#333a42] leading-[1.18] tracking-tight text-center"
                        style={{ fontSize: "clamp(26px, 5.2vw, 52px)" }}
                        dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, "<br/>") }}
                    />
                </div>
            </section>

            {/* Section 2: Transition Beige Banner */}
            <section className="bg-[#D6CFC2] pt-[68px] pb-[64px] text-center border-b border-black/[0.04] px-4">
                <div className="max-w-[1100px] mx-auto">
                    <h2 className="font-serif italic text-[#333a42] leading-[1.2] whitespace-normal lg:whitespace-nowrap" style={{ fontSize: "clamp(24px, 4.2vw, 42px)" }}>
                        {insightTitle}
                    </h2>
                    <p className="font-sans font-medium text-[#4a535e] mt-[32px]" style={{ fontSize: "clamp(17px, 2.5vw, 25px)" }}>
                        {connectionTitle}
                    </p>
                    <div className="pt-[34px]">
                        <Button
                            asChild
                            className="bg-[#424c56] hover:bg-[#333a42] text-white rounded-none font-semibold text-sm h-[38px] px-[30px] border-none shadow-md transition-all duration-300"
                        >
                            <Link href="/contact">{sec2BtnText}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Section 3: Narrative Section (Pillows & Checklist) */}
            <section
                className="relative"
                style={{
                    backgroundImage: `url('${attunementImage}')`,
                    // Scale off the section height (stable) rather than the width, so the
                    // vertical framing is identical at every viewport. 180% reproduces the
                    // design's crop: image rows 22%-78% visible.
                    backgroundSize: "auto 180%",
                    // 77% (not centre) — puts the window rail ~23% and the pillow tops ~50%
                    // down the section, matching the design; centre sat the crop too high.
                    backgroundPosition: "center 77%",
                    backgroundRepeat: "no-repeat",
                    minHeight: "540px",
                }}
            >
                {/* Veil fades edge to edge — never fully transparent, never a hard start */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(to right, rgba(255,250,245,0.28) 0%, rgba(255,250,245,0.42) 25%, rgba(255,250,245,0.66) 45%, rgba(255,250,245,0.88) 65%, rgba(255,250,245,0.97) 85%, rgba(255,250,245,1) 100%)",
                    }}
                />

                <div className="container mx-auto max-w-[1340px] relative z-10 flex justify-end py-[58px] px-6">
                    <div className="w-full lg:w-[54%] space-y-5 text-left">
                        {/* H4 — 28px Merriweather Semibold */}
                        <h3
                            className="font-serif font-semibold text-[#333a42] leading-[1.25]"
                            style={{ fontSize: "clamp(20px, 2.8vw, 28px)" }}
                        >
                            {attunementTitle}
                        </h3>

                        {/* Checklist — 25px Raleway Regular */}
                        <ul className="space-y-3">
                            {attunementPoints.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 font-sans font-normal text-[#333a42]" style={{ fontSize: "clamp(17px, 2.5vw, 25px)" }}>
                                    <span className="w-6 h-6 rounded-full bg-[#424c56] flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        {/* B2 — 25px Raleway Medium */}
                        <p
                            className="font-sans font-medium text-[#333a42] leading-relaxed pt-4"
                            style={{ fontSize: "clamp(17px, 2.5vw, 25px)" }}
                        >
                            {beyondInsight}
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4: Flexible Transition Banner */}
            <section className="pt-[58px] pb-[48px] bg-[#FFFAF5] border-t border-black/[0.04] px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-5">
                    <h2
                        className="font-serif italic text-[#333a42] leading-[1.2] whitespace-normal lg:whitespace-nowrap"
                        style={{ fontSize: "clamp(24px, 4.2vw, 42px)" }}
                    >
                        {flexibilityTitle}
                    </h2>
                    <div className="font-sans font-medium text-[#4a535e] leading-relaxed space-y-0" style={{ fontSize: "clamp(17px, 2.5vw, 25px)" }}>
                        <p>You don&apos;t have to force change or try harder.</p>
                        <p>You begin to feel unstuck, because something deeper has shifted.</p>
                    </div>
                </div>
            </section>

            {/* Section 5: Dual Attunement Cards — contained */}
            {/* inset from the page edges (design: cards span ~92% of width, never edge to edge) */}
            <section className="bg-[#FFFAF5] px-8 lg:px-[3.8%] pb-[80px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[6px] max-w-[1740px] mx-auto">

                    {/* Left Card: Emotions */}
                    <div
                        className="relative h-auto min-h-[430px] lg:h-[510px] p-8 sm:p-10 lg:pt-[58px] lg:px-[62px] flex flex-col justify-start bg-cover bg-center rounded-sm overflow-hidden"
                        style={{ backgroundImage: `url('${leftCardImage}')` }}
                    >
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, #D6CFC2 0%, rgba(214,207,194,0) 100%)" }} />

                        <div className="relative z-10 space-y-6 text-left max-w-[470px]">
                            <h3 className="font-serif font-semibold text-[#333a42] leading-[1.25]" style={{ fontSize: "clamp(20px, 2.8vw, 28px)" }}>
                                {leftCardTitle}
                            </h3>
                            <ul className="space-y-1">
                                {leftCardPoints.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 font-sans font-normal text-[#333a42]" style={{ fontSize: "clamp(17px, 2.5vw, 25px)" }}>
                                        <span className="w-6 h-6 rounded-full bg-white/70 border border-[#333a42]/20 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#333a42]/40" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Card: Relationships */}
                    <div
                        className="relative h-auto min-h-[430px] lg:h-[510px] p-8 sm:p-10 lg:pt-[58px] lg:px-[62px] flex flex-col justify-start bg-cover bg-center rounded-sm overflow-hidden"
                        style={{ backgroundImage: `url('${rightCardImage}')` }}
                    >
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, #D6CFC2 0%, rgba(214,207,194,0) 100%)" }} />

                        <div className="relative z-10 space-y-6 text-left max-w-[470px]">
                            <h3 className="font-serif font-semibold text-[#333a42] leading-[1.25]" style={{ fontSize: "clamp(20px, 2.8vw, 28px)" }}>
                                {rightCardTitle}
                            </h3>
                            <ul className="space-y-1">
                                {rightCardPoints.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 font-sans font-normal text-[#333a42]" style={{ fontSize: "clamp(17px, 2.5vw, 25px)" }}>
                                        <span className="w-6 h-6 rounded-full bg-white/70 border border-[#333a42]/20 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#333a42]/40" />
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </section>

            {/* Section 6: Bottom Call-to-Action Section */}
            <section className="bg-[#424c56] text-white py-20 px-8 sm:px-12 lg:px-16 border-t border-black/[0.04]">
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <h3 className="font-serif text-xl sm:text-2xl lg:text-[26px] text-white font-normal leading-relaxed max-w-2xl text-left">
                        {callToActionTitle}
                    </h3>
                    <Button 
                        asChild 
                        className="bg-white hover:bg-white/95 text-[#424c56] font-semibold px-8 rounded-none h-14 border-none shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 text-[16px] tracking-wide shrink-0"
                    >
                        <Link href="/contact">{sec6BtnText || data?.content?.sec6_btn_text || "Schedule a Consultation"}</Link>
                    </Button>
                </div>
            </section>

        </div>
    );
}

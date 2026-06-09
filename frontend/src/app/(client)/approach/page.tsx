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
    const leftCardImage = data?.content?.left_card_image || "/assets/RPG_Images for UI/modern-window-with-pillows-trees-and-sky-behind-2026-03-16-04-30-14-utc.jpg";
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
                className="relative min-h-[60vh] sm:min-h-[70vh] w-full flex flex-col items-center justify-start bg-cover border-b border-black/[0.04] pt-28 lg:pt-36 pb-20 px-4"
                style={{ 
                    backgroundImage: `url('${heroImage}')`,
                    backgroundPosition: "center 65%"
                }}
            >
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                <div className="relative z-10 max-w-[1050px] mx-auto text-center">
                    <h1 
                        className="text-3xl sm:text-5xl lg:text-[54px] xl:text-[58px] font-serif text-[#333a42] leading-[1.2] tracking-tight font-normal text-balance"
                        dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, "<br/>") }}
                    />
                </div>
            </section>

            {/* Section 2: Transition Beige Banner */}
            <section className="bg-[#dbd4c7] py-20 lg:py-24 text-center border-b border-black/[0.04] px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif italic text-[#333a42] leading-tight font-light">
                        {insightTitle}
                    </h2>
                    <p className="text-base sm:text-lg lg:text-[17px] text-[#4a535e] font-medium tracking-wide">
                        {connectionTitle}
                    </p>
                    <div className="pt-4">
                        <Button 
                            asChild 
                            className="bg-[#424c56] hover:bg-[#333a42] text-white rounded-none font-semibold text-sm h-12 px-8 border-none shadow-md transition-all duration-300"
                        >
                            <Link href="/contact">{sec2BtnText}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Section 3: Narrative Section (Pillows & Checklist) */}
            <section 
                className="relative py-24 lg:py-32 bg-cover bg-center px-6"
                style={{ 
                    backgroundImage: `url('${attunementImage}')`,
                }}
            >
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                <div className="container mx-auto max-w-7xl relative z-10 flex justify-end">
                    <div className="w-full lg:w-1/2 bg-white/95 backdrop-blur-[6px] p-8 sm:p-10 lg:p-12 rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.12)] border border-[#e5e0d8] space-y-8">
                        <h3 className="text-[22px] sm:text-[26px] lg:text-[30px] font-serif text-[#333a42] leading-[1.25] font-normal text-left">
                            {attunementTitle}
                        </h3>
                        
                        <ul className="space-y-4 sm:space-y-5 text-left">
                            {attunementPoints.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-[15px] sm:text-[16px] lg:text-[17px] font-sans font-medium text-[#4a535e] leading-snug">
                                    <div className="w-6 h-6 rounded-full bg-[#424c56] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="text-[15px] sm:text-[16px] lg:text-[17px] font-sans text-[#4a535e]/90 leading-relaxed border-t border-[#333a42]/10 pt-6 max-w-2xl font-medium text-left">
                            {beyondInsight}
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4: Flexible Transition Banner */}
            <section className="py-16 lg:py-20 bg-white border-t border-black/[0.04] px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-4">
                    <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-serif italic text-[#333a42] leading-tight font-light">
                        {flexibilityTitle}
                    </h2>
                    <div className="text-base sm:text-lg lg:text-[18px] text-[#4a535e] leading-relaxed font-medium space-y-1">
                        {stucknessDesc.split("\n").map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Dual Attunement Cards */}
            <section className="py-24 lg:py-32 bg-[#fdf8f5] px-6 border-t border-b border-black/[0.04]">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[16px] overflow-hidden shadow-[0_24px_48px_rgba(30,28,24,0.12)] border border-[#e5e0d8]">
                        
                        {/* Left Card: Emotions */}
                        <div 
                            className="relative h-[420px] sm:h-[450px] p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-cover bg-center border-b md:border-b-0 md:border-r border-[#e5e0d8]"
                            style={{ 
                                backgroundImage: `url('${leftCardImage}')`,
                                backgroundPosition: "center bottom"
                            }}
                        >
                            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] pointer-events-none" />
                            
                            <div className="relative z-10 space-y-6 text-left">
                                <h3 className="text-[21px] sm:text-[23px] lg:text-[27px] font-serif text-[#333a42] leading-[1.25] font-semibold max-w-md">
                                    {leftCardTitle}
                                </h3>
                                <ul className="space-y-3.5">
                                    {leftCardPoints.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3.5 text-[15px] sm:text-[16px] lg:text-[17px] font-sans font-bold text-[#333a42]">
                                            <div className="w-6 h-6 rounded-full bg-white border border-[#333a42]/30 flex items-center justify-center text-[#333a42] shrink-0 shadow-sm">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right Card: Relationships */}
                        <div 
                            className="relative h-[420px] sm:h-[450px] p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url('${rightCardImage}')`,
                            }}
                        >
                            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] pointer-events-none" />
                            
                            <div className="relative z-10 space-y-6 text-left">
                                <h3 className="text-[21px] sm:text-[23px] lg:text-[27px] font-serif text-[#333a42] leading-[1.25] font-semibold max-w-md">
                                    {rightCardTitle}
                                </h3>
                                <ul className="space-y-3.5">
                                    {rightCardPoints.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3.5 text-[15px] sm:text-[16px] lg:text-[17px] font-sans font-bold text-[#333a42]">
                                            <div className="w-6 h-6 rounded-full bg-white border border-[#333a42]/30 flex items-center justify-center text-[#333a42] shrink-0 shadow-sm">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
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

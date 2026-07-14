import { notFound } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

interface SpecialtyData {
    id: string;
    title: string;
    paragraphs: string[];
    image: string;
}

const STATIC_SPECIALTIES: SpecialtyData[] = [
    {
        id: "mood",
        title: "Improving Mood and Well-being",
        paragraphs: [
            "It's not that your life isn't working.",
            "From the outside, it probably looks like it is.\nBut internally, the energy isn't the same.\nThings that used to feel engaging and meaningful no longer bring you pleasure or joy.",
            "Depression doesn't always look like sadness.\nIt can feel like disconnection, exhaustion, or going through the motions without really being there.",
            "You may be used to pushing through, staying productive, or overriding how you feel, but underneath, there is a heaviness you can't quite shake.",
            "In therapy, we focus on what's driving that stuckness in real time. We slow things down to notice the ways you've learned to cope with depression.",
            "This isn't about just managing symptoms, it's about finding a new way to relate to yourself and others so you can find energy, connection, and meaning again.",
            "So instead of operating on autopilot, you begin to feel more present, more engaged, and more like yourself again, with greater clarity and emotional range."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Improving Mood and Well-being.png"
    },
    {
        id: "anxiety",
        title: "Working Through Anxiety And Stress",
        paragraphs: [
            "You're managing a lot, your career, your relationships, your responsibilities…",
            "and yet, beneath the surface, it feels like your mind never stops racing.",
            "It might look like staying on top of everything, but internally, there's tension, agitation, or that constant undercurrent of worry.",
            "Sometimes your body feels it first, tight shoulders, a racing heart, restless energy, while your thoughts spin through every \"what if\" scenario.",
            "At a certain point, it's no longer just about deadlines. responsibilities, or the challenges of the day. It's the cycle of overthinking and tension you can't seem to step out of.",
            "You have tried breathing exercises, journaling, mindfulness apps, or \"pushing through,\" and yet, in critical moments, anxiety still takes over.",
            "We help you slow things down and notice that anxiety is a pattern your mind and body have learned over time. In therapy, we work with those patterns as they're happening, not just talking about them, but helping you experience something different in real time.",
            "More importantly, we help you shift it.",
            "Instead of being pulled into the same anxious loop of spiraling or shutting down, you'll learn to respond with more clarity, self-trust, and emotional balance.",
            "This isn't just about coping strategies.\nIt's about changing the underlying patterns that keep you feeling \"on edge\" so you can reclaim energy, calm, and confidence."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Working Through Anxiety and Stress.png"
    },
    {
        id: "couples",
        title: "Couples Therapy: Rebuilding Intimacy And Connections",
        paragraphs: [
            "You may find yourselves having the same conversation over and over, one of you pushing, the other pulling away…\nboth of you leaving feeling unheard, frustrated, or alone.",
            "At a certain point, it's no longer about the surface issue.\nIt's the cycle you can't seem to get out of.",
            "You've tried to communicate better, be more patient, give each other space, and yet, in the moments that matter, something takes over.",
            "That's where we focus.\nWe help you slow these moments down in real time, so you can begin to see what's actually happening underneath the conflict, and why it keeps repeating.",
            "More importantly, we help you change it.",
            "Instead of getting pulled into the same familiar dynamic, you'll learn how to reach for each other in a way that creates understanding rather than distance, building trust, responsiveness, and a deeper sense of connection.",
            "This isn't simply about learning better communication techniques.\nIt's about shifting the emotional patterns that shape how you relate to each other.",
            "Over time, couples move from reactivity and disconnection\nto feeling more secure, more aligned, and more like a team again."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Couples Therapy_Rebuilding Intimacy and Connection.png"
    },
    {
        id: "infants",
        title: "Parenting Infants & Young Children",
        paragraphs: [
            "Becoming a parent can be deeply meaningful and unexpectedly disorienting.",
            "You may find yourself second-guessing decisions you once made with ease, feeling stretched thin, or unsure how to respond in the moments that matter most. Even highly capable, thoughtful parents can feel overwhelmed by the constant demands and the quiet pressure to \"get it right.\"",
            "It's not just about sleep training, behavior management, or milestones.",
            "It's about how you're experiencing your child and yourself within those moments.",
            "In our work, we focus on helping you slow things down and make sense of what's happening beneath the surface: your child's needs, your emotional responses, and the patterns that begin to take shape between you.",
            "From there, change becomes more natural.\nYou'll feel more steady, more confident in your decisions, and more connected to your child, without losing sight of yourself in the process.",
            "This isn't simply about following a rigid parenting approach or trend.",
            "It's about developing a way of responding that feels clear, grounded, and aligned with who you are and how you want to show up as a parent."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Parenting Infants and Young Children.png"
    },
    {
        id: "teens",
        title: "Parenting Teens & Young Adults",
        paragraphs: [
            "As children grow, the relationship changes, often in ways no one fully prepares you for.",
            "Conversations become more complex. Reactions feel less predictable.",
            "And the closeness you once relied on can begin to feel harder to reach.",
            "You may find yourself questioning how much to step in, when to step back, and how to stay connected without overstepping. Even experienced, thoughtful parents can feel unsure in this phase, especially when what used to work no longer does.",
            "In our work, we focus on helping you understand what's happening beneath the surface of these interactions, so you can respond in ways that maintain both connection and respect for your child's growing independence.",
            "Rather than getting pulled into tension, distance, or repeated conflict, you'll learn how to navigate these moments with more clarity, steadiness, and intention.",
            "The goal isn't to control outcomes.",
            "It's to create a relationship that can adapt, one that allows for autonomy while staying meaningfully connected.",
            "Over time, parents feel more confident in how they show up, and more at ease in a stage that often feels uncertain."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Parenting Teens and Young Adults.png"
    },
    {
        id: "transitions",
        title: "Navigating Life Transitions",
        paragraphs: [
            "Life transitions have a way of disrupting what used to feel clear.",
            "What once worked, how you made decisions, handled stress, or found direction, may not hold up in the same way anymore.",
            "That's often where people start to feel stuck.\nA new role, a shift in identity, a change you chose, or didn't, can quietly disrupt your sense of direction. What once felt clear or manageable may now feel unsettled, even disorienting.",
            "You may be questioning your decisions, comparing yourself to others, or noticing a pull to withdraw or avoid what feels uncertain.\nThis is often the point where people try to think their way forward, but clarity doesn't come from pressure.",
            "It comes from understanding and adapting to what this moment is asking of you.",
            "In therapy, we focus on how you're navigating those moments as they're happening, not just what you think you should do, but how you actually respond to uncertainty, pressure, and change.",
            "From there, we help you shift those patterns in real time.",
            "So instead of spinning, avoiding, or forcing clarity, you begin to feel more grounded and decisive, able to move forward in a way that feels aligned with who you are now.",
            "Not a quick fix, but a clearer, more stable sense of direction that actually holds."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Navigating Life Transitions.png"
    },
    {
        id: "trauma",
        title: "Overcoming Adverse Life Events And Trauma",
        paragraphs: [
            "Trauma doesn't always show up in obvious ways.",
            "From the outside, it may seem like you've moved on.",
            "But internally, something still feels reactive, guarded, or hard to fully settle.",
            "It can show up in how you respond now, feeling on edge, shutting down, over-controlling, or reacting in ways that don't fully make sense to you.",
            "You may notice the same relationship patterns repeating, difficulty trusting, staying overly independent, people-pleasing or a tendency to go numb when things feel too close or overwhelming.",
            "Even when life has moved forward, something in your system may still be organized around what happened.",
            "That's why insight alone often isn't enough.",
            "In our work, we focus on how those patterns are still active in the present, how your mind and body respond in real time, and how past experiences continue to shape those reactions.",
            "More importantly, we help you shift them.",
            "Not by pushing you to revisit everything before you're ready, but by working with what's happening as it comes up, so you can begin to experience something different.",
            "Over time, you feel more grounded, more like yourself, and less defined by what you've been through. Instead of reacting automatically, you're able to pause, choose, and respond in ways that feel more aligned."
        ],
        image: "/assets/Specialties Section_Selected Images/cards/Overcoming Adverse Life Events and Trauma.png"
    }
];

// Alternating backgrounds per mockup: cream pages get beige CTA box, beige pages get cream CTA box
const BG_MAP: Record<string, { pageBg: string; ctaBg: string }> = {
    mood:        { pageBg: "bg-[#FFFAF5]",  ctaBg: "bg-[#f0ebe1]" },
    anxiety:     { pageBg: "bg-[#f0ebe1]",  ctaBg: "bg-[#FFFAF5]" },
    couples:     { pageBg: "bg-[#FFFAF5]",  ctaBg: "bg-[#f0ebe1]" },
    infants:     { pageBg: "bg-[#f0ebe1]",  ctaBg: "bg-[#FFFAF5]" },
    teens:       { pageBg: "bg-[#FFFAF5]",  ctaBg: "bg-[#f0ebe1]" },
    transitions: { pageBg: "bg-[#f0ebe1]",  ctaBg: "bg-[#FFFAF5]" },
    trauma:      { pageBg: "bg-[#FFFAF5]",  ctaBg: "" }, // per mockup: no CTA box on trauma
};

async function getSpecialtyData(id: string): Promise<SpecialtyData | null> {
    const staticMatch = STATIC_SPECIALTIES.find(s => s.id === id) ?? null;

    try {
        const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/specialties`, { cache: "no-store" });
        if (!res.ok) return staticMatch;
        const pageData = await res.json();
        const cmsSpec = pageData?.content?.[id];
        if (!cmsSpec) return staticMatch;

        return {
            id,
            title: cmsSpec.title || staticMatch?.title || "",
            paragraphs: cmsSpec.paragraphs?.length ? cmsSpec.paragraphs : (staticMatch?.paragraphs || []),
            image: cmsSpec.image || staticMatch?.image || "",
        };
    } catch {
        return staticMatch;
    }
}

export default async function SpecialtyDetailPage({ params }: { params: { id: string } }) {
    const specialty = await getSpecialtyData(params.id);

    if (!specialty) {
        notFound();
    }

    const { pageBg, ctaBg } = BG_MAP[specialty.id] || { pageBg: "bg-[#FFFAF5]", ctaBg: "bg-[#f0ebe1]" };

    return (
        <div className={`${pageBg} min-h-screen font-sans text-[#4a535e]`}>

            {/* Main Content — centered container, narrow text left / wide image right */}
            <section className={`${pageBg} pt-16 pb-24 lg:pt-20 lg:pb-28`}>
                <div className="max-w-[1500px] mx-auto px-6 sm:px-10 xl:px-16">
                    <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-20 xl:gap-28">

                        {/* Left Column: Text + CTA */}
                        <div className="lg:w-[38%] shrink-0 space-y-10 text-left">
                            <h1 className="text-[36px] sm:text-[48px] xl:text-[56px] font-serif text-[#3f4a56] font-normal leading-[1.2]">
                                {specialty.title}
                            </h1>

                            <div className="space-y-7 text-[15px] sm:text-[16px] text-[#3f4a56] leading-[1.8] font-normal text-justify hyphens-auto whitespace-pre-line" lang="en">
                                {specialty.paragraphs.map((para, idx) => (
                                    <p key={idx}>{para}</p>
                                ))}
                            </div>

                            {/* CTA Card */}
                            <div className={`${ctaBg ? `${ctaBg} p-8 sm:p-9` : ""} rounded-none space-y-5`}>
                                <p className="text-[16px] font-bold text-[#333a42] tracking-wide font-sans">
                                    When You&apos;re Ready for Something Different
                                </p>
                                <p className="text-[14px] sm:text-[15px] text-[#4a535e]/90 leading-[1.75] text-justify hyphens-auto" lang="en">
                                    If you&apos;re ready to move beyond just getting through your days and want to feel more fully present in your life again, we invite you to take the next step.
                                </p>
                                <div className="pt-1">
                                    <Link
                                        href="/contact"
                                        className="bg-[#3d4853] hover:bg-[#2d3740] text-white rounded-none font-medium h-11 w-fit px-6 flex items-center justify-center text-[14px] font-sans tracking-wide transition-all shadow-sm hover:shadow-md"
                                    >
                                        Book a Consultation
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Full-height image */}
                        <div className="flex-1 relative min-h-[400px] lg:min-h-[500px]">
                            <img
                                src={specialty.image}
                                alt={specialty.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}

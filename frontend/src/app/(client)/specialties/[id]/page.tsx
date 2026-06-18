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
            "From the outside, it probably looks like it is. But internally, the energy isn't the same. Things that used to feel engaging and meaningful no longer bring you pleasure or joy.",
            "Depression doesn't always look like sadness. It can feel like disconnection, exhaustion, or going through the motions without really being there.",
            "You may be used to pushing through, staying productive, or overriding how you feel, but underneath, there is a heaviness you can't quite shake.",
            "In therapy, we focus on what's driving that stuckness in real time. We slow things down to notice the ways you've learned to cope with depression.",
            "This isn't about just managing symptoms, it's about finding a new way to relate to yourself and others so you can find energy, connection, and meaning again.",
            "So instead of operating on autopilot, you begin to feel more present, more engaged, and more like yourself again, with greater clarity and emotional range."
        ],
        image: "/assets/RPG_Images for UI/mockup-wall-in-the-children-s-room-on-wall-white-c-2026-03-24-01-09-26-utc.jpg"
    },
    {
        id: "anxiety",
        title: "Working Through Anxiety And Stress",
        paragraphs: [
            "You're managing a lot, your career, your relationships, your responsibilities..",
            "and yet, beneath the surface, it feels like your mind never stops racing.",
            "It might look like staying on top of everything, but internally, there's tension, agitation, or that constant undercurrent of worry.",
            "Sometimes your body feels it first, tight shoulders, a racing heart, restless energy, while your thoughts spin through every \"what if\" scenario.",
            "At a certain point, it's no longer just about deadlines. responsibilities, or the challenges of the day. It's the cycle of overthinking and tension you can't seem to step out of.",
            "You have tried breathing exercises, journaling, mindfulness apps, or \"pushing through,\" and yet, in critical moments, anxiety still takes over.",
            "We help you slow things down and notice that anxiety is a pattern your mind and body have learned over time. In therapy, we work with those patterns as they're happening, not just talking about them, but helping you experience something different in real time.",
            "More importantly, we help you shift it.",
            "Instead of being pulled into the same anxious loop of spiraling or shutting down, you'll learn to respond with more clarity, self-trust, and emotional balance.",
            "This isn't just about coping strategies. It's about changing the underlying patterns that keep you feeling \"on edge\" so you can reclaim energy, calm, and confidence."
        ],
        image: "/assets/RPG_Images for UI/stress-theme-concept-paper-with-inscription-and-n-2026-03-24-15-36-15-utc.jpg"
    },
    {
        id: "couples",
        title: "Couples Therapy: Rebuilding Intimacy And Connections",
        paragraphs: [
            "You may find yourselves having the same conversation over and over, one pushing, the other pulling away.. both of you leaving feeling unheard, frustrated, or alone.",
            "At a certain point, it's no longer about the surface issue. It's the cycle you can't seem to get out of.",
            "You've tried to communicate better, be more patient, give each other space, and yet, in the moments that matter, something takes over.",
            "That's where we focus. We help you slow these moments down in real time, so you can begin to see what's actually happening underneath the conflict, and why it keeps repeating.",
            "More importantly, we help you change it.",
            "Instead of getting pulled into the same familiar dynamic, you'll learn how to reach for each other in a way that creates understanding rather than distance, building trust, responsiveness, and a deeper sense of connection.",
            "This isn't simply about learning communication techniques. It's about shifting the emotional patterns that shape how you relate to each other.",
            "Over time, couples move from reactivity and disconnection to feeling more secure, more aligned, and more like a team again."
        ],
        image: "/assets/RPG_Images for UI/modern-ceramic-vases-on-a-white-marble-table-2026-03-16-02-08-02-utc.jpg"
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
            "From there, change becomes more natural. You'll feel more steady, more confident in your decisions, and more connected to your child, without losing sight of yourself in the process.",
            "This isn't simply about following a rigid parenting approach or trend.",
            "It's about developing a way of responding that feels clear, grounded, and aligned with who you are and how you want to show up as a parent."
        ],
        image: "/assets/RPG_Images for UI/portrait-of-four-young-children-in-a-row-one-cryi-2026-03-11-00-57-01-utc.jpg"
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
        image: "/assets/RPG_Images for UI/little-kid-playing-with-joystick-in-front-of-pc-2026-03-24-14-20-02-utc.jpg"
    },
    {
        id: "transitions",
        title: "Navigating Life Transitions",
        paragraphs: [
            "Life transitions have a way of disrupting what used to feel clear.",
            "What once worked—how you made decisions, handled stress, or found direction—may not hold up in the same way anymore. That's often when people start to feel stuck.",
            "In therapy, we provide a structured container to slow down these shifting dynamics.",
            "We help you make sense of the gap between where you were and where you are going, deconstructing old habits that no longer fit and intentionally building a new framework that feels authentic, sustainable, and aligned with your present values."
        ],
        image: "/assets/RPG_Images for UI/closeup-shot-of-a-beautiful-butterfly-metamorpho-2026-03-18-06-39-46-utc.jpeg"
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
        image: "/assets/RPG_Images for UI/rubber-band-ball-2026-03-19-06-59-46-utc.jpg"
    }
];

// Alternating backgrounds matching the listing page
const BG_MAP: Record<string, { pageBg: string; ctaBg: string }> = {
    mood:        { pageBg: "bg-white",       ctaBg: "bg-[#f2ede4]" },
    anxiety:     { pageBg: "bg-[#f2ede4]",   ctaBg: "bg-white" },
    couples:     { pageBg: "bg-white",       ctaBg: "bg-[#f2ede4]" },
    infants:     { pageBg: "bg-[#f2ede4]",   ctaBg: "bg-white" },
    teens:       { pageBg: "bg-white",       ctaBg: "bg-[#f2ede4]" },
    transitions: { pageBg: "bg-[#f2ede4]",   ctaBg: "bg-white" },
    trauma:      { pageBg: "bg-white",       ctaBg: "bg-[#f2ede4]" },
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

    const { pageBg, ctaBg } = BG_MAP[specialty.id] || { pageBg: "bg-white", ctaBg: "bg-[#f2ede4]" };

    return (
        <div className={`${pageBg} min-h-screen font-sans text-[#4a535e]`}>

            {/* Main Content — matches listing page section layout exactly */}
            <section className={`${pageBg} py-24 border-b border-black/[0.03]`}>
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">

                        {/* Left Column: Text + CTA */}
                        <div className="lg:col-span-6 space-y-8 text-left">
                            <h1 className="text-[32px] sm:text-[38px] font-serif text-[#333a42] font-normal leading-tight">
                                {specialty.title}
                            </h1>

                            <div className="space-y-5 text-sm sm:text-base text-[#4a535e] leading-relaxed font-normal">
                                {specialty.paragraphs.map((para, idx) => (
                                    <p key={idx}>{para}</p>
                                ))}
                            </div>

                            {/* CTA Card */}
                            <div className={`${ctaBg} p-8 sm:p-10 rounded-none border border-black/[0.02] shadow-sm space-y-6`}>
                                <div className="space-y-2">
                                    <p className="text-[14px] font-bold text-[#333a42] tracking-wide font-sans">
                                        When You&apos;re Ready for Something Different
                                    </p>
                                    <p className="text-[12px] sm:text-[13px] text-[#4a535e]/85 leading-relaxed">
                                        If you&apos;re ready to move beyond just getting through your days and want to feel more fully present in your life again, we invite you to take the next step.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link
                                        href="/contact"
                                        className="bg-[#333a42] hover:bg-[#4a535e] text-white rounded-none font-semibold h-12 w-fit px-8 flex items-center justify-center gap-2 text-[13px] font-sans tracking-wide transition-all shadow-md hover:shadow-lg"
                                    >
                                        Book a Consultation
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Full-height image */}
                        <div className="lg:col-span-6 relative min-h-[400px]">
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

import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

interface SpecialtyData {
    id: string;
    title: string;
    paragraphs: string[];
    excerpt: string;
    image: string;
}

const STATIC_SPECIALTIES: SpecialtyData[] = [
    {
        id: "mood",
        title: "Improving Mood and Well-being",
        paragraphs: [
            "It's not that your life isn't working.",
            "From the outside, it probably looks like it is. But internally, the energy isn't the same. Things that used to feel engaging and meaningful no longer bring you pleasure or joy.",
            "Depression doesn’t always look like sadness. It can feel like disconnection, exhaustion, or going through the motions without really being there.",
            "You may be used to pushing through, staying productive, or overriding how you feel, but underneath, there is a heaviness you can’t quite shake.",
            "In therapy, we focus on what’s driving that stuckness in real time. We slow things down to notice the ways you’ve learned to cope with depression.",
            "This isn’t about just managing symptoms, it’s about finding a new way to relate to yourself and others so you can find energy, connection, and meaning again.",
            "So instead of operating on autopilot, you begin to feel more present, more engaged, and more like yourself again, with greater clarity and emotional range."
        ],
        excerpt: "It's not that your life isn't working.\nFrom the outside, it probably looks like it is. But internally, the energy isn't the same. Things that used to feel engaging and meaningful no longer bring you pleasure or joy.",
        image: "/assets/Specialties Section_Selected Images/Cards/Improving Mood and Well-being.png"
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
        excerpt: "You're managing a lot, your career, your relationships, your responsibilities… and yet, beneath the surface, it feels like your mind never stops racing.",
        image: "/assets/Specialties Section_Selected Images/Cards/Working Through Anxiety and Stress.png"
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
        excerpt: "You may find yourselves having the same conversation over and over, one of you pushing, the other pulling away… both of you leaving feeling unheard, frustrated, or alone.",
        image: "/assets/Specialties Section_Selected Images/Cards/Couples Therapy_Rebuilding Intimacy and Connection.png"
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
        excerpt: "Becoming a parent can be deeply meaningful and unexpectedly disorienting. You may find yourself second-guessing decisions you once made with ease, feeling stretched thin, or unsure how to respond in the moments that matter most.",
        image: "/assets/Specialties Section_Selected Images/Cards/Parenting Infants and Young Children.png"
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
        excerpt: "As children grow, the relationship changes, often in ways no one fully prepares you for. Conversations become more complex. Reactions feel less predictable. And the closeness you once relied on can begin to feel harder to reach.",
        image: "/assets/Specialties Section_Selected Images/Cards/Parenting Teens and Young Adults.png"
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
        excerpt: "Life transitions have a way of disrupting what used to feel clear. What once worked, how you made decisions, handled stress, or found direction, may not hold up in the same way anymore. That's often where people start to feel stuck.",
        image: "/assets/Specialties Section_Selected Images/Cards/Navigating Life Transitions.png"
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
        excerpt: "Trauma doesn't always show up in obvious ways. From the outside, it may seem like you've moved on. But internally, something still feels reactive, guarded, or hard to fully settle.",
        image: "/assets/Specialties Section_Selected Images/Cards/Overcoming Adverse Life Events and Trauma.png"
    }
];

async function getSpecialtiesPageData() {
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/settings/pages/specialties`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("Failed to load dynamic specialties from database:", err);
        return null;
    }
}

export default async function SpecialtiesPage() {
    const pageData = await getSpecialtiesPageData();

    const title = pageData?.title || "Specialties";
    const desc = pageData?.hero_description || "Core Practice Areas";
    const cmsContent = pageData?.content || {};

    const specialtiesList = STATIC_SPECIALTIES.map(staticSpec => {
        const cmsSpec = cmsContent[staticSpec.id];
        return {
            id: staticSpec.id,
            title: cmsSpec?.title || staticSpec.title,
            excerpt: cmsSpec?.paragraphs && cmsSpec.paragraphs.length > 0
                ? cmsSpec.paragraphs.slice(0, 2).join(" ").replace(/\n/g, " ")
                : staticSpec.excerpt,
            image: cmsSpec?.image || staticSpec.image
        };
    });

    const ctaTitle = cmsContent?.cta_card_title || "When You’re Ready for Something Different";
    const ctaDesc = cmsContent?.cta_card_desc || "If you're ready to move beyond just getting through your days and want to feel more fully present in your life again, we invite you to take the next step.";
    const ctaBtn = cmsContent?.cta_card_button || "Book a Consultation";

    return (
        <div className="bg-[#FFFAF5] min-h-screen font-sans text-[#4a535e] pb-20">

            {/* Page Header — H1 52px serif */}
            <div className="w-full text-center pt-20 pb-16 px-8">
                {/* H1 — Merriweather Semibold */}
                <h1 className="font-serif font-semibold text-[#3f4a56]" style={{ fontSize: "clamp(25px, 4.4vw, 44px)" }}>{title}</h1>
            </div>

            {/* Card Grid */}
            <div className="mx-auto w-full px-10 max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[46px] gap-y-[56px]">
                    {specialtiesList.map((spec) => (                        <Link
                            key={spec.id}
                            href={`/specialties/${spec.id}`}
                            className="group relative overflow-hidden flex flex-col justify-between p-8 transition-all duration-300 aspect-[1.57/1]"
                            style={{ boxShadow: "0 20px 60px rgba(60,50,40,0.18), 0 6px 20px rgba(60,50,40,0.10)" }}
                        >
                            {/* Background image */}
                            <img
                                src={spec.image}
                                alt={spec.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            {/* Gradient overlay — solid beige left, image stays washed under the tint at right */}
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #D6CFC2 0%, #D6CFC2 48%, rgba(214,207,194,0.85) 68%, rgba(214,207,194,0.4) 100%)' }} />

                            {/* Text content */}
                            <div className="relative z-10 space-y-5 max-w-[88%]">
                                {/* H4 — Merriweather Semibold */}
                                <h2 className="font-serif font-bold text-[#333a42] leading-[1.8]" style={{ fontSize: "clamp(16px, 2.05vw, 20.5px)" }}>
                                    {spec.title}
                                </h2>
                                {/* B2.1 — Raleway Regular, justified with hyphens */}
                                <p className="font-sans font-medium text-[#4a535e] leading-[1.32] line-clamp-[8] text-justify hyphens-auto whitespace-pre-line" style={{ fontSize: "18.6px" }} lang="en">
                                    {spec.excerpt}
                                </p>
                            </div>

                            {/* READ MORE */}
                            <div className="relative z-10">
                                <span className="font-sans font-medium text-[#4a535e] uppercase tracking-[0.18em] group-hover:text-[#333a42] transition-colors duration-200" style={{ fontSize: "13.5px" }}>
                                    Read More
                                </span>
                            </div>
                        </Link>
                    ))}

                    {/* Logo placeholder in empty grid cell */}
                    {specialtiesList.length % 2 !== 0 && (
                        <div className="hidden sm:flex aspect-[4/3] items-center justify-center">
                            <img
                                src="/assets/RPG Logo_Main Portrait.png"
                                alt="Reframe Psychology Group"
                                className="w-64"
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

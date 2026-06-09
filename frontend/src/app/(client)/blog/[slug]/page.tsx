import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";
import { ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/api";


// Re-use full interface outline
interface FullArticle {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    published_at: string;
    category: { name: string };
    author: { name: string, bio: string, profile_image_url?: string };
    seo_meta?: {
        meta_title: string;
        meta_description: string;
    };
}

const MOCK_ARTICLES: Record<string, FullArticle> = {
    "role-of-iq-in-relationships": {
        id: 101,
        slug: "role-of-iq-in-relationships",
        title: "The Role of IQ in Relationships",
        category: { name: "RELATIONSHIPS" },
        published_at: "2026-05-20T10:00:00Z",
        excerpt: "Understanding how cognitive profiles, intellectual compatibility, and intellectual style shape connection, communication patterns, and conflict in partnerships.",
        content: `
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">In the landscape of modern therapy, we often talk about emotional intelligence (EQ), communication styles, and attachment security. While these are undeniably the cornerstones of any healthy relationship, another crucial, yet frequently overlooked factor is cognitive profiles and intellectual compatibility.</p>
            
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">When partners have similar cognitive tempos, they often experience a natural ease in conversation and shared decision-making. However, when there is a significant discrepancy in intellectual style or processing speed, it can lead to unique challenges that—if misunderstood—can erode connection and create cycles of frustration.</p>
            
            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Understanding Intellectual Style vs. IQ Score</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">It's important to differentiate between raw intellectual capacity (often measured by IQ) and "intellectual style"—the way an individual processes information, solves problems, and conceptualizes the world. Some people are highly analytical and detail-oriented, while others process globally, relying on intuition, synthesis, and big-picture ideas. When partners operate in different modes, communication breakdowns are common. The analytical partner may feel the intuitive partner lacks rigor, while the intuitive partner may feel bogged down by unnecessary details.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">The Dynamic of Processing Speed</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">One of the most frequent sources of relational strain related to cognitive profiles is a mismatch in processing speed. One partner may process thoughts and feelings rapidly, verbalizing their inner state in real time. The other partner may have a slower, more deliberate processing style, requiring quiet reflection to formulate their thoughts. In high-conflict moments, the fast processor may interpret the slower partner's silence as stonewalling or indifference, while the slower processor feels overwhelmed, flooded, and rushed. Recognizing this as a difference in cognitive wiring, rather than a lack of love or investment, can transform relational dynamics.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Building Bridges Across Cognitive Gaps</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-4">To foster connection and avoid common pitfalls, couples can practice several key strategies:</p>
            <ul className="list-disc pl-6 space-y-3 text-[17px] text-[#4a535e] mb-6">
                <li><strong>Acknowledge and Validate:</strong> Explicitly name your different cognitive styles. Normalize that you process the world differently and that neither way is superior.</li>
                <li><strong>Slowing Down:</strong> The faster-processing partner can learn to pause, giving the other partner space to think. Agreeing on a "reflection window" (e.g., "Let's talk about this in an hour after we've both had time to process") can be highly effective.</li>
                <li><strong>Shared Intellectual Outlets:</strong> Cultivate areas of shared curiosity. Even if your professional or academic interests differ, find books, podcasts, or activities that stimulate both of you and provide a common ground for connection.</li>
            </ul>
        `,
        author: {
            name: "Dr. Tamara Eromo, Psy.D.",
            bio: "Clinical Psychologist, Co-Founder. Dr. Eromo specializes in attachment science and relational systems, helping couples navigate complex relational patterns.",
            profile_image_url: "/assets/RPG_Images for UI/Tamara copy.jpg"
        }
    },
    "dogs-for-therapy": {
        id: 102,
        slug: "dogs-for-therapy",
        title: "Dogs for Therapy: More Than a Best Friend",
        category: { name: "THERAPY" },
        published_at: "2026-05-18T10:00:00Z",
        excerpt: "How animal-assisted support offers comfort, regulation, and emotional healing.",
        content: `
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">For centuries, dogs have been referred to as humanity's best friend. But in recent decades, the fields of psychology and neurobiology have begun to recognize that the bond between humans and dogs goes far beyond simple companionship. Today, animal-assisted therapy is a rapidly growing clinical modality that offers unique pathways for emotional healing, nervous system regulation, and trauma recovery.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">The Neurobiology of the Canine Bond</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">Interacting with a friendly animal has immediate, measurable effects on our physiology. Studies show that spending even a few minutes petting a dog triggers a release of oxytocin (often called the "bonding hormone") in both the human and the dog, while simultaneously reducing levels of cortisol, the primary stress hormone. This biological shift helps to lower blood pressure, slow the heart rate, and bring the autonomic nervous system out of a state of fight-or-flight into a state of safety and connection.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Nervous System Co-Regulation</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">One of the most powerful aspects of therapy dogs is their ability to assist in co-regulation. Individuals who have experienced trauma or chronic stress often struggle with self-regulation; their nervous systems are highly sensitive to perceived threats. A well-trained therapy dog serves as a steady, calm presence. Because dogs are exceptionally sensitive to human emotional states, they respond to our somatic cues. By resting their head in a client's lap or leaning against them, they offer soothing physical feedback that helps ground the client in the present moment, making it easier to discuss and process difficult emotional material.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Overcoming Barriers to Vulnerability</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">Entering therapy can feel intimidating, and opening up to a clinician requires a high degree of trust. A therapy dog acts as an emotional bridge. Their non-judgmental presence, unconditional positive regard, and simple affection create an environment of warmth and safety. Clients often find it easier to express vulnerability or share painful experiences while holding or sitting near a dog. The dog provides a comforting buffer, allowing the client to pace their emotional disclosure in a way that feels manageable and secure.</p>
        `,
        author: {
            name: "Dr. Anat Cohen, Ph.D.",
            bio: "Clinical Psychologist, Co-Founder. Dr. Cohen has over two decades of clinical experience in helping individuals manage life stress, functional anxiety, and emotional regulation.",
            profile_image_url: "/assets/RPG_Images for UI/Anat copy.jpg"
        }
    },
    "fitness-and-mental-health": {
        id: 103,
        slug: "fitness-and-mental-health",
        title: "Fitness & Mental Health: Movement as Medicine",
        category: { name: "WELLNESS" },
        published_at: "2026-05-15T10:00:00Z",
        excerpt: "Exploring the bi-directional relationship between physical activity, neurochemistry, and mental wellness.",
        content: `
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">When we discuss the benefits of fitness, the conversation is often dominated by physical outcomes: cardiovascular strength, muscular endurance, and body composition. However, some of the most profound benefits of physical movement occur above the neck. In modern clinical psychology, movement is increasingly viewed not just as a lifestyle recommendation, but as a powerful, evidence-based intervention for mental wellness.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">The Neurochemical Cocktail of Exercise</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">When we engage in moderate to vigorous physical activity, our brain undergoes a rich neurochemical shift. Exercise triggers the release of endorphins, which act as natural pain relievers and mood elevators. But the effects go much deeper. Physical activity increases the synthesis and release of key neurotransmitters like dopamine, serotonin, and norepinephrine—the very chemicals targeted by traditional antidepressant and antianxiety medications. Furthermore, exercise stimulates the production of Brain-Derived Neurotrophic Factor (BDNF), a protein that supports brain plasticity, learning, and cognitive resilience.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Somatic Processing and Stress Release</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">Our bodies store stress and trauma. When we experience emotional overwhelm, it manifest physically as muscle tension, shallow breathing, and elevated physiological arousal. Exercise provides a healthy, active channel for somatic processing. By engaging in rhythmic movements—like running, swimming, or yoga—we allow the body to complete the biological stress response cycle. This somatic release helps to quiet the amygdala (the brain's threat-detection center) and restore a feeling of physical safety and integration.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Shifting from Perfectionism to Connection</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">For many high-achieving individuals, fitness can unfortunately become another arena for perfectionism, rigid goals, and self-judgment. To utilize movement as mental health support, it is crucial to shift our mindset from performance to connection. \"Intuitive movement\" focuses on listening to your body's needs rather than adhering to rigid metrics. Whether it is a gentle walk in nature, a high-energy dance class, or a strength training session, the goal is to cultivate presence, self-compassion, and physical agency.</p>
        `,
        author: {
            name: "Dr. Wendy Eifert, Psy.D.",
            bio: "Clinical Psychologist. Dr. Eifert works with high-achieving professionals and medical providers navigating burnout, perfectionism, and somatic wellness.",
            profile_image_url: "/assets/RPG_Images for UI/Wendy copy.jpg"
        }
    },
    "leave-the-past-where-it-belongs": {
        id: 104,
        slug: "leave-the-past-where-it-belongs",
        title: "Leave the Past Where It Belongs",
        category: { name: "HEALING" },
        published_at: "2026-05-10T10:00:00Z",
        excerpt: "How to process past emotional wounds, stop repetitive cycles, and step into the present.",
        content: `
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">Many individuals come to therapy carrying the weight of past experiences. Whether it is childhood emotional neglect, a painful relational betrayal, or past professional failures, these historical wounds often act as invisible anchors, pulling us back into repetitive emotional cycles and preventing us from fully engaging with the present.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">The Nature of Repetitive Relational Cycles</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">In attachment theory, we understand that our early experiences shape our relational blueprints—the internal working models of how relationships function. If we learned early on that we had to perform to receive love, or that vulnerability led to rejection, we often carry these expectations into our adult partnerships. We find ourselves caught in \"compulsive repetition,\" unconsciously choosing partners or enacting dynamics that recreate the very wounds we seek to heal. Breaking this cycle requires slowing down and recognizing these patterns in real time.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">The Myth of \"Just Moving On\"</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-6">A common societal expectation is that we should simply \"let go\" and move on from past pain. However, true healing is not an act of willpower or avoidance. When we suppress difficult memories or push emotions aside, they do not disappear; instead, they manifest as anxiety, somatic symptoms, or reactive behaviors. To leave the past where it belongs, we must first be willing to face it, feel the emotions associated with it, and process it in a safe, therapeutic environment. Healing is not about erasing the past, but rather integration—allowing the past to be a chapter of our story rather than the author of our present.</p>

            <h3 className="text-[22px] font-serif text-[#333a42] font-semibold mt-8 mb-4 leading-tight">Practicing Mindful Presence and Self-Compassion</h3>
            <p className="text-[17px] leading-relaxed text-[#4a535e] mb-4">To ground yourself in the present and build a new path forward, consider these core practices:</p>
            <ul className="list-disc pl-6 space-y-3 text-[17px] text-[#4a535e] mb-6">
                <li><strong>Mindful Somatic Grounding:</strong> When past hurts or anxieties resurface, bring your awareness to your physical body. Focus on your breathing, feel the ground beneath your feet, and orient yourself to your current environment. This helps signal to your nervous system that you are safe in the present.</li>
                <li><strong>Cultivate Self-Compassion:</strong> Speak to yourself with the same kindness you would offer a close friend. Acknowledge the difficulty of your past experiences without judgment or self-blame.</li>
                <li><strong>Clarify Your Present Values:</strong> Actively define who you want to be and how you want to show up in your life today. By aligning your actions with your present values, you reclaim your agency and write your own future.</li>
            </ul>
        `,
        author: {
            name: "Dr. Tamara Eromo, Psy.D.",
            bio: "Clinical Psychologist, Co-Founder. Dr. Eromo specializes in attachment science and relational systems, helping couples navigate complex relational patterns.",
            profile_image_url: "/assets/RPG_Images for UI/Tamara copy.jpg"
        }
    }
};

async function getArticle(slug: string): Promise<FullArticle | null> {
    // 1. Check local static fallback first
    if (MOCK_ARTICLES[slug]) {
        return MOCK_ARTICLES[slug];
    }

    // 2. Fetch from Fast API
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/articles/${slug}`, {
            next: { revalidate: 60 }
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error("Failed to fetch article");
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching individual article:", error);
        return null;
    }
}

// Generate Next-SEO Metadata Dynamically
export async function generateMetadata({ params }: { params: { slug: string } }) {
    const article = await getArticle(params.slug);
    if (!article) return { title: 'Article Not Found' };

    return {
        title: article.seo_meta?.meta_title || `${article.title} | Reframe Psychology Group`,
        description: article.seo_meta?.meta_description || article.excerpt,
    };
}

export default async function DynamicArticlePage({ params }: { params: { slug: string } }) {
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] py-16 px-6">
            <article className="container mx-auto max-w-3xl bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-black/[0.02] p-8 sm:p-12 md:p-16">
                
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#7ebac8] hover:text-[#5fa2b0] transition-colors duration-300">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Articles
                    </Link>
                </div>

                {/* Article Header */}
                <div className="space-y-4 border-b border-black/[0.06] pb-8 mb-8">
                    <span className="text-[10px] tracking-[0.2em] font-bold text-[#7ebac8] uppercase">
                        {article.category?.name || "Therapy"}
                    </span>
                    <h1 className="text-[30px] sm:text-[40px] font-serif text-[#333a42] font-normal leading-tight">
                        {article.title}
                    </h1>
                    <p className="text-[17px] sm:text-[18px] text-[#4a535e]/80 italic font-sans leading-relaxed">
                        {article.excerpt}
                    </p>
                    
                    {/* Date / Reading context */}
                    <p className="text-[12px] text-[#4a535e]/60 pt-1">
                        Published on {article.published_at ? new Date(article.published_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "May 28, 2026"}
                    </p>
                </div>

                {/* Article Content */}
                <div className="prose prose-stone max-w-none text-[#4a535e] font-sans">
                    {parse(article.content)}
                </div>

                {/* Author Card Section */}
                <div className="mt-16 pt-8 border-t border-black/[0.06]">
                    <div className="bg-[#fdfbf9] p-6 sm:p-8 rounded-[16px] border border-black/[0.03] flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {article.author?.profile_image_url ? (
                            <img
                                src={article.author.profile_image_url}
                                alt={article.author.name}
                                className="h-16 w-16 object-cover rounded-full border shadow-sm grayscale-[8%]"
                            />
                        ) : (
                            <div className="h-16 w-16 text-xl flex items-center justify-center rounded-full bg-[#f2ede4] text-[#333a42] font-semibold border shadow-sm">
                                Dr
                            </div>
                        )}
                        <div className="text-center sm:text-left space-y-2">
                            <h4 className="font-serif text-[18px] text-[#333a42] font-semibold">About the Author</h4>
                            <p className="text-[15px] font-semibold text-[#7ebac8]">{article.author?.name || "Clinical Expert"}</p>
                            <p className="text-[14px] text-[#4a535e] leading-relaxed">
                                {article.author?.bio || "A licensed clinical expert at Reframe Psychology Group committed to supporting patients on their mental wellness journeys."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTAs */}
                <div className="mt-12 bg-[#dbded7] p-8 rounded-[20px] flex flex-col md:flex-row items-center justify-between gap-6 border border-black/[0.02] shadow-sm">
                    <div className="text-center md:text-left">
                        <h3 className="font-serif text-[20px] text-[#333a42] font-normal leading-snug">Ready to take the next step?</h3>
                        <p className="text-[14px] text-[#4a535e] mt-1">Book an initial clinical consultation with one of our specialists.</p>
                    </div>
                    <Button size="lg" className="bg-[#333a42] hover:bg-[#252a30] text-white rounded-full font-medium px-6 py-2 h-auto" asChild>
                        <Link href="/book" className="font-sans text-[14px] tracking-wide">Book Consultation</Link>
                    </Button>
                </div>

            </article>
        </div>
    );
}
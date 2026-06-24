import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { NewsletterSignup } from "@/components/blocks/NewsletterSignup";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image_url?: string;
    published: boolean;
    published_at?: string;
    category?: { name: string };
    author?: { name: string };
}

// Fallback placeholder colors for articles without a cover image
const CARD_COLORS = ["#7ebac8", "#8ba89e", "#a09080", "#6b7f7a", "#9aab97"];

const PLACEHOLDER_ARTICLES: Article[] = [
    {
        id: -1,
        title: "Understanding Emotional Patterns in Relationships",
        slug: "#",
        excerpt: "Many of the patterns that shape how we relate to others were formed long before we were aware of them. Therapy helps bring these into focus.",
        cover_image_url: "/assets/RPG_Images for UI/Homepage_Image 1 copy.jpg",
        published: true,
    },
    {
        id: -2,
        title: "Dogs For Therapy",
        slug: "#",
        excerpt: "Animal-assisted therapy has shown remarkable results for individuals dealing with anxiety, depression, and trauma.",
        cover_image_url: "/assets/RPG_Images for UI/dog-therapy.jpg",
        published: true,
    },
    {
        id: -3,
        title: "Fitness & Mental Health",
        slug: "#",
        excerpt: "The connection between physical movement and emotional wellbeing is stronger than most people realize.",
        cover_image_url: "/assets/RPG_Images for UI/fitness-health.jpg",
        published: true,
    },
    {
        id: -4,
        title: "Leave The Past Where It Belongs",
        slug: "#",
        excerpt: "Life transitions have a way of disrupting what used to feel clear. This is where therapy can help you move forward.",
        cover_image_url: "/assets/RPG_Images for UI/leave-past.jpg",
        published: true,
    },
];

async function getPublishedArticles(): Promise<Article[]> {
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/articles`, { cache: "no-store" });
        if (res.ok) {
            const all: Article[] = await res.json();
            // Accept boolean true, numeric 1, or string "true"
            return all.filter(a => a.published === true || (a.published as any) === 1 || (a.published as any) === "true");
        }
    } catch (err) {
        console.error("Failed to load articles:", err);
    }
    return [];
}

export default async function BlogListingPage() {
    const articles = await getPublishedArticles();
    const displayArticles = articles.length > 0 ? articles : PLACEHOLDER_ARTICLES;

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-24">

            {/* Header */}
            <div className="w-full text-center mt-20 mb-16 px-4">
                <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">
                    Blogs & Articles
                </h1>
            </div>

            <div className="max-w-6xl mx-auto px-6">

                {displayArticles.length === 1 ? (
                    /* ── Single article ── */
                    <SingleCard article={displayArticles[0]} colorIndex={0} />

                ) : displayArticles.length <= 3 ? (
                    /* ── 2-3 articles: simple row ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayArticles.map((a, i) => (
                            <ImageCard key={a.id} article={a} colorIndex={i} tall={false} />
                        ))}
                    </div>

                ) : (
                    /* ── 4+ articles: bento layout ── */
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left 2/3: featured + two cards below */}
                            <div className="lg:col-span-2 flex flex-col gap-6">

                                {/* Card 1: wide featured */}
                                <FeaturedCard article={displayArticles[0]} />

                                {/* Cards 2 & 3: side by side */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageCard article={displayArticles[1]} colorIndex={1} tall />
                                    <ImageCard article={displayArticles[2]} colorIndex={2} tall />
                                </div>
                            </div>

                            {/* Right 1/3: tall vertical */}
                            <div className="lg:col-span-1">
                                <ImageCard article={displayArticles[3]} colorIndex={3} tall vertical />
                            </div>
                        </div>

                        {/* Remaining articles (5+) */}
                        {displayArticles.length > 4 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                {displayArticles.slice(4).map((a, i) => (
                                    <ImageCard key={a.id} article={a} colorIndex={(i + 4) % CARD_COLORS.length} tall={false} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <NewsletterSignup
                heading="Enjoyed what you read? Get more in your inbox."
                subheading="Our clinicians share practical mental health tools, therapy insights, and wellness perspectives — monthly."
            />
        </div>
    );
}

/* ─── Card components ──────────────────────────────── */

function FeaturedCard({ article }: { article: Article }) {
    return (
        <Link href={`/blog/${article.slug}`}
            className="group relative flex h-[300px] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">

            {/* Full background image */}
            {article.cover_image_url && (
                <img src={article.cover_image_url} alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            {/* Dark gradient overlay left side for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent z-10" />

            {/* Text content */}
            <div className="relative z-20 w-[55%] flex flex-col justify-between p-8 shrink-0">
                <div>
                    {article.category && (
                        <span className="text-[10px] tracking-[0.2em] font-bold text-white/70 uppercase block mb-2">
                            {article.category.name}
                        </span>
                    )}
                    <h2 className="text-[22px] sm:text-[26px] font-serif text-white font-normal leading-tight">
                        {article.title}
                    </h2>
                    {article.excerpt && (
                        <p className="text-[13px] sm:text-[14px] text-white/85 font-sans mt-3 leading-relaxed line-clamp-3">
                            {article.excerpt}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm group-hover:underline">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>
        </Link>
    );
}

function ImageCard({ article, colorIndex, tall, vertical = false }: {
    article: Article; colorIndex: number; tall: boolean; vertical?: boolean;
}) {
    const bg = CARD_COLORS[colorIndex % CARD_COLORS.length];
    const heightCls = vertical
        ? "h-[350px] lg:h-[724px]"
        : tall ? "h-[400px]" : "h-[280px]";

    return (
        <Link href={`/blog/${article.slug}`}
            className={`group relative block w-full ${heightCls} rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02]`}
            style={{ background: bg }}>

            {article.cover_image_url && (
                <img src={article.cover_image_url} alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            )}
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 z-10 transition-colors duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />

            <div className="absolute inset-0 z-20 flex flex-col justify-end p-7 sm:p-8">
                {article.category && (
                    <span className="text-[10px] tracking-[0.2em] font-bold text-white/60 uppercase block mb-2">
                        {article.category.name}
                    </span>
                )}
                <h2 className="text-[20px] sm:text-[22px] font-serif text-white font-normal leading-snug group-hover:text-[#e4f3f5] transition-colors duration-300">
                    {article.title}
                </h2>
                {article.excerpt && (
                    <p className="text-[13px] text-white/80 font-sans mt-2 leading-relaxed line-clamp-2">
                        {article.excerpt}
                    </p>
                )}
                <div className="flex items-center gap-2 text-white font-medium text-xs mt-4 group-hover:underline">
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>
        </Link>
    );
}

function SingleCard({ article, colorIndex }: { article: Article; colorIndex: number }) {
    return (
        <div className="max-w-2xl mx-auto">
            <FeaturedCard article={article} />
        </div>
    );
}

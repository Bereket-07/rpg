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

async function getPublishedArticles(): Promise<Article[]> {
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/articles`, { cache: "no-store" });
        if (res.ok) {
            const all: Article[] = await res.json();
            return all.filter(a => a.published);
        }
    } catch (err) {
        console.error("Failed to load articles:", err);
    }
    return [];
}

export default async function BlogListingPage() {
    const articles = await getPublishedArticles();

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-24">

            {/* Header */}
            <div className="w-full text-center mt-20 mb-16 px-4">
                <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">
                    Blogs & Articles
                </h1>
                {articles.length > 0 && (
                    <p className="text-[15px] text-[#5c6670]/70 mt-3">
                        {articles.length} article{articles.length !== 1 ? "s" : ""} from our clinical team
                    </p>
                )}
            </div>

            <div className="max-w-6xl mx-auto px-6">

                {articles.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-[#f2ede4] flex items-center justify-center">
                            <FileText className="w-7 h-7 text-[#7ebac8]" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[20px] font-serif text-[#333a42]">No articles yet</p>
                            <p className="text-[15px] text-[#5c6670]/70 max-w-xs mx-auto leading-relaxed">
                                Our clinical team is preparing thoughtful content. Check back soon.
                            </p>
                        </div>
                    </div>

                ) : articles.length === 1 ? (
                    /* ── Single article ── */
                    <SingleCard article={articles[0]} colorIndex={0} />

                ) : articles.length <= 3 ? (
                    /* ── 2-3 articles: simple row ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((a, i) => (
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
                                <FeaturedCard article={articles[0]} />

                                {/* Cards 2 & 3: side by side */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ImageCard article={articles[1]} colorIndex={1} tall />
                                    <ImageCard article={articles[2]} colorIndex={2} tall />
                                </div>
                            </div>

                            {/* Right 1/3: tall vertical */}
                            <div className="lg:col-span-1">
                                <ImageCard article={articles[3]} colorIndex={3} tall vertical />
                            </div>
                        </div>

                        {/* Remaining articles (5+) */}
                        {articles.length > 4 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                {articles.slice(4).map((a, i) => (
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
            className="group relative flex h-[300px] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02]"
            style={{ background: "#7ebac8" }}>
            {/* Left: text */}
            <div className="w-[55%] flex flex-col justify-between p-8 z-10 shrink-0">
                <div>
                    {article.category && (
                        <span className="text-[10px] tracking-[0.2em] font-bold text-white/70 uppercase block mb-2">
                            {article.category.name}
                        </span>
                    )}
                    <h2 className="text-[22px] sm:text-[26px] font-serif text-white font-normal leading-tight group-hover:text-[#e4f3f5] transition-colors duration-300">
                        {article.title}
                    </h2>
                    {article.excerpt && (
                        <p className="text-[13px] sm:text-[14px] text-white/90 font-sans mt-3 leading-relaxed line-clamp-3">
                            {article.excerpt}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm group-hover:underline">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>

            {/* Right: cover image */}
            <div className="flex-1 relative h-full bg-[#fdfaf7] rounded-r-[20px] overflow-hidden border-l border-black/[0.03]">
                {article.cover_image_url ? (
                    <img src={article.cover_image_url} alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <FileText className="w-16 h-16 text-white" />
                    </div>
                )}
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

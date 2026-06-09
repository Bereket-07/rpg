import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NewsletterSignup } from "@/components/blocks/NewsletterSignup";

export default function BlogListingPage() {
    const articles = [
        {
            slug: "role-of-iq-in-relationships",
            title: "Role of IQ in relationships",
            category: "RELATIONSHIPS",
            excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna",
            image: "/assets/RPG_Images for UI/98cc3fad-ed2c-4348-ad89-cb67ef1e9445-2026-04-17.png",
            bgType: "teal",
        },
        {
            slug: "dogs-for-therapy",
            title: "Dogs for therapy",
            category: "THERAPY",
            excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam",
            image: "/assets/RPG_Images for UI/dog-therapy.jpg",
            bgType: "image",
        },
        {
            slug: "fitness-and-mental-health",
            title: "Fitness & Mental Health",
            category: "WELLNESS",
            excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam",
            image: "/assets/RPG_Images for UI/fitness-health.jpg",
            bgType: "image",
        },
        {
            slug: "leave-the-past-where-it-belongs",
            title: "Leave the past where it belongs",
            category: "HEALING",
            excerpt: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
            image: "/assets/RPG_Images for UI/leave-past.jpg",
            bgType: "image",
        }
    ];

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-24">
            
            {/* Centered Page Header */}
            <div className="w-full text-center mt-20 mb-16 px-4">
                <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">Blogs & Articles</h1>
            </div>

            {/* Asymmetric Bento-Box Grid Container */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column Spanning 2 Columns (Contains Card 1 on top, Card 2 & 3 below) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Card 1: Wide Spanning 2 Columns - Height 300px */}
                        <Link 
                            href={`/blog/${articles[0].slug}`}
                            className="group relative block w-full h-[300px] rounded-[20px] bg-[#7ebac8] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02]"
                        >
                            <div className="flex h-full w-full">
                                {/* Left Side Content */}
                                <div className="w-[55%] flex flex-col justify-between p-8 z-10">
                                    <div>
                                        <h2 className="text-[22px] sm:text-[26px] font-serif text-white font-normal mt-2 leading-tight group-hover:text-[#e4f3f5] transition-colors duration-300">
                                            {articles[0].title}
                                        </h2>
                                        <p className="text-[13px] sm:text-[14px] text-white/90 font-sans mt-3 leading-relaxed max-w-[400px] line-clamp-3">
                                            {articles[0].excerpt}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm group-hover:underline">
                                        Read Article 
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>

                                {/* Right Side Image Column */}
                                <div className="w-[45%] relative h-full bg-[#fdfaf7] rounded-r-[20px] overflow-hidden flex items-center justify-center p-4 border-l border-black/[0.03]">
                                    <img 
                                        src={articles[0].image} 
                                        alt={articles[0].title}
                                        className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </Link>

                        {/* Bottom Row inside left column: Card 2 & Card 3 side by side - Height 400px */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Card 2: Dogs for Therapy - Height 400px */}
                            <Link 
                                href={`/blog/${articles[1].slug}`}
                                className="group relative block w-full h-[400px] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02]"
                            >
                                <div className="absolute inset-0 bg-black/15 z-10 transition-colors duration-500 group-hover:bg-black/30" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />
                                <img 
                                    src={articles[1].image} 
                                    alt={articles[1].title}
                                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                                    <div>
                                        <h2 className="text-[22px] font-serif text-white font-normal leading-tight group-hover:text-[#e4f3f5] transition-colors duration-300">
                                            {articles[1].title}
                                        </h2>
                                        <p className="text-[13px] text-white/90 font-sans mt-2 leading-relaxed line-clamp-2">
                                            {articles[1].excerpt}
                                        </p>
                                        <div className="flex items-center gap-2 text-white font-medium text-xs mt-4 group-hover:underline">
                                            Read Article 
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Card 3: Fitness & Mental Health - Height 400px */}
                            <Link 
                                href={`/blog/${articles[2].slug}`}
                                className="group relative block w-full h-[400px] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02]"
                            >
                                <div className="absolute inset-0 bg-black/15 z-10 transition-colors duration-500 group-hover:bg-black/30" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />
                                <img 
                                    src={articles[2].image} 
                                    alt={articles[2].title}
                                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                                    <div>
                                        <h2 className="text-[22px] font-serif text-white font-normal leading-tight group-hover:text-[#e4f3f5] transition-colors duration-300">
                                            {articles[2].title}
                                        </h2>
                                        <p className="text-[13px] text-white/90 font-sans mt-2 leading-relaxed line-clamp-2">
                                            {articles[2].excerpt}
                                        </p>
                                        <div className="flex items-center gap-2 text-white font-medium text-xs mt-4 group-hover:underline">
                                            Read Article 
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                        </div>
                    </div>

                    {/* Right Column: Card 4 (Tall Vertical) - Spans Height of Row 1 & 2 - Height 724px */}
                    <div className="lg:col-span-1">
                        <Link 
                            href={`/blog/${articles[3].slug}`}
                            className="group relative block w-full h-[350px] lg:h-[724px] rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 border border-black/[0.02]"
                        >
                            <div className="absolute inset-0 bg-black/20 z-10 transition-colors duration-500 group-hover:bg-black/35" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                            <img 
                                src={articles[3].image} 
                                alt={articles[3].title}
                                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                                <div>
                                    <h2 className="text-[22px] sm:text-[26px] font-serif text-white font-normal leading-snug group-hover:text-[#e4f3f5] transition-colors duration-300">
                                        {articles[3].title}
                                    </h2>
                                    <p className="text-[13px] sm:text-[14px] text-white/90 font-sans mt-3 leading-relaxed line-clamp-3 lg:line-clamp-none">
                                        {articles[3].excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm mt-4 lg:mt-6 group-hover:underline">
                                        Read Article 
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>

            {/* Newsletter CTA below articles */}
            <NewsletterSignup
                heading="Enjoyed what you read? Get more in your inbox."
                subheading="Our clinicians share practical mental health tools, therapy insights, and wellness perspectives — monthly."
            />

        </div>
    );
}

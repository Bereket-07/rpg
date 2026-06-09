import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

interface TherapistData {
    slug: string;
    name: string;
    role: string;
    credentials: string;
    image: string;
    beyondTherapy: string;
    approach: string[];
    background: string[];
    specialties: { title: string; desc: string }[];
}

export const STATIC_TEAM_MEMBERS: TherapistData[] = [
    {
        slug: "tamara-eromo",
        name: "Tamara Eromo, Psy.D.",
        role: "Clinical Psychologist, Co-Founder",
        credentials: "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY31798)",
        image: "/assets/RPG_Images for UI/Tamara copy.jpg",
        beyondTherapy: "Relationships are central to my life outside the therapy room as well. I’m a wife and mother of two, and my family life continually reminds me how important patience, repair, and connection are in close relationships. I love bringing people together and often host friends and family for gatherings or game nights. I love the energy of a full house and the simple moments of connection that happen when people gather. I also appreciate the slower pace of everyday moments that balance out the busy ones—staying active outdoors, cooking, reading, or working on a project around the house. Having space for both connection and quiet time helps me stay present in my work and in my life.",
        approach: [
            "Many couples who come to work with me are thoughtful, capable people who care deeply about their relationship but find themselves caught in the same painful cycles. Conversations that begin with good intentions can quickly turn into defensiveness, misunderstanding, or frustration, leaving both partners feeling unheard and increasingly distant.",
            "In therapy, we slow these moments down and explore the emotional and relational dynamics underneath them. My work is grounded in attachment science and relational systems, helping couples understand how past experiences and long-standing patterns shape their responses to one another.",
            "As these dynamics become clearer, couples often begin to communicate more openly, navigate difficult conversations with greater understanding, and rebuild a stronger sense of connection.",
            "In addition to couples therapy, I also work with individuals and parents who want to better understand their emotional and interpersonal patterns and build more balanced, fulfilling relationships."
        ],
        background: [
            "Dr. Tamara Eromo is a licensed clinical psychologist (PSY31798) and has been working in the mental health field since 2006.",
            "She received her doctorate in clinical psychology from Pepperdine University, a school accredited by the American Psychological Association (APA). Prior to her doctoral work, Dr. Eromo received a master's degree in clinical psychology from Pepperdine University and a bachelor's degree from University of California, Los Angeles (UCLA).",
            "Dr. Eromo has clinical training and experience in a variety of settings, including community mental health, medical centers (Harbor-UCLA Medical Center, Children's Hospital Los Angeles), and a nonprofit organization.",
            "She completed her APA-accredited internship at Kaiser Permanente Los Angeles Medical Center in 2013.",
            "With a passion for education and training, Dr. Eromo has extensive experience teaching, providing clinical supervision, and conducting psychological assessments (neuropsychological and psycho-diagnostic).",
            "She is currently adjunct clinical faculty at Pepperdine University's Graduate School of Education and Psychology, supervising doctoral level trainees since 2016."
        ],
        specialties: [
            { title: "Couples Therapy & Relationship Repair", desc: "Breaking out of recurring conflict cycles, communication breakdowns, and patterns of disconnection." },
            { title: "Emotional Intimacy & Attachment", desc: "Using an attachment-based approach to deepen connection, strengthen bonding, and create meaningful repair." },
            { title: "Trust, Resentment & Relationship Strain", desc: "Rebuilding trust, working through unresolved hurt, and navigating the impact of long-standing tension." },
            { title: "Relational Patterns & Self-Understanding", desc: "Helping individuals make sense of their attachment style, emotional responses, and patterns in relationships." },
            { title: "Parenting & Family Dynamics", desc: "Supporting parents in navigating child behavior, parent-child connection, and managing co-parenting stress and shifting family roles." },
            { title: "Life Transitions & Relationship Change", desc: "Supporting couples and individuals through transitions such as becoming parents, career shifts, and evolving identities." }
        ]
    },
    {
        slug: "anat-cohen",
        name: "Anat Cohen, Ph.D.",
        role: "Clinical Psychologist, Co-Founder",
        credentials: "CSPP PH.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY15800)",
        image: "/assets/RPG_Images for UI/Anat copy.jpg",
        beyondTherapy: "Outside of therapy, I try to spend my time in ways that reflect what I value most: connection, curiosity, and meaningful conversation. Much of my time is spent with family and close friends, often over long talks and a good cup of coffee. I enjoy laughing often, greeting every dog I meet on my daily walks, and listening to my favorite audiobooks. These small, everyday moments help keep me grounded, centered, and fully engaged in the transformative work I do with my clients.",
        approach: [
            "I help people who manage life well on the surface feel more grounded and connected to themselves and others.",
            "Many of my clients are self-aware, yet they still struggle with self-doubt, persistent internal pressure, and emotional exhaustion. Their anxiety or depression quietly influences how they see themselves, relate to others, and move through their daily lives.",
            "Long-standing beliefs, often shaped by earlier relationships and experiences, can begin to feel unquestionably true. In therapy, we pay close attention to how these patterns appear in the present moment and how you might be able to respond differently.",
            "Through honest conversation, curiosity, and a willingness to explore vulnerability, many clients begin to experience a gradual easing of internal pressure. Over time, people often find greater choice and flexibility in how they handle life's challenges, responding with intention rather than old reflexes.",
            "My style is engaged and straightforward. Clients often appreciate that I keep things real. I tend to be direct, and I often use humor and our shared humanity to make the work feel accessible. More than two decades after seeing my first client, I remain just as engaged in this work as when I began."
        ],
        background: [
            "Dr. Anat Cohen is a licensed clinical psychologist (PSY15800) with over two decades of experience in practice. She received her Ph.D. from the California School of Professional Psychology (CSPP), an institution accredited by the American Psychological Association (APA), in 1996.",
            "Dr. Cohen has provided and supervised mental health services in a variety of settings, including psychiatric hospitals and various community counseling centers.",
            "Dr. Cohen has taught, trained, mentored, and supervised numerous therapists and clinical psychologists. She has made significant contributions to the career development of countless therapists over the past two decades.",
            "As a clinical professor at Pepperdine University's Graduate School of Education and Psychology, Dr. Cohen has served as the director of the Pepperdine Community Counseling Center in Encino since 2002. The center, which has transformed into a telehealth clinic, benefits from her proven track record as an experienced clinical supervisor and leader in the field of clinical training in psychology. Dr. Cohen is passionate about community outreach and has developed pro bono parent-education workshops for local schools. She talks to parents about how they can protect their children from bullying and address various mental health challenges impacting their children and teens."
        ],
        specialties: [
            { title: "Functional Anxiety", desc: "Perfectionism, overthinking, burnout, and high-achievement stress." },
            { title: "Functional Depression", desc: "Grief and loss, midlife dissatisfaction, emotional numbness, and relational disconnection." },
            { title: "Adjustment & Stress Rebuilding after change", desc: "Divorce or breakup recovery, career stress, parenting transitions (empty nest), caregiver overwhelm." },
            { title: "Women's Issues Across the Lifespan", desc: "Role and identity shift at various stages of womanhood (e.g., motherhood, perimenopause and menopause transitions, divorce or breakup)." }
        ]
    },
    {
        slug: "wendy-eifert",
        name: "Wendy Eifert, Psy.D.",
        role: "Clinical Psychologist",
        credentials: "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY34367)",
        image: "/assets/RPG_Images for UI/Wendy copy.jpg",
        beyondTherapy: "Outside the therapy room, I deeply value the beauty of slow and intentional processes. About a year ago, I started my own sourdough starter, Penelope, and after plenty of trial, error, and flour-covered counters, weekend baking has become one of my favorite rituals. Sharing fresh bread with friends and family is a meaningful reminder that the most worthwhile things often require patience, consistency, and time. That appreciation for the long game is also shaped by my personal life. As the wife of a physician, I have lived alongside the demands, sacrifices, and invisible pressures of a medical career. This has deepened my passion for supporting both providers and the partners who carry the emotional and logistical weight of life in medicine. I also find a great deal of fulfillment in connection and movement. You can often find me on long hikes with friends, at the driving range rediscovering my golf swing, or enjoying a quiet morning coffee while the day begins. At home, my two cats, Cosmo and Calvin, are steady companions and occasional on-screen guests. Whether I’m exploring a National Park or trying a new cuisine, I’m continually drawn to curiosity, culture, and the stories people carry.",
        approach: [
            "Many of the individuals who seek my help are high-functioning, thoughtful, and deeply capable. On the outside, they appear successful and composed, yet privately feel burned out by constant pressure, disconnected from themselves, or unsure why their achievements no longer feel fulfilling or aligned.",
            "This is especially true for high-achieving professionals, graduate students, medical providers, and individuals navigating complex cultural expectations. Many have learned to adapt by staying productive, self-reliant, or emotionally “fine,” even when long-standing patterns, family messages, or the habit of pushing difficult feelings aside continue to shape how they experience stress, relationships, and major life transitions.",
            "My work helps clients understand the emotional logic behind how they learned to cope, while also gently challenging the strategies that no longer serve them. As these patterns become clearer in real time, people often begin to feel less stuck, less internally pressured, and more connected to a sense of self that feels chosen rather than inherited.",
            "My style is warm, collaborative, and engaged. I often describe it as a nurturing but firm container. I believe that thoughtfully reshaping long-standing ways of being can create space for greater flexibility, intention, and self-trust. I am firmly on the side of helping you make intentional choices, even when those choices feel uncomfortable or unfamiliar. Clients often share that they feel both supported and challenged in a way that leads to meaningful, lasting change.",
            "I bring humor, spontaneous metaphors, and psychoeducation into the work to make it feel both accessible and meaningful. My goal is to help you develop a deeper trust in yourself so that you can move through uncertainty with more steadiness, clarity, and confidence. If you're looking for a space where you can feel understood while also being empowered to grow, this work can help you move forward in a way that feels more aligned and sustainable."
        ],
        background: [
            "Dr. Wendy Eifert is a licensed clinical psychologist (PSY34367) and has been working in the mental health field since 2015. She received her doctorate in clinical psychology from Pepperdine University, an institution accredited by the American Psychological Association (APA).",
            "Prior to her doctoral work, Dr. Eifert received a Master's degree in clinical psychology with an emphasis in Marriage and Family Therapy from Pepperdine University and a bachelor's degree from the University of California, Santa Barbara.",
            "Dr. Eifert has clinical training and experience in a variety of settings, including community mental health, university counseling, and Kaiser Permanente - Los Angeles Medical Center. She completed her APA doctoral internship and postdoctoral residency at University of Southern California (USC) Counseling and Mental Health.",
            "Dr. Eifert has a passion for education and training and has embraced multiple roles, including teaching, developing training curriculums, and providing clinical supervision. She is currently adjunct clinical faculty at Pepperdine University's Graduate School of Education and Psychology."
        ],
        specialties: [
            { title: "High-Achieving Professionals & Emerging Adults", desc: "Burnout, perfectionism, and the gap between success and fulfillment." },
            { title: "Trauma, Avoidance & Attachment", desc: "Helping resilient adults move beyond survival patterns and safely reclaim their story." },
            { title: "Identity, Culture & Life Transitions", desc: "Deconstructing inherited values, navigating first-gen pressure, and building an authentic adult identity." },
            { title: "Relational Patterns & Boundaries", desc: "Healing anxious attachment, overfunctioning, and relational roles that no longer fit." },
            { title: "Life in Medicine", desc: "Supporting providers and partners through burnout, resentment, and the emotional cost of medical culture." }
        ]
    },
    {
        slug: "valarie-gardner",
        name: "Valarie Gardner, M.A., AMFT",
        role: "Marriage and Family Therapy Associate",
        credentials: "REGISTERED ASSOCIATE MFT (AMFT140224)",
        image: "/assets/RPG_Images for UI/Valarie copy.jpg",
        beyondTherapy: "Outside of the clinical setting, I love spending time outdoors, staying active, and exploring California's hiking trails. I'm passionate about nature and finding peace through connection, art, and quiet moments that balance out the fast pace of modern life.",
        approach: [
            "I believe that every individual holds the capacity for deep healing when provided with a safe, non-judgmental, and attuned clinical environment.",
            "I work closely with individuals and couples to process unresolved hurt and rebuild structural trust. My clinical practice is deeply collaborative and focuses on attachment healing."
        ],
        background: [
            "Valarie received her master's degree in clinical psychology and is currently a Registered Associate Marriage and Family Therapist (AMFT140224).",
            "She has extensive training in EMDR, attachment-based modalities, trauma-informed care, and couples systems."
        ],
        specialties: [
            { title: "Individual Therapy", desc: "Navigating self-esteem, attachment styles, anxiety, and depression." },
            { title: "EMDR & Trauma Recovery", desc: "Processing adverse childhood events and traumatic blocks via certified EMDR protocols." },
            { title: "Couples & Relationship Growth", desc: "Strengthening emotional responsiveness, repair, and trust in relationships." }
        ]
    },
    {
        slug: "hedieh-hakakian",
        name: "Hedieh Hakakian, Psy.D.",
        role: "Clinical Psychologist",
        credentials: "LICENSED CLINICAL PSYCHOLOGIST (PSY32551)",
        image: "/assets/RPG_Images for UI/Hedieh copy.jpg",
        beyondTherapy: "Outside the therapy room, my favorite moments are spent over long family dinners, discovering new books, and traveling to explore new cultures. Cultivating meaningful personal relationships with friends and family keeps me present and attuned to the diverse stories of my clients.",
        approach: [
            "I focus on helping individuals, couples, and parents decode their interpersonal dynamics.",
            "We work together to slow down high-conflict triggers, identify hidden relational needs, and create new ways of interacting that promote family harmony, co-parenting alignment, and mutual respect."
        ],
        background: [
            "Dr. Hedieh Hakakian is a licensed clinical psychologist (PSY32551) with years of training in family systems, attachment dynamics, and evidence-based clinical practices.",
            "She works with clients on both individual and systemic relational levels."
        ],
        specialties: [
            { title: "Couples Therapy", desc: "Breaking conflict cycles and improving deep emotional communication." },
            { title: "Parenting & Co-Parenting Stress", desc: "Supporting parent-child bonding, navigating adolescent behavior, and managing co-parenting roles." },
            { title: "Interpersonal Growth", desc: "Identifying recurring attachment habits and consciously replacing them." }
        ]
    }
];

async function getClinicians() {
    try {
        const res = await fetch(`${getApiUrl()}/api/v1/authors?team_only=true`, {
            cache: "no-store",
        });
        if (!res.ok) return STATIC_TEAM_MEMBERS;
        const data = await res.json();
        if (!Array.isArray(data)) return STATIC_TEAM_MEMBERS;

        // Map dynamic authors to TherapistData
        return data.map((auth: any) => {
            const staticFallback = STATIC_TEAM_MEMBERS.find(s => s.name.includes(auth.name) || auth.name.includes(s.name));
            
            // Clean slug generation
            const slug = auth.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            return {
                slug: slug,
                name: auth.name,
                role: auth.role || staticFallback?.role || "Clinical Psychologist",
                credentials: auth.credentials || staticFallback?.credentials || "",
                image: auth.profile_image_url || staticFallback?.image || "/assets/RPG Logo_Main Portrait.png",
                beyondTherapy: auth.beyond_therapy || staticFallback?.beyondTherapy || "",
                approach: auth.approach_paragraphs && auth.approach_paragraphs.length > 0 ? auth.approach_paragraphs : (staticFallback?.approach || []),
                background: auth.background_paragraphs && auth.background_paragraphs.length > 0 ? auth.background_paragraphs : (staticFallback?.background || []),
                specialties: auth.specialties_list && auth.specialties_list.length > 0 ? auth.specialties_list : (staticFallback?.specialties || [])
            };
        });
    } catch (err) {
        console.error("Failed to query dynamic therapists, falling back to preloaded:", err);
        return STATIC_TEAM_MEMBERS;
    }
}

export default async function TeamListingPage() {
    const teamMembers = await getClinicians();

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-28">
            <div className="w-full text-center mt-20 mb-28">
                <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">OUR SPECIALISTS</p>
                <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">Meet the Team</h1>
            </div>

            <section className="bg-[#fdf8f5] font-sans text-[#333a42]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-28 lg:gap-x-12">
                        {teamMembers.map((member) => {
                            const specialties = member.specialties?.length
                                ? member.specialties.map(spec => spec.title).join(", ")
                                : "Individual Therapy";
                            const imageClass = member.slug.includes("valarie-gardner")
                                ? "w-full h-full object-cover scale-[1.05] object-top origin-top group-hover:scale-[1.1] transition-all duration-500"
                                : "w-full h-full object-cover scale-[1.3] origin-center group-hover:scale-[1.35] transition-all duration-500";

                            return (
                                <article
                                    key={member.slug}
                                    className="w-[320px] sm:w-[340px] h-[330px] sm:h-[345px] bg-[#d2c9b7] border border-[#c4b9a3]/40 rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.14)] p-6 pt-[110px] sm:pt-[120px] relative flex flex-col items-center text-center pb-6 hover:shadow-[0_28px_56px_rgba(30,28,24,0.22)] hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="w-[185px] h-[185px] sm:w-[200px] sm:h-[200px] rounded-full border-[8px] border-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] absolute top-[-92px] sm:top-[-100px] left-1/2 -translate-x-1/2 overflow-hidden bg-muted">
                                        <img src={member.image} alt={member.name} className={imageClass} />
                                    </div>

                                    <div className="flex-grow flex flex-col justify-between w-full h-full pb-1">
                                        <div className="flex flex-col items-center">
                                            <h2 className="text-[20px] sm:text-[21px] md:text-[22px] font-sans font-extrabold text-[#333a42] leading-tight tracking-wide">
                                                {member.name}
                                            </h2>
                                            <div className="w-10 h-[1.5px] bg-[#333a42]/30 my-2.5" />
                                            <p className="text-[13px] sm:text-[13px] md:text-[14px] font-sans font-semibold text-[#4a535e] leading-snug tracking-wide">
                                                {member.role}
                                            </p>
                                            <p className="text-[12px] sm:text-[12px] md:text-[13px] font-sans text-[#4a535e]/90 leading-relaxed max-w-[270px] pt-1 font-medium tracking-wide">
                                                {specialties}
                                            </p>
                                        </div>

                                        <div className="pt-2">
                                            <Link
                                                href={`/team/${member.slug}`}
                                                className="font-serif italic text-[14px] sm:text-[15px] text-[#333a42] hover:text-[#5c6670] transition-colors"
                                            >
                                                Read More
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-24">
            
            {/* Centered Page Header */}
            <div className="w-full text-center mt-20 mb-16">
                <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">OUR SPECIALISTS</p>
                <h1 className="text-[34px] sm:text-[42px] font-serif text-[#333a42] font-normal tracking-tight">Meet the Team</h1>
            </div>

            {/* Loop through all therapists and render their full details sequentially */}
            <div className="space-y-0">
                {teamMembers.map((profile) => {
                    const backgroundList = profile.background || [];
                    const half = Math.ceil(backgroundList.length / 2);
                    const leftCol = backgroundList.slice(0, half);
                    const rightCol = backgroundList.slice(half);

                    return (
                        <div key={profile.slug} className="w-full border-t border-black/[0.04]">
                            
                            {/* Section 1: Portrait & Therapeutic Approach - White Background */}
                            <section className="bg-white py-24">
                                <div className="container mx-auto px-6 max-w-6xl">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
                                        
                                        {/* Left Column: Portrait & Title */}
                                        <div className="md:col-span-5 lg:col-span-4 space-y-6 text-left">
                                            <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-black/[0.03]">
                                                <img 
                                                    src={profile.image} 
                                                    alt={profile.name} 
                                                    className="w-full h-full object-cover grayscale-[8%] hover:grayscale-0 transition-all duration-500"
                                                />
                                            </div>
                                            <div className="pb-6 max-w-[280px]">
                                                <h2 className="text-[22px] font-serif text-[#333a42] font-semibold leading-tight">
                                                    {profile.slug === "tamara-eromo" ? `‘${profile.name}` : profile.name}
                                                </h2>
                                                <p className="text-[15px] font-sans text-[#4a535e] mt-1">{profile.role}</p>
                                                <div className="w-12 h-[1px] bg-[#333a42]/30 mt-5" />
                                            </div>
                                        </div>

                                        {/* Right Column: Dynamic paragraphs of Approach */}
                                        <div className="md:col-span-7 lg:col-span-8 space-y-6 text-left md:pt-2">
                                            <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Approach</h2>
                                            <div className="space-y-5 text-base sm:text-[17px] text-[#4a535e] leading-relaxed font-normal">
                                                {profile.approach.map((para, idx) => (
                                                    <p key={idx}>{para}</p>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Beyond Therapy full-bleed Quote section - Sage-green background */}
                            {profile.beyondTherapy && (
                                <section className="bg-[#dbded7] py-20 border-t border-b border-black/[0.02]">
                                    <div className="container mx-auto px-6 max-w-5xl text-center space-y-6">
                                        <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal tracking-tight">Beyond Therapy</h2>
                                        
                                        <div className="relative max-w-4xl mx-auto px-12 sm:px-16 flex items-start gap-4">
                                            <span className="text-[54px] font-serif font-bold text-[#424c56]/60 leading-none select-none absolute left-0 top-0 font-serif">“</span>
                                            <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-[#4a535e] leading-relaxed font-medium text-left">
                                                {profile.beyondTherapy}
                                            </p>
                                            <span className="text-[54px] font-serif font-bold text-[#424c56]/60 leading-none select-none absolute right-0 bottom-0 font-serif">”</span>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Section 3: Specialty Areas of Practice Grid - Cream background */}
                            {profile.specialties && profile.specialties.length > 0 && (
                                <section className="bg-[#fdf8f5] py-24 border-b border-black/[0.03]">
                                    <div className="container mx-auto px-6 max-w-6xl text-center">
                                        <h2 className="text-2xl lg:text-[30px] font-serif text-[#333a42] mb-16 font-normal">Specialty Areas of Practice</h2>
                                        
                                        <div className={profile.specialties.length === 4 ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                                            {profile.specialties.map((spec, idx) => (
                                                <div key={idx} className="bg-[#f2ede4] p-8 flex flex-col justify-between items-center text-center rounded-none border border-[#e5e0d8]/40 shadow-sm">
                                                    <div className="space-y-4 w-full">
                                                        <h3 className="font-serif text-[17px] text-[#333a42] font-semibold tracking-wide leading-snug">
                                                            {spec.title}
                                                        </h3>
                                                        <div className="w-8 h-[1px] bg-[#333a42]/30 mx-auto" />
                                                        <p className="text-[14px] text-[#4a535e] leading-relaxed">
                                                            {spec.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Section 4: Background and Education Column Layout - White Background */}
                            {backgroundList.length > 0 && (
                                <section className="bg-white py-24">
                                    <div className="container mx-auto px-6 max-w-5xl text-center">
                                        <div className="flex flex-col items-center mb-12">
                                            <div className="w-14 h-14 rounded-full bg-[#f2ede4] flex items-center justify-center text-[#333a42] mb-4 shadow-sm border border-black/[0.01]">
                                                <GraduationCap className="w-8 h-8 stroke-[1.5]" />
                                            </div>
                                            <h2 className="text-2xl lg:text-[28px] font-serif text-[#333a42] font-normal">Background and Education</h2>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 text-left text-sm sm:text-base leading-relaxed text-[#4a535e] font-normal">
                                            <div className="space-y-4">
                                                {leftCol.map((para, idx) => (
                                                    <p key={idx}>{para}</p>
                                                ))}
                                            </div>
                                            <div className="space-y-4">
                                                {rightCol.map((para, idx) => (
                                                    <p key={idx}>{para}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                        </div>
                    );
                })}
            </div>

        </div>
    );
}

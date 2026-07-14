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
        beyondTherapy: "Relationships are central to my life outside the therapy room as well. I’m a wife and mother of two, and my family life continually reminds me how important patience, repair, and connection are in close relationships.\n\nI love bringing people together and often host friends and family for gatherings or game nights. I love the energy of a full house and the simple moments of connection that happen when people gather.\n\nI also appreciate the slower pace of everyday moments that balance out the busy ones—staying active outdoors, cooking, reading, or working on a project around the house. Having space for both connection and quiet time helps me stay present in my work and in my life.",
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
            { title: "Parenting & Family Dynamics", desc: "Supporting parents in navigating child behavior, strengthening parent-child connection, and managing co-parenting stress and shifting family roles." },
            { title: "Life Transitions & Relationship Change", desc: "Supporting couples and individuals through transitions such as becoming parents, career shifts, and evolving identities." },
        ]
    },
    {
        slug: "anat-cohen",
        name: "Anat Cohen, Ph.D.",
        role: "Clinical Psychologist, Co-Founder",
        credentials: "CSPP PH.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY15800)",
        image: "/assets/RPG_Images for UI/Anat copy.jpg",
        beyondTherapy: "Outside of therapy, I try to spend my time in ways that reflect what I value most: connection, curiosity, and meaningful conversation. Much of my time is spent with family and close friends, often over long talks and a good cup of coffee.\n\nI enjoy laughing often, greeting every dog I meet on my daily walks, and listening to my favorite audiobooks. These small, everyday moments help keep me grounded, centered, and fully engaged in the transformative work I do with my clients.",
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
            { title: "Women's Issues Across the Lifespan", desc: "Role and identity shift at various stages of womanhood (e.g., motherhood, perimenopause and menopause transitions, divorce or breakup)." },
        ]
    },
    {
        slug: "wendy-eifert",
        name: "Wendy Eifert, Psy.D.",
        role: "Clinical Psychologist",
        credentials: "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY34367)",
        image: "/assets/RPG_Images for UI/Wendy copy.jpg",
        beyondTherapy: "Outside the therapy room, I deeply value the beauty of slow and intentional processes. About a year ago, I started my own sourdough starter, Penelope, and after plenty of trial, error, and flour-covered counters, weekend baking has become one of my favorite rituals. Sharing fresh bread with friends and family is a meaningful reminder that the most worthwhile things often require patience, consistency, and time.\n\nThat appreciation for the long game is also shaped by my personal life. As the wife of a physician, I have lived alongside the demands, sacrifices, and invisible pressures of a medical career. This has deepened my passion for supporting both providers and the partners who carry the emotional and logistical weight of life in medicine.\n\nI also find a great deal of fulfillment in connection and movement. You can often find me on long hikes with friends, at the driving range rediscovering my golf swing, or enjoying a quiet morning coffee while the day begins. At home, my two cats, Cosmo and Calvin, are steady companions and occasional on-screen guests. Whether I’m exploring a National Park or trying a new cuisine, I’m continually drawn to curiosity, culture, and the stories people carry.",
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
            { title: "Individual Therapy", desc: "Supporting high-functioning adults through burnout, perfectionism, and life transitions." },
            { title: "Couples Therapy", desc: "Helping couples navigate conflict, attachment wounds, and relational patterns." },
        ]
    },
    {
        slug: "valarie-gardner",
        name: "Valarie Gardner, M.A., AMFT",
        role: "Marriage and Family Therapy Associate",
        credentials: "REGISTERED ASSOCIATE MFT (AMFT140224)",
        image: "/assets/RPG_Images for UI/Valarie copy.jpg",
        beyondTherapy: "Outside of the clinical setting, I love spending time outdoors, staying active, and exploring California's hiking trails.\n\nI'm passionate about nature and finding peace through connection, art, and quiet moments that balance out the fast pace of modern life.",
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
            { title: "Couples Therapy", desc: "Strengthening emotional responsiveness, repair, and trust in relationships." },
            { title: "Parenting Support, EMDR", desc: "Processing trauma and supporting families through attachment-based care." },
        ]
    },
    {
        slug: "hedieh-hakakian",
        name: "Hedieh Hakakian, Psy.D.",
        role: "Clinical Psychologist",
        credentials: "LICENSED CLINICAL PSYCHOLOGIST (PSY32551)",
        image: "/assets/RPG_Images for UI/Hedieh copy.jpg",
        beyondTherapy: "Outside the therapy room, my favorite moments are spent over long family dinners, discovering new books, and traveling to explore new cultures.\n\nCultivating meaningful personal relationships with friends and family keeps me present and attuned to the diverse stories of my clients.",
        approach: [
            "I focus on helping individuals, couples, and parents decode their interpersonal dynamics.",
            "We work together to slow down high-conflict triggers, identify hidden relational needs, and create new ways of interacting that promote family harmony, co-parenting alignment, and mutual respect."
        ],
        background: [
            "Dr. Hedieh Hakakian is a licensed clinical psychologist (PSY32551) with years of training in family systems, attachment dynamics, and evidence-based clinical practices.",
            "She works with clients on both individual and systemic relational levels."
        ],
        specialties: [
            { title: "Individual Therapy", desc: "Supporting individuals through self-esteem, anxiety, and interpersonal growth." },
            { title: "Couples Therapy", desc: "Breaking conflict cycles and improving deep emotional communication." },
            { title: "Parenting Support", desc: "Supporting parent-child bonding and managing co-parenting roles." },
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
                specialties: staticFallback?.specialties || []
            };
        });
    } catch (err) {
        console.error("Failed to query dynamic therapists, falling back to preloaded:", err);
        return STATIC_TEAM_MEMBERS;
    }
}

function TherapistCard({ member }: { member: TherapistData }) {
    const specialties = member.specialties?.length
        ? member.specialties.slice(0, 3).map(spec => spec.title).join(", ")
        : "Individual Therapy";

    return (
        <article
            key={member.slug}
            style={{
                background: 'linear-gradient(#D6CFC2, #D6CFC2) padding-box, linear-gradient(to bottom, #D6CFC2, #FFFAF5) border-box',
                border: '1px solid transparent'
            }}
            className="w-[380px] h-[425px] rounded-[16px] shadow-[0_24px_48px_rgba(30,28,24,0.14)] p-6 pt-[120px] relative flex flex-col items-center text-center pb-6 hover:shadow-[0_28px_56px_rgba(30,28,24,0.22)] hover:-translate-y-1 transition-all duration-300 group"
        >
            {/* Circular Photo Container with transparent background and circular mask */}
            <div className="w-[185px] h-[185px] sm:w-[200px] sm:h-[200px] rounded-full border-[8px] border-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] absolute top-[-92px] sm:top-[-100px] left-1/2 -translate-x-1/2 overflow-hidden bg-transparent">
                <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 group-hover:scale-[1.05]" 
                />
            </div>

            <div className="flex-grow flex flex-col justify-between w-full h-full pb-1">
                <div className="flex flex-col items-center">
                    <h2 className="text-[30px] font-sans font-bold text-[#333a42] leading-tight tracking-wide">
                        {member.name}
                    </h2>
                    <div className="w-10 h-[1.5px] bg-[#333a42]/45 my-2" />
                    <p className="text-[22px] font-sans font-medium text-[#333a42]/85 leading-snug tracking-wide">
                        {member.role}
                    </p>
                    <p className="text-[20px] font-sans font-light text-[#4a535e] leading-snug max-w-[320px] pt-1 tracking-wide">
                        {specialties}
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href={`/team/${member.slug}`}
                        className="font-serif italic text-[14px] text-[#333a42] hover:text-[#5c6670] transition-colors"
                    >
                        Read More
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default async function TeamListingPage() {
    const teamMembers = await getClinicians();
    const row1 = teamMembers.slice(0, 3);
    const row2 = teamMembers.slice(3);

    return (
        <div className="bg-[#FDF8F5] min-h-screen font-sans text-[#4a535e] pb-28">
            <div className="w-full text-center mt-20 mb-28">
                <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#7ebac8] mb-3">OUR SPECIALISTS</p>
                <h1 className="text-[38px] sm:text-[52px] font-serif text-[#333a42] font-semibold tracking-tight">Meet the Team</h1>
            </div>

            <section className="bg-[#fdf8f5] font-sans text-[#333a42]">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Row 1 — 3 therapists centered */}
                    <div className="flex flex-wrap sm:flex-nowrap justify-center gap-x-4 md:gap-x-8 lg:gap-x-12 gap-y-28">
                        {row1.map((member) => (
                            <TherapistCard key={member.slug} member={member} />
                        ))}
                    </div>

                    {/* Row 2 — remaining therapists centered */}
                    {row2.length > 0 && (
                        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-x-4 md:gap-x-8 lg:gap-x-12 gap-y-28 mt-28">
                            {row2.map((member) => (
                                <TherapistCard key={member.slug} member={member} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

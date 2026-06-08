from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.author_category import Author


DEFAULT_AUTHOR_NAMES = [
    "Anat Cohen, Ph.D.",
    "Tamara Eromo, Psy.D.",
    "Wendy Eifert, Psy.D.",
    "Hedieh Hakakian, Psy.D.",
    "Valarie Gardner, M.A., AMFT",
]

DEFAULT_AUTHORS = [
    {
        "name": "Anat Cohen, Ph.D.",
        "role": "Clinical Psychologist, Co-Founder",
        "credentials": "CSPP PH.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY15800)",
        "profile_image_url": "/assets/RPG_Images for UI/Anat copy.jpg",
        "beyond_therapy": "Outside of therapy, I try to spend my time in ways that reflect what I value most: connection, curiosity, and meaningful conversation. Much of my time is spent with family and close friends, often over long talks and a good cup of coffee. I enjoy laughing often, greeting every dog I meet on my daily walks, and listening to my favorite audiobooks. These small, everyday moments help keep me grounded, centered, and fully engaged in the transformative work I do with my clients.",
        "approach_paragraphs": [
            "I help people who manage life well on the surface feel more grounded and connected to themselves and others.",
            "Many of my clients are self-aware, yet they still struggle with self-doubt, persistent internal pressure, and emotional exhaustion.",
            "Long-standing beliefs, often shaped by earlier relationships and experiences, can begin to feel unquestionably true. In therapy, we pay close attention to how these patterns appear in the present moment and how you might be able to respond differently.",
            "Through honest conversation, curiosity, and a willingness to explore vulnerability, many clients begin to experience a gradual easing of internal pressure. Over time, people often find greater choice and flexibility in how they handle life's challenges, responding with intention rather than old reflexes.",
            "My style is engaged and straightforward. Clients often appreciate that I keep things real. I tend to be direct, and I often use humor and our shared humanity to make the work feel accessible. More than two decades after seeing my first client, I remain just as engaged in this work as when I began.",
        ],
        "background_paragraphs": [
            "Dr. Anat Cohen is a licensed clinical psychologist (PSY15800) with over two decades of experience in practice. She received her Ph.D. from the California School of Professional Psychology (CSPP), an institution accredited by the American Psychological Association (APA), in 1996.",
            "Dr. Cohen has provided and supervised mental health services in a variety of settings, including psychiatric hospitals and various community counseling centers.",
            "Dr. Cohen has taught, trained, mentored, and supervised numerous therapists and clinical psychologists. She has made significant contributions to the career development of countless therapists over the past two decades.",
            "As a clinical professor at Pepperdine University's Graduate School of Education and Psychology, Dr. Cohen has served as the director of the Pepperdine Community Counseling Center in Encino since 2002. The center, which has transformed into a telehealth clinic, benefits from her proven track record as an experienced clinical supervisor and leader in the field of clinical training in psychology. Dr. Cohen is passionate about community outreach and has developed pro bono parent-education workshops for local schools. She talks to parents about how they can protect their children from bullying and address various mental health challenges impacting their children and teens.",
        ],
        "specialties_list": [
            {"title": "Functional Anxiety", "desc": "Perfectionism, overthinking, burnout, and high-achievement stress."},
            {"title": "Functional Depression", "desc": "Grief and loss, midlife dissatisfaction, emotional numbness, and relational disconnection."},
            {"title": "Adjustment & Stress Rebuilding after change", "desc": "Divorce or breakup recovery, career stress, parenting transitions (empty nest), caregiver overwhelm."},
            {"title": "Women's Issues Across the Lifespan", "desc": "Role and identity shift at various stages of womanhood (e.g., motherhood, perimenopause and menopause transitions, divorce or breakup)."},
        ],
    },
    {
        "name": "Tamara Eromo, Psy.D.",
        "role": "Clinical Psychologist, Co-Founder",
        "credentials": "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY31798)",
        "profile_image_url": "/assets/RPG_Images for UI/Tamara copy.jpg",
        "beyond_therapy": "Relationships are central to my life outside the therapy room as well. I'm a wife and mother of two, and my family life continually reminds me how important patience, repair, and connection are in close relationships. I love bringing people together and often host friends and family for gatherings or game nights. I love the energy of a full house and the simple moments of connection that happen when people gather. I also appreciate the slower pace of everyday moments that balance out the busy ones - staying active outdoors, cooking, reading, or working on a project around the house. Having space for both connection and quiet time helps me stay present in my work and in my life.",
        "approach_paragraphs": [
            "Many couples who come to work with me are thoughtful, capable people who care deeply about their relationship but find themselves caught in the same painful cycles.",
            "In therapy, we slow these moments down and explore the emotional and relational dynamics underneath them. My work is grounded in attachment science and relational systems, helping couples understand how past experiences and long-standing patterns shape their responses to one another.",
            "As these dynamics become clearer, couples often begin to communicate more openly, navigate difficult conversations with greater understanding, and rebuild a stronger sense of connection.",
            "In addition to couples therapy, I also work with individuals and parents who want to better understand their emotional and interpersonal patterns and build more balanced, fulfilling relationships.",
        ],
        "background_paragraphs": [
            "Dr. Tamara Eromo is a licensed clinical psychologist (PSY31798) and has been working in the mental health field since 2006.",
            "She received her doctorate in clinical psychology from Pepperdine University, a school accredited by the American Psychological Association (APA). Prior to her doctoral work, Dr. Eromo received a master's degree in clinical psychology from Pepperdine University and a bachelor's degree from University of California, Los Angeles (UCLA).",
            "Dr. Eromo has clinical training and experience in a variety of settings, including community mental health, medical centers (Harbor-UCLA Medical Center, Children's Hospital Los Angeles), and a nonprofit organization.",
            "She completed her APA-accredited internship at Kaiser Permanente Los Angeles Medical Center in 2013.",
            "With a passion for education and training, Dr. Eromo has extensive experience teaching, providing clinical supervision, and conducting psychological assessments (neuropsychological and psycho-diagnostic).",
            "She is currently adjunct clinical faculty at Pepperdine University's Graduate School of Education and Psychology, supervising doctoral level trainees since 2016.",
        ],
        "specialties_list": [
            {"title": "Couples Therapy & Relationship Repair", "desc": "Breaking out of recurring conflict cycles, communication breakdowns, and patterns of disconnection."},
            {"title": "Emotional Intimacy & Attachment", "desc": "Using an attachment-based approach to deepen connection, strengthen bonding, and create meaningful repair."},
            {"title": "Trust, Resentment & Relationship Strain", "desc": "Rebuilding trust, working through unresolved hurt, and navigating the impact of long-standing tension."},
            {"title": "Relational Patterns & Self-Understanding", "desc": "Helping individuals make sense of their attachment style, emotional responses, and patterns in relationships."},
            {"title": "Parenting & Family Dynamics", "desc": "Supporting parents in navigating child behavior, parent-child connection, and managing co-parenting stress and shifting family roles."},
            {"title": "Life Transitions & Relationship Change", "desc": "Supporting couples and individuals through transitions such as becoming parents, career shifts, and evolving identities."},
        ],
    },
    {
        "name": "Wendy Eifert, Psy.D.",
        "role": "Clinical Psychologist",
        "credentials": "PEPPERDINE PSY.D. | LICENSED CLINICAL PSYCHOLOGIST (PSY34367)",
        "profile_image_url": "/assets/RPG_Images for UI/Wendy copy.jpg",
        "beyond_therapy": "Outside the therapy room, I deeply value the beauty of slow and intentional processes. About a year ago, I started my own sourdough starter, Penelope, and after plenty of trial, error, and flour-covered counters, weekend baking has become one of my favorite rituals. Sharing fresh bread with friends and family is a meaningful reminder that the most worthwhile things often require patience, consistency, and time. That appreciation for the long game is also shaped by my personal life. As the wife of a physician, I have lived alongside the demands, sacrifices, and invisible pressures of a medical career. This has deepened my passion for supporting both providers and the partners who carry the emotional and logistical weight of life in medicine. I also find a great deal of fulfillment in connection and movement. You can often find me on long hikes with friends, at the driving range rediscovering my golf swing, or enjoying a quiet morning coffee while the day begins. At home, my two cats, Cosmo and Calvin, are steady companions and occasional on-screen guests. Whether I'm exploring a National Park or trying a new cuisine, I'm continually drawn to curiosity, culture, and the stories people carry.",
        "approach_paragraphs": [
            "Many of the individuals who seek my help are high-functioning, thoughtful, and deeply capable.",
            "This is especially true for high-achieving professionals, graduate students, medical providers, and individuals navigating complex cultural expectations. Many have learned to adapt by staying productive, self-reliant, or emotionally fine, even when long-standing patterns, family messages, or the habit of pushing difficult feelings aside continue to shape how they experience stress, relationships, and major life transitions.",
            "My work helps clients understand the emotional logic behind how they learned to cope, while also gently challenging the strategies that no longer serve them. As these patterns become clearer in real time, people often begin to feel less stuck, less internally pressured, and more connected to a sense of self that feels chosen rather than inherited.",
            "My style is warm, collaborative, and engaged. I often describe it as a nurturing but firm container. I believe that thoughtfully reshaping long-standing ways of being can create space for greater flexibility, intention, and self-trust. I am firmly on the side of helping you make intentional choices, even when those choices feel uncomfortable or unfamiliar. Clients often share that they feel both supported and challenged in a way that leads to meaningful, lasting change.",
            "I bring humor, spontaneous metaphors, and psychoeducation into the work to make it feel both accessible and meaningful. My goal is to help you develop a deeper trust in yourself so that you can move through uncertainty with more steadiness, clarity, and confidence. If you're looking for a space where you can feel understood while also being empowered to grow, this work can help you move forward in a way that feels more aligned and sustainable.",
        ],
        "background_paragraphs": [
            "Dr. Wendy Eifert is a licensed clinical psychologist (PSY34367) and has been working in the mental health field since 2015. She received her doctorate in clinical psychology from Pepperdine University, an institution accredited by the American Psychological Association (APA).",
            "Prior to her doctoral work, Dr. Eifert received a Master's degree in clinical psychology with an emphasis in Marriage and Family Therapy from Pepperdine University and a bachelor's degree from the University of California, Santa Barbara.",
            "Dr. Eifert has clinical training and experience in a variety of settings, including community mental health, university counseling, and Kaiser Permanente - Los Angeles Medical Center. She completed her APA doctoral internship and postdoctoral residency at University of Southern California (USC) Counseling and Mental Health.",
            "Dr. Eifert has a passion for education and training and has embraced multiple roles, including teaching, developing training curriculums, and providing clinical supervision. She is currently adjunct clinical faculty at Pepperdine University's Graduate School of Education and Psychology.",
        ],
        "specialties_list": [
            {"title": "High-Achieving Professionals & Emerging Adults", "desc": "Burnout, perfectionism, and the gap between success and fulfillment."},
            {"title": "Trauma, Avoidance & Attachment", "desc": "Helping resilient adults move beyond survival patterns and safely reclaim their story."},
            {"title": "Identity, Culture & Life Transitions", "desc": "Deconstructing inherited values, navigating first-gen pressure, and building an authentic adult identity."},
            {"title": "Relational Patterns & Boundaries", "desc": "Healing anxious attachment, overfunctioning, and relational roles that no longer fit."},
            {"title": "Life in Medicine", "desc": "Supporting providers and partners through burnout, resentment, and the emotional cost of medical culture."},
        ],
    },
    {
        "name": "Hedieh Hakakian, Psy.D.",
        "role": "Clinical Psychologist",
        "credentials": "LICENSED CLINICAL PSYCHOLOGIST (PSY32551)",
        "profile_image_url": "/assets/RPG_Images for UI/Hedieh copy.jpg",
        "beyond_therapy": "Outside the therapy room, my favorite moments are spent over long family dinners, discovering new books, and traveling to explore new cultures.",
        "approach_paragraphs": [
            "I focus on helping individuals, couples, and parents decode their interpersonal dynamics.",
            "We work together to slow down high-conflict triggers, identify hidden relational needs, and create new ways of interacting.",
        ],
        "background_paragraphs": [
            "Dr. Hedieh Hakakian is a licensed clinical psychologist (PSY32551) with years of training in family systems and attachment dynamics.",
        ],
        "specialties_list": [
            {"title": "Couples Therapy", "desc": "Breaking conflict cycles and improving deep emotional communication."},
            {"title": "Parenting & Co-Parenting Stress", "desc": "Supporting parent-child bonding and managing co-parenting roles."},
            {"title": "Interpersonal Growth", "desc": "Identifying recurring attachment habits and consciously replacing them."},
        ],
    },
    {
        "name": "Valarie Gardner, M.A., AMFT",
        "role": "Marriage and Family Therapy Associate",
        "credentials": "REGISTERED ASSOCIATE MFT (AMFT140224)",
        "profile_image_url": "/assets/RPG_Images for UI/Valarie copy.jpg",
        "beyond_therapy": "Outside of the clinical setting, I love spending time outdoors, staying active, and exploring California's hiking trails.",
        "approach_paragraphs": [
            "I believe that every individual holds the capacity for deep healing when provided with a safe, non-judgmental, and attuned clinical environment.",
            "I work closely with individuals and couples to process unresolved hurt and rebuild structural trust.",
        ],
        "background_paragraphs": [
            "Valarie received her master's degree in clinical psychology and is currently a Registered Associate Marriage and Family Therapist (AMFT140224).",
            "She has extensive training in EMDR, attachment-based modalities, trauma-informed care, and couples systems.",
        ],
        "specialties_list": [
            {"title": "Individual Therapy", "desc": "Navigating self-esteem, attachment styles, anxiety, and depression."},
            {"title": "EMDR & Trauma Recovery", "desc": "Processing adverse childhood events via certified EMDR protocols."},
            {"title": "Couples & Relationship Growth", "desc": "Strengthening emotional responsiveness, repair, and trust."},
        ],
    },
]


async def ensure_default_authors(db: AsyncSession) -> None:
    result = await db.execute(select(Author))
    existing = result.scalars().all()
    existing_names = {author.name.strip().lower() for author in existing}

    if existing:
        return

    created = False
    for author_data in DEFAULT_AUTHORS:
        if author_data["name"].lower() not in existing_names:
            db.add(Author(**author_data, is_team_member=True))
            created = True

    if created:
        await db.commit()

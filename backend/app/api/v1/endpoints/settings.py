from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any

from app.api import deps
from app.models.user import User, Role
from app.models.settings import SiteSetting, PageContent
from app.schemas.settings import SiteSettingResponse, SiteSettingUpdate, PageContentResponse, PageContentUpdate

router = APIRouter()

DEFAULT_SPECIALTIES = {
    "mood": {
        "title": "Improving Mood and Well-being",
        "paragraphs": [
            "It's not that your life isn't working.",
            "From the outside, it probably looks like it is. But internally, the energy isn't the same. Things that used to feel engaging and meaningful no longer bring you pleasure or joy.",
            "Depression doesn’t always look like sadness. It can feel like disconnection, exhaustion, or going through the motions without really being there.",
            "You may be used to pushing through, staying productive, or overriding how you feel, but underneath, there is a heaviness you can’t quite shake.",
            "In therapy, we focus on what’s driving that stuckness in real time. We slow things down to notice the ways you’ve learned to cope with depression.",
            "This isn’t about just managing symptoms, it’s about finding a new way to relate to yourself and others so you can find energy, connection, and meaning again.",
            "So instead of operating on autopilot, you begin to feel more present, more engaged, and more like yourself again, with greater clarity and emotional range."
        ],
        "image": "/assets/RPG_Images for UI/mockup-wall-in-the-children-s-room-on-wall-white-c-2026-03-24-01-09-26-utc.jpg"
    },
    "anxiety": {
        "title": "Working Through Anxiety And Stress",
        "paragraphs": [
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
        "image": "/assets/RPG_Images for UI/stress-theme-concept-paper-with-inscription-and-n-2026-03-24-15-36-15-utc.jpg"
    },
    "couples": {
        "title": "Couples Therapy: Rebuilding Intimacy And Connections",
        "paragraphs": [
            "You may find yourselves having the same conversation over and over, one pushing, the other pulling away.. both of you leaving feeling unheard, frustrated, or alone.",
            "At a certain point, it's no longer about the surface issue. It's the cycle you can't seem to get out of.",
            "You've tried to communicate better, be more patient, give each other space, and yet, in the moments that matter, something takes over.",
            "That's where we focus. We help you slow these moments down in real time, so you can begin to see what's actually happening underneath the conflict, and why it keeps repeating.",
            "More importantly, we help you change it.",
            "Instead of getting pulled into the same familiar dynamic, you'll learn how to reach for each other in a way that creates understanding rather than distance, building trust, responsiveness, and a deeper sense of connection.",
            "This isn't simply about learning communication techniques. It's about shifting the emotional patterns that shape how you relate to each other.",
            "Over time, couples move from reactivity and disconnection to feeling more secure, more aligned, and more like a team again."
        ],
        "image": "/assets/RPG_Images for UI/modern-ceramic-vases-on-a-white-marble-table-2026-03-16-02-08-02-utc.jpg"
    },
    "infants": {
        "title": "Parenting Infants & Young Children",
        "paragraphs": [
            "Becoming a parent can be deeply meaningful and unexpectedly disorienting.",
            "You may find yourself second-guessing decisions you once made with ease, feeling stretched thin, or unsure how to respond in the moments that matter most. Even highly capable, thoughtful parents can feel overwhelmed by the constant demands and the quiet pressure to \"get it right.\"",
            "It's not just about sleep training, behavior management, or milestones.",
            "It's about how you're experiencing your child and yourself within those moments.",
            "In our work, we focus on helping you slow things down and make sense of what's happening beneath the surface: your child's needs, your emotional responses, and the patterns that begin to take shape between you.",
            "From there, change becomes more natural. You'll feel more steady, more confident in your decisions, and more connected to your child, without losing sight of yourself in the process.",
            "This isn't simply about following a rigid parenting approach or trend.",
            "It's about developing a way of responding that feels clear, grounded, and aligned with who you are and how you want to show up as a parent."
        ],
        "image": "/assets/RPG_Images for UI/portrait-of-four-young-children-in-a-row-one-cryi-2026-03-11-00-57-01-utc.jpg"
    },
    "teens": {
        "title": "Parenting Teens & Young Adults",
        "paragraphs": [
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
        "image": "/assets/RPG_Images for UI/little-kid-playing-with-joystick-in-front-of-pc-2026-03-24-14-20-02-utc.jpg"
    },
    "transitions": {
        "title": "Navigating Life Transitions",
        "paragraphs": [
            "Life transitions have a way of disrupting what used to feel clear.",
            "What once worked—how you made decisions, handled stress, or found direction—may not hold up in the same way anymore. That's often when people start to feel stuck.",
            "In therapy, we provide a structured container to slow down these shifting dynamics.",
            "We help you make sense of the gap between where you were and where you are going, deconstructing old habits that no longer fit and intentionally building a new framework that feels authentic, sustainable, and aligned with your present values."
        ],
        "image": "/assets/RPG_Images for UI/closeup-shot-of-a-beautiful-butterfly-metamorpho-2026-03-18-06-39-46-utc.jpeg"
    },
    "trauma": {
        "title": "Overcoming Adverse Life Events And Trauma",
        "paragraphs": [
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
        "image": "/assets/RPG_Images for UI/rubber-band-ball-2026-03-19-06-59-46-utc.jpg"
    }
}

DEFAULT_PAGES = {
    "home": {
        "title": "Home",
        "hero_title": "You’re Not Stuck Because You’re Doing Something Wrong",
        "hero_description": "Move beyond insight to change the patterns that shape your life.",
        "hero_image_url": "/assets/RPG_Images for UI/Homepage_Image 1 copy.jpg",
        "content": {
            "hero_subheading": "You’ve Simply Outgrown the Way You Learned to Cope",
            "hero_cta_text": "Request a Consultation",
            "banner_title": "Online Therapy Across California",
            "banner_description": "For adults and couples who manage life well on the surface yet feel stuck in familiar emotional or relational patterns.",
            "showcase_title": "Meet the Team"
        }
    },
    "approach": {
        "title": "Our Approach",
        "hero_title": "Patterns learned earlier in life can quietly shape how we relate, react, and make decisions.",
        "hero_description": "Change happens in connection. You don’t have to force change or try harder. You begin to feel unstuck, because something deeper has shifted. But change doesn’t happen through insight alone.",
        "hero_image_url": "/assets/RPG_Images for UI/Our Approach_Img.jpg",
        "content": {
            "insight_title": "But change doesn’t happen through insight alone.",
            "connection_title": "Change happens in connection.",
            "attunement_image": "/assets/RPG_Images for UI/modern-window-with-pillows-trees-and-sky-behind-2026-03-16-04-30-14-utc.jpg",
            "attunement_title": "In a space that is attuned, structured, and grounded in evidence-based approaches, we help you:",
            "attunement_points": [
                "Feel understood without having to overexplain",
                "Recognize automatic responses as they happen",
                "Understand what purpose they serve",
                "Shift them through new emotional experiences"
            ],
            "beyond_insight": "This is what allows change to move from something you understand to something you feel and live.",
            "flexibility_title": "Over time, what once felt automatic becomes flexible.",
            "stuckness_desc": "You don’t have to force change or try harder.\nYou begin to feel unstuck, because something deeper has shifted.",
            "left_card_image": "/assets/RPG_Images for UI/modern-window-with-pillows-trees-and-sky-behind-2026-03-16-04-30-14-utc.jpg",
            "left_card_title": "Develop a different relationship with your emotions:",
            "left_card_points": ["Greater clarity", "More choice", "Less reactivity"],
            "right_card_image": "/assets/RPG_Images for UI/window-natural-shadow-2026-03-17-14-48-39-utc.jpg",
            "right_card_title": "Move out of familiar relationship cycles of disconnection and into new ways of responding:",
            "right_card_points": ["Greater trust", "More responsiveness", "Genuine closeness"],
            "call_to_action_title": "Book a consultation and we’ll explore what’s keeping you stuck, and how to help you move forward."
        }
    },
    "specialties": {
        "title": "Specialties",
        "hero_title": "Specialties",
        "hero_description": "Core Practice Areas",
        "hero_image_url": "",
        "content": {
            **DEFAULT_SPECIALTIES,
            "cta_card_title": "When You’re Ready for Something Different",
            "cta_card_desc": "If you're ready to move beyond just getting through your days and want to feel more fully present in your life again, we invite you to take the next step.",
            "cta_card_button": "Book a Consultation"
        }
    },
    "services": {
        "title": "Services and Fees",
        "hero_title": "Telehealth Services",
        "hero_description": "Reframe Psychology Group provides all services online via our HIPAA compliant, encrypted video platform called SimplePractice. All you will need is a private place to meet, an internet connection, and a computer or mobile device. Online sessions are secure, confidential, and allow for more ease and flexibility in scheduling.",
        "hero_image_url": "/assets/RPG_Images for UI/asian-senior-older-woman-video-call-with-doctor-in-2026-03-16-04-23-55-utc.jpg",
        "content": {
            "fees_title": "Fees",
            "fees_subtitle": "Please review our team members and the standard fee for their services. \n Limited sliding scale fees when available.",
            "out_of_network_title": "Out-of-Network Policy",
            "out_of_network_desc": "Reframe Psychology Group is an out-of-network provider. This means that our therapists cannot bill your insurance company directly. We have chosen to practice independently of insurance companies in order to provide you with care that is based on your specific therapy goals and not on the limitations imposed by insurance companies. However, at your request, we will gladly generate a \"superbill\" that will include an itemized list of services and their insurance codes so that you can submit to your insurance company for out-of-network reimbursement.",
            "reimbursement_info": "Your insurance company and your particular coverage determine if and how you can be reimbursed. At your request, we will do our best to provide information that will support your claim."
        }
    },
    "contact": {
        "title": "Contact Us",
        "hero_title": "Get in Touch",
        "hero_description": "Contact our team to request a clinical consultation.",
        "hero_image_url": "",
        "content": {
            "email": "info@reframepsychology.com",
            "phone": "(123) 456-7890",
            "address": "Online across California",
            "hours": "Monday - Friday, 9:00 AM - 5:00 PM",
            "intake_tagline": "Intake & Inquiry",
            "email_label": "Secure Direct Email",
            "email_sub": "Encrypted communications portal.",
            "phone_label": "Practice Phone Line",
            "phone_sub": "Mon - Fri, 9:00 AM - 5:00 PM PST.",
            "address_label": "Online Operations",
            "address_sub": "Serving clients digitally throughout all cities in California.",
            "qa_title": "Is it secure?",
            "qa_desc": "Yes! All clinical data and intake document transmissions are handled directly through SimplePractice—our secure, fully encrypted, HIPAA-compliant patient dashboard.",
            "form_title": "Send a Secure Inquiry",
            "form_desc": "Please avoid including highly confidential Protected Health Information (PHI) in this public form. Full intakes are managed privately inside SimplePractice.",
            "form_button": "Send Message",
            "info_title": "Get in Touch",
            "info_desc": "We offer secure, encrypted virtual care across all of California. If you have questions about billing, SimplePractice portals, scheduling, or specific therapists, feel free to drop us a line."
        }
    }
}


@router.get("/settings", response_model=SiteSettingResponse)
async def get_site_settings(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(SiteSetting).filter(SiteSetting.id == 1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = SiteSetting(
            id=1,
            font_sans="Raleway",
            font_serif="Merriweather",
            primary_color="#7ebac8",
            background_color="#FDF8F5",
            secondary_color="#4a535e",
            text_color="#4a535e",
            logo_url="/assets/RPG Logo_Main Landscape.png",
            header_button_text="Contact Us",
            footer_ready_text="Ready to start?",
            footer_button_text="Schedule a Consultation"
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    return settings


@router.put("/settings", response_model=SiteSettingResponse)
async def update_site_settings(
    settings_in: SiteSettingUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db.execute(select(SiteSetting).filter(SiteSetting.id == 1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = SiteSetting(id=1)
        db.add(settings)
        
    for field, value in settings_in.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
        
    await db.commit()
    await db.refresh(settings)
    return settings


@router.get("/pages", response_model=List[PageContentResponse])
async def get_all_pages(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(PageContent))
    pages = result.scalars().all()
    
    # Auto-initialize missing pages
    existing_slugs = {p.slug for p in pages}
    for slug, defaults in DEFAULT_PAGES.items():
        if slug not in existing_slugs:
            new_page = PageContent(
                slug=slug,
                title=defaults["title"],
                hero_title=defaults["hero_title"],
                hero_description=defaults["hero_description"],
                hero_image_url=defaults["hero_image_url"],
                content=defaults["content"]
            )
            db.add(new_page)
            await db.commit()
            pages.append(new_page)
            
    return pages


@router.get("/pages/{slug}", response_model=PageContentResponse)
async def get_page_content(slug: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(PageContent).filter(PageContent.slug == slug))
    page = result.scalar_one_or_none()
    
    if not page:
        defaults = DEFAULT_PAGES.get(slug)
        if not defaults:
            raise HTTPException(status_code=404, detail="Page not found")
            
        page = PageContent(
            slug=slug,
            title=defaults["title"],
            hero_title=defaults["hero_title"],
            hero_description=defaults["hero_description"],
            hero_image_url=defaults["hero_image_url"],
            content=defaults["content"]
        )
        db.add(page)
        await db.commit()
        await db.refresh(page)
        
    return page


@router.put("/pages/{slug}", response_model=PageContentResponse)
async def update_page_content(
    slug: str,
    page_in: PageContentUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db.execute(select(PageContent).filter(PageContent.slug == slug))
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    for field, value in page_in.model_dump(exclude_unset=True).items():
        setattr(page, field, value)
        
    await db.commit()
    await db.refresh(page)
    return page

"""
Email sending via Resend (https://resend.com)
All functions are async-safe and fail silently with logging.
"""
import logging
import os
from typing import List

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Resend client — imported lazily so the app still starts if key is missing
# ---------------------------------------------------------------------------
def _get_resend():
    try:
        import resend
        api_key = os.getenv("RESEND_API_KEY", "")
        if not api_key:
            return None
        resend.api_key = api_key
        return resend
    except ImportError:
        logger.error("resend package not installed. Run: pip install resend")
        return None

MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Reframe Psychology")
MAIL_FROM      = os.getenv("MAIL_FROM", "onboarding@resend.dev")   # swap once domain verified
SITE_URL       = os.getenv("SITE_URL", "http://localhost:3000")

# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------
def _base_html(body: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f1ed;margin:0;padding:32px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <!-- Header -->
    <tr>
      <td style="background:#1e2328;padding:28px 32px;border-radius:12px 12px 0 0;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#7ebac8;letter-spacing:0.05em;">
          REFRAME PSYCHOLOGY
        </p>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="background:#ffffff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e4df;border-top:none;">
        {body}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:20px 0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#aaa;">
          © Reframe Psychology Group · <a href="{SITE_URL}" style="color:#7ebac8;">Visit Site</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Welcome email (newsletter subscription)
# ---------------------------------------------------------------------------
async def send_welcome_email(email_to: str):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured — skipping welcome email to {email_to}")
        return

    body = f"""
      <h2 style="margin:0 0 16px;color:#1e2328;font-size:24px;font-weight:700;">Welcome aboard! 👋</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Thank you for subscribing to the <strong>Reframe Psychology Group</strong> newsletter.
      </p>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 24px;">
        You'll receive our latest articles, mental health tools, and clinical insights directly in your inbox — 
        no spam, just thoughtful content from our team.
      </p>
      <a href="{SITE_URL}/blog"
         style="display:inline-block;background:#7ebac8;color:#fff;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
        Read Our Latest Articles →
      </a>
      <hr style="margin:32px 0;border:none;border-top:1px solid #eee;"/>
      <p style="color:#aaa;font-size:12px;margin:0;">
        You're receiving this because you subscribed at reframepsychology.com.
        <a href="{SITE_URL}" style="color:#7ebac8;">Unsubscribe</a>
      </p>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": "Welcome to Reframe Psychology 🧠",
            "html": _base_html(body),
        })
        logger.info(f"Welcome email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email_to}: {e}")


# ---------------------------------------------------------------------------
# Article broadcast to all subscribers
# ---------------------------------------------------------------------------
async def send_article_broadcast(emails: List[str], article_title: str, article_excerpt: str, article_slug: str):
    rs = _get_resend()
    if not rs or not emails:
        logger.warning("Resend not configured or no emails — skipping broadcast")
        return

    article_url = f"{SITE_URL}/blog/{article_slug}"
    body = f"""
      <h2 style="margin:0 0 8px;color:#1e2328;font-size:22px;font-weight:700;">New Article</h2>
      <h3 style="margin:0 0 16px;color:#7ebac8;font-size:18px;font-weight:600;">{article_title}</h3>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 24px;">{article_excerpt or "Click below to read our latest clinical insights."}</p>
      <a href="{article_url}"
         style="display:inline-block;background:#7ebac8;color:#fff;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
        Read Full Article →
      </a>
      <hr style="margin:32px 0;border:none;border-top:1px solid #eee;"/>
      <p style="color:#aaa;font-size:12px;margin:0;">
        You're receiving this because you subscribed at reframepsychology.com.
        <a href="{SITE_URL}" style="color:#7ebac8;">Unsubscribe</a>
      </p>
    """

    # Resend supports up to 50 recipients per call — batch if needed
    BATCH = 50
    for i in range(0, len(emails), BATCH):
        batch = emails[i:i+BATCH]
        try:
            rs.Emails.send({
                "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
                "to": batch,
                "subject": f"New from Reframe: {article_title}",
                "html": _base_html(body),
            })
            logger.info(f"Broadcast sent to batch {i//BATCH + 1} ({len(batch)} recipients)")
        except Exception as e:
            logger.error(f"Broadcast batch {i//BATCH + 1} failed: {e}")


# ---------------------------------------------------------------------------
# Contact inquiry notification (to practice)
# ---------------------------------------------------------------------------
async def send_inquiry_notification(first_name: str, last_name: str, email_from: str, subject: str, message: str):
    rs = _get_resend()
    if not rs:
        logger.warning("Resend not configured — skipping inquiry notification")
        return

    body = f"""
      <h2 style="margin:0 0 16px;color:#1e2328;">📨 New Contact Inquiry</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:140px;">Name</td><td style="color:#333;">{first_name} {last_name}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Email</td><td><a href="mailto:{email_from}" style="color:#7ebac8;">{email_from}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Subject</td><td style="color:#333;">{subject}</td></tr>
      </table>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;"/>
      <p style="font-weight:700;color:#555;margin:0 0 8px;">Message:</p>
      <div style="background:#f7f5f2;padding:16px;border-radius:8px;color:#333;font-size:14px;line-height:1.7;">{message}</div>
      <div style="margin-top:24px;">
        <a href="{SITE_URL}/admin/consultations"
           style="display:inline-block;background:#1e2328;color:#fff;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;">
          View in Admin Portal →
        </a>
      </div>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [MAIL_FROM],
            "reply_to": email_from,
            "subject": f"New Inquiry: {subject} — {first_name} {last_name}",
            "html": _base_html(body),
        })
        logger.info(f"Inquiry notification sent for {email_from}")
    except Exception as e:
        logger.error(f"Failed to send inquiry notification: {e}")


# ---------------------------------------------------------------------------
# Booking notification (to practice)
# ---------------------------------------------------------------------------
async def send_booking_notification(
    first_name: str, last_name: str, email_from: str,
    requested_date: str, requested_time: str,
    therapist_preference: str, notes: str
):
    rs = _get_resend()
    if not rs:
        logger.warning("Resend not configured — skipping booking notification")
        return

    notes_html = f"""
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee;"/>
      <p style="font-weight:700;color:#555;margin:0 0 8px;">Notes:</p>
      <div style="background:#f7f5f2;padding:14px;border-radius:8px;color:#333;font-size:14px;line-height:1.7;">{notes}</div>
    """ if notes else ""

    body = f"""
      <h2 style="margin:0 0 16px;color:#1e2328;">📅 New Booking Request</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:180px;">Name</td><td style="color:#333;">{first_name} {last_name}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Email</td><td><a href="mailto:{email_from}" style="color:#7ebac8;">{email_from}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Requested Date</td><td style="color:#333;">{requested_date}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Requested Time</td><td style="color:#333;">{requested_time}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Therapist</td><td style="color:#333;">{therapist_preference or "No preference"}</td></tr>
      </table>
      {notes_html}
      <div style="margin-top:24px;">
        <a href="{SITE_URL}/admin/consultations"
           style="display:inline-block;background:#1e2328;color:#fff;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;">
          View in Admin Portal →
        </a>
      </div>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [MAIL_FROM],
            "reply_to": email_from,
            "subject": f"New Booking: {first_name} {last_name} — {requested_date} at {requested_time}",
            "html": _base_html(body),
        })
        logger.info(f"Booking notification sent for {email_from}")
    except Exception as e:
        logger.error(f"Failed to send booking notification: {e}")

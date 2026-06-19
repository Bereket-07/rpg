"""
Email sending via Resend (https://resend.com)
All functions are async-safe and fail silently with logging.
"""
import hashlib
import logging
import os
from html import escape
from typing import List, Optional
from urllib.parse import quote

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

MAIL_FROM_NAME  = os.getenv("MAIL_FROM_NAME", "Reframe Psychology")
MAIL_FROM       = os.getenv("MAIL_FROM", "onboarding@resend.dev")
ADMIN_EMAIL     = os.getenv("ADMIN_EMAIL", MAIL_FROM)
SITE_URL        = os.getenv("SITE_URL", "http://localhost:3000")
TIMEZONE_LABEL  = os.getenv("PRACTICE_TIMEZONE_LABEL", "America/Los_Angeles")


def _safe(value: Optional[str]) -> str:
    return escape(value or "")


def _unsubscribe_link(email_addr: str) -> str:
    token = hashlib.sha256(email_addr.encode()).hexdigest()[:16]
    return f"{SITE_URL}/api/v1/newsletter/unsubscribe?token={token}"


def _gcal_link(date_str: str, time_str: str, clinician: str) -> str:
    """Generate a Google Calendar add-event deep link."""
    try:
        from datetime import datetime, timedelta
        # Parse date (YYYY-MM-DD) and time (HH:MM AM/PM)
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
        end = dt + timedelta(hours=1)
        fmt = "%Y%m%dT%H%M%S"
        title = quote(f"Reframe Psychology Session with {clinician}")
        details = quote(f"Consultation session with {clinician} via Reframe Psychology Group.")
        return (
            f"https://calendar.google.com/calendar/render?action=TEMPLATE"
            f"&text={title}&dates={dt.strftime(fmt)}/{end.strftime(fmt)}&details={details}"
        )
    except Exception:
        return ""


def _booking_summary_table(
    first_name: str,
    last_name: str,
    requested_date: str,
    requested_time: str,
    therapist_preference: Optional[str] = None,
    presenting_concern: Optional[str] = None,
    urgency: Optional[str] = None,
    preferred_contact_method: Optional[str] = None,
    video_link: Optional[str] = None,
) -> str:
    video_row = ""
    if video_link:
        safe_link = _safe(video_link)
        video_row = (
            "<tr><td style=\"padding:8px 0;font-weight:700;color:#555;\">Session Link</td>"
            f"<td><a href=\"{safe_link}\" style=\"color:#7ebac8;\">{safe_link}</a></td></tr>"
        )

    return f"""
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0 22px;">
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:170px;">Client</td><td style="color:#333;">{_safe(first_name)} {_safe(last_name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Date</td><td style="color:#333;">{_safe(requested_date)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Time</td><td style="color:#333;">{_safe(requested_time)} ({TIMEZONE_LABEL})</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Clinician</td><td style="color:#333;">{_safe(therapist_preference or "No preference")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Concern</td><td style="color:#333;">{_safe(presenting_concern or "Not specified")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Timing</td><td style="color:#333;">{_safe(urgency or "Flexible")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Contact</td><td style="color:#333;">{_safe(preferred_contact_method or "Email")}</td></tr>
        {video_row}
      </table>
    """

# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------
def _base_html(body: str, unsubscribe_url: Optional[str] = None) -> str:
    unsub_html = ""
    if unsubscribe_url:
        unsub_html = f' · <a href="{unsubscribe_url}" style="color:#aaa;">Unsubscribe</a>'
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    @media only screen and (max-width:600px) {{
      .email-body {{ padding: 24px 16px !important; }}
      .email-header {{ padding: 20px 16px !important; }}
    }}
  </style>
</head>
<body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#f4f1ed;margin:0;padding:32px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <!-- Header -->
    <tr>
      <td class="email-header" style="background:#1e2328;padding:28px 32px;border-radius:12px 12px 0 0;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#7ebac8;letter-spacing:0.05em;">
          REFRAME PSYCHOLOGY
        </p>
        <p style="margin:4px 0 0;font-size:11px;color:#7ebac8;opacity:0.6;letter-spacing:0.08em;">PSYCHOLOGY GROUP</p>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td class="email-body" style="background:#ffffff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e4df;border-top:none;">
        {body}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:20px 0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#aaa;">
          © Reframe Psychology Group · <a href="{SITE_URL}" style="color:#7ebac8;">Visit Site</a>{unsub_html}
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

    unsub = _unsubscribe_link(email_to)
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
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": "Welcome to Reframe Psychology 🧠",
            "html": _base_html(body, unsubscribe_url=unsub),
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
    BATCH = 50
    for i in range(0, len(emails), BATCH):
        batch = emails[i:i+BATCH]
        for email_addr in batch:
            unsub = _unsubscribe_link(email_addr)
            body = f"""
              <h2 style="margin:0 0 8px;color:#1e2328;font-size:22px;font-weight:700;">New Article</h2>
              <h3 style="margin:0 0 16px;color:#7ebac8;font-size:18px;font-weight:600;">{_safe(article_title)}</h3>
              <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 24px;">{_safe(article_excerpt or "Click below to read our latest clinical insights.")}</p>
              <a href="{article_url}"
                 style="display:inline-block;background:#7ebac8;color:#fff;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
                Read Full Article →
              </a>
            """
            try:
                rs.Emails.send({
                    "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
                    "to": [email_addr],
                    "subject": f"New from Reframe: {article_title}",
                    "html": _base_html(body, unsubscribe_url=unsub),
                })
            except Exception as e:
                logger.error(f"Broadcast failed for {email_addr}: {e}")
        logger.info(f"Broadcast sent to batch {i//BATCH + 1} ({len(batch)} recipients)")


# ---------------------------------------------------------------------------
# Custom newsletter broadcast (admin sends custom message)
# ---------------------------------------------------------------------------
async def send_custom_broadcast(emails: List[str], subject: str, message_html: str):
    rs = _get_resend()
    if not rs or not emails:
        logger.warning("Resend not configured or no emails — skipping custom broadcast")
        return

    BATCH = 50
    total_sent = 0
    for i in range(0, len(emails), BATCH):
        batch = emails[i:i+BATCH]
        for email_addr in batch:
            unsub = _unsubscribe_link(email_addr)
            body = f"""
              <div style="color:#4a535e;font-size:15px;line-height:1.8;">
                {message_html}
              </div>
            """
            try:
                rs.Emails.send({
                    "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
                    "to": [email_addr],
                    "subject": subject,
                    "html": _base_html(body, unsubscribe_url=unsub),
                })
                total_sent += 1
            except Exception as e:
                logger.error(f"Custom broadcast failed for {email_addr}: {e}")
    logger.info(f"Custom broadcast complete: {total_sent}/{len(emails)} sent")
    return total_sent


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
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:140px;">Name</td><td style="color:#333;">{_safe(first_name)} {_safe(last_name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Email</td><td><a href="mailto:{_safe(email_from)}" style="color:#7ebac8;">{_safe(email_from)}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Subject</td><td style="color:#333;">{_safe(subject)}</td></tr>
      </table>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;"/>
      <p style="font-weight:700;color:#555;margin:0 0 8px;">Message:</p>
      <div style="background:#f7f5f2;padding:16px;border-radius:8px;color:#333;font-size:14px;line-height:1.7;">{_safe(message)}</div>
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
            "to": [ADMIN_EMAIL],
            "reply_to": email_from,
            "subject": f"New Inquiry: {subject} — {first_name} {last_name}",
            "html": _base_html(body),
        })
        logger.info(f"Inquiry notification sent for {email_from}")
    except Exception as e:
        logger.error(f"Failed to send inquiry notification: {e}")


# ---------------------------------------------------------------------------
# Contact inquiry received — client receipt email
# ---------------------------------------------------------------------------
async def send_inquiry_received_client_email(email_to: str, first_name: str, last_name: str, subject: str):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured — skipping inquiry receipt email to {email_to}")
        return

    body = f"""
      <h2 style="margin:0 0 8px;color:#1e2328;font-size:22px;">We received your message ✅</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hi <strong>{_safe(first_name)}</strong>, thank you for reaching out to Reframe Psychology Group.
        Our team will review your inquiry and follow up within <strong>24 business hours</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0 22px;">
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:140px;">Name</td><td style="color:#333;">{_safe(first_name)} {_safe(last_name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Subject</td><td style="color:#333;">{_safe(subject)}</td></tr>
      </table>
      <div style="background:#f0f9ff;border-left:4px solid #7ebac8;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;color:#4a535e;font-size:13px;line-height:1.6;">
          💡 <strong>What happens next?</strong> A member of our clinical team will contact you at
          <strong>{_safe(email_to)}</strong> shortly. If anything changes, simply reply to this email.
        </p>
      </div>
      <a href="{SITE_URL}/contact"
         style="display:inline-block;background:#1e2328;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
        Visit Our Site →
      </a>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": "We received your inquiry — Reframe Psychology",
            "html": _base_html(body),
        })
        logger.info(f"Inquiry receipt email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send inquiry receipt email to {email_to}: {e}")


# ---------------------------------------------------------------------------
# Contact inquiry responded — client notification email
# ---------------------------------------------------------------------------
async def send_inquiry_responded_client_email(email_to: str, first_name: str, last_name: str, subject: str):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured — skipping inquiry responded email to {email_to}")
        return

    body = f"""
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;color:#15803d;font-weight:700;font-size:15px;">✅ Our team has responded to your inquiry</p>
      </div>
      <h2 style="margin:0 0 8px;color:#1e2328;font-size:22px;">Hi {_safe(first_name)}, we've followed up!</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 20px;">
        A member of our clinical team has reviewed and responded to your inquiry:
        <strong>{_safe(subject)}</strong>.
      </p>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Please check your inbox for a reply from us, or feel free to reach back out if you have any
        additional questions.
      </p>
      <a href="{SITE_URL}/contact"
         style="display:inline-block;background:#1e2328;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
        Contact Us Again →
      </a>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": "We've responded to your inquiry — Reframe Psychology",
            "html": _base_html(body),
        })
        logger.info(f"Inquiry responded email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send inquiry responded email to {email_to}: {e}")


# ---------------------------------------------------------------------------
# Booking notification (to practice)
# ---------------------------------------------------------------------------
async def send_booking_notification(
    first_name: str, last_name: str, email_from: str,
    requested_date: str, requested_time: str,
    therapist_preference: str, notes: str,
    presenting_concern: Optional[str] = None,
    urgency: Optional[str] = None,
    preferred_contact_method: Optional[str] = None,
):
    rs = _get_resend()
    if not rs:
        logger.warning("Resend not configured — skipping booking notification")
        return

    notes_html = f"""
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee;"/>
      <p style="font-weight:700;color:#555;margin:0 0 8px;">Notes:</p>
      <div style="background:#f7f5f2;padding:14px;border-radius:8px;color:#333;font-size:14px;line-height:1.7;">{_safe(notes)}</div>
    """ if notes else ""

    body = f"""
      <h2 style="margin:0 0 16px;color:#1e2328;">📅 New Booking Request</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:180px;">Name</td><td style="color:#333;">{_safe(first_name)} {_safe(last_name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Email</td><td><a href="mailto:{_safe(email_from)}" style="color:#7ebac8;">{_safe(email_from)}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Date</td><td style="color:#333;">{_safe(requested_date)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Time</td><td style="color:#333;">{_safe(requested_time)} ({TIMEZONE_LABEL})</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Clinician</td><td style="color:#333;">{_safe(therapist_preference or "No preference")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Concern</td><td style="color:#333;">{_safe(presenting_concern or "Not specified")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Timing</td><td style="color:#333;">{_safe(urgency or "Flexible")}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Contact</td><td style="color:#333;">{_safe(preferred_contact_method or "Email")}</td></tr>
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
            "to": [ADMIN_EMAIL],
            "reply_to": email_from,
            "subject": f"New Booking: {first_name} {last_name} — {requested_date} at {requested_time}",
            "html": _base_html(body),
        })
        logger.info(f"Booking notification sent for {email_from}")
    except Exception as e:
        logger.error(f"Failed to send booking notification: {e}")


# ---------------------------------------------------------------------------
# Booking received — client receipt email
# ---------------------------------------------------------------------------
async def send_booking_received_client_email(
    email_to: str,
    first_name: str,
    last_name: str,
    requested_date: str,
    requested_time: str,
    therapist_preference: Optional[str] = None,
    presenting_concern: Optional[str] = None,
    urgency: Optional[str] = None,
    preferred_contact_method: Optional[str] = None,
):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured - skipping booking receipt email to {email_to}")
        return

    body = f"""
      <h2 style="margin:0 0 8px;color:#1e2328;font-size:22px;">We received your consultation request ✅</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hi <strong>{_safe(first_name)}</strong>, thank you for reaching out to Reframe Psychology Group.
        Our team will review your request and follow up within <strong>24 business hours</strong>.
      </p>
      {_booking_summary_table(
        first_name=first_name,
        last_name=last_name,
        requested_date=requested_date,
        requested_time=requested_time,
        therapist_preference=therapist_preference,
        presenting_concern=presenting_concern,
        urgency=urgency,
        preferred_contact_method=preferred_contact_method,
      )}
      <div style="background:#f0f9ff;border-left:4px solid #7ebac8;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <p style="margin:0;color:#4a535e;font-size:13px;line-height:1.6;">
          💡 <strong>What happens next?</strong> A member of our clinical team will contact you at
          <strong>{_safe(email_to)}</strong> to confirm your appointment. If anything changes, simply reply to this email.
        </p>
      </div>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": "We received your consultation request — Reframe Psychology",
            "html": _base_html(body),
        })
        logger.info(f"Booking receipt email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send booking receipt email to {email_to}: {e}")


# ---------------------------------------------------------------------------
# Booking confirmed — client confirmation email
# ---------------------------------------------------------------------------
async def send_booking_confirmed_client_email(
    email_to: str,
    first_name: str,
    last_name: str,
    requested_date: str,
    requested_time: str,
    therapist_preference: Optional[str] = None,
    video_link: Optional[str] = None,
    presenting_concern: Optional[str] = None,
    urgency: Optional[str] = None,
    preferred_contact_method: Optional[str] = None,
):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured - skipping booking confirmation email to {email_to}")
        return

    gcal = _gcal_link(requested_date, requested_time, therapist_preference or "your clinician")
    gcal_button = ""
    if gcal:
        gcal_button = f"""
        <a href="{gcal}"
           style="display:inline-block;background:#f0f9ff;color:#7ebac8;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;border:1px solid #7ebac8;margin-left:10px;">
          📅 Add to Google Calendar
        </a>"""

    video_button = ""
    if video_link:
        video_button = f"""
        <div style="margin:20px 0;background:#f0fdf4;border:1px solid #86efac;padding:16px;border-radius:10px;">
          <p style="margin:0 0 10px;font-weight:700;color:#166534;font-size:14px;">🎥 Your Session Link</p>
          <a href="{_safe(video_link)}"
             style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
            Join Your Session →
          </a>
        </div>"""

    body = f"""
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;color:#15803d;font-weight:700;font-size:15px;">✅ Your appointment is confirmed</p>
      </div>
      <h2 style="margin:0 0 8px;color:#1e2328;font-size:22px;">See you soon, {_safe(first_name)}!</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Your consultation with <strong>{_safe(therapist_preference or "Reframe Psychology")}</strong> has been confirmed.
        Please review your appointment details below.
      </p>
      {_booking_summary_table(
        first_name=first_name,
        last_name=last_name,
        requested_date=requested_date,
        requested_time=requested_time,
        therapist_preference=therapist_preference,
        presenting_concern=presenting_concern,
        urgency=urgency,
        preferred_contact_method=preferred_contact_method,
        video_link=video_link,
      )}
      {video_button}
      <div style="margin-top:20px;">
        <a href="{SITE_URL}"
           style="display:inline-block;background:#1e2328;color:#fff;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;">
          Visit Our Site
        </a>{gcal_button}
      </div>
      <hr style="margin:28px 0;border:none;border-top:1px solid #eee;"/>
      <p style="color:#888;font-size:12px;margin:0;line-height:1.7;">
        Need to reschedule? Simply reply to this email and our team will assist you.
        Please give at least 24 hours notice when possible.
      </p>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": f"✅ Appointment Confirmed — {requested_date} at {requested_time} ({TIMEZONE_LABEL})",
            "html": _base_html(body),
        })
        logger.info(f"Booking confirmation email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email to {email_to}: {e}")


# ---------------------------------------------------------------------------
# Booking declined — client decline email
# ---------------------------------------------------------------------------
async def send_booking_declined_client_email(
    email_to: str,
    first_name: str,
    last_name: str,
    requested_date: str,
    requested_time: str,
    therapist_preference: Optional[str] = None,
    presenting_concern: Optional[str] = None,
    urgency: Optional[str] = None,
    preferred_contact_method: Optional[str] = None,
):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured - skipping booking decline email to {email_to}")
        return

    body = f"""
      <h2 style="margin:0 0 16px;color:#1e2328;font-size:22px;">Update on your consultation request</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Hi <strong>{_safe(first_name)}</strong>, thank you for reaching out. Unfortunately, we are unable to confirm
        the requested time slot. Please reply to this email and our team will work with you to find an alternative.
      </p>
      {_booking_summary_table(
        first_name=first_name,
        last_name=last_name,
        requested_date=requested_date,
        requested_time=requested_time,
        therapist_preference=therapist_preference,
        presenting_concern=presenting_concern,
        urgency=urgency,
        preferred_contact_method=preferred_contact_method,
      )}
      <a href="{SITE_URL}/book"
         style="display:inline-block;background:#7ebac8;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">
        Request a New Time →
      </a>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": "Update on your consultation request — Reframe Psychology",
            "html": _base_html(body),
        })
        logger.info(f"Booking decline email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send booking decline email to {email_to}: {e}")


# ---------------------------------------------------------------------------
# Clinician booking notification
# ---------------------------------------------------------------------------
async def send_booking_clinician_notification(
    email_to: str,
    clinician_name: str,
    client_name: str,
    requested_date: str,
    requested_time: str,
    booking_id: int,
    status_label: str,
):
    rs = _get_resend()
    if not rs:
        logger.warning(f"Resend not configured - skipping clinician booking email to {email_to}")
        return

    body = f"""
      <h2 style="margin:0 0 16px;color:#1e2328;font-size:22px;">Consultation request update 📋</h2>
      <p style="color:#4a535e;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Hi <strong>{_safe(clinician_name)}</strong>, a consultation request has been marked
        <strong style="color:#7ebac8;">{_safe(status_label)}</strong> and is assigned to you.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0 22px;">
        <tr><td style="padding:8px 0;font-weight:700;color:#555;width:170px;">Client</td><td style="color:#333;">{_safe(client_name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Date</td><td style="color:#333;">{_safe(requested_date)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Time</td><td style="color:#333;">{_safe(requested_time)} ({TIMEZONE_LABEL})</td></tr>
        <tr><td style="padding:8px 0;font-weight:700;color:#555;">Booking ID</td><td style="color:#333;">#{booking_id}</td></tr>
      </table>
      <a href="{SITE_URL}/admin/my-requests"
         style="display:inline-block;background:#1e2328;color:#fff;font-weight:700;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:13px;">
        View in My Requests →
      </a>
    """

    try:
        rs.Emails.send({
            "from": f"{MAIL_FROM_NAME} <{MAIL_FROM}>",
            "to": [email_to],
            "subject": f"Consultation request #{booking_id}: {status_label}",
            "html": _base_html(body),
        })
        logger.info(f"Clinician booking email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send clinician booking email to {email_to}: {e}")

"""
ARIOME Email Templates
All email templates for the application - professionally written and database-driven
"""
import asyncio
import resend
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


async def send_email(to_email: str, subject: str, html_content: str) -> dict:
    """Send email using Resend API"""
    if not RESEND_API_KEY:
        logger.info(f"[DEV MODE] Email to {to_email}: {subject}")
        return {"status": "dev_mode", "message": "Email logged (no API key)"}
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "sent", "email_id": result.get("id")}
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {"status": "failed", "error": str(e)}


def get_email_base_style():
    """Common email styles"""
    return """
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0F; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo-text { font-size: 32px; font-weight: bold; color: #14B8A6; letter-spacing: 4px; }
        .tagline { color: #14B8A6; font-size: 14px; margin-top: 8px; }
        .content { background-color: #1F2937; border-radius: 16px; padding: 40px; }
        h1 { color: #ffffff; font-size: 28px; margin-bottom: 16px; text-align: center; }
        h2 { color: #14B8A6; font-size: 20px; margin: 24px 0 12px 0; }
        p { color: #D1D5DB; font-size: 16px; line-height: 1.7; margin-bottom: 16px; }
        .highlight { color: #14B8A6; font-weight: 600; }
        .cta-button { display: inline-block; background-color: #14B8A6; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 24px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px; line-height: 1.6; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, #374151, transparent); margin: 24px 0; }
        .quote { font-style: italic; color: #9CA3AF; text-align: center; padding: 20px; border-left: 3px solid #14B8A6; margin: 24px 0; background-color: #374151; border-radius: 0 12px 12px 0; }
        .credentials-box { background-color: #374151; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .credential-item { margin: 12px 0; }
        .credential-label { color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .credential-value { color: #ffffff; font-size: 18px; font-weight: 600; margin-top: 4px; }
    """


# ==================== CREATOR APPLICATION EMAILS ====================

async def send_creator_application_received(email: str, name: str):
    """Email sent when creator application is submitted"""
    subject = "Thanks for Applying to ARIOME Creator Program! 🎨"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🎨 Application Received!</h1>
                
                <p>Dear <span class="highlight">{name}</span>,</p>
                
                <p>Thank you for taking the first step towards becoming an ARIOME Creator. We are genuinely honored that you wish to share your gifts with our conscious wellness community.</p>
                
                <p>Your application has been received and is now being carefully reviewed by our team. We believe that every creator brings a unique perspective to the tapestry of human wellness, and we're excited to learn more about yours.</p>
                
                <div class="divider"></div>
                
                <h2>What Happens Next?</h2>
                <p>Our team will review your application within <span class="highlight">3-5 business days</span>. We look at each application with care, considering how your voice and vision align with our mission of fostering conscious living and inner peace.</p>
                
                <p>Once reviewed, you'll receive an email with our decision. If approved, you'll receive your login credentials and can immediately start sharing your transformative content with our community.</p>
                
                <div class="quote">
                    "The greatest gift you can give another is the purity of your attention." — Richard Moss
                </div>
                
                <p>We appreciate your patience during this process. Great things take time to cultivate, just like the inner growth we facilitate at ARIOME.</p>
                
                <p style="margin-top: 32px;">With gratitude and anticipation,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>Questions? Reach out to us at support@ariome.com</p>
                <p style="margin-top: 16px; color: #4B5563;">This email was sent to {email} because you applied to the ARIOME Creator Program.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, html)


async def send_creator_approved(email: str, name: str):
    """Email sent when creator application is approved"""
    subject = "🎉 Welcome to ARIOME Creator Program! Your Journey Begins"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🎉 Congratulations, {name}!</h1>
                
                <p>We are <span class="highlight">thrilled</span> to welcome you to the ARIOME Creator family!</p>
                
                <p>After careful consideration, we've approved your application to become an ARIOME Creator. Your unique perspective and dedication to wellness resonated deeply with our team, and we believe you have something truly valuable to share with our community.</p>
                
                <div class="credentials-box">
                    <h2 style="margin-top: 0;">Your Login Credentials</h2>
                    <div class="credential-item">
                        <div class="credential-label">Email</div>
                        <div class="credential-value">{email}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">Password</div>
                        <div class="credential-value">The password you provided during application</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="#" class="cta-button">Login to Creator Dashboard</a>
                </div>
                
                <div class="divider"></div>
                
                <h2>What You Can Do Now</h2>
                <p>As an ARIOME Creator, you have the power to:</p>
                <ul style="color: #D1D5DB; line-height: 2;">
                    <li>📹 Upload <span class="highlight">video stories</span> and guided meditations</li>
                    <li>🎵 Share <span class="highlight">audio content</span> and healing soundscapes</li>
                    <li>✍️ Create <span class="highlight">reflection prompts</span> that inspire introspection</li>
                    <li>👥 Build your <span class="highlight">community</span> of conscious seekers</li>
                    <li>📊 Track your <span class="highlight">impact</span> through analytics</li>
                </ul>
                
                <div class="quote">
                    "In a world full of noise, your authentic voice is a gift of silence and clarity to those who seek it."
                </div>
                
                <p>Remember, every piece of content you create has the potential to transform someone's day, heal a wound, or spark a moment of profound realization. Create with intention, and your impact will ripple far beyond what you can imagine.</p>
                
                <p style="margin-top: 32px;">Welcome to the family,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>Need help getting started? Email us at creators@ariome.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, html)


async def send_creator_rejected(email: str, name: str, reason: str):
    """Email sent when creator application is rejected"""
    subject = "Update on Your ARIOME Creator Application"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>Application Update</h1>
                
                <p>Dear <span class="highlight">{name}</span>,</p>
                
                <p>Thank you for your interest in becoming an ARIOME Creator. We genuinely appreciate the time and thought you put into your application.</p>
                
                <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
                
                <div class="credentials-box">
                    <h2 style="margin-top: 0; color: #F59E0B;">Feedback</h2>
                    <p style="margin-bottom: 0;">{reason}</p>
                </div>
                
                <div class="divider"></div>
                
                <h2>This Is Not the End</h2>
                <p>Every great creator's journey includes moments of redirection. We encourage you to:</p>
                <ul style="color: #D1D5DB; line-height: 2;">
                    <li>Continue developing your craft and unique voice</li>
                    <li>Engage with our community as an Explorer or Subscriber</li>
                    <li>Build your portfolio and experience</li>
                    <li><span class="highlight">Reapply in the future</span> — we welcome new applications</li>
                </ul>
                
                <div class="quote">
                    "The master has failed more times than the beginner has even tried." — Stephen McCranie
                </div>
                
                <p>We believe in continuous growth, and sometimes the path to creation begins with deeper exploration. Your journey with ARIOME doesn't end here — it simply takes a different form for now.</p>
                
                <p style="margin-top: 32px;">With respect and encouragement,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>Questions about your application? Email us at support@ariome.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, html)


# ==================== SUBSCRIBER EMAILS ====================

async def send_subscriber_welcome(email: str, name: str):
    """Email sent when user subscribes to premium"""
    subject = "Welcome to ARIOME Premium! 🌟 Your Journey Deepens"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🌟 Welcome to Premium, {name}!</h1>
                
                <p>You've just unlocked the full depth of the ARIOME experience. This is more than a subscription — it's a commitment to your inner growth and conscious living.</p>
                
                <p>We're honored that you've chosen to walk this path with us.</p>
                
                <div class="divider"></div>
                
                <h2>What's Now Available to You</h2>
                <ul style="color: #D1D5DB; line-height: 2;">
                    <li>🎧 <span class="highlight">Unlimited access</span> to all stories, meditations, and soundscapes</li>
                    <li>🌙 <span class="highlight">Exclusive content</span> from our most beloved creators</li>
                    <li>📝 <span class="highlight">Full journaling features</span> to track your inner journey</li>
                    <li>👥 <span class="highlight">Premium circles</span> for deeper community connection</li>
                    <li>🎯 <span class="highlight">Personalized recommendations</span> based on your intentions</li>
                    <li>📱 <span class="highlight">Offline listening</span> for moments without connection</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="#" class="cta-button">Explore Premium Content</a>
                </div>
                
                <div class="quote">
                    "The quieter you become, the more you can hear." — Ram Dass
                </div>
                
                <p>Take your time. There's no rush in the journey inward. Let each story, each meditation, each moment of reflection unfold naturally.</p>
                
                <p style="margin-top: 32px;">With deep gratitude,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>Your conscious wellness journey is our priority.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, html)


# ==================== PASSWORD RESET EMAIL ====================

async def send_password_reset(email: str, name: str, reset_code: str):
    """Email sent for password reset"""
    subject = "Reset Your ARIOME Password"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🔐 Password Reset Request</h1>
                
                <p>Hello <span class="highlight">{name}</span>,</p>
                
                <p>We received a request to reset your password. Use the code below to create a new password:</p>
                
                <div class="credentials-box" style="text-align: center;">
                    <div class="credential-label">Your Reset Code</div>
                    <div style="font-size: 36px; font-weight: bold; color: #14B8A6; letter-spacing: 8px; margin-top: 12px;">{reset_code}</div>
                </div>
                
                <p style="text-align: center; color: #9CA3AF;">This code expires in <span class="highlight">15 minutes</span>.</p>
                
                <div class="divider"></div>
                
                <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
                
                <p style="color: #9CA3AF; font-size: 14px;">For your security, never share this code with anyone. ARIOME team will never ask for your password or reset codes.</p>
                
                <p style="margin-top: 32px;">Stay mindful,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>If you didn't request this, please contact support@ariome.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, html)


# ==================== CIRCLE NOTIFICATION EMAILS ====================

async def send_circle_join_notification(creator_email: str, creator_name: str, circle_name: str, new_member_name: str):
    """Email sent to circle creator when someone joins"""
    subject = f"🎉 {new_member_name} joined your circle '{circle_name}'!"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🎉 New Circle Member!</h1>
                
                <p>Hello <span class="highlight">{creator_name}</span>,</p>
                
                <p>Great news! <span class="highlight">{new_member_name}</span> has just joined your circle "<span class="highlight">{circle_name}</span>".</p>
                
                <p>Your community is growing, and with each new member comes fresh energy and perspectives. This is a beautiful sign that your circle resonates with seekers on their wellness journey.</p>
                
                <div class="quote">
                    "Alone we can do so little; together we can do so much." — Helen Keller
                </div>
                
                <p>Consider welcoming them with a post or starting a meaningful discussion. Small gestures of connection create the foundation for transformative community experiences.</p>
                
                <div style="text-align: center;">
                    <a href="#" class="cta-button">View Your Circle</a>
                </div>
                
                <p style="margin-top: 32px;">Keep nurturing your community,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(creator_email, subject, html)


# ==================== STORY PUBLISHED EMAIL ====================

async def send_story_published(email: str, name: str, story_title: str):
    """Email sent when creator's story is published/approved"""
    subject = f"🎉 Your Story '{story_title}' is Now Live!"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><style>{get_email_base_style()}</style></head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p class="tagline">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🎉 Your Story is Live!</h1>
                
                <p>Dear <span class="highlight">{name}</span>,</p>
                
                <p>Wonderful news! Your story "<span class="highlight">{story_title}</span>" has been reviewed and is now live on ARIOME.</p>
                
                <p>From this moment, seekers around the world can discover your creation. Your words, your voice, your intention — now available to touch hearts and transform moments.</p>
                
                <div class="credentials-box">
                    <h2 style="margin-top: 0;">Story Details</h2>
                    <div class="credential-item">
                        <div class="credential-label">Title</div>
                        <div class="credential-value">{story_title}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">Status</div>
                        <div class="credential-value" style="color: #10B981;">✓ Published</div>
                    </div>
                </div>
                
                <div class="quote">
                    "What you create from your heart touches the hearts of others in ways you may never fully know."
                </div>
                
                <div style="text-align: center;">
                    <a href="#" class="cta-button">View Your Story</a>
                </div>
                
                <p>Keep creating. The world needs more voices like yours.</p>
                
                <p style="margin-top: 32px;">With celebration,</p>
                <p><span class="highlight">The ARIOME Team</span></p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(email, subject, html)

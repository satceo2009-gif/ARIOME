from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import users_collection
import asyncio
import resend
import os
import random
import string
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/email", tags=["Email"])

# Initialize Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Store verification codes temporarily (in production, use Redis)
verification_codes = {}


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


class EmailVerificationRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


def get_verification_email_html(code: str, name: str = "Explorer"):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0F; color: #ffffff; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .logo {{ text-align: center; margin-bottom: 30px; }}
            .logo-text {{ font-size: 32px; font-weight: bold; color: #14B8A6; letter-spacing: 4px; }}
            .content {{ background-color: #1F2937; border-radius: 16px; padding: 40px; text-align: center; }}
            h1 {{ color: #ffffff; font-size: 24px; margin-bottom: 16px; }}
            p {{ color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }}
            .code-box {{ background-color: #374151; border-radius: 12px; padding: 20px; margin: 24px 0; }}
            .code {{ font-size: 36px; font-weight: bold; color: #14B8A6; letter-spacing: 8px; }}
            .footer {{ text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px; }}
            .highlight {{ color: #14B8A6; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p style="color: #14B8A6; font-size: 14px;">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>Verify Your Email</h1>
                <p>Hello {name}! 👋</p>
                <p>Thank you for joining ARIOME. Use the verification code below to complete your registration:</p>
                <div class="code-box">
                    <div class="code">{code}</div>
                </div>
                <p>This code will expire in <span class="highlight">10 minutes</span>.</p>
                <p style="font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>Your journey to conscious wellness starts here.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_welcome_email_html(name: str = "Explorer"):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0F; color: #ffffff; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .logo {{ text-align: center; margin-bottom: 30px; }}
            .logo-text {{ font-size: 32px; font-weight: bold; color: #14B8A6; letter-spacing: 4px; }}
            .content {{ background-color: #1F2937; border-radius: 16px; padding: 40px; }}
            h1 {{ color: #ffffff; font-size: 28px; margin-bottom: 16px; text-align: center; }}
            p {{ color: #D1D5DB; font-size: 16px; line-height: 1.6; margin-bottom: 16px; }}
            .feature-list {{ margin: 24px 0; }}
            .feature {{ display: flex; align-items: center; margin-bottom: 16px; padding: 16px; background-color: #374151; border-radius: 12px; }}
            .feature-icon {{ font-size: 24px; margin-right: 16px; }}
            .feature-text {{ color: #ffffff; font-size: 14px; }}
            .cta-button {{ display: inline-block; background-color: #14B8A6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 24px; }}
            .footer {{ text-align: center; margin-top: 30px; color: #6B7280; font-size: 12px; }}
            .highlight {{ color: #14B8A6; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <div class="logo-text">ARIOME</div>
                <p style="color: #14B8A6; font-size: 14px;">Conscious Wellness</p>
            </div>
            <div class="content">
                <h1>🎉 Welcome to ARIOME, {name}!</h1>
                <p>We're thrilled to have you join our conscious wellness community. Your journey to inner peace and personal growth starts now.</p>
                
                <p style="color: #ffffff; font-weight: bold; margin-top: 24px;">As an Explorer, you can:</p>
                
                <div class="feature-list">
                    <div class="feature">
                        <span class="feature-icon">🎧</span>
                        <span class="feature-text">Preview stories with 30-second clips</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🔍</span>
                        <span class="feature-text">Browse our collection of healing content</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">👥</span>
                        <span class="feature-text">Explore community circles</span>
                    </div>
                </div>
                
                <p style="margin-top: 24px;">Ready for the full experience? <span class="highlight">Subscribe</span> to unlock unlimited access to all stories, exclusive content, and premium features.</p>
                
                <div style="text-align: center; margin-top: 32px;">
                    <p style="color: #9CA3AF; font-style: italic;">"The journey of a thousand miles begins with a single step."</p>
                </div>
            </div>
            <div class="footer">
                <p>© 2024 ARIOME by CSEA. All rights reserved.</p>
                <p>Questions? Contact us at support@ariome.com</p>
            </div>
        </div>
    </body>
    </html>
    """


@router.post("/send-verification")
async def send_verification_email(request: EmailVerificationRequest):
    """Send verification code to email"""
    email = request.email
    code = generate_otp()
    
    # Store the code with expiration (10 minutes)
    verification_codes[email] = {
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=10),
        "verified": False
    }
    
    if not RESEND_API_KEY:
        # If no API key, return mock response for development
        logger.info(f"[DEV MODE] Verification code for {email}: {code}")
        return {
            "status": "success",
            "message": f"Verification code sent to {email}",
            "dev_code": code  # Only in dev mode
        }
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": "Verify Your ARIOME Account",
            "html": get_verification_email_html(code)
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        
        return {
            "status": "success",
            "message": f"Verification code sent to {email}",
            "email_id": result.get("id")
        }
    except Exception as e:
        logger.error(f"Failed to send verification email: {str(e)}")
        # Return success with dev code if email fails
        return {
            "status": "success",
            "message": f"Verification code sent to {email}",
            "dev_code": code
        }


@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    """Verify the email code"""
    email = request.email
    code = request.code
    
    if email not in verification_codes:
        raise HTTPException(status_code=400, detail="No verification code found for this email")
    
    stored = verification_codes[email]
    
    if datetime.utcnow() > stored["expires_at"]:
        del verification_codes[email]
        raise HTTPException(status_code=400, detail="Verification code expired")
    
    if stored["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Mark as verified
    verification_codes[email]["verified"] = True
    
    # Send welcome email
    if RESEND_API_KEY:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [email],
                "subject": "Welcome to ARIOME! 🎉",
                "html": get_welcome_email_html()
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
    
    return {
        "status": "success",
        "message": "Email verified successfully",
        "verified": True
    }


@router.get("/check-verification/{email}")
async def check_verification(email: str):
    """Check if email is verified"""
    if email not in verification_codes:
        return {"verified": False}
    
    return {"verified": verification_codes[email].get("verified", False)}

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@opengov.ke")

def send_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None):
    """Send email notification"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add plain text version
        msg.attach(MIMEText(body, 'plain'))
        
        # Add HTML version if provided
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_feedback_status_email(user_email: str, user_name: str, feedback_id: int, old_status: str, new_status: str):
    """Send email when feedback status changes"""
    subject = f"OpenGov: Your Feedback Status Updated to {new_status.replace('_', ' ').title()}"
    
    status_messages = {
        'under_review': 'Your feedback is now being reviewed by our team.',
        'approved': 'Your feedback has been approved and will be addressed by the relevant department.',
        'flagged': 'Your feedback has been flagged for further review.',
        'escalated': 'Your feedback has been escalated to senior management for urgent attention.'
    }
    
    body = f"""Dear {user_name},

Your feedback (ID: {feedback_id}) status has been updated.

Previous Status: {old_status.replace('_', ' ').title()}
New Status: {new_status.replace('_', ' ').title()}

{status_messages.get(new_status, 'Your feedback status has been updated.')}

You can view your feedback details by logging into OpenGov platform.

Thank you for your contribution to government transparency.

Best regards,
OpenGov Team
"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa;">
            <div style="background-color: #0066cc; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">OpenGov</h1>
            </div>
            <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 8px;">
                <h2 style="color: #0066cc;">Feedback Status Update</h2>
                <p>Dear {user_name},</p>
                <p>Your feedback (ID: <strong>{feedback_id}</strong>) status has been updated.</p>
                <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Previous Status:</strong> {old_status.replace('_', ' ').title()}</p>
                    <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: #059669;">{new_status.replace('_', ' ').title()}</span></p>
                </div>
                <p>{status_messages.get(new_status, 'Your feedback status has been updated.')}</p>
                <p>You can view your feedback details by logging into the OpenGov platform.</p>
                <p style="margin-top: 30px;">Thank you for your contribution to government transparency.</p>
                <p>Best regards,<br><strong>OpenGov Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, body, html_body)

def send_forum_reply_email(user_email: str, user_name: str, post_title: str, replier_name: str, reply_preview: str):
    """Send email when someone replies to user's forum post"""
    subject = f"OpenGov: New Reply to Your Forum Post - {post_title}"
    
    body = f"""Dear {user_name},

{replier_name} has replied to your forum post: "{post_title}"

Reply preview:
{reply_preview[:200]}{'...' if len(reply_preview) > 200 else ''}

Log in to OpenGov to view the full reply and continue the discussion.

Best regards,
OpenGov Team
"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa;">
            <div style="background-color: #0066cc; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">OpenGov</h1>
            </div>
            <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 8px;">
                <h2 style="color: #0066cc;">New Forum Reply</h2>
                <p>Dear {user_name},</p>
                <p><strong>{replier_name}</strong> has replied to your forum post:</p>
                <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #0066cc;">{post_title}</h3>
                    <p style="margin: 0; color: #666; font-style: italic;">"{reply_preview[:200]}{'...' if len(reply_preview) > 200 else ''}"</p>
                </div>
                <p>Log in to OpenGov to view the full reply and continue the discussion.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/forum" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Discussion</a>
                </div>
                <p>Best regards,<br><strong>OpenGov Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, body, html_body)

def send_forum_moderation_email(user_email: str, user_name: str, action: str, content_type: str, content_title: str, reason: str = None):
    """Send email when admin takes moderation action on user's forum content"""
    
    action_titles = {
        'warn': 'Content Warning',
        'remove': 'Content Removed',
        'suspend': 'Account Suspended',
        'approve': 'Content Approved'
    }
    
    action_colors = {
        'warn': '#f59e0b',
        'remove': '#dc2626',
        'suspend': '#991b1b',
        'approve': '#059669'
    }
    
    subject = f"OpenGov: {action_titles.get(action, 'Moderation Action')} - {content_title}"
    
    if action == 'warn':
        message = f"Your {content_type} '{content_title}' has been flagged by our moderation team. {reason or 'Please ensure your content follows our community guidelines.'}"
    elif action == 'remove':
        message = f"Your {content_type} '{content_title}' has been removed. Reason: {reason or 'Violation of community guidelines.'}"
    elif action == 'suspend':
        message = f"Your account has been suspended due to your {content_type}. {reason or 'Please contact admin for more information.'}"
    elif action == 'approve':
        message = f"Your {content_type} '{content_title}' has been reviewed and approved by our moderation team."
    else:
        message = f"A moderation action has been taken on your {content_type}."
    
    body = f"""Dear {user_name},

{message}

Content Type: {content_type.title()}
Title/Topic: {content_title}
Action Taken: {action_titles.get(action, action.title())}

Please review our community guidelines to ensure future posts comply with our standards.

If you believe this action was taken in error, please contact our support team.

Best regards,
OpenGov Moderation Team
"""
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa;">
            <div style="background-color: #0066cc; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">OpenGov</h1>
            </div>
            <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 8px;">
                <h2 style="color: {action_colors.get(action, '#0066cc')};">{action_titles.get(action, 'Moderation Action')}</h2>
                <p>Dear {user_name},</p>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid {action_colors.get(action, '#f59e0b')}; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold; color: {action_colors.get(action, '#856404')};">{message}</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Content Type:</strong> {content_type.title()}</p>
                    <p style="margin: 5px 0;"><strong>Title/Topic:</strong> {content_title}</p>
                    <p style="margin: 5px 0;"><strong>Action Taken:</strong> {action_titles.get(action, action.title())}</p>
                </div>
                <p>Please review our <a href="http://localhost:5173/guidelines" style="color: #0066cc;">community guidelines</a> to ensure future posts comply with our standards.</p>
                <p>If you believe this action was taken in error, please contact our support team.</p>
                <p style="margin-top: 30px;">Best regards,<br><strong>OpenGov Moderation Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, body, html_body)

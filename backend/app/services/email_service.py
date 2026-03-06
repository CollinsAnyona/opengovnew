import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@opengov.ke")

def send_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None):
    """Send email notification"""
    print(f"\n=== SMTP DEBUG ===")
    print(f"SMTP Server: {SMTP_SERVER}")
    print(f"SMTP Port: {SMTP_PORT}")
    print(f"SMTP Username: {SMTP_USERNAME}")
    print(f"SMTP Password configured: {bool(SMTP_PASSWORD)}")
    print(f"From Email: {FROM_EMAIL}")
    print(f"To Email: {to_email}")
    print(f"Subject: {subject}")
    
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
        
        print(f"Connecting to SMTP server...")
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            print(f"Starting TLS...")
            server.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                print(f"Logging in...")
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            print(f"Sending message...")
            server.send_message(msg)
        
        print(f"✓ Email sent successfully!")
        print(f"=== END SMTP DEBUG ===\n")
        return True
    except Exception as e:
        print(f"✗ Failed to send email: {e}")
        import traceback
        traceback.print_exc()
        print(f"=== END SMTP DEBUG ===\n")
        return False

def send_feedback_response_email(user_email: str, user_name: str, feedback_message: str, admin_response: str):
    """Send email when admin responds to feedback"""
    subject = "OpenGov: Response to Your Feedback"
    
    plain_text = f"""Dear {user_name},

Thank you for your feedback. Our team has reviewed your submission and provided a response:

Your Feedback:
{feedback_message}

Admin Response:
{admin_response}

Your feedback has been marked as resolved. If you have any further concerns, please submit new feedback through the platform.

Best regards,
OpenGov Kenya Team
"""
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">Response to Your Feedback</h2>
                <p>Dear {user_name},</p>
                <p>Thank you for your feedback. Our team has reviewed your submission and provided a response:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your Feedback:</strong>
                    <p style="margin: 10px 0;">{feedback_message}</p>
                </div>
                
                <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <strong>Admin Response:</strong>
                    <p style="margin: 10px 0;">{admin_response}</p>
                </div>
                
                <p>Your feedback has been marked as resolved. If you have any further concerns, please submit new feedback through the platform.</p>
                
                <p style="margin-top: 30px;">Best regards,<br>OpenGov Kenya Team</p>
            </div>
        </body>
    </html>
    """
    
    return send_email(user_email, subject, plain_text, html_content)

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

def send_account_update_email(user_email: str, user_name: str, changes: dict):
    """Send email when admin updates user account"""
    subject = "OpenGov: Your Account Has Been Updated"
    
    change_list = []
    for key, value in changes.items():
        if key == 'role':
            change_list.append(f"Your role has been changed to: {value.title()}")
        elif key == 'password':
            change_list.append("Your password has been reset by an administrator")
        elif key == 'email':
            change_list.append(f"Your email has been updated to: {value}")
        elif key == 'status':
            change_list.append(f"Your account status: {value.title()}")
    
    changes_text = "\n".join([f"- {change}" for change in change_list])
    
    body = f"""Dear {user_name},

Your OpenGov account has been updated by an administrator.

Changes made:
{changes_text}

If you did not request these changes or have concerns, please contact support immediately.

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
                <h2 style="color: #0066cc;">Account Update Notification</h2>
                <p>Dear {user_name},</p>
                <p>Your OpenGov account has been updated by an administrator.</p>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <strong>Changes made:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        {''.join([f'<li>{change}</li>' for change in change_list])}
                    </ul>
                </div>
                <p>If you did not request these changes or have concerns, please contact support immediately.</p>
                <p style="margin-top: 30px;">Best regards,<br><strong>OpenGov Team</strong></p>
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

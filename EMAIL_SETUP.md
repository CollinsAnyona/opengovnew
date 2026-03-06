# Email Setup Guide for OpenGov

## Current Status
✅ Email functionality is **fully implemented** in the code
❌ Emails are **not sending** because SMTP is not configured

## What Emails Are Sent?

1. **Forum Reply Notifications**: When someone replies to a user's forum post
2. **Moderation Actions**: When admin takes action (warn, remove, suspend, approve)
3. **Password Reset**: When user requests password reset (6-digit code)

## How to Enable Emails

### Option 1: Using Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "OpenGov"
   - Copy the 16-character password

3. **Update `.env` file** in `backend/` folder:
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

4. **Restart the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

### Option 2: Using SendGrid (Recommended for Production)

1. **Sign up** at https://sendgrid.com (Free tier: 100 emails/day)

2. **Create API Key**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Update `.env` file**:
   ```env
   SMTP_SERVER=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USERNAME=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Verify sender email** in SendGrid dashboard

5. **Restart the backend server**

### Option 3: Using Mailtrap (For Testing Only)

1. **Sign up** at https://mailtrap.io (Free)

2. **Get SMTP credentials** from your inbox

3. **Update `.env` file**:
   ```env
   SMTP_SERVER=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USERNAME=your-mailtrap-username
   SMTP_PASSWORD=your-mailtrap-password
   FROM_EMAIL=noreply@opengov.ke
   ```

4. **Restart the backend server**

**Note**: Mailtrap catches all emails (doesn't actually send them). Good for testing.

## Testing Email Functionality

### Test 1: Forum Reply Notification
1. Login as User A
2. Create a forum post
3. Logout and login as User B
4. Reply to User A's post
5. Check User A's email inbox

### Test 2: Moderation Action
1. Login as admin
2. Go to `/moderation` page
3. Take action on flagged content (warn/remove/suspend)
4. Check the content author's email inbox

### Test 3: Password Reset
1. Go to login page
2. Click "Forgot Password?"
3. Enter email address
4. Check email for 6-digit code

## Troubleshooting

### Emails not sending?

1. **Check backend logs** for error messages
2. **Verify SMTP credentials** are correct
3. **Check spam folder** in email inbox
4. **For Gmail**: Make sure App Password is used (not regular password)
5. **For Gmail**: Check "Less secure app access" is not blocking

### Still not working?

The code has try-catch blocks that prevent email errors from breaking the app. Check backend console for error messages like:
```
Failed to send email: [error details]
```

## Email Templates Included

All emails use professional HTML templates with:
- OpenGov branding
- Responsive design
- Clear call-to-action buttons
- Plain text fallback

## Production Recommendations

1. **Use SendGrid or AWS SES** for production
2. **Set up SPF/DKIM records** for your domain
3. **Monitor email delivery rates**
4. **Add unsubscribe links** (for compliance)
5. **Rate limit email sending** to prevent spam

## Current Email Service Configuration

Location: `backend/app/services/email_service.py`

Functions available:
- `send_email()` - Generic email sender
- `send_forum_reply_email()` - Forum reply notifications
- `send_forum_moderation_email()` - Moderation action notifications
- `send_feedback_status_email()` - Feedback status updates (if needed)

All functions are already integrated into the application routes.

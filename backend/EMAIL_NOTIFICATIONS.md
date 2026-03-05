# Email Notifications Setup

## Features

Citizens receive email notifications for:
1. **Feedback Status Updates** - When admin changes feedback status (submitted → under review → approved/flagged/escalated)
2. **Forum Replies** - When someone replies to their forum post

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your email credentials:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@opengov.ke
```

### 2. Gmail Setup (Recommended)

If using Gmail:

1. Go to your Google Account: https://myaccount.google.com/
2. Enable **2-Factor Authentication**
3. Generate an **App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
4. Use this App Password as `SMTP_PASSWORD` in `.env`

### 3. Alternative Email Providers

**Outlook/Hotmail:**
```
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom SMTP:**
Use your organization's SMTP server details

### 4. Test Email Notifications

1. Start the backend server:
```bash
uvicorn main:app --reload
```

2. Test feedback notification:
   - Submit feedback as a citizen
   - Login as admin and change the feedback status
   - Check the citizen's email

3. Test forum reply notification:
   - Create a forum post as a citizen
   - Reply to the post as another user
   - Check the original poster's email

## Email Templates

### Feedback Status Update Email
- Subject: "OpenGov: Your Feedback Status Updated to [Status]"
- Includes: Feedback ID, old status, new status, next steps
- HTML formatted with OpenGov branding

### Forum Reply Email
- Subject: "OpenGov: New Reply to Your Forum Post - [Title]"
- Includes: Replier name, reply preview, link to discussion
- HTML formatted with OpenGov branding

## Troubleshooting

**Emails not sending:**
1. Check SMTP credentials in `.env`
2. Verify 2FA and App Password for Gmail
3. Check server logs for error messages
4. Ensure firewall allows SMTP port (587)

**Emails going to spam:**
1. Use a verified domain email
2. Set up SPF/DKIM records
3. Use a professional email service

**Testing without real emails:**
- Use a service like Mailtrap.io for testing
- Or check server logs for email content

## Security Notes

- Never commit `.env` file to Git
- Use App Passwords, not account passwords
- Rotate SMTP credentials regularly
- Use environment variables in production

## Future Enhancements

- Email preferences (opt-in/opt-out)
- Digest emails (daily/weekly summaries)
- SMS notifications
- Push notifications
- Email templates customization

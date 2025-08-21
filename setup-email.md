# Email Configuration Setup Guide

## Quick Setup for Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Update your .env file**:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=University Grading System <your-email@gmail.com>
```

## Alternative SMTP Setup

If you prefer using a different email provider:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=University Grading System <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:3000
```

## Testing Email Functionality

1. **Start the backend server**:
```bash
cd backend
npm start
```

2. **Test forgot password**:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

3. **Check console logs** for:
   - SMTP connection verification
   - Email sending confirmation
   - Preview URLs (for development)

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**: Check Gmail App Password
2. **"Connection timeout"**: Check firewall/network settings
3. **"Authentication failed"**: Verify credentials in .env

### Development Mode:
If no email credentials are configured, the system will use Ethereal.email test accounts and log preview URLs to the console.

## Security Notes

- Never commit real credentials to version control
- Use App Passwords, not regular passwords for Gmail
- Keep your .env file in .gitignore
- Rotate credentials regularly in production

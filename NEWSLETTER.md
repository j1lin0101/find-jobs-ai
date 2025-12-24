# Email Newsletter System

The Find Jobs AI application now features an email newsletter system that sends curated job listings to subscribers daily at 7 AM UTC.

## Features

### User-Facing
- **Email Signup Form** - Users can subscribe to the daily newsletter from the homepage
- **Email Validation** - Ensures valid email addresses are collected
- **Duplicate Prevention** - Prevents the same email from subscribing multiple times
- **Success Confirmation** - Shows subscribers confirmation after signup

### Admin Features
- **Admin Dashboard** (`/admin`) - View all subscribers and send test newsletters
- **Manual Newsletter Trigger** - Send newsletter immediately without waiting for 7 AM
- **Subscriber Management** - Delete subscribers and view confirmation status
- **Real-time Statistics** - See total and confirmed subscriber counts

## How It Works

### Architecture

1. **Frontend (Homepage - `/`)**
   - Simple email input form
   - Email validation before submission
   - Success state after subscription
   - Shows benefits of newsletter

2. **Subscribe API (`/api/subscribe`)**
   - Accepts email signup requests
   - Validates email format
   - Prevents duplicate subscriptions
   - Stores to `data/subscribers.json`
   - Auto-confirms subscriptions

3. **Scheduler (`lib/scheduler.ts`)**
   - Uses `node-cron` to schedule tasks
   - Runs every day at 7:00 AM UTC
   - Calls `/api/send-newsletter` endpoint

4. **Newsletter API (`/api/send-newsletter`)**
   - Reads all confirmed subscribers
   - Generates job listings for email content
   - TODO: Sends emails via email service provider
   - Logs success/failure

5. **Admin Dashboard (`/admin`)**
   - Displays all subscribers
   - Allows manual newsletter trigger
   - Subscriber management (delete, view status)

## File Structure

```
pages/
  index.tsx                 # Homepage with email signup form
  admin.tsx                 # Admin dashboard
  _app.tsx                  # App initialization with scheduler
  api/
    subscribe.ts            # Subscribe endpoint
    send-newsletter.ts      # Newsletter sending logic
    admin/
      subscribers.ts        # Subscriber management API

lib/
  scheduler.ts              # Cron job scheduler

data/
  subscribers.json          # Persisted subscriber list
```

## Data Structure

### Subscribers (`data/subscribers.json`)

```json
[
  {
    "email": "user@example.com",
    "subscribedAt": "2024-01-15T10:30:00Z",
    "confirmed": true
  }
]
```

## Usage

### For Users
1. Visit `http://localhost:3000/`
2. Enter email address
3. Click "Subscribe to Newsletter"
4. See success confirmation
5. Receive daily job emails at 7 AM UTC

### For Admins
1. Visit `http://localhost:3000/admin`
2. View all subscribers
3. Click "Send Newsletter Now" to test
4. Delete subscribers as needed

### Manual Newsletter Sending

```bash
curl -X POST http://localhost:3000/api/send-newsletter
```

## Environment Variables (TODO)

When implementing actual email sending, add:

```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=newsletter@yoursite.com
```

Or use alternative providers:
- Mailgun
- AWS SES
- Resend
- Postmark

## TODO: Email Service Integration

The current system is ready for email service integration:

1. **Choose Email Provider**
   - SendGrid
   - Mailgun
   - AWS SES
   - Resend
   - Postmark

2. **Install Package**
   ```bash
   npm install sendgrid  # or chosen provider
   ```

3. **Update `/api/send-newsletter.ts`**
   - Remove TODO comments
   - Implement actual email sending
   - Add HTML email template generation
   - Include job cards in email body

4. **Email Template**
   - Header with logo
   - Job cards matching UI design
   - Unsubscribe link (legal requirement)
   - Company branding

## Testing

### Local Testing (Development)

1. Visit homepage and subscribe with test email
2. Check `data/subscribers.json` to confirm storage
3. Go to `/admin` dashboard
4. Click "Send Newsletter Now" button
5. Check console logs for success messages
6. Verify newsletter generation logic

### Using TestCron.org (Free Scheduling Testing)

For testing 7 AM delivery schedule:
1. Create account at testcron.org
2. Set webhook to `https://yourdomain.com/api/send-newsletter`
3. Schedule for specific times to test

## Production Deployment

### Important Considerations

1. **Scheduler Initialization**
   - Current: Runs on client-side via `_app.tsx`
   - Production: Move to backend or use external cron service
   - Options:
     - Vercel Cron (serverless cron)
     - AWS Lambda + EventBridge
     - Heroku Scheduler
     - Dedicated cron service (EasyCron, cron-job.org)

2. **Email Service**
   - Must integrate with SendGrid/Mailgun/etc before going live
   - Set up environment variables
   - Configure sender email and domain

3. **Error Handling**
   - Add retry logic for failed emails
   - Log all sends to database
   - Alert on high failure rates

4. **Compliance**
   - CAN-SPAM compliance
   - Include physical address in emails
   - Honor unsubscribe requests
   - Privacy policy in signup form

5. **Database**
   - Migrate from JSON file to real database
   - PostgreSQL recommended
   - Track email send history
   - Handle unsubscribes

## Development Notes

- Newsletter generation uses mock job data for now
- Email sending logic ready for implementation
- Scheduler initialized on app startup
- Admin dashboard for manual testing and management
- All subscriber data persisted to disk

## Next Steps

1. Implement email service integration
2. Create HTML email template
3. Move scheduler to production environment
4. Add email confirmation/verification
5. Implement unsubscribe mechanism
6. Add email send history logging
7. Create email preview page

# Newsletter System Setup & Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Subscribe to Newsletter
- Visit `http://localhost:3000/`
- Enter your email address
- Click "Subscribe to Newsletter"
- You'll see a success confirmation

### 4. View Admin Dashboard
- Visit `http://localhost:3000/admin`
- See all subscribers
- Test sending newsletter manually

## Features Implemented

### ✅ Email Newsletter Signup
- Simple, clean form on homepage
- Email validation
- Duplicate prevention
- Success confirmation UI
- Subscriber data stored in `data/subscribers.json`

### ✅ Admin Dashboard
- View all subscribers
- See confirmation status
- Delete subscribers
- Manual newsletter trigger for testing
- Real-time subscriber count

### ✅ Newsletter Generation
- Generates job listings automatically
- Ready for email service integration
- Mock data for development testing
- Can be extended with AI analysis

### ✅ Scheduler Foundation
- Node-cron setup for 7 AM daily delivery
- Server-side only (doesn't break browser builds)
- Can be triggered via API endpoint

### 📁 API Endpoints

| Endpoint                 | Method | Purpose                             |
| ------------------------ | ------ | ----------------------------------- |
| `/api/subscribe`         | POST   | Subscribe to newsletter             |
| `/api/send-newsletter`   | POST   | Generate and prepare newsletter     |
| `/api/init-scheduler`    | POST   | Initialize the 7 AM daily scheduler |
| `/api/admin/subscribers` | GET    | List all subscribers                |
| `/api/admin/subscribers` | DELETE | Remove a subscriber                 |

## File Structure

```
find-jobs-ai/
├── pages/
│   ├── index.tsx                 # Homepage with email signup form
│   ├── admin.tsx                 # Admin dashboard
│   ├── _app.tsx                  # App layout
│   └── api/
│       ├── subscribe.ts          # Email subscription endpoint
│       ├── send-newsletter.ts    # Newsletter generation
│       ├── init-scheduler.ts     # Scheduler initialization
│       └── admin/
│           └── subscribers.ts    # Subscriber management
│
├── lib/
│   ├── scheduler.ts              # Cron job scheduler (server-side only)
│   ├── resumeParser.ts           # Job analysis engine
│   └── cn.ts                     # Utility functions
│
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
│
├── data/
│   └── subscribers.json          # Subscriber database (auto-created)
│
└── styles/
    └── globals.css               # Global styles
```

## Running with Scheduler

### Option 1: Use API Endpoint (Recommended)
```bash
npm run dev
# Then in another terminal:
curl -X POST http://localhost:3000/api/init-scheduler
```

### Option 2: Direct Node Initialization
```bash
npm run dev:with-scheduler
```

### Option 3: Production with Scheduler
```bash
npm run build
npm run start:with-scheduler
```

## Testing the Newsletter

### Manual Test (via Admin Dashboard)
1. Go to `http://localhost:3000/admin`
2. Click "Send Newsletter Now"
3. Check server logs for output
4. See "Newsletter ready for X subscribers" message

### Manual Test (via curl)
```bash
curl -X POST http://localhost:3000/api/send-newsletter
```

### Subscribe First
1. Visit `http://localhost:3000/`
2. Enter test email: `test@example.com`
3. Click "Subscribe to Newsletter"
4. Then test newsletter sending

## Subscriber Data Format

Subscribers are stored in `data/subscribers.json`:

```json
[
  {
    "email": "user@example.com",
    "subscribedAt": "2024-01-15T10:30:00Z",
    "confirmed": true
  }
]
```

## Next Steps: Email Integration

### 1. Choose Email Service Provider

**Popular Options:**
- **SendGrid** - Most popular, free tier available
- **Mailgun** - Good developer experience
- **AWS SES** - Cost-effective at scale
- **Resend** - Modern, developer-friendly
- **Postmark** - High deliverability

### 2. Install Email Package
```bash
npm install @sendgrid/mail  # For SendGrid
# or
npm install mailgun.js      # For Mailgun
```

### 3. Add Environment Variables
Create `.env.local`:
```env
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=newsletter@yoursite.com
```

### 4. Update `/api/send-newsletter.ts`
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// In the handler:
const emailPromises = confirmedSubscribers.map((subscriber: any) => {
  return sgMail.send({
    to: subscriber.email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Your Daily Job Newsletter',
    html: generateEmailHTML(jobs),
  })
})

await Promise.all(emailPromises)
```

### 5. Create Email Template
Design HTML email with job cards, unsubscribe link, branding

## Scheduler Cron Expression

Current: `0 7 * * *` (7:00 AM UTC daily)

**To change delivery time:**
Edit `lib/scheduler.ts`:
```typescript
// Change '0 7 * * *' to your desired time
cron.schedule('0 18 * * *', async () => {  // 6 PM UTC
  // ...
})
```

**Cron Format:** `minute hour day month day-of-week`
- `0 7 * * *` - 7:00 AM daily
- `0 14 * * *` - 2:00 PM daily
- `0 7 * * 1` - 7:00 AM Mondays only
- `30 9 * * 1-5` - 9:30 AM weekdays only

## Logging & Debugging

### Check if Scheduler Started
Look for this message in console:
```
[Newsletter Scheduler] Initialized - Newsletter will be sent daily at 7 AM UTC
```

### Check Newsletter Generation
When newsletter runs, you'll see:
```
[Newsletter] Would send newsletter to X subscribers
[Newsletter] Newsletter contains 10 job listings
[Newsletter] Would send to: user@example.com
```

### Enable Test Hourly Runs
In `lib/scheduler.ts`, uncomment the test schedule:
```typescript
// Runs at minute 1 of every hour for testing
cron.schedule('1 * * * *', async () => {
  // ...
})
```

## Troubleshooting

### Build Fails with "node-cron" Error
- Ensure scheduler is only imported in server contexts
- Check that `_app.tsx` doesn't import scheduler
- Use `require()` instead of `import` for node-cron

### Subscribers Not Being Saved
- Check `data/` directory exists
- Verify write permissions
- Check server logs for errors

### Newsletter Not Triggering at 7 AM
- Scheduler must be initialized (see "Running with Scheduler")
- Check server is running and has console access
- Verify server time matches expected timezone (currently UTC)

### Admin Dashboard Not Loading
- Ensure `data/subscribers.json` exists
- Try subscribing first to create the file
- Check browser console for errors

## Production Deployment

### Vercel (Recommended for Next.js)
```bash
vercel deploy
```
Then add cron job via `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/send-newsletter",
    "schedule": "0 7 * * *"
  }]
}
```

### Self-Hosted
1. Initialize scheduler on app startup
2. Use external cron service (EasyCron, cron-job.org)
3. Or use PM2 with cron scheduling
4. Configure email service provider

## Security Considerations

- Add authentication to `/admin` routes in production
- Validate API requests to `/api/send-newsletter`
- Use environment variables for API keys
- Implement GDPR-compliant unsubscribe
- Add rate limiting for subscribe endpoint

## Monitoring

- Log all newsletter sends with timestamp and count
- Track email delivery (via SendGrid/Mailgun webhooks)
- Monitor failed sends and retry logic
- Alert on high unsubscribe rates

---

**Status:** ✅ Core system ready for email service integration
**Next Priority:** Implement email sending with chosen provider

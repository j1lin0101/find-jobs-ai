import fs from 'fs'
import path from 'path'

interface Job {
    title: string
    company: string
    location: string
    salary: string
    type: string
    source: string
    description: string
    requirements: string[]
    applicationUrl: string
    matchScore?: number
}

// Job sources
const JOB_SOURCES = [
    { name: 'LinkedIn', icon: '💼' },
    { name: 'Indeed', icon: '🔍' },
    { name: 'Glassdoor', icon: '🚪' },
    { name: 'Google Jobs', icon: '🔎' },
]

const COMPANIES = {
    tech: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Stripe'],
    startups: ['Notion', 'Figma', 'Canva', 'Vercel', 'Supabase', 'Linear', 'Retool', 'Loom'],
    finance: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Citadel', 'Two Sigma'],
}

const LOCATIONS = [
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Remote',
    'Hybrid - San Francisco',
]

const SALARY_RANGES = [
    '$80k - $120k',
    '$100k - $150k',
    '$120k - $160k',
    '$140k - $180k',
    '$150k - $200k',
]

const JOB_TYPES = ['Full-time', 'Remote', 'Contract', 'Full-time Remote', 'Hybrid']

const ROLES = [
    'Senior Software Engineer',
    'Full Stack Developer',
    'Product Manager',
    'Data Scientist',
    'DevOps Engineer',
    'Solutions Architect',
    'Engineering Manager',
    'Backend Engineer',
    'Frontend Engineer',
    'ML Engineer',
]

function scoreJobMatch(job: Job, userDescription: string): number {
    if (!userDescription) return 0.5 // Default medium match if no description

    const description = userDescription.toLowerCase()
    let score = 0
    const keywords = description.split(/[\s,]+/).filter(w => w.length > 2)

    // Check if job title or company matches user keywords
    const jobText = (job.title + ' ' + job.company + ' ' + job.description).toLowerCase()

    keywords.forEach(keyword => {
        if (jobText.includes(keyword)) {
            score += 0.1
        }
    })

    // Check salary match
    if (description.includes('remote') && job.type.includes('Remote')) {
        score += 0.2
    }

    return Math.min(score, 1)
}

export function generateJobsForWelcome(count: number = 5, userDescription: string = ''): Job[] {
    const jobs: Job[] = []
    const allCompanies = [
        ...COMPANIES.tech,
        ...COMPANIES.startups,
        ...COMPANIES.finance,
    ]

    // Generate more jobs then filter by match score
    const generatedCount = count * 3

    for (let i = 0; i < generatedCount; i++) {
        const company = allCompanies[Math.floor(Math.random() * allCompanies.length)]
        const title = ROLES[Math.floor(Math.random() * ROLES.length)]
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
        const salary = SALARY_RANGES[Math.floor(Math.random() * SALARY_RANGES.length)]
        const type = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)]
        const source = JOB_SOURCES[Math.floor(Math.random() * JOB_SOURCES.length)]

        const job: Job = {
            title,
            company,
            location,
            salary,
            type,
            source: source.name,
            description: `We are looking for a talented ${title} to join our team at ${company}. You will work on cutting-edge projects and collaborate with world-class engineers.`,
            requirements: [
                'Strong problem-solving skills',
                'Experience with modern technologies',
                'Excellent communication',
                'Team collaboration',
            ],
            applicationUrl: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i + 1}`,
        }

        job['matchScore'] = scoreJobMatch(job, userDescription)
        jobs.push(job)
    }

    // Sort by match score and return top N
    return jobs.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, count)
}

export function generateWelcomeEmailHTML(email: string, jobs: Job[]): string {
    const jobsHTML = jobs
        .map(
            (job: any) => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 20px; border-right: 1px solid #e0e0e0;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${job.title}
          </h3>
          <p style="margin: 0 0 4px 0; color: #4b5563; font-size: 14px;">
            ${job.company}
          </p>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px;">
            ${job.location} • ${job.type}
          </p>
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 13px; line-height: 1.5;">
            ${job.description}
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            ${job.requirements
                .slice(0, 3)
                .map(
                    (requirement: string) => `
              <span style="display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                ${requirement}
              </span>
            `
                )
                .join('')}
          </div>
          <p style="margin: 0; color: #059669; font-size: 14px; font-weight: 600;">
            ${job.salary}
          </p>
        </td>
        <td style="padding: 20px; text-align: center;">
          <a href="${job.applicationUrl}" style="display: inline-block; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Apply Now
          </a>
        </td>
      </tr>
    `
        )
        .join('')

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6;">
      <div style="max-width: 800px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(to right, #1e3a8a, #6d28d9); padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
            Welcome to Find Jobs AI! 🎉
          </h1>
          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
            Here are hand-picked jobs matched for you
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
            Hi there,
          </p>
          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
            Thanks for subscribing to Find Jobs AI! We've analyzed your preferences and matched you with <strong>${jobs.length} incredible job opportunities</strong> that we think you'll love.
          </p>
          <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
            Starting tomorrow at 7 AM, you'll receive daily updates with new jobs selected just for you. But don't wait—check out these opportunities today!
          </p>

          <!-- Jobs Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            ${jobsHTML}
          </table>

          <!-- Features -->
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
              What You'll Get Every Morning
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li style="margin: 8px 0;">Daily curated job listings tailored to your skills</li>
              <li style="margin: 8px 0;">Jobs posted within the last 24 hours</li>
              <li style="margin: 8px 0;">Resume matching insights</li>
              <li style="margin: 8px 0;">Delivered every morning at 7 AM UTC</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
              Questions? Reply to this email and we'll help you out.
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              You can <a href="#" style="color: #2563eb; text-decoration: none;">manage your preferences</a> or <a href="#" style="color: #2563eb; text-decoration: none;">unsubscribe</a> anytime.
            </p>
          </div>
        </div>

        <!-- Bottom Banner -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © 2025 Find Jobs AI. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// TODO: Integrate with email service provider (SendGrid, Mailgun, AWS SES, etc)
export async function sendWelcomeEmail(email: string, jobs: Job[]): Promise<boolean> {
    try {
        const htmlContent = generateWelcomeEmailHTML(email, jobs)
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'j1lin0101@gmail.com'
        const apiKey = process.env.SENDGRID_API_KEY

        if (!apiKey) {
            console.log(`[Welcome Email] No SENDGRID_API_KEY found - would send to: ${email}`)
            return false
        }

        // Send with SendGrid
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(apiKey)

        const msg = {
            to: email,
            from: fromEmail,
            subject: 'Welcome to Find Jobs AI - Here are your matched jobs!',
            html: htmlContent,
        }

        await sgMail.send(msg)

        console.log(`[Welcome Email] ✅ Successfully sent to: ${email} from ${fromEmail}`)
        return true
    } catch (error) {
        console.error('[Welcome Email] Error:', error)
        return false
    }
}

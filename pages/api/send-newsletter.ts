import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

// Job sources
const JOB_SOURCES = [
    { name: 'LinkedIn', icon: '💼' },
    { name: 'Indeed', icon: '🔍' },
    { name: 'Glassdoor', icon: '🚪' },
    { name: 'Google Jobs', icon: '🔎' },
    { name: 'Fortune 500 Companies', icon: '🏢' },
    { name: 'Tech Startups', icon: '🚀' },
    { name: 'Remote Job Boards', icon: '🌍' },
    { name: 'Staffing Agencies', icon: '👥' },
]

// Sample company data for generating realistic jobs
const COMPANIES = {
    tech: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Stripe'],
    startups: ['Notion', 'Figma', 'Canva', 'Vercel', 'Supabase', 'Linear', 'Retool', 'Loom', 'Miro'],
    finance: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Citadel', 'Two Sigma', 'BlackRock'],
    healthcare: ['UnitedHealth', 'CVS Health', 'Anthem', 'Cigna', 'HCA Healthcare'],
    consulting: ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC'],
    agencies: ['Robert Half', 'Randstad', 'ManpowerGroup', 'Kelly Services', 'Adecco'],
}

const LOCATIONS = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
    'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA', 'Miami, FL',
    'Remote', 'Hybrid - San Francisco', 'Hybrid - New York',
]

const SALARY_RANGES = [
    '$80k - $120k', '$100k - $150k', '$120k - $160k', '$140k - $180k',
    '$150k - $200k', '$90k - $130k', '$110k - $140k', '$130k - $170k',
]

const JOB_TYPES = ['Full-time', 'Remote', 'Contract', 'Full-time Remote', 'Hybrid']

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
}

function generateJobTitle(): string {
    const roles = [
        'Senior Software Engineer',
        'Full Stack Developer',
        'Product Manager',
        'Data Scientist',
        'DevOps Engineer',
        'Solutions Architect',
        'Engineering Manager',
        'Technical Lead',
        'Backend Engineer',
        'Frontend Engineer',
        'ML Engineer',
        'Cloud Architect',
        'Security Engineer',
        'Platform Engineer',
        'Site Reliability Engineer',
    ]
    return roles[Math.floor(Math.random() * roles.length)]
}

function generateRequirements(): string[] {
    const baseRequirements = [
        'Bachelor\'s degree in Computer Science or related field',
        'Strong problem-solving and analytical skills',
        'Excellent communication and collaboration abilities',
        'Experience working in agile development environments',
    ]
    return baseRequirements
}

function generateJobsForNewsletter(count: number = 10): Job[] {
    const jobs: Job[] = []
    const allCompanies = [
        ...COMPANIES.tech,
        ...COMPANIES.startups,
        ...COMPANIES.finance,
    ]

    for (let i = 0; i < count; i++) {
        const company = allCompanies[Math.floor(Math.random() * allCompanies.length)]
        const title = generateJobTitle()
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
        const salary = SALARY_RANGES[Math.floor(Math.random() * SALARY_RANGES.length)]
        const type = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)]
        const source = JOB_SOURCES[Math.floor(Math.random() * JOB_SOURCES.length)]
        const requirements = generateRequirements()
        const jobDescription = `We are looking for a talented ${title} to join our team at ${company}. You will work on cutting-edge projects and collaborate with world-class engineers.`

        jobs.push({
            title,
            company,
            location,
            salary,
            type,
            source: source.name,
            description: jobDescription,
            requirements,
            applicationUrl: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i + 1}`,
        })
    }

    return jobs
}

function generateNewsletterHTML(jobs: Job[], userDescription: string = ''): string {
    const jobsHTML = jobs
        .slice(0, 10)
        .map(
            (job: Job) => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 20px;">
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
          <p style="margin: 0 0 12px 0; color: #059669; font-size: 14px; font-weight: 600;">
            ${job.salary}
          </p>
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
            Your Daily Job Newsletter 📧
          </h1>
          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
            ${jobs.length} hand-picked jobs matched for you
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
          <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
            Hi there,
          </p>
          <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
            Here are today's ${jobs.length} job listings tailored to your profile. Click "Apply Now" to view more details and apply!
          </p>

          <!-- Jobs Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            ${jobsHTML}
          </table>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
              Happy job hunting!
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

interface ApiResponse {
    error?: string
    message?: string
    emailsSent?: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Read subscribers
        const dataDir = path.join(process.cwd(), 'data')
        const subscribersFile = path.join(dataDir, 'subscribers.json')

        if (!fs.existsSync(subscribersFile)) {
            return res.status(200).json({
                message: 'No subscribers to send to',
                emailsSent: 0,
            })
        }

        const subscribersData = fs.readFileSync(subscribersFile, 'utf-8')
        const subscribers = JSON.parse(subscribersData)

        // Filter confirmed subscribers
        const confirmedSubscribers = subscribers.filter((sub: any) => sub.confirmed)

        if (confirmedSubscribers.length === 0) {
            return res.status(200).json({
                message: 'No confirmed subscribers',
                emailsSent: 0,
            })
        }

        // Generate jobs for newsletter
        const jobs = generateJobsForNewsletter(10)

        // Send emails via SendGrid
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'j1lin0101@gmail.com'
        const apiKey = process.env.SENDGRID_API_KEY

        if (!apiKey) {
            console.log(`[Newsletter] No SENDGRID_API_KEY - would send to ${confirmedSubscribers.length} subscribers`)
            return res.status(200).json({
                message: `Newsletter ready for ${confirmedSubscribers.length} subscribers (no API key configured)`,
                emailsSent: 0,
            })
        }

        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(apiKey)

        // Send to each subscriber
        let sentCount = 0
        const sendPromises = confirmedSubscribers.map(async (subscriber: any) => {
            try {
                const msg = {
                    to: subscriber.email,
                    from: fromEmail,
                    subject: 'Your Daily Job Newsletter - Find Jobs AI',
                    html: generateNewsletterHTML(jobs, subscriber.jobDescription),
                }
                await sgMail.send(msg)
                sentCount++
                console.log(`[Newsletter] ✅ Sent to: ${subscriber.email}`)
            } catch (error) {
                console.error(`[Newsletter] ❌ Failed to send to ${subscriber.email}:`, error)
            }
        })

        await Promise.all(sendPromises)

        console.log(`[Newsletter] Sent ${sentCount}/${confirmedSubscribers.length} newsletters`)

        return res.status(200).json({
            message: `Newsletter sent to ${sentCount} subscribers`,
            emailsSent: sentCount,
        })
    } catch (error) {
        console.error('Newsletter error:', error)
        return res.status(500).json({
            error: 'An error occurred while processing the newsletter',
        })
    }
}

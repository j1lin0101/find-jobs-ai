import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { generateJobsForWelcome, sendWelcomeEmail } from '../../lib/emailService'

interface SubscriberData {
    email: string
    jobDescription: string
    subscribedAt: string
    confirmed: boolean
}

interface ApiResponse {
    error?: string
    message?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { email, jobDescription } = req.body

    if (!email || !email.trim()) {
        return res.status(400).json({ error: 'Email is required' })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' })
    }

    try {
        // Path to subscribers file
        const dataDir = path.join(process.cwd(), 'data')
        const subscribersFile = path.join(dataDir, 'subscribers.json')

        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
        }

        // Read existing subscribers
        let subscribers: SubscriberData[] = []
        if (fs.existsSync(subscribersFile)) {
            const data = fs.readFileSync(subscribersFile, 'utf-8')
            subscribers = JSON.parse(data)
        }

        // Check if email already exists
        const emailExists = subscribers.some(
            (sub) => sub.email.toLowerCase() === email.toLowerCase()
        )

        if (emailExists) {
            return res.status(400).json({ error: 'Email already subscribed' })
        }

        // Add new subscriber
        const newSubscriber: SubscriberData = {
            email: email.toLowerCase(),
            jobDescription: jobDescription?.trim() || '',
            subscribedAt: new Date().toISOString(),
            confirmed: false,
        }

        subscribers.push(newSubscriber)

        // Write updated subscribers back to file
        fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2))

        // TODO: Send confirmation email in production
        // For now, we'll auto-confirm
        newSubscriber.confirmed = true
        subscribers[subscribers.length - 1].confirmed = true
        fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2))

        // Send welcome email with matched jobs
        const welcomeJobs = generateJobsForWelcome(5, jobDescription)
        await sendWelcomeEmail(email, welcomeJobs)

        // Log subscription summary
        console.log(`\n${'='.repeat(60)}`)
        console.log(`[New Subscriber] 🎉 ${email}`)
        console.log(`${'='.repeat(60)}`)
        console.log(`Subscribed: ${new Date().toLocaleString()}`)
        if (jobDescription) {
            console.log(`\nJob Description:\n${jobDescription}`)
        } else {
            console.log(`\nJob Description: (None provided)`)
        }
        console.log(`Matched Jobs Sent: ${welcomeJobs.length}`)
        console.log(`${'='.repeat(60)}\n`)

        return res.status(200).json({
            message: 'Successfully subscribed to newsletter',
        })
    } catch (error) {
        console.error('Subscription error:', error)
        return res.status(500).json({
            error: 'An error occurred while processing your subscription',
        })
    }
}

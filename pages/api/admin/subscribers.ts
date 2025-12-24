import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

interface Subscriber {
    email: string
    subscribedAt: string
    confirmed: boolean
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Subscriber[] | { error: string } | { message: string }>
) {
    try {
        const dataDir = path.join(process.cwd(), 'data')
        const subscribersFile = path.join(dataDir, 'subscribers.json')

        if (req.method === 'GET') {
            if (!fs.existsSync(subscribersFile)) {
                return res.status(200).json([])
            }

            const subscribersData = fs.readFileSync(subscribersFile, 'utf-8')
            const subscribers = JSON.parse(subscribersData)
            return res.status(200).json(subscribers)
        }

        if (req.method === 'DELETE') {
            const { email } = req.query

            if (!email || typeof email !== 'string') {
                return res.status(400).json({ error: 'Email parameter required' })
            }

            if (!fs.existsSync(subscribersFile)) {
                return res.status(404).json({ error: 'Subscribers file not found' })
            }

            const subscribersData = fs.readFileSync(subscribersFile, 'utf-8')
            let subscribers = JSON.parse(subscribersData)

            subscribers = subscribers.filter((sub: Subscriber) => sub.email.toLowerCase() !== email.toLowerCase())

            fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2))

            return res.status(200).json({ message: 'Subscriber deleted' })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (error) {
        console.error('Admin subscribers error:', error)
        return res.status(500).json({ error: 'An error occurred' })
    }
}

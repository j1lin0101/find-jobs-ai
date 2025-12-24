import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeScheduler } from '../../lib/scheduler'

interface ApiResponse {
    message: string
    scheduled?: boolean
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    // This should be called once during server startup
    // Can be triggered manually or integrated with deployment scripts

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        initializeScheduler()
        return res.status(200).json({
            message: 'Newsletter scheduler initialized',
            scheduled: true,
        })
    } catch (error) {
        console.error('Error initializing scheduler:', error)
        return res.status(500).json({
            message: 'Failed to initialize scheduler',
        })
    }
}

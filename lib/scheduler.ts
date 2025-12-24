// Server-side only - node-cron scheduling for newsletter delivery
// This file should only be imported in server contexts

let schedulerStarted = false

export function initializeScheduler() {
    // Check if we're in a Node.js environment
    if (typeof window !== 'undefined') {
        console.log('[Newsletter Scheduler] Cannot initialize scheduler in browser environment')
        return
    }

    if (schedulerStarted) {
        console.log('[Newsletter Scheduler] Already initialized')
        return
    }

    try {
        // Dynamically import node-cron only in Node.js environment
        const cron = require('node-cron')

        // Schedule newsletter to send daily at 7 AM (UTC)
        // Cron format: minute hour day month day-of-week
        // 0 7 * * * = 7:00 AM every day
        cron.schedule('0 7 * * *', async () => {
            console.log('[Newsletter Scheduler] Running daily newsletter at 7 AM...')

            try {
                // Use localhost for development, update for production
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
                const response = await fetch(`${baseUrl}/api/send-newsletter`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                const data = await response.json()
                console.log('[Newsletter Scheduler] Response:', data)
            } catch (error) {
                console.error('[Newsletter Scheduler] Error sending newsletter:', error)
            }
        })

        schedulerStarted = true
        console.log('[Newsletter Scheduler] Initialized - Newsletter will be sent daily at 7 AM UTC')
    } catch (error) {
        console.error('[Newsletter Scheduler] Failed to initialize:', error)
    }
}

export function stopScheduler() {
    if (schedulerStarted) {
        try {
            const cron = require('node-cron')
            cron.getTasks().forEach((task: any) => task.stop())
        } catch (error) {
            console.error('[Newsletter Scheduler] Error stopping scheduler:', error)
        }
        schedulerStarted = false
        console.log('[Newsletter Scheduler] Stopped')
    }
}

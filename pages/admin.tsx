import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Mail, Send, Trash2 } from 'lucide-react'

interface Subscriber {
    email: string
    subscribedAt: string
    confirmed: boolean
}

export default function AdminDashboard() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        loadSubscribers()
    }, [])

    async function loadSubscribers() {
        try {
            const response = await fetch('/api/admin/subscribers')
            const data = await response.json()
            if (Array.isArray(data)) {
                setSubscribers(data)
            }
        } catch (error) {
            console.error('Error loading subscribers:', error)
        } finally {
            setLoading(false)
        }
    }

    async function sendNewsletter() {
        setSending(true)
        setMessage('')
        try {
            const response = await fetch('/api/send-newsletter', {
                method: 'POST',
            })
            const data = await response.json()
            setMessage(
                data.emailsSent
                    ? `✅ Newsletter sent to ${data.emailsSent} subscribers`
                    : `⚠️ ${data.message || 'No subscribers to send to'}`
            )
        } catch (error) {
            setMessage('❌ Error sending newsletter')
            console.error(error)
        } finally {
            setSending(false)
        }
    }

    async function deleteSubscriber(email: string) {
        if (!confirm(`Delete ${email}?`)) return

        try {
            const response = await fetch(`/api/admin/subscribers?email=${encodeURIComponent(email)}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setSubscribers(subscribers.filter(s => s.email !== email))
                setMessage('✅ Subscriber deleted')
            }
        } catch (error) {
            setMessage('❌ Error deleting subscriber')
            console.error(error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Newsletter Admin</h1>
                    <p className="text-gray-600">Manage subscribers and send newsletters</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                        {message}
                    </div>
                )}

                {/* Send Newsletter Card */}
                <Card className="mb-8 border border-purple-100 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            Send Newsletter
                        </CardTitle>
                        <CardDescription>
                            Trigger the daily newsletter to be sent immediately to all confirmed subscribers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={sendNewsletter}
                            disabled={sending}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {sending ? 'Sending...' : 'Send Newsletter Now'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Subscribers List */}
                <Card className="border border-purple-100 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Subscribers ({subscribers.length})
                        </CardTitle>
                        <CardDescription>
                            Total subscribers: {subscribers.length} | Confirmed: {subscribers.filter(s => s.confirmed).length}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-gray-600">Loading subscribers...</p>
                        ) : subscribers.length === 0 ? (
                            <p className="text-gray-600">No subscribers yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscribed</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((subscriber) => (
                                            <tr key={subscriber.email} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">{subscriber.email}</td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${subscriber.confirmed
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}
                                                    >
                                                        {subscriber.confirmed ? 'Confirmed' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => deleteSubscriber(subscriber.email)}
                                                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

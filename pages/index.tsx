import { useState } from 'react'
import Head from 'next/head'
import { Sparkles, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function Home() {
    const [email, setEmail] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, jobDescription }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Subscription failed')
            }

            setSubmitted(true)
            setEmail('')
            setJobDescription('')
            // Reset submitted message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Head>
                <title>Find Jobs AI - Daily Job Newsletter</title>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-2xl shadow-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                            <CardTitle className="text-3xl">Find Your Dream Job</CardTitle>
                        </div>
                        <CardDescription>
                            Get handpicked job listings delivered to your inbox every day at 7 AM
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {submitted ? (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900">You're Subscribed!</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Check your email to confirm your subscription. Starting tomorrow at 7 AM, you'll receive daily job listings.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        Email Address
                                    </Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                    <p className="text-sm text-gray-500">
                                        We'll send you relevant job listings every morning. Unsubscribe anytime.
                                    </p>
                                </div>

                                {/* Job Description Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="jobDescription">Describe Your Ideal Job</Label>
                                    <textarea
                                        id="jobDescription"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="e.g., Senior React developer with 5+ years experience, remote role, working on AI products..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={4}
                                    />
                                    <p className="text-sm text-gray-500">
                                        This helps us find jobs that match your skills and preferences. You can describe your experience, desired role, tech stack, or any other preferences.
                                    </p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                {/* Features List */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                    <p className="font-semibold text-blue-900">What You'll Get:</p>
                                    <ul className="space-y-2 text-sm text-blue-900">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600">✓</span>
                                            <span>Daily curated job listings from 8+ sources</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600">✓</span>
                                            <span>Jobs posted within the last 24 hours</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600">✓</span>
                                            <span>Intelligent resume matching insights</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600">✓</span>
                                            <span>Delivered every morning at 7 AM</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                        disabled={isSubmitting || !email.trim()}
                                    >
                                        <Mail className="mr-2 h-5 w-5" />
                                        {isSubmitting ? 'Subscribing...' : 'Subscribe to Daily Newsletter'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

import { useState, useRef } from 'react'
import Head from 'next/head'
import { Briefcase, MapPin, Upload, Linkedin, Sparkles, ChevronDown, ChevronUp, Building2, DollarSign, Clock, ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

interface ResumeAnalysis {
    resumeScore: number
    matchingKeywords: string[]
    missingKeywords: string[]
    matchingSkills: string[]
    missingSkills: string[]
    strengthsFound: string[]
    improvementAreas: string[]
    metricsSuggestions: string[]
    keywordDensity: number
    overallFeedback: string
}

interface LinkedInAnalysis {
    linkedinScore: number
    headlineSuggestion: string
    summaryFeedback: string[]
    endorsementSuggestions: string[]
    skillGaps: string[]
    improvements: string[]
    overallFeedback: string
}

interface Job {
    id: string
    title: string
    company: string
    location: string
    salary: string
    type: string
    source: string
    sourceIcon: string
    description: string
    requirements: string[]
    postedDate: string
    applicationUrl: string
    matchScore: number
    resumeFeedback?: string
    linkedInFeedback?: string
    resumeAnalysis?: ResumeAnalysis
    linkedinAnalysis?: LinkedInAnalysis
}

interface SearchStatus {
    message: string
    progress: number
    currentSource: string | null
    sourceIcon?: string
    sourcesCompleted?: number
    totalSources?: number
}

export default function Home() {
    const [jobDescription, setJobDescription] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchStatus, setSearchStatus] = useState<SearchStatus | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [expandedJob, setExpandedJob] = useState<string | null>(null)
    const [showResults, setShowResults] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const jobsPerPage = 10
    const fileInputRef = useRef<HTMLInputElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

    // Pagination calculations
    const totalPages = Math.ceil(jobs.length / jobsPerPage)
    const startIndex = (currentPage - 1) * jobsPerPage
    const endIndex = startIndex + jobsPerPage
    const currentJobs = jobs.slice(startIndex, endIndex)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0])
        }
    }

    const handleRemoveFile = () => {
        setResumeFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setJobs([])
        setShowResults(true)
        setSearchStatus({ message: 'Initializing search...', progress: 0, currentSource: null })

        try {
            // Read resume file if provided
            let resumeText = ''
            if (resumeFile) {
                resumeText = await new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (e) => resolve((e.target?.result as string) || '')
                    reader.readAsText(resumeFile)
                })
            }

            // Call API with streaming response
            const response = await fetch('/api/search-jobs-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobDescription,
                    resumeText,
                    linkedinUrl,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Search failed: ${response.status} - ${errorText}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (reader) {
                let buffer = ''
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6))
                                if (data.type === 'status') {
                                    setSearchStatus(data)
                                } else if (data.type === 'jobs') {
                                    setJobs((prev) => [...prev, ...data.jobs])
                                } else if (data.type === 'complete') {
                                    setJobs((prev) =>
                                        [...prev, ...data.jobs].sort((a, b) => b.matchScore - a.matchScore)
                                    )
                                    setSearchStatus({ message: 'Search complete!', progress: 100, currentSource: null })
                                }
                            } catch (e) {
                                console.error('Parse error:', e)
                            }
                        }
                    }
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during search'
            setSearchStatus({ message: `Error: ${errorMessage}`, progress: 0, currentSource: null })
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        setShowResults(false)
        setJobs([])
        setCurrentPage(1)
        setExpandedJob(null)
    }

    const toggleJobDetails = (jobId: string) => {
        setExpandedJob(expandedJob === jobId ? null : jobId)
    }

    if (showResults) {
        return (
            <>
                <Head>
                    <title>Job Results - Find Jobs AI</title>
                </Head>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="mb-4"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Search
                            </Button>

                            <Card className="shadow-md">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-6 w-6 text-blue-600" />
                                        <CardTitle className="text-3xl">Your Matched Jobs</CardTitle>
                                    </div>
                                    <CardDescription>
                                        We found {jobs.length} positions that match your profile. Click on any job to see details and personalized insights.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Loading Status */}
                        {searchStatus && searchStatus.progress < 100 && (
                            <Card className="mb-8 bg-blue-50 border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{searchStatus.message}</p>
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${searchStatus.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{searchStatus.progress}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Jobs List */}
                        {currentJobs.length > 0 && (
                            <div className="space-y-4">
                                {currentJobs.map((job) => {
                                    const isExpanded = expandedJob === job.id

                                    return (
                                        <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                            <CardContent className="p-0">
                                                {/* Job Header */}
                                                <div
                                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => toggleJobDetails(job.id)}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-medium mb-2">{job.title}</h3>
                                                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                                                                <Building2 className="h-4 w-4" />
                                                                <span className="font-medium">{job.company}</span>
                                                            </div>

                                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span>{job.location}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <DollarSign className="h-4 w-4" />
                                                                    <span>{job.salary}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4" />
                                                                    <span>{job.type}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className="text-xs text-gray-500">{job.postedDate}</span>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className={`text-2xl font-bold ${job.matchScore >= 80 ? 'text-green-600' :
                                                                    job.matchScore >= 60 ? 'text-yellow-600' :
                                                                        'text-orange-600'
                                                                    }`}>
                                                                    {job.matchScore}%
                                                                </span>
                                                                <span className="text-xs text-gray-500">Match</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-transparent"
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronUp className="h-5 w-5" />
                                                                ) : (
                                                                    <ChevronDown className="h-5 w-5" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 bg-gray-50">
                                                        <div className="p-6 space-y-6">
                                                            {/* Job Description */}
                                                            <div>
                                                                <h4 className="text-lg font-medium mb-2 flex items-center gap-2">
                                                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                                                    About this role
                                                                </h4>
                                                                <p className="text-gray-700 leading-relaxed">
                                                                    {job.description}
                                                                </p>
                                                            </div>

                                                            {/* Requirements */}
                                                            <div>
                                                                <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                    Requirements
                                                                </h4>
                                                                <ul className="space-y-2">
                                                                    {job.requirements.map((req, idx) => (
                                                                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                                            <span className="text-green-600 mt-1 font-bold">•</span>
                                                                            <span>{req}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Resume Tips */}
                                                            {job.resumeAnalysis && (
                                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                                    <h4 className="text-lg font-medium mb-3 flex items-center gap-2 text-amber-900">
                                                                        <Lightbulb className="h-5 w-5 text-amber-600" />
                                                                        Resume Match Tips
                                                                    </h4>
                                                                    <div className="space-y-4">
                                                                        {/* Match Score */}
                                                                        <p className="text-sm text-amber-900 font-medium">
                                                                            Match Score: <span className="text-lg text-amber-700">{job.resumeAnalysis.resumeScore}%</span>
                                                                        </p>

                                                                        {/* Strengths */}
                                                                        {job.resumeAnalysis.strengthsFound.length > 0 && (
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-green-700 mb-2">✓ What's Good:</p>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {job.resumeAnalysis.strengthsFound.slice(0, 3).map((strength, idx) => (
                                                                                        <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">
                                                                                            {strength}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Matching Keywords */}
                                                                        {job.resumeAnalysis.matchingKeywords.length > 0 && (
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-blue-700 mb-2">✓ Keywords You Have:</p>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {job.resumeAnalysis.matchingKeywords.slice(0, 4).map((kw, idx) => (
                                                                                        <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">
                                                                                            {kw}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Missing Keywords by Category */}
                                                                        {job.resumeAnalysis.missingKeywords.length > 0 && (
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-amber-700 mb-2">+ Add These Skills:</p>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {job.resumeAnalysis.missingKeywords.slice(0, 5).map((kw, idx) => (
                                                                                        <span key={idx} className="inline-block bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full">
                                                                                            {kw}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Improvement Areas */}
                                                                        {job.resumeAnalysis.improvementAreas.length > 0 && (
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-amber-800 mb-2">📝 Suggestions:</p>
                                                                                <ul className="space-y-1">
                                                                                    {job.resumeAnalysis.improvementAreas.slice(0, 3).map((area, idx) => (
                                                                                        <li key={idx} className="text-sm text-amber-900 flex items-start gap-2">
                                                                                            <span className="text-amber-600 flex-shrink-0">→</span>
                                                                                            {area}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* LinkedIn Tips */}
                                                            {job.linkedinAnalysis && (
                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                                    <h4 className="text-lg font-medium mb-3 flex items-center gap-2 text-blue-900">
                                                                        <Linkedin className="h-5 w-5 text-blue-600" />
                                                                        LinkedIn Profile Optimization
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        <p className="text-sm text-blue-900 font-medium">
                                                                            LinkedIn Score: <span className="text-lg text-blue-700">{job.linkedinAnalysis.linkedinScore}%</span>
                                                                        </p>
                                                                        <p className="text-sm text-blue-900"><strong>Suggested Headline:</strong> {job.linkedinAnalysis.headlineSuggestion}</p>
                                                                        {job.linkedinAnalysis.summaryFeedback.slice(0, 2).map((feedback, idx) => (
                                                                            <p key={idx} className="text-sm text-blue-900 flex items-start gap-2">
                                                                                <span className="text-blue-600">💡</span>
                                                                                {feedback}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex gap-3 pt-2">
                                                                <Button className="flex-1" size="lg">
                                                                    Apply Now
                                                                </Button>
                                                                <Button variant="outline" size="lg">
                                                                    Save Job
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    First
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1
                                    if (pageNum <= totalPages) {
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        )
                                    }
                                })}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                >
                                    Last
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>Find Your Dream Job - Find Jobs AI</title>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-3xl shadow-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                            <CardTitle className="text-3xl">Find Your Dream Job</CardTitle>
                        </div>
                        <CardDescription>
                            Tell us about yourself and we'll match you with the perfect opportunities
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Job Description */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                    Tell me about yourself and the job you want
                                </Label>
                                <Textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Tell us about your work experience, skills, education, and describe your ideal job including role, responsibilities, desired company culture, and any specific requirements..."
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    Include your background, key accomplishments, and what you're looking for in your next role
                                </p>
                            </div>

                            {/* Resume Upload */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-blue-600" />
                                    Upload Resume (Optional)
                                </Label>
                                <div className="relative">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="cursor-pointer"
                                    />
                                </div>
                                {resumeFile && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-600">{resumeFile.name}</span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="text-xs text-gray-500 hover:text-gray-700 ml-auto"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500">
                                    Accepted formats: PDF, DOC, DOCX, TXT (Max 10MB)
                                </p>
                            </div>

                            {/* LinkedIn Profile */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Linkedin className="h-4 w-4 text-blue-600" />
                                    LinkedIn Profile (Optional)
                                </Label>
                                <Input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://www.linkedin.com/in/yourprofile"
                                />
                                <p className="text-sm text-gray-500">
                                    Helps us better understand your professional background and provide better matches
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    size="lg"
                                    disabled={isSubmitting || !jobDescription.trim()}
                                >
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    {isSubmitting ? 'Searching...' : 'Find My Dream Job'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

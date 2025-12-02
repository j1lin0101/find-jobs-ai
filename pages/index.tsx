import { useState, useRef } from 'react'
import Head from 'next/head'

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
    const [linkedInUrl, setLinkedInUrl] = useState('')
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
                    reader.onload = (e) => resolve(e.target?.result as string || '')
                    reader.onerror = () => resolve('')
                    reader.readAsText(resumeFile)
                })
            }

            const response = await fetch('/api/search-jobs-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription, linkedInUrl, resumeText }),
            })

            if (!response.ok) throw new Error('Search failed')

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) throw new Error('No reader available')

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))

                            if (data.type === 'status') {
                                setSearchStatus({
                                    message: data.message,
                                    progress: data.progress,
                                    currentSource: data.currentSource,
                                    sourceIcon: data.sourceIcon,
                                    sourcesCompleted: data.sourcesCompleted,
                                    totalSources: data.totalSources,
                                })
                            } else if (data.type === 'jobs') {
                                setJobs(prev => [...prev, ...data.jobs])
                            } else if (data.type === 'complete') {
                                setSearchStatus({
                                    message: `Found ${data.totalResults} matching jobs!`,
                                    progress: 100,
                                    currentSource: null,
                                })
                                setJobs(data.jobs)
                            } else if (data.type === 'error') {
                                throw new Error(data.message)
                            }
                        } catch (parseError) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Search error:', error)
            setSearchStatus({
                message: 'An error occurred. Please try again.',
                progress: 0,
                currentSource: null,
            })
        } finally {
            setIsSubmitting(false)
            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 300)
        }
    }

    const handleNewSearch = () => {
        setShowResults(false)
        setJobs([])
        setSearchStatus(null)
        setJobDescription('')
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setExpandedJob(null)
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <>
            <Head>
                <title>Find Jobs AI - Your AI-Powered Job Search Assistant</title>
                <meta name="description" content="Find your dream job with AI-powered matching based on your skills and preferences" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="container mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-white mb-4">
                            Find Jobs <span className="text-purple-400">AI</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Let AI find your perfect job match. Tell us what you&apos;re looking for,
                            and we&apos;ll search the internet to find opportunities tailored just for you.
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">

                            {/* Job Description Chat Box */}
                            <div className="mb-8">
                                <label htmlFor="jobDescription" className="block text-lg font-semibold text-white mb-3">
                                    💼 Describe Your Ideal Job
                                </label>
                                <p className="text-gray-400 text-sm mb-3">
                                    Tell us about the role you&apos;re looking for, including job title, skills, experience level, and preferred location.
                                </p>
                                <textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="e.g., I'm looking for a Senior Software Engineer position in San Francisco. I have 5 years of experience with React, Node.js, and Python. I prefer remote-friendly companies in the tech industry..."
                                    className="w-full h-40 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                                    required
                                />
                            </div>

                            {/* Resume Upload */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-white mb-3">
                                    📄 Upload Your Resume
                                </label>
                                <p className="text-gray-400 text-sm mb-3">
                                    Attach your resume so we can match your skills with job requirements.
                                </p>
                                <div className="relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="resumeUpload"
                                    />
                                    {!resumeFile ? (
                                        <label
                                            htmlFor="resumeUpload"
                                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-400 group-hover:text-gray-300">
                                                    <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="flex items-center justify-between w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl">
                                            <div className="flex items-center">
                                                <svg className="h-8 w-8 text-purple-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="text-white font-medium">{resumeFile.name}</p>
                                                    <p className="text-gray-400 text-sm">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* LinkedIn Profile */}
                            <div className="mb-8">
                                <label htmlFor="linkedIn" className="block text-lg font-semibold text-white mb-3">
                                    🔗 LinkedIn Profile
                                </label>
                                <p className="text-gray-400 text-sm mb-3">
                                    Paste your LinkedIn profile URL for enhanced job matching.
                                </p>
                                <input
                                    type="url"
                                    id="linkedIn"
                                    value={linkedInUrl}
                                    onChange={(e) => setLinkedInUrl(e.target.value)}
                                    placeholder="https://www.linkedin.com/in/your-profile"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !jobDescription}
                                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Finding Your Perfect Jobs...
                                    </span>
                                ) : (
                                    '🚀 Find My Dream Jobs'
                                )}
                            </button>

                            {/* Status Bar */}
                            {searchStatus && isSubmitting && (
                                <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            {searchStatus.sourceIcon && (
                                                <span className="text-2xl mr-3">{searchStatus.sourceIcon}</span>
                                            )}
                                            <span className="text-white font-medium">{searchStatus.message}</span>
                                        </div>
                                        <span className="text-purple-400 font-bold">{searchStatus.progress}%</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${searchStatus.progress}%` }}
                                        />
                                    </div>

                                    {/* Source Progress */}
                                    {searchStatus.sourcesCompleted !== undefined && (
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-gray-400">
                                                Searching source {searchStatus.sourcesCompleted + 1} of {searchStatus.totalSources}
                                            </span>
                                            <span className="text-gray-400">
                                                {jobs.length} jobs found so far
                                            </span>
                                        </div>
                                    )}

                                    {/* Animated Dots */}
                                    <div className="flex justify-center mt-4 space-x-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Features Section */}
                        {!showResults && (
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    <div className="text-3xl mb-3">🎯</div>
                                    <h3 className="text-white font-semibold mb-2">Smart Matching</h3>
                                    <p className="text-gray-400 text-sm">AI-powered job matching based on your skills and preferences</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    <div className="text-3xl mb-3">📝</div>
                                    <h3 className="text-white font-semibold mb-2">Resume Feedback</h3>
                                    <p className="text-gray-400 text-sm">Get personalized suggestions to improve your resume for each job</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    <div className="text-3xl mb-3">🌐</div>
                                    <h3 className="text-white font-semibold mb-2">Web-Wide Search</h3>
                                    <p className="text-gray-400 text-sm">We scrape the entire internet to find opportunities just for you</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Job Results Section */}
                    {showResults && !isSubmitting && jobs.length > 0 && (
                        <div ref={resultsRef} className="max-w-5xl mx-auto mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">
                                        🎉 Found {jobs.length} Matching Jobs
                                    </h2>
                                    <p className="text-gray-400 mt-1">Sorted by match score. Click on a job to see details and feedback.</p>
                                </div>
                                <button
                                    onClick={handleNewSearch}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    New Search
                                </button>
                            </div>

                            {/* Pagination Info */}
                            <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                                <span>
                                    Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length} jobs
                                </span>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            {/* Job Cards */}
                            <div className="space-y-4">
                                {currentJobs.map((job, index) => (
                                    <div
                                        key={job.id}
                                        className={`bg-white/10 backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden ${expandedJob === job.id ? 'border-purple-500' : 'border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {/* Job Header - Always Visible */}
                                        <div
                                            className="p-6 cursor-pointer"
                                            onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                                            #{startIndex + index + 1}
                                                        </span>
                                                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full flex items-center gap-1">
                                                            {job.sourceIcon} {job.source}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${job.matchScore >= 90 ? 'bg-green-500/20 text-green-300' :
                                                            job.matchScore >= 80 ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-orange-500/20 text-orange-300'
                                                            }`}>
                                                            {job.matchScore}% Match
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
                                                    <p className="text-purple-400 font-medium">{job.company}</p>
                                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            📍 {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            💰 {job.salary}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            ⏰ {job.type}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            📅 {job.postedDate}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <svg
                                                        className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${expandedJob === job.id ? 'rotate-180' : ''
                                                            }`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedJob === job.id && (
                                            <div className="px-6 pb-6 border-t border-white/10">
                                                <div className="pt-4 grid md:grid-cols-2 gap-6">
                                                    {/* Job Description */}
                                                    <div>
                                                        <h4 className="text-white font-semibold mb-2">📋 Description</h4>
                                                        <p className="text-gray-300 text-sm">{job.description}</p>

                                                        <h4 className="text-white font-semibold mt-4 mb-2">✅ Requirements</h4>
                                                        <ul className="space-y-1">
                                                            {job.requirements.map((req, i) => (
                                                                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                                                    <span className="text-purple-400">•</span>
                                                                    {req}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Feedback Section */}
                                                    <div>
                                                        {/* Resume Analysis Section */}
                                                        {job.resumeAnalysis && (
                                                            <>
                                                                {/* Resume Score Card */}
                                                                <div className={`rounded-lg p-4 mb-4 border ${
                                                                    job.resumeAnalysis.resumeScore >= 80 ? 'bg-green-500/10 border-green-500/20' :
                                                                    job.resumeAnalysis.resumeScore >= 60 ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                                    'bg-orange-500/10 border-orange-500/20'
                                                                }`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className={`font-semibold flex items-center gap-2 ${
                                                                            job.resumeAnalysis.resumeScore >= 80 ? 'text-green-400' :
                                                                            job.resumeAnalysis.resumeScore >= 60 ? 'text-yellow-400' :
                                                                            'text-orange-400'
                                                                        }`}>
                                                                            📊 Resume Match Score
                                                                        </h4>
                                                                        <span className={`text-2xl font-bold ${
                                                                            job.resumeAnalysis.resumeScore >= 80 ? 'text-green-400' :
                                                                            job.resumeAnalysis.resumeScore >= 60 ? 'text-yellow-400' :
                                                                            'text-orange-400'
                                                                        }`}>
                                                                            {job.resumeAnalysis.resumeScore}%
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-300 text-sm mb-2">{job.resumeAnalysis.overallFeedback}</p>
                                                                </div>

                                                                {/* Matching Keywords */}
                                                                {job.resumeAnalysis.matchingKeywords.length > 0 && (
                                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-green-400 font-semibold text-sm mb-2">✅ Matching Keywords</h5>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {job.resumeAnalysis.matchingKeywords.slice(0, 6).map((kw, i) => (
                                                                                <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                                                                    {kw}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Missing Keywords */}
                                                                {job.resumeAnalysis.missingKeywords.length > 0 && (
                                                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-orange-400 font-semibold text-sm mb-2">⚠️ Add These Keywords</h5>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {job.resumeAnalysis.missingKeywords.slice(0, 5).map((kw, i) => (
                                                                                <span key={i} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                                                                                    {kw}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Strengths */}
                                                                {job.resumeAnalysis.strengthsFound.length > 0 && (
                                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-blue-400 font-semibold text-sm mb-1">💪 Resume Strengths</h5>
                                                                        <ul className="space-y-1">
                                                                            {job.resumeAnalysis.strengthsFound.map((strength, i) => (
                                                                                <li key={i} className="text-blue-300 text-xs flex items-start gap-2">
                                                                                    <span>✓</span>
                                                                                    <span>{strength}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Improvement Areas */}
                                                                {job.resumeAnalysis.improvementAreas.length > 0 && (
                                                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-purple-400 font-semibold text-sm mb-1">📝 To Improve Your Match</h5>
                                                                        <ul className="space-y-1">
                                                                            {job.resumeAnalysis.improvementAreas.map((area, i) => (
                                                                                <li key={i} className="text-purple-300 text-xs flex items-start gap-2">
                                                                                    <span>→</span>
                                                                                    <span>{area}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Metrics Suggestions */}
                                                                {job.resumeAnalysis.metricsSuggestions.length > 0 && (
                                                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-indigo-400 font-semibold text-sm mb-1">📈 Metrics to Add</h5>
                                                                        <ul className="space-y-1">
                                                                            {job.resumeAnalysis.metricsSuggestions.map((metric, i) => (
                                                                                <li key={i} className="text-indigo-300 text-xs flex items-start gap-2">
                                                                                    <span>•</span>
                                                                                    <span>{metric}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* LinkedIn Analysis Section */}
                                                        {job.linkedinAnalysis && (
                                                            <>
                                                                {/* LinkedIn Score Card */}
                                                                <div className={`rounded-lg p-4 mb-4 border ${
                                                                    job.linkedinAnalysis.linkedinScore >= 80 ? 'bg-blue-500/10 border-blue-500/20' :
                                                                    job.linkedinAnalysis.linkedinScore >= 60 ? 'bg-cyan-500/10 border-cyan-500/20' :
                                                                    'bg-slate-500/10 border-slate-500/20'
                                                                }`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className={`font-semibold flex items-center gap-2 ${
                                                                            job.linkedinAnalysis.linkedinScore >= 80 ? 'text-blue-400' :
                                                                            job.linkedinAnalysis.linkedinScore >= 60 ? 'text-cyan-400' :
                                                                            'text-slate-400'
                                                                        }`}>
                                                                            🔗 LinkedIn Profile Match
                                                                        </h4>
                                                                        <span className={`text-2xl font-bold ${
                                                                            job.linkedinAnalysis.linkedinScore >= 80 ? 'text-blue-400' :
                                                                            job.linkedinAnalysis.linkedinScore >= 60 ? 'text-cyan-400' :
                                                                            'text-slate-400'
                                                                        }`}>
                                                                            {job.linkedinAnalysis.linkedinScore}%
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-300 text-sm">{job.linkedinAnalysis.overallFeedback}</p>
                                                                </div>

                                                                {/* Headline Suggestion */}
                                                                {job.linkedinAnalysis.headlineSuggestion && (
                                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-blue-400 font-semibold text-sm mb-2">💼 Suggested Headline</h5>
                                                                        <p className="text-gray-200 text-sm italic">"{job.linkedinAnalysis.headlineSuggestion}"</p>
                                                                    </div>
                                                                )}

                                                                {/* Summary Feedback */}
                                                                {job.linkedinAnalysis.summaryFeedback.length > 0 && (
                                                                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-cyan-400 font-semibold text-sm mb-2">📝 Profile Summary Tips</h5>
                                                                        <ul className="space-y-1">
                                                                            {job.linkedinAnalysis.summaryFeedback.map((tip, i) => (
                                                                                <li key={i} className="text-cyan-300 text-xs flex items-start gap-2">
                                                                                    <span>•</span>
                                                                                    <span>{tip}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Endorsement Suggestions */}
                                                                {job.linkedinAnalysis.endorsementSuggestions.length > 0 && (
                                                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-indigo-400 font-semibold text-sm mb-2">⭐ Skills to Highlight</h5>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {job.linkedinAnalysis.endorsementSuggestions.slice(0, 8).map((skill, i) => (
                                                                                <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Skill Gaps */}
                                                                {job.linkedinAnalysis.skillGaps.length > 0 && (
                                                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-red-400 font-semibold text-sm mb-2">⚠️ Skill Gaps to Address</h5>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {job.linkedinAnalysis.skillGaps.slice(0, 6).map((skill, i) => (
                                                                                <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Improvements */}
                                                                {job.linkedinAnalysis.improvements.length > 0 && (
                                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                                                                        <h5 className="text-green-400 font-semibold text-sm mb-2">💡 LinkedIn Optimization Tips</h5>
                                                                        <ul className="space-y-1">
                                                                            {job.linkedinAnalysis.improvements.map((tip, i) => (
                                                                                <li key={i} className="text-green-300 text-xs flex items-start gap-2">
                                                                                    <span>→</span>
                                                                                    <span>{tip}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {job.resumeFeedback && (
                                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                                                                <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                                                                    📄 Resume Feedback
                                                                </h4>
                                                                <p className="text-gray-300 text-sm">{job.resumeFeedback}</p>
                                                            </div>
                                                        )}

                                                        {job.linkedInFeedback && (
                                                            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mb-4">
                                                                <h4 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                                                                    🔗 LinkedIn Feedback
                                                                </h4>
                                                                <p className="text-gray-300 text-sm">{job.linkedInFeedback}</p>
                                                            </div>
                                                        )}

                                                        <a
                                                            href={job.applicationUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
                                                        >
                                                            Apply Now →
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="mt-8 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white disabled:text-gray-500 rounded-lg transition-colors"
                                    >
                                        ← Previous
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            // Show first page, last page, current page, and pages around current
                                            const showPage =
                                                page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1

                                            if (!showPage) {
                                                // Show ellipsis for gaps
                                                if (page === 2 && currentPage > 3) {
                                                    return <span key={page} className="px-2 text-gray-500">...</span>
                                                }
                                                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                                                    return <span key={page} className="px-2 text-gray-500">...</span>
                                                }
                                                return null
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold'
                                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white disabled:text-gray-500 rounded-lg transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>

                                {/* Summary */}
                                <p className="text-gray-400 text-sm">
                                    Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length} results from 8 sources
                                </p>

                                <button
                                    onClick={handleNewSearch}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all"
                                >
                                    🔍 Start New Search
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

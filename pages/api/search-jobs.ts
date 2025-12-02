import type { NextApiRequest, NextApiResponse } from 'next'

// Job sources we'll search
const JOB_SOURCES = [
    { name: 'LinkedIn', icon: '💼', delay: 800 },
    { name: 'Indeed', icon: '🔍', delay: 600 },
    { name: 'Glassdoor', icon: '🚪', delay: 700 },
    { name: 'Google Jobs', icon: '🔎', delay: 500 },
    { name: 'Fortune 500 Companies', icon: '🏢', delay: 900 },
    { name: 'Tech Startups', icon: '🚀', delay: 600 },
    { name: 'Remote Job Boards', icon: '🌍', delay: 500 },
    { name: 'Staffing Agencies', icon: '👥', delay: 700 },
]

export interface Job {
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
}

// Sample company data for generating realistic jobs
const COMPANIES = {
    tech: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Stripe', 'Shopify', 'Salesforce', 'Adobe', 'Oracle', 'IBM'],
    startups: ['Notion', 'Figma', 'Canva', 'Vercel', 'Supabase', 'Linear', 'Retool', 'Loom', 'Miro', 'Airtable', 'Webflow', 'PostHog', 'Datadog', 'GitLab', 'HashiCorp'],
    finance: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Citadel', 'Two Sigma', 'BlackRock', 'Fidelity', 'Charles Schwab', 'Capital One', 'American Express'],
    healthcare: ['UnitedHealth', 'CVS Health', 'Anthem', 'Cigna', 'HCA Healthcare', 'Pfizer', 'Johnson & Johnson', 'Abbott', 'Merck', 'Bristol-Myers'],
    consulting: ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'PwC', 'EY', 'KPMG', 'Accenture', 'Capgemini', 'Cognizant'],
    agencies: ['Robert Half', 'Randstad', 'ManpowerGroup', 'Kelly Services', 'Adecco', 'TEKsystems', 'Insight Global', 'Apex Group', 'Kforce', 'Hays'],
}

const LOCATIONS = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
    'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA', 'Miami, FL',
    'Remote', 'Hybrid - San Francisco', 'Hybrid - New York', 'Remote (US)', 'Remote (Worldwide)'
]

const JOB_TYPES = ['Full-time', 'Contract', 'Part-time', 'Freelance', 'Internship']

const SALARY_RANGES = [
    '$80,000 - $120,000', '$100,000 - $150,000', '$120,000 - $180,000',
    '$150,000 - $220,000', '$180,000 - $280,000', '$200,000 - $350,000',
    '$250,000 - $400,000', 'Competitive', 'DOE'
]

function extractKeywords(description: string): string[] {
    const commonKeywords = [
        'software', 'engineer', 'developer', 'manager', 'designer', 'analyst',
        'data', 'product', 'marketing', 'sales', 'frontend', 'backend', 'fullstack',
        'react', 'python', 'javascript', 'typescript', 'java', 'go', 'rust',
        'machine learning', 'ai', 'ml', 'devops', 'cloud', 'aws', 'azure', 'gcp',
        'senior', 'junior', 'lead', 'principal', 'staff', 'remote', 'hybrid'
    ]

    const lowerDesc = description.toLowerCase()
    return commonKeywords.filter(kw => lowerDesc.includes(kw))
}

function generateJobTitle(keywords: string[]): string {
    const levels = ['Junior', 'Mid-Level', 'Senior', 'Staff', 'Principal', 'Lead', 'Head of']
    const roles = [
        'Software Engineer', 'Full Stack Developer', 'Frontend Engineer', 'Backend Engineer',
        'Data Scientist', 'Data Engineer', 'ML Engineer', 'DevOps Engineer', 'Site Reliability Engineer',
        'Product Manager', 'Engineering Manager', 'Technical Program Manager', 'Solutions Architect',
        'UI/UX Designer', 'Product Designer', 'Data Analyst', 'Business Analyst', 'Cloud Architect'
    ]

    // Try to match keywords to roles
    let selectedRole = roles[Math.floor(Math.random() * roles.length)]
    let selectedLevel = levels[Math.floor(Math.random() * levels.length)]

    if (keywords.includes('senior')) selectedLevel = 'Senior'
    if (keywords.includes('junior')) selectedLevel = 'Junior'
    if (keywords.includes('lead')) selectedLevel = 'Lead'
    if (keywords.includes('frontend')) selectedRole = 'Frontend Engineer'
    if (keywords.includes('backend')) selectedRole = 'Backend Engineer'
    if (keywords.includes('fullstack')) selectedRole = 'Full Stack Developer'
    if (keywords.includes('data')) selectedRole = Math.random() > 0.5 ? 'Data Scientist' : 'Data Engineer'
    if (keywords.includes('ml') || keywords.includes('machine learning')) selectedRole = 'ML Engineer'
    if (keywords.includes('devops')) selectedRole = 'DevOps Engineer'
    if (keywords.includes('product') && keywords.includes('manager')) selectedRole = 'Product Manager'
    if (keywords.includes('designer')) selectedRole = 'Product Designer'

    return `${selectedLevel} ${selectedRole}`
}

function generateRequirements(keywords: string[]): string[] {
    const baseRequirements = [
        'Bachelor\'s degree in Computer Science or related field',
        'Strong problem-solving and analytical skills',
        'Excellent communication and collaboration abilities',
        'Experience working in agile development environments',
    ]

    const techRequirements: string[] = []

    if (keywords.includes('react') || keywords.includes('frontend')) {
        techRequirements.push('3+ years of experience with React and modern JavaScript')
        techRequirements.push('Proficiency in TypeScript and CSS-in-JS solutions')
    }
    if (keywords.includes('python') || keywords.includes('backend')) {
        techRequirements.push('Strong Python skills with experience in Django or FastAPI')
        techRequirements.push('Database design experience with PostgreSQL or MongoDB')
    }
    if (keywords.includes('aws') || keywords.includes('cloud')) {
        techRequirements.push('AWS certification or equivalent cloud platform experience')
        techRequirements.push('Experience with infrastructure as code (Terraform, CloudFormation)')
    }
    if (keywords.includes('ml') || keywords.includes('data')) {
        techRequirements.push('Experience with ML frameworks (PyTorch, TensorFlow, scikit-learn)')
        techRequirements.push('Strong statistical analysis and data visualization skills')
    }

    return [...baseRequirements, ...techRequirements].slice(0, 6)
}

function generateResumeFeedback(job: Partial<Job>, keywords: string[]): string {
    const feedbacks = [
        `Consider highlighting your experience with ${keywords[0] || 'relevant technologies'} more prominently in your summary.`,
        `Add quantifiable achievements related to ${job.title?.split(' ').pop() || 'this role'} responsibilities.`,
        `Include specific projects that demonstrate your ${keywords.slice(0, 2).join(' and ') || 'technical'} expertise.`,
        `Tailor your skills section to emphasize the technologies mentioned in this job posting.`,
        `Consider adding a brief section about your experience with ${job.company}'s industry or similar companies.`,
    ]
    return feedbacks[Math.floor(Math.random() * feedbacks.length)]
}

function generateLinkedInFeedback(): string {
    const feedbacks = [
        'Update your headline to include key skills mentioned in this role.',
        'Add more detail to your current role description to match job requirements.',
        'Consider getting endorsements for skills relevant to this position.',
        'Your LinkedIn summary could better highlight your career trajectory for this role.',
        'Add relevant certifications or courses to strengthen your profile for this position.',
    ]
    return feedbacks[Math.floor(Math.random() * feedbacks.length)]
}

function generateJobs(description: string, count: number): Job[] {
    const keywords = extractKeywords(description)
    const jobs: Job[] = []

    const allCompanies = [
        ...COMPANIES.tech,
        ...COMPANIES.startups,
        ...COMPANIES.finance,
        ...COMPANIES.healthcare,
        ...COMPANIES.consulting,
        ...COMPANIES.agencies,
    ]

    // Check if user mentioned a location preference
    const locationLower = description.toLowerCase()
    let preferredLocations = [...LOCATIONS]
    if (locationLower.includes('remote')) {
        preferredLocations = LOCATIONS.filter(l => l.toLowerCase().includes('remote'))
        preferredLocations.push(...LOCATIONS.slice(0, 5)) // Add some on-site options too
    }
    if (locationLower.includes('san francisco') || locationLower.includes('sf')) {
        preferredLocations = LOCATIONS.filter(l => l.includes('San Francisco') || l.includes('Remote'))
    }
    if (locationLower.includes('new york') || locationLower.includes('nyc')) {
        preferredLocations = LOCATIONS.filter(l => l.includes('New York') || l.includes('Remote'))
    }

    for (let i = 0; i < count; i++) {
        const source = JOB_SOURCES[i % JOB_SOURCES.length]
        const company = allCompanies[Math.floor(Math.random() * allCompanies.length)]
        const title = generateJobTitle(keywords)
        const location = preferredLocations[Math.floor(Math.random() * preferredLocations.length)]
        const salary = SALARY_RANGES[Math.floor(Math.random() * SALARY_RANGES.length)]
        const type = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)]
        const matchScore = Math.floor(Math.random() * 30) + 70 // 70-100% match

        const job: Job = {
            id: `job-${i + 1}-${Date.now()}`,
            title,
            company,
            location,
            salary,
            type,
            source: source.name,
            sourceIcon: source.icon,
            description: `We are looking for a talented ${title} to join our team at ${company}. You will work on cutting-edge projects and collaborate with world-class engineers to build products that impact millions of users.`,
            requirements: generateRequirements(keywords),
            postedDate: `${Math.floor(Math.random() * 14) + 1} days ago`,
            applicationUrl: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i + 1}`,
            matchScore,
            resumeFeedback: generateResumeFeedback({ title, company }, keywords),
            linkedInFeedback: generateLinkedInFeedback(),
        }

        jobs.push(job)
    }

    // Sort by match score
    return jobs.sort((a, b) => b.matchScore - a.matchScore)
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { jobDescription } = req.body

    if (!jobDescription || jobDescription.trim().length === 0) {
        return res.status(400).json({ error: 'Job description is required' })
    }

    try {
        // Generate 50 job results
        const jobs = generateJobs(jobDescription, 50)

        // Simulate processing delay for realism
        await new Promise(resolve => setTimeout(resolve, 500))

        return res.status(200).json({
            success: true,
            totalResults: jobs.length,
            sources: JOB_SOURCES.map(s => s.name),
            jobs,
        })
    } catch (error) {
        console.error('Job search error:', error)
        return res.status(500).json({ error: 'Failed to search for jobs' })
    }
}

// Resume parsing and analysis utilities

export interface ParsedResume {
    rawText: string
    skills: string[]
    experience: string[]
    education: string[]
    certifications: string[]
    keywords: string[]
    metrics: string[]
}

export interface ResumeAnalysis {
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

export interface LinkedInAnalysis {
    linkedinScore: number
    headlineSuggestion: string
    summaryFeedback: string[]
    endorsementSuggestions: string[]
    skillGaps: string[]
    improvements: string[]
    overallFeedback: string
}

// Common tech skills and keywords for job matching
const TECH_SKILLS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'devops',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision',
    'git', 'agile', 'scrum', 'jira', 'confluence', 'figma', 'sketch',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite',
    'testing', 'jest', 'cypress', 'selenium', 'unit testing', 'integration testing',
    'microservices', 'api design', 'system design', 'distributed systems', 'scalability',
    'data analysis', 'data visualization', 'tableau', 'power bi', 'excel', 'pandas', 'numpy',
    'leadership', 'management', 'communication', 'problem-solving', 'teamwork', 'collaboration'
]

// Action verbs that indicate strong resume writing
const ACTION_VERBS = [
    'achieved', 'built', 'created', 'delivered', 'developed', 'designed', 'established',
    'generated', 'implemented', 'improved', 'increased', 'launched', 'led', 'managed',
    'optimized', 'reduced', 'resolved', 'scaled', 'spearheaded', 'streamlined', 'transformed'
]

// Metrics patterns
const METRICS_PATTERNS = [
    /\d+%/g,  // percentages
    /\$[\d,]+/g,  // dollar amounts
    /\d+x/g,  // multipliers
    /\d+\+?\s*(users|customers|clients|employees|team members)/gi,  // user counts
    /\d+\+?\s*(years|months)/gi,  // time periods
    /\d+\+?\s*(projects|applications|systems|features)/gi,  // project counts
]

export function parseResumeText(text: string): ParsedResume {
    const lowerText = text.toLowerCase()

    // Extract skills found in resume
    const skills = TECH_SKILLS.filter(skill =>
        lowerText.includes(skill.toLowerCase())
    )

    // Extract keywords (including action verbs)
    const keywords = [
        ...skills,
        ...ACTION_VERBS.filter(verb => lowerText.includes(verb.toLowerCase()))
    ]

    // Extract metrics
    const metrics: string[] = []
    METRICS_PATTERNS.forEach(pattern => {
        const matches = text.match(pattern)
        if (matches) {
            metrics.push(...matches)
        }
    })

    // Extract experience sections (simplified)
    const experienceIndicators = ['experience', 'work history', 'employment', 'professional background']
    const experience: string[] = []
    experienceIndicators.forEach(indicator => {
        if (lowerText.includes(indicator)) {
            experience.push(indicator)
        }
    })

    // Extract education
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'certification', 'certified']
    const education = educationKeywords.filter(edu => lowerText.includes(edu))

    // Extract certifications
    const certKeywords = ['aws certified', 'google certified', 'microsoft certified', 'pmp', 'scrum master', 'cissp', 'cka', 'ckad']
    const certifications = certKeywords.filter(cert => lowerText.includes(cert))

    return {
        rawText: text,
        skills,
        experience,
        education,
        certifications,
        keywords,
        metrics
    }
}

export function analyzeResumeForJob(
    resume: ParsedResume,
    jobTitle: string,
    jobDescription: string,
    jobRequirements: string[]
): ResumeAnalysis {
    const jobText = `${jobTitle} ${jobDescription} ${jobRequirements.join(' ')}`.toLowerCase()
    const resumeText = resume.rawText.toLowerCase()

    // Extract job keywords
    const jobSkills = TECH_SKILLS.filter(skill => jobText.includes(skill.toLowerCase()))

    // Find matching and missing keywords
    const matchingSkills = resume.skills.filter(skill =>
        jobSkills.some(js => js.toLowerCase() === skill.toLowerCase())
    )
    const missingSkills = jobSkills.filter(skill =>
        !resume.skills.some(rs => rs.toLowerCase() === skill.toLowerCase())
    )

    // Extract specific keywords from job requirements
    const jobKeywords = extractKeywordsFromText(jobText)
    const resumeKeywords = extractKeywordsFromText(resumeText)

    const matchingKeywords = resumeKeywords.filter(kw =>
        jobKeywords.some(jk => jk.toLowerCase() === kw.toLowerCase())
    )
    const missingKeywords = jobKeywords.filter(kw =>
        !resumeKeywords.some(rk => rk.toLowerCase() === kw.toLowerCase())
    ).slice(0, 8) // Limit to top 8 missing

    // Calculate scores
    const skillMatchRatio = jobSkills.length > 0
        ? matchingSkills.length / jobSkills.length
        : 0.5
    const keywordMatchRatio = jobKeywords.length > 0
        ? matchingKeywords.length / jobKeywords.length
        : 0.5
    const hasMetrics = resume.metrics.length > 0
    const hasActionVerbs = ACTION_VERBS.some(verb => resumeText.includes(verb))

    // Calculate resume score (0-100)
    let resumeScore = Math.round(
        (skillMatchRatio * 40) +  // 40% weight on skills
        (keywordMatchRatio * 30) +  // 30% weight on keywords
        (hasMetrics ? 15 : 0) +  // 15% for having metrics
        (hasActionVerbs ? 10 : 0) +  // 10% for action verbs
        (resume.certifications.length > 0 ? 5 : 0)  // 5% for certifications
    )

    // Ensure score is between 0-100
    resumeScore = Math.max(0, Math.min(100, resumeScore))

    // Generate strengths
    const strengthsFound: string[] = []
    if (matchingSkills.length >= 3) {
        strengthsFound.push(`Strong technical skill alignment (${matchingSkills.length} matching skills)`)
    }
    if (resume.metrics.length >= 2) {
        strengthsFound.push('Good use of quantifiable metrics and achievements')
    }
    if (hasActionVerbs) {
        strengthsFound.push('Effective use of action verbs to describe accomplishments')
    }
    if (resume.certifications.length > 0) {
        strengthsFound.push(`Relevant certifications found (${resume.certifications.join(', ')})`)
    }
    if (matchingKeywords.length >= 5) {
        strengthsFound.push('Strong keyword alignment with job description')
    }

    // Generate improvement areas
    const improvementAreas: string[] = []
    if (missingSkills.length > 0) {
        improvementAreas.push(`Add these in-demand skills if you have them: ${missingSkills.slice(0, 4).join(', ')}`)
    }
    if (resume.metrics.length < 2) {
        improvementAreas.push('Include more quantifiable achievements (percentages, dollar amounts, user counts)')
    }
    if (!hasActionVerbs) {
        improvementAreas.push('Start bullet points with strong action verbs (Led, Developed, Achieved, etc.)')
    }
    if (missingKeywords.length > 3) {
        improvementAreas.push(`Consider incorporating these keywords: ${missingKeywords.slice(0, 4).join(', ')}`)
    }

    // Generate metrics suggestions
    const metricsSuggestions: string[] = []
    if (jobText.includes('team') || jobText.includes('lead')) {
        metricsSuggestions.push('Add team size you\'ve managed or collaborated with (e.g., "Led a team of 8 engineers")')
    }
    if (jobText.includes('performance') || jobText.includes('optimization')) {
        metricsSuggestions.push('Include performance improvements (e.g., "Improved load time by 40%")')
    }
    if (jobText.includes('revenue') || jobText.includes('cost')) {
        metricsSuggestions.push('Add business impact metrics (e.g., "Reduced costs by $50K annually")')
    }
    if (jobText.includes('user') || jobText.includes('customer')) {
        metricsSuggestions.push('Include user/customer impact (e.g., "Served 100K+ daily active users")')
    }
    if (jobText.includes('project') || jobText.includes('delivery')) {
        metricsSuggestions.push('Mention project delivery metrics (e.g., "Delivered 15 features ahead of schedule")')
    }

    // Generate overall feedback
    let overallFeedback = ''
    if (resumeScore >= 80) {
        overallFeedback = 'Excellent match! Your resume aligns very well with this position. Focus on tailoring your cover letter to stand out.'
    } else if (resumeScore >= 60) {
        overallFeedback = 'Good match with room for improvement. Consider highlighting the matching skills more prominently and addressing the missing keywords.'
    } else if (resumeScore >= 40) {
        overallFeedback = 'Moderate match. You may need to emphasize transferable skills and add more relevant keywords to strengthen your application.'
    } else {
        overallFeedback = 'This role may require significant resume tailoring. Focus on highlighting any relevant experience and consider gaining the missing skills.'
    }

    return {
        resumeScore,
        matchingKeywords: [...new Set(matchingKeywords)].slice(0, 10),
        missingKeywords: [...new Set(missingKeywords)].slice(0, 8),
        matchingSkills: [...new Set(matchingSkills)],
        missingSkills: [...new Set(missingSkills)].slice(0, 6),
        strengthsFound: strengthsFound.slice(0, 4),
        improvementAreas: improvementAreas.slice(0, 4),
        metricsSuggestions: metricsSuggestions.slice(0, 3),
        keywordDensity: Math.round(keywordMatchRatio * 100),
        overallFeedback
    }
}

function extractKeywordsFromText(text: string): string[] {
    const keywords: string[] = []

    // Add tech skills
    TECH_SKILLS.forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
            keywords.push(skill)
        }
    })

    // Add common job-related terms
    const jobTerms = [
        'remote', 'hybrid', 'onsite', 'full-time', 'contract',
        'senior', 'junior', 'lead', 'principal', 'staff', 'manager',
        'startup', 'enterprise', 'b2b', 'b2c', 'saas',
        'cross-functional', 'stakeholder', 'roadmap', 'strategy',
        'analytics', 'metrics', 'kpi', 'okr', 'roi'
    ]

    jobTerms.forEach(term => {
        if (text.includes(term.toLowerCase())) {
            keywords.push(term)
        }
    })

    return [...new Set(keywords)]
}

// Simulate extracting text from a file (in production, use a proper PDF/DOC parser)
export function extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            // For now, just return the raw text (works for .txt files)
            // In production, you'd use libraries like pdf-parse or mammoth for PDF/DOC
            resolve(text || '')
        }
        reader.onerror = () => resolve('')
        reader.readAsText(file)
    })
}

export function analyzeLinkedInProfile(
    linkedinUrl: string,
    jobTitle: string,
    jobDescription: string,
    jobRequirements: string[],
    resumeAnalysis?: ResumeAnalysis
): LinkedInAnalysis {
    // Extract profile info from URL if possible
    const hasProfile = linkedinUrl && linkedinUrl.trim().length > 0
    const urlLower = linkedinUrl.toLowerCase()
    
    const jobText = `${jobTitle} ${jobDescription} ${jobRequirements.join(' ')}`.toLowerCase()
    
    // Extract job keywords
    const jobSkills = TECH_SKILLS.filter(skill => jobText.includes(skill.toLowerCase()))
    
    // Calculate LinkedIn score based on profile presence and resume alignment
    let linkedinScore = 50 // Base score if profile provided
    
    if (hasProfile) {
        // Check for profile completeness indicators
        const urlIndicators = [
            urlLower.includes('/in/'),  // Standard LinkedIn URL
            urlLower.length > 30,  // Likely to be complete URL
        ]
        const completenessScore = urlIndicators.filter(Boolean).length * 25
        linkedinScore = Math.min(100, 50 + completenessScore)
        
        if (resumeAnalysis) {
            // Boost score if resume is strong
            linkedinScore = Math.round((linkedinScore + resumeAnalysis.resumeScore) / 2)
        }
    }
    
    // Generate headline suggestion
    let headlineSuggestion = ''
    const jobRole = jobTitle.split(' ').slice(-2).join(' ')
    if (resumeAnalysis && resumeAnalysis.matchingSkills.length > 0) {
        const topSkills = resumeAnalysis.matchingSkills.slice(0, 2).join(' & ')
        headlineSuggestion = `${jobRole} | ${topSkills} | Open to Opportunities`
    } else {
        headlineSuggestion = `${jobRole} | Experienced Professional | Always Learning`
    }
    
    // Generate summary feedback
    const summaryFeedback: string[] = []
    if (!hasProfile) {
        summaryFeedback.push('Create or complete your LinkedIn profile with a professional photo and comprehensive headline')
        summaryFeedback.push('Add a compelling summary highlighting your career goals and key achievements')
    } else {
        summaryFeedback.push('Update your headline to match this role: ' + headlineSuggestion)
        summaryFeedback.push('Include specific accomplishments and metrics in your summary section')
        summaryFeedback.push('Mention industry experience and key projects you\'ve worked on')
    }
    
    // Endorsement suggestions - skills to highlight
    const endorsementSuggestions = resumeAnalysis 
        ? resumeAnalysis.matchingSkills.slice(0, 5)
        : jobSkills.slice(0, 5)
    
    // Skill gaps
    const skillGaps = resumeAnalysis
        ? resumeAnalysis.missingSkills.slice(0, 4)
        : jobSkills.slice(0, 4)
    
    // General improvements
    const improvements: string[] = [
        'Add detailed job descriptions with quantifiable results',
        'Get endorsements for skills matching this job role',
        'Ask colleagues for recommendations highlighting your strengths',
        'Include any relevant certifications and courses',
        'Show volunteer work or open source contributions if applicable'
    ]
    
    // Overall feedback
    let overallFeedback = ''
    if (!hasProfile) {
        overallFeedback = 'LinkedIn profile is missing or incomplete. A complete profile significantly improves your visibility to recruiters.'
    } else if (linkedinScore >= 80) {
        overallFeedback = 'Excellent LinkedIn profile! Keep it updated and consistent with your resume.'
    } else if (linkedinScore >= 60) {
        overallFeedback = 'Good LinkedIn foundation. Add more specific accomplishments and get skill endorsements.'
    } else {
        overallFeedback = 'Your LinkedIn profile needs attention. Update it with recent experience and stronger positioning.'
    }
    
    return {
        linkedinScore: linkedinScore,
        headlineSuggestion,
        summaryFeedback: summaryFeedback.slice(0, 3),
        endorsementSuggestions: [...new Set(endorsementSuggestions)],
        skillGaps: [...new Set(skillGaps)],
        improvements: improvements,
        overallFeedback
    }
}

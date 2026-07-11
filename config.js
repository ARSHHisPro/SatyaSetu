// Satyasetu - App Configurations (Global Namespace)

window.CONFIG = {
    APP_ID: "satyasetu-prod",
    LOCAL_STORAGE_KEY: "satyasetu_complaints_v3",
    DRAFT_STORAGE_KEY: "satyasetu_complaint_draft",
    THEME_STORAGE_KEY: "satyasetu_theme",
    LANG_STORAGE_KEY: "satyasetu_lang",
    MAX_IMAGE_SIZE_MB: 4,
    MAX_VIDEO_SIZE_MB: 15,
    SUBMISSION_RATE_LIMIT_MS: 30000,

    CLOUD_CONFIG: {
        apiKey: "AIzaSyBGVlsu_dm8Pdr2GiBroBUIWLB3NTggR0Q",
        authDomain: "satyasetu-9be45.firebaseapp.com",
        projectId: "satyasetu-9be45",
        storageBucket: "satyasetu-9be45.firebasestorage.app",
        messagingSenderId: "362533453912",
        appId: "1:362533453912:web:641eddc13047c187c94a2d",
        measurementId: "G-3PBSTCH5LN"
    },

    CATEGORIES: [
        { id: "bribery", name: "Bribery & Graft", description: "Demands for illicit payments, bribes, or kickbacks by public officials." },
        { id: "judicial", name: "Judicial Abuse of Power", description: "Arbitrary arrests, illegal detentions, unfair trials, or judicial corruption." },
        { id: "embezzlement", name: "Embezzlement & Misappropriation", description: "Theft, misuse, or diversion of public funds, materials, or assets." },
        { id: "negligence", name: "Administrative Negligence", description: "Severe delays, lack of accountability, and refusal of service by departments." },
        { id: "human_rights", name: "Human Rights Violations", description: "Discrimination, censorship, or violent coercion by institutions." },
        { id: "general", name: "General Public Concern", description: "Other community integrity issues that compromise civic transparency." }
    ],

    DEPARTMENTS: [
        { id: "police", name: "Police & Law Enforcement" },
        { id: "judiciary", name: "Judiciary & Courts" },
        { id: "municipal", name: "Municipal & Public Works" },
        { id: "finance", name: "Finance & Revenue" },
        { id: "education", name: "Education & Health Services" },
        { id: "agriculture", name: "Agriculture & Water Resources" },
        { id: "general", name: "General Administration" }
    ],

    SEVERITY_LEVELS: ["Low", "Medium", "High", "Critical"],
    PRIORITY_LEVELS: ["Low", "Medium", "High", "Immediate"],
    STATUS_LEVELS: ["Pending", "Under Review", "Resolved", "Flagged"],

    MOCK_COMPLAINTS: [
        {
            id: "SS-20260515-3948",
            event_date: "2026-05-15",
            title: "Irrigation channel concrete lining left incomplete",
            details: "The concrete lining of the water delivery channel for sector 4 crops was halted without explanation. Silt is accumulating and obstructing water flow to over 100 small agricultural plots.",
            classification: "Administrative Negligence",
            severity: "Medium",
            priority: "Medium",
            urgency: "Medium",
            status: "Pending",
            department: "Agriculture & Water Resources",
            city: "Bhatinda",
            state: "Punjab",
            area: "Sector 4 Canal",
            tags: ["water", "agriculture", "negligence", "canal"],
            image_data: null,
            video_data: null,
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            ai_analysis: {
                confidenceScore: 0.92,
                spamScore: 0.05,
                qualityScore: 0.88,
                trustScore: 0.95,
                isFake: false,
                isAbusive: false,
                flaggedForManualReview: false,
                reasons: []
            }
        },
        {
            id: "SS-20260402-9921",
            event_date: "2026-04-02",
            title: "Local footbridge repairs abandoned near central market",
            details: "A private contractor was reportedly paid in full from municipal funds for resurfacing the footbridge near the central market. However, the wood planks remain broken, making walking hazardous. Fund allocations cannot be accounted for.",
            classification: "Embezzlement & Misappropriation",
            severity: "High",
            priority: "High",
            urgency: "High",
            status: "Under Review",
            department: "Municipal & Public Works",
            city: "Jaipur",
            state: "Rajasthan",
            area: "Central Market",
            tags: ["bridge", "infrastructure", "funds", "misappropriation"],
            image_data: null,
            video_data: null,
            created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
            ai_analysis: {
                confidenceScore: 0.95,
                spamScore: 0.02,
                qualityScore: 0.94,
                trustScore: 0.97,
                isFake: false,
                isAbusive: false,
                flaggedForManualReview: false,
                reasons: []
            }
        },
        {
            id: "SS-20260320-1120",
            event_date: "2026-03-20",
            title: "Arbitrary detention and harassment of street vendors",
            details: "Vendors at the east gate were detained and had their stock confiscated without formal citation or receipts. A bribe of 2,000 INR was demanded to release the items.",
            classification: "Judicial Abuse of Power",
            severity: "Critical",
            priority: "Immediate",
            urgency: "High",
            status: "Pending",
            department: "Police & Law Enforcement",
            city: "Noida",
            state: "Uttar Pradesh",
            area: "East Gate Market",
            tags: ["police", "vendors", "extortion", "abuse-of-power"],
            image_data: null,
            video_data: null,
            created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
            ai_analysis: {
                confidenceScore: 0.97,
                spamScore: 0.08,
                qualityScore: 0.91,
                trustScore: 0.92,
                isFake: false,
                isAbusive: false,
                flaggedForManualReview: false,
                reasons: []
            }
        }
    ]
};

// Satyasetu - On-Device NLP & AI Analysis Engine (Global Namespace)

window.AI = {
    STOP_WORDS: new Set([
        'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
        'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot',
        'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each',
        'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed',
        'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i',
        'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more',
        'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
        'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'shent', 'she', 'shed',
        'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their',
        'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre',
        'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we',
        'wed', 'well', 'were', 'werent', 'weve', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which',
        'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll',
        'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves', 'please', 'their', 'there', 'thank', 'thanks'
    ]),

    ABUSIVE_KEYWORDS: [
        'bastard', 'bitch', 'idiot', 'moron', 'asshole', 'fuck', 'shit', 'scoundrel', 'cheat', 'liar',
        'fraudster', 'corrupt', 'crook', 'dog', 'bloody', 'stupid', 'nonsense', 'useless', 'fool'
    ],

    DEPARTMENT_MAPPING: [
        { dept: "Police & Law Enforcement", keywords: ['police', 'cop', 'constable', 'station', 'officer', 'arrest', 'lockup', 'jail', 'harass', 'violence', 'fir', 'patrol'] },
        { dept: "Judiciary & Courts", keywords: ['judge', 'court', 'magistrate', 'lawyer', 'hearing', 'trial', 'bail', 'decree', 'verdict', 'judicial'] },
        { dept: "Municipal & Public Works", keywords: ['road', 'bridge', 'pothole', 'street', 'light', 'garbage', 'drain', 'sewer', 'encroachment', 'water supply', 'construction', 'contractor'] },
        { dept: "Finance & Revenue", keywords: ['tax', 'bank', 'funds', 'revenue', 'bribe', 'graft', 'payment', 'audit', 'treasury', 'embezzle', 'misappropriation'] },
        { dept: "Education & Health Services", keywords: ['school', 'college', 'teacher', 'hospital', 'doctor', 'clinic', 'nurse', 'medicine', 'vaccine', 'fee', 'midday meal'] },
        { dept: "Agriculture & Water Resources", keywords: ['canal', 'farm', 'crop', 'irrigation', 'fertilizer', 'seed', 'land', 'pesticide', 'farmer', 'tubewell'] },
        { dept: "General Administration", keywords: ['office', 'clerk', 'collector', 'delay', 'certificate', 'license', 'permit', 'file', 'application', 'signature'] }
    ],

    CATEGORY_MAPPING: [
        { cat: "Bribery & Graft", keywords: ['bribe', 'demanded money', 'commission', 'under table', 'cash payment', 'kickback', 'extortion', 'grease palm', 'paid him'] },
        { cat: "Judicial Abuse of Power", keywords: ['wrongful arrest', 'no fir', 'beating', 'detained', 'illegal detention', 'custody', 'handcuffed', 'court delay', 'threatened'] },
        { cat: "Embezzlement & Misappropriation", keywords: ['embezzled', 'siphoned', 'stolen funds', 'diverted', 'fake bill', 'contractor scam', 'tenders', 'inflated cost'] },
        { cat: "Administrative Negligence", keywords: ['unfinished', 'halted', 'abandoned', 'no action', 'stuck file', 'unresponsive', 'absent staff', 'closed door', 'leakage', 'potholes'] },
        { cat: "Human Rights Violations", keywords: ['censored', 'discrimination', 'caste', 'gender', 'religion', 'beaten', 'coercion', 'freedom', 'assaulted'] }
    ],

    calculateSimilarity(str1, str2) {
        const getTokens = (str) => {
            return new Set(
                str.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .split(/\s+/)
                    .filter(t => t.length > 2 && !this.STOP_WORDS.has(t))
            );
        };

        const tokens1 = getTokens(str1);
        const tokens2 = getTokens(str2);

        if (tokens1.size === 0 || tokens2.size === 0) return 0;

        const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
        const union = new Set([...tokens1, ...tokens2]);

        return intersection.size / union.size;
    },

    checkDuplicate(title, details, existingComplaints) {
        const currentText = `${title} ${details}`;
        let highestSim = 0;
        let duplicateDoc = null;

        for (const complaint of existingComplaints) {
            const compareText = `${complaint.title} ${complaint.details}`;
            const sim = this.calculateSimilarity(currentText, compareText);
            if (sim > highestSim) {
                highestSim = sim;
                duplicateDoc = complaint;
            }
        }

        return {
            isDuplicate: highestSim > 0.70,
            score: highestSim,
            duplicateId: duplicateDoc ? duplicateDoc.id : null
        };
    },

    analyzeTextQuality(title, details) {
        const text = `${title} ${details}`.toLowerCase();
        const words = text.split(/\s+/).filter(w => w.length > 0);
        
        let spamScore = 0;
        let confidenceScore = 1.0;
        const reasons = [];
        let isAbusive = false;
        let isFake = false;

        if (words.length === 0) {
            return { spamScore: 1, confidenceScore: 0, isFake: true, reasons: ["Empty report body"] };
        }

        const vowelCount = (text.match(/[aeiou]/gi) || []).length;
        const charCount = text.replace(/[^a-z]/gi, '').length;
        const vowelDensity = charCount > 0 ? vowelCount / charCount : 0;
        if (charCount > 20 && vowelDensity < 0.14) {
            spamScore += 0.35;
            reasons.push("Gibberish text profile (unusually low vowel density)");
        }

        const repeats = text.match(/(.)\1{4,}/g);
        if (repeats) {
            spamScore += 0.25;
            reasons.push("Repetitive characters patterns detected");
        }

        const longWords = words.filter(w => w.length > 22);
        if (longWords.length > 0) {
            spamScore += 0.3;
            reasons.push("Contains unnaturally long words");
        }

        const foundAbuse = this.ABUSIVE_KEYWORDS.filter(k => text.includes(k));
        if (foundAbuse.length > 0) {
            isAbusive = true;
            spamScore += 0.4;
            reasons.push(`Contains inappropriate language (${foundAbuse.join(', ')})`);
        }

        if (details.length < 50) {
            spamScore += 0.15;
            reasons.push("Insufficient detail length for accurate validation");
        }

        spamScore = Math.min(1.0, spamScore);

        return {
            spamScore: parseFloat(spamScore.toFixed(2)),
            isAbusive,
            isFake: spamScore > 0.5,
            reasons
        };
    },

    predictMetadata(title, details) {
        const fullContent = `${title} ${details}`.toLowerCase();
        
        let suggestedDept = "General Administration";
        let maxDeptHits = 0;
        for (const dMap of this.DEPARTMENT_MAPPING) {
            const hits = dMap.keywords.filter(k => fullContent.includes(k)).length;
            if (hits > maxDeptHits) {
                maxDeptHits = hits;
                suggestedDept = dMap.dept;
            }
        }

        let suggestedCat = "General Public Concern";
        let maxCatHits = 0;
        for (const cMap of this.CATEGORY_MAPPING) {
            const hits = cMap.keywords.filter(k => fullContent.includes(k)).length;
            if (hits > maxCatHits) {
                maxCatHits = hits;
                suggestedCat = cMap.cat;
            }
        }

        let severity = "Low";
        let urgency = "Low";
        
        const criticalKeywords = ['arrest', 'detained', 'illegal detention', 'assaulted', 'tortured', 'jail', 'cops beaten', 'beating', 'violence', 'lockup', 'handcuffed'];
        const highKeywords = ['bribe', 'money demanded', 'extortion', 'funds stolen', 'embezzlement', 'corruption', 'bridge collapsed', 'hazard', 'safety risk', 'accident'];
        const mediumKeywords = ['delay', 'incomplete', 'halted', 'abandoned', 'road repairs', 'leakage', 'absent staff', 'closed gates', 'water logging'];

        const critHits = criticalKeywords.filter(k => fullContent.includes(k)).length;
        const highHits = highKeywords.filter(k => fullContent.includes(k)).length;
        const medHits = mediumKeywords.filter(k => fullContent.includes(k)).length;

        if (critHits > 0) {
            severity = "Critical";
            urgency = "High";
        } else if (highHits > 0) {
            severity = "High";
            urgency = "High";
        } else if (medHits > 0) {
            severity = "Medium";
            urgency = "Medium";
        }

        const priority = severity === "Critical" ? "Immediate" : severity;

        const words = fullContent
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 4 && !this.STOP_WORDS.has(w));
            
        const freqs = {};
        words.forEach(w => freqs[w] = (freqs[w] || 0) + 1);
        
        const sortedTags = Object.keys(freqs).sort((a, b) => freqs[b] - freqs[a]);
        const extractedTags = sortedTags.slice(0, 4);

        return {
            department: suggestedDept,
            classification: suggestedCat,
            severity,
            urgency,
            priority,
            tags: extractedTags.length > 0 ? extractedTags : ["community"]
        };
    },

    performAnalysis(title, details, existingComplaints = [], antiBotVerdict = { success: true }) {
        const meta = this.predictMetadata(title, details);
        const qualityAudit = this.analyzeTextQuality(title, details);
        const dupAudit = this.checkDuplicate(title, details, existingComplaints);

        let spamScore = qualityAudit.spamScore;
        const reasons = [...qualityAudit.reasons];
        
        if (dupAudit.isDuplicate) {
            spamScore += 0.45;
            reasons.push(`Duplicate complaint pattern similarity (${(dupAudit.score * 100).toFixed(0)}%) with report ${dupAudit.duplicateId}`);
        }

        if (!antiBotVerdict.success) {
            spamScore += 0.6;
            reasons.push(`Failed physical Anti-Bot coordinate validation: ${antiBotVerdict.reason}`);
        }

        spamScore = parseFloat(Math.min(1.0, spamScore).toFixed(2));

        const detailCompletion = Math.min(1.0, details.length / 500);
        const titleCompletion = Math.min(1.0, title.length / 50);
        const qualityScore = parseFloat(((detailCompletion * 0.6) + (titleCompletion * 0.4)).toFixed(2));

        let trustScore = parseFloat((Math.max(0, (1 - spamScore) * 0.8 + (qualityScore * 0.2))).toFixed(2));
        const confidenceScore = parseFloat((Math.max(0.2, 1 - (spamScore * 0.6) - (details.length < 80 ? 0.3 : 0))).toFixed(2));

        const flaggedForManualReview = spamScore > 0.42 || confidenceScore < 0.6 || qualityAudit.isAbusive || dupAudit.isDuplicate;

        return {
            classification: meta.classification,
            severity: meta.severity,
            priority: meta.priority,
            urgency: meta.urgency,
            department: meta.department,
            tags: meta.tags,
            ai_analysis: {
                confidenceScore,
                spamScore,
                qualityScore,
                trustScore,
                isFake: qualityAudit.isFake || spamScore > 0.5,
                isAbusive: qualityAudit.isAbusive,
                flaggedForManualReview,
                reasons: [...new Set(reasons)]
            }
        };
    }
};

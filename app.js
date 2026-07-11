// Satyasetu - Main Application Coordinator (app.js - Global Namespace)

window.App = {
    complaints: [],
    isCloudActive: false,
    draftTimer: null,
    currentLanguage: 'en'
};

const TRANSLATIONS = {
    en: {
        brand: "SatyaSetu",
        home: "Home",
        register: "Register Complaint",
        dashboard: "Reports Hub",
        safety: "Privacy & Safety",
        tagline: "Peace, Justice & Strong Institutions",
        hero_desc: "SatyaSetu is a transparent, secure educational portal assisting citizens, educators, and evaluators to register and study community integrity indicators securely.",
        reset_demo: "Reset Demo",
        card1_title: "Zero Phishing Policy",
        card1_desc: "To guarantee safe transparency and data compliance, reports never request, store, or verify critical identification certificates, contact info, or personal names.",
        card2_title: "SDG Goal 16",
        card2_desc: "Promote fair, inclusive, peaceful societies. Build responsive, accountable structural environments by modeling local development monitoring workflows.",
        card3_title: "Connected Sandbox",
        card3_desc: "Features real-time client synchronization directly with your registered Cloud Realtime database. It gracefully falls back to local storage offline.",
        start_tracking: "Start Tracking Community Integrity Now",
        register_now: "Register Complaint",
        explore_dash: "Explore Dashboard",
        voice_assistant: "Chat with AI Voice Assistant 🎙️",
        form_title: "Log Community Concern",
        form_subtitle: "All fields marked with an asterisk (*) are required.",
        field_date: "Date of the Event *",
        field_title: "Complaint Title *",
        field_details: "Incident Details *",
        field_proof: "Attach Proof Image",
        field_video: "Attach Video Clip",
        consent_text: "I verify that I have not supplied any private contact details, identities, or physical addresses. I agree to save this structured log.",
        btn_submit: "Submit Incident",
        btn_cancel: "Cancel",
        search_placeholder: "Search through titles, IDs or locations...",
        total_logs: "Total Logs",
        severe_flags: "High & Critical Flags",
        sync_list: "Sync List ⟳"
    },
    hi: {
        brand: "सत्यसेतु",
        home: "होम",
        register: "शिकायत दर्ज करें",
        dashboard: "रिपोर्ट हब",
        safety: "गोपनीयता और सुरक्षा",
        tagline: "शांति, न्याय और मजबूत संस्थाएं",
        hero_desc: "सत्यसेतु एक पारदर्शी, सुरक्षित शैक्षिक पोर्टल है जो नागरिकों, शिक्षकों और मूल्यांकनकर्ताओं को सुरक्षित रूप से सामुदायिक अखंडता संकेतकों को दर्ज करने और अध्ययन करने में सहायता करता है।",
        reset_demo: "डेमो रीसेट करें",
        card1_title: "शून्य फ़िशिंग नीति",
        card1_desc: "सुरक्षित पारदर्शिता और डेटा अनुपालन की गारंटी के लिए, रिपोर्ट कभी भी महत्वपूर्ण पहचान पत्र, संपर्क जानकारी या व्यक्तिगत नाम नहीं मांगती, संग्रहीत या सत्यापित नहीं करती है।",
        card2_title: "एसडीजी लक्ष्य 16",
        card2_desc: "निष्पक्ष, समावेशी, शांतिपूर्ण समाजों को बढ़ावा देना। स्थानीय विकास निगरानी कार्यप्रवाहों को मॉडल करके उत्तरदायी, जवाबदेह संरचनात्मक वातावरण का निर्माण करना।",
        card3_title: "कनेक्टेड सैंडबॉक्स",
        card3_desc: "आपके पंजीकृत फ़ायरबेस रीयलटाइम डेटाबेस के साथ सीधे रीयल-टाइम क्लाइंट सिंक्रनाइज़ेशन की सुविधा देता है। यह ऑफ़लाइन होने पर लोकल स्टोरेज का सहारा लेता है।",
        start_tracking: "सामुदायिक अखंडता को अभी ट्रैक करना शुरू करें",
        register_now: "शिकायत दर्ज करें",
        explore_dash: "डैशबोर्ड देखें",
        voice_assistant: "एआई वॉयस असिस्टेंट से बात करें 🎙️",
        form_title: "सामुदायिक चिंता दर्ज करें",
        form_subtitle: "तारांकित (*) सभी फ़ील्ड अनिवार्य हैं।",
        field_date: "घटना की तारीख *",
        field_title: "शिकायत का शीर्षक *",
        field_details: "घटना का विवरण *",
        field_proof: "प्रमाण छवि संलग्न करें",
        field_video: "वीडियो क्लिप संलग्न करें",
        consent_text: "मैं सत्यापित करता हूँ कि मैंने कोई निजी संपर्क विवरण, पहचान पत्र या भौतिक पता प्रदान नहीं किया है। मैं इस संरचित लॉग को सहेजने के लिए सहमत हूँ।",
        btn_submit: "शिकायत सबमिट करें",
        btn_cancel: "रद्द करें",
        search_placeholder: "शीर्षकों, आईडी या स्थानों में खोजें...",
        total_logs: "कुल लॉग",
        severe_flags: "उच्च और गंभीर झंडे",
        sync_list: "सूची सिंक करें ⟳"
    }
};

window.onload = function() {
    setTimeout(hideLoader, 3000); // Max 3s fallback
    initApp().then(hideLoader).catch(hideLoader);
};

function hideLoader() {
    const loader = document.getElementById('loading-screen');
    if (loader && !loader.classList.contains('fade-out')) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 600);
    }
}

async function initApp() {
    // 1. Theme Configuration load
    initTheme();

    // 2. Load Local Storage Complaints fallback
    loadLocalComplaints();

    // 3. Initialize UI elements
    window.UI.init(
        (isDark) => {
            saveThemePreference(isDark);
            renderActivePage();
        },
        (type, data) => {
            triggerDraftAutosave();
        }
    );

    // 4. Setup navigation link handlers
    setupNavigation();
    setupLanguageSelector();
    setupPWAInstall();

    // 5. Initialize Cloud storage SDK
    const connectionBadge = document.getElementById('connection-badge');
    const userBadge = document.getElementById('user-info-badge');

    if (connectionBadge) {
        connectionBadge.textContent = "Connecting to shared database...";
        connectionBadge.className = "badge badge-warning";
    }

    const cloudResult = await window.CLOUD.init((user) => {
        if (user) {
            window.App.isCloudActive = true;
            if (userBadge) {
                userBadge.innerHTML = `👤 UID: <strong>${user.uid.substring(0, 10)}...</strong>`;
                userBadge.classList.remove('hidden');
                userBadge.style.display = 'inline-block';
            }
            if (connectionBadge) {
                connectionBadge.textContent = "Storage: Connected to Shared Database 📡";
                connectionBadge.className = "badge badge-success";
            }
            setupRealtimeSync();
        } else {
            handleCloudDisconnected();
        }
    });

    if (!cloudResult.success) {
        handleCloudDisconnected();
    }

    // 6. Run Page specific initialization routines contextually
    initPageSpecificCode();

    // Handle Custom Pagination re-renders
    document.addEventListener('page-changed', () => {
        renderActivePage();
    });

    registerServiceWorker();
}

function initTheme() {
    const cachedTheme = localStorage.getItem(window.CONFIG.THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = cachedTheme === 'dark' || (!cachedTheme && systemPrefersDark);
    
    document.body.classList.toggle('light-theme', !shouldBeDark);
}

function saveThemePreference(isDark) {
    localStorage.setItem(window.CONFIG.THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
}

function loadLocalComplaints() {
    try {
        const cached = localStorage.getItem(window.CONFIG.LOCAL_STORAGE_KEY);
        if (cached) {
            window.App.complaints = JSON.parse(cached);
        } else {
            window.App.complaints = [...window.CONFIG.MOCK_COMPLAINTS];
            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
        }
    } catch (e) {
        console.error(e);
        window.App.complaints = [...window.CONFIG.MOCK_COMPLAINTS];
    }
}

let syncUnsubscribe = null;
function setupRealtimeSync() {
    if (syncUnsubscribe) syncUnsubscribe();

    if (document.body.id === 'page-complaints' || document.body.id === 'page-dashboard') {
        window.UI.showSkeletons('submissions-list');
    }

    syncUnsubscribe = window.CLOUD.subscribeToComplaints(
        (cloudComplaints) => {
            if (cloudComplaints && cloudComplaints.length > 0) {
                window.App.complaints = cloudComplaints;
            } else {
                window.App.complaints = [...window.CONFIG.MOCK_COMPLAINTS];
            }
            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
            renderActivePage();
        },
        (error) => {
            console.error(error);
            window.UI.showToast("Database Sync Error", "Could not sync cloud data. Loading local data.", "warning");
            loadLocalComplaints();
            renderActivePage();
        }
    );
}

function handleCloudDisconnected() {
    window.App.isCloudActive = false;
    const connectionBadge = document.getElementById('connection-badge');
    const userBadge = document.getElementById('user-info-badge');
    
    if (userBadge) userBadge.style.display = 'none';
    if (connectionBadge) {
        connectionBadge.textContent = "Storage: Local Device Backup (Offline Sandbox) 💾";
        connectionBadge.className = "badge badge-info";
    }
    renderActivePage();
}

function setupNavigation() {
    const resetBtn = document.getElementById('reset-demo-btn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm("This will clear all device cache records and reload default mocks. Proceed?")) {
                localStorage.removeItem(window.CONFIG.LOCAL_STORAGE_KEY);
                localStorage.removeItem(window.CONFIG.DRAFT_STORAGE_KEY);
                window.UI.showToast("Local Data Reset", "Restored sandbox seed data.", "success");
                loadLocalComplaints();
                window.location.reload();
            }
        };
    }

    const dropdown = document.querySelector('.nav-dropdown');
    const dropdownBtn = document.querySelector('.nav-dropdown-btn');
    if (dropdown && dropdownBtn) {
        dropdownBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        };
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
}

// Routes initialization dynamically based on Body Tag ID
function initPageSpecificCode() {
    const pageId = document.body.id;

    if (pageId === 'page-index') {
        renderLandingStats();
    } else if (pageId === 'page-report') {
        setupFormListeners();
        window.UTILS.AntiBot.init();
        generateAntiBotMath();
        loadSavedDraft();
    } else if (pageId === 'page-dashboard') {
        renderDashboardComplaints();
    } else if (pageId === 'page-analytics') {
        renderAnalyticsPage();
    } else if (pageId === 'page-complaints') {
        setupSearchFilters();
        renderComplaintsDirectory();
    } else if (pageId === 'page-complaint') {
        renderComplaintDetails();
    } else if (pageId === 'page-settings') {
        setupSettingsControls();
    }
}

function renderActivePage() {
    const pageId = document.body.id;
    if (pageId === 'page-index') renderLandingStats();
    else if (pageId === 'page-dashboard') renderDashboardComplaints();
    else if (pageId === 'page-analytics') renderAnalyticsPage();
    else if (pageId === 'page-complaints') renderComplaintsDirectory();
    else if (pageId === 'page-complaint') renderComplaintDetails();
}

// -------------------------------------------------------------
// PAGE SPECIFIC LOGICS
// -------------------------------------------------------------

// Page: index.html
function renderLandingStats() {
    const stats = window.CHARTS.computeStatistics(window.App.complaints);
    const totalEl = document.getElementById('landing-stat-total');
    const severeEl = document.getElementById('landing-stat-severe');
    const confidenceEl = document.getElementById('landing-stat-confidence');

    if (totalEl) window.UI.animateCount(totalEl, stats.total);
    if (severeEl) window.UI.animateCount(severeEl, stats.criticalCount + stats.highCount);
    if (confidenceEl) window.UI.animateCount(confidenceEl, `${(stats.avgConfidence * 100).toFixed(0)}%`);
}

// Page: report.html
function setupFormListeners() {
    const titleIn = document.getElementById('complaint-title');
    const detailsText = document.getElementById('complaint-details');
    
    titleIn?.addEventListener('input', () => {
        document.getElementById('title-counter').textContent = `${titleIn.value.length} / 120`;
        triggerDraftAutosave();
    });

    detailsText?.addEventListener('input', () => {
        document.getElementById('details-counter').textContent = `${detailsText.value.length} / 1000`;
        triggerDraftAutosave();
    });

    ['event-date', 'city-input', 'state-input', 'area-input', 'dept-select', 'cat-select'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => triggerDraftAutosave());
    });

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.onclick = (e) => {
            e.preventDefault();
            handleSubmitComplaint();
        };
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to discard this complaint?")) {
                clearDraft();
                window.location.href = 'index.html';
            }
        };
    }

    const botCheck = document.getElementById('bot-check');
    const mathChallengeSection = document.getElementById('math-challenge-section');
    botCheck?.addEventListener('change', () => {
        if (botCheck.checked) {
            mathChallengeSection.classList.add('active');
        } else {
            mathChallengeSection.classList.remove('active');
        }
    });

    const dictationBtn = document.getElementById('voice-dictate-btn');
    const detailsField = document.getElementById('complaint-details');
    if (dictationBtn && detailsField) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            dictationBtn.style.display = 'none';
        } else {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            let isListening = false;
            dictationBtn.onclick = (e) => {
                e.preventDefault();
                if (!isListening) {
                    recognition.lang = window.App.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
                    try {
                        recognition.start();
                        dictationBtn.innerHTML = '🎤 Listening...';
                        dictationBtn.style.background = 'var(--neon-rose)';
                        dictationBtn.style.color = '#fff';
                        isListening = true;
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    recognition.stop();
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                detailsField.value = detailsField.value ? detailsField.value + " " + transcript : transcript;
                const counter = document.getElementById('details-counter');
                if (counter) counter.textContent = `${detailsField.value.length} / 1000`;
                triggerDraftAutosave();
            };

            recognition.onend = () => {
                isListening = false;
                dictationBtn.innerHTML = '🎤 Speak Details';
                dictationBtn.style.background = 'rgba(34, 211, 238, 0.15)';
                dictationBtn.style.color = 'var(--accent-cyan)';
            };

            recognition.onerror = (err) => {
                console.error("Speech recognition error:", err);
                isListening = false;
                dictationBtn.innerHTML = '🎤 Dictation Failed';
            };
        }
    }
}

function generateAntiBotMath() {
    const mathLabel = document.getElementById('math-label');
    const mathInput = document.getElementById('math-input');
    
    if (mathLabel && mathInput) {
        mathLabel.textContent = window.UTILS.AntiBot.MathChallenge.generate();
        mathInput.value = '';
        window.App.antiBotMathSolved = false;
    }
}

async function handleSubmitComplaint() {
    const date = document.getElementById('event-date').value;
    const title = document.getElementById('complaint-title').value.trim();
    const details = document.getElementById('complaint-details').value.trim();
    const city = document.getElementById('city-input').value.trim();
    const state = document.getElementById('state-input').value;
    const area = document.getElementById('area-input').value.trim();
    const dept = document.getElementById('dept-select').value;
    const cat = document.getElementById('cat-select').value;
    const consent = document.getElementById('user-consent').checked;
    
    const botCheck = document.getElementById('bot-check').checked;
    const mathAnswer = document.getElementById('math-input').value.trim();

    const rateLimitSecs = window.UTILS.checkRateLimit('last_submit_timestamp', window.CONFIG.SUBMISSION_RATE_LIMIT_MS);
    if (rateLimitSecs > 0) {
        window.UI.showToast("Submission Rate Limited", `Please wait ${rateLimitSecs} seconds before logging another case.`, "warning");
        return;
    }

    const fieldValidation = window.VALIDATION.validateComplaintForm({ date, title, details, city, state, area });
    if (!fieldValidation.valid) {
        window.UI.showToast("Validation Incomplete", fieldValidation.message, "error");
        return;
    }

    if (!consent) {
        window.UI.showToast("Consent Required", "You must check the privacy consent statement to proceed.", "warning");
        return;
    }

    if (!botCheck) {
        window.UI.showToast("Security Check Required", "Please complete the 'I am not a robot' checkbox.", "warning");
        return;
    }

    if (!window.UTILS.AntiBot.MathChallenge.validate(mathAnswer)) {
        window.UI.showToast("Security Math Incorrect", "The answer to the security challenge is incorrect. Please try again.", "error");
        generateAntiBotMath();
        return;
    }

    const botVerdict = window.UTILS.AntiBot.verify();

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `Transmitting Security Envelopes...`;
    submitBtn.disabled = true;

    try {
        const analysis = window.AI.performAnalysis(title, details, window.App.complaints, botVerdict);
        
        const dateHash = date.replace(/-/g, '');
        const dailyCount = window.App.complaints.filter(c => c.event_date === date).length;
        const sequenceCode = String(dailyCount + 1).padStart(2, '0');
        const uniqueId = `SS-${dateHash}-${sequenceCode}`;

        // Compute local cryptographic integrity hash
        const hashContent = `${title}|${details}|${date}|${area},${city},${state}`;
        const cryptoHash = await window.UTILS.generateSHA256(hashContent);

        const record = {
            id: uniqueId,
            event_date: date,
            title: title,
            details: details,
            city: city,
            state: state,
            area: area,
            department: dept || analysis.department,
            classification: cat || analysis.classification,
            severity: analysis.severity,
            priority: analysis.priority,
            urgency: analysis.urgency,
            tags: analysis.tags,
            image_data: selectedImagesList.length > 0 ? selectedImagesList[0] : null,
            image_list: selectedImagesList,
            video_data: selectedVideoBase64,
            created_at: new Date().toISOString(),
            status: "Pending",
            ai_analysis: analysis.ai_analysis,
            hash: cryptoHash
        };

        let savedToCloud = false;
        if (window.App.isCloudActive) {
            try {
                await window.CLOUD.submitComplaint(record);
                savedToCloud = true;
                window.UI.showToast("Record Transmitted", `Case logged successfully. ID: ${uniqueId}`, "success");
            } catch (err) {
                console.warn("Could not reach cloud database, caching offline:", err);
            }
        }

        if (!savedToCloud) {
            window.App.complaints.unshift(record);
            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
            window.UI.showToast("Saved Locally", `Case saved on device local sandbox. ID: ${uniqueId}`, "info");
        }

        window.UTILS.setRateLimit('last_submit_timestamp');

        // Clear Form fields
        resetForm();
        clearDraft();

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);

    } catch (err) {
        console.error("Submission error:", err);
        window.UI.showToast("System Submission Error", err.message || "An unexpected error occurred during submission.", "error");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function resetForm() {
    document.getElementById('complaint-form')?.reset();
    const titleCounter = document.getElementById('title-counter');
    const detailsCounter = document.getElementById('details-counter');
    if (titleCounter) titleCounter.textContent = '0 / 120';
    if (detailsCounter) detailsCounter.textContent = '0 / 1000';
    document.getElementById('math-challenge-section')?.classList.remove('active');
    window.UI.resetFormFiles();
}

function triggerDraftAutosave() {
    if (window.App.draftTimer) clearTimeout(window.App.draftTimer);
    
    window.App.draftTimer = setTimeout(() => {
        if (document.body.id !== 'page-report') return;
        
        const draft = {
            date: document.getElementById('event-date').value,
            title: document.getElementById('complaint-title').value,
            details: document.getElementById('complaint-details').value,
            city: document.getElementById('city-input').value,
            state: document.getElementById('state-input').value,
            area: document.getElementById('area-input').value,
            dept: document.getElementById('dept-select').value,
            cat: document.getElementById('cat-select').value,
            images: selectedImagesList,
            video: selectedVideoBase64
        };

        if (draft.title.trim().length > 0 || draft.details.trim().length > 0) {
            localStorage.setItem(window.CONFIG.DRAFT_STORAGE_KEY, JSON.stringify(draft));
            
            const indicator = document.getElementById('draft-indicator');
            if (indicator) {
                indicator.classList.add('active');
                setTimeout(() => indicator.classList.remove('active'), 2500);
            }
        }
    }, 1500);
}

function loadSavedDraft() {
    try {
        const cached = localStorage.getItem(window.CONFIG.DRAFT_STORAGE_KEY);
        if (cached) {
            const draft = JSON.parse(cached);
            if (!draft) return;

            document.getElementById('event-date').value = draft.date || '';
            document.getElementById('complaint-title').value = draft.title || '';
            document.getElementById('complaint-details').value = draft.details || '';
            document.getElementById('city-input').value = draft.city || '';
            document.getElementById('state-input').value = draft.state || '';
            document.getElementById('area-input').value = draft.area || '';
            document.getElementById('dept-select').value = draft.dept || '';
            document.getElementById('cat-select').value = draft.cat || '';

            document.getElementById('title-counter').textContent = `${(draft.title || '').length} / 120`;
            document.getElementById('details-counter').textContent = `${(draft.details || '').length} / 1000`;

            const imgList = draft.images || (draft.image ? [draft.image] : []);
            if (imgList && imgList.length > 0) {
                selectedImagesList = imgList;
                const drop = document.getElementById('image-dropzone');
                const prev = drop?.querySelector('.media-preview-container');
                if (prev) {
                    prev.classList.add('active');
                    prev.querySelector('img').src = imgList[0];
                }
                const label = drop?.querySelector('.dropzone-status');
                if (label) label.textContent = `✓ Recovered ${imgList.length} images from draft`;
            }

            if (draft.video) {
                selectedVideoBase64 = draft.video;
                const drop = document.getElementById('video-dropzone');
                const prev = drop?.querySelector('.media-preview-container');
                if (prev) {
                    prev.classList.add('active');
                    prev.querySelector('video').src = draft.video;
                }
                const label = drop?.querySelector('.dropzone-status');
                if (label) label.textContent = '✓ Saved Draft Video Recovered';
            }

            window.UI.showToast("Draft Restored", "Your unfinished complaint draft has been auto-recovered.", "info");
        }
    } catch (e) {
        console.warn("Failed to load saved draft:", e);
    }
}

function clearDraft() {
    localStorage.removeItem(window.CONFIG.DRAFT_STORAGE_KEY);
    selectedImagesList = [];
    selectedVideoBase64 = null;
}

// Page: dashboard.html
function renderDashboardComplaints() {
    const stats = window.CHARTS.computeStatistics(window.App.complaints);
    
    // Bind quick metrics
    const totalEl = document.getElementById('stat-total');
    const severeEl = document.getElementById('stat-severe');
    const spamEl = document.getElementById('stat-spam');
    const confidenceEl = document.getElementById('stat-confidence');
    
    if (totalEl) window.UI.animateCount(totalEl, stats.total);
    if (severeEl) window.UI.animateCount(severeEl, stats.criticalCount + stats.highCount);
    if (spamEl) window.UI.animateCount(spamEl, stats.flagged);
    if (confidenceEl) window.UI.animateCount(confidenceEl, `${(stats.avgConfidence * 100).toFixed(0)}%`);

    // Render Recent 3 complaints
    const listContainer = document.getElementById('submissions-list');
    if (listContainer) {
        listContainer.innerHTML = '';
        const recent = window.App.complaints.slice(0, 3);
        
        if (recent.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding: 40px; grid-column: 1/-1;">
                    <p style="color:var(--text-muted);">No complaints logged yet. Click "Register Complaint" to log your first case.</p>
                </div>
            `;
            return;
        }

        recent.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card submission-card fade-in-el';
            const dateStr = window.UTILS.formatDate(item.created_at || item.event_date);
            const sevClass = window.UI.severityBadgeClass(item.severity);
            
            card.innerHTML = `
                <div>
                    <div class="card-top">
                        <span class="card-date">${dateStr}</span>
                        <span class="badge ${sevClass}">${window.UTILS.escapeHtml(item.severity || 'Medium')}</span>
                    </div>
                    <div class="card-body">
                        <h4>${window.UTILS.escapeHtml(item.title)}</h4>
                        <p>${window.UTILS.escapeHtml(item.details)}</p>
                    </div>
                </div>
                <div class="card-bottom">
                    <span class="badge badge-info" style="font-size:9px;">📂 ${window.UTILS.escapeHtml(item.classification || 'General')}</span>
                    <span class="card-id">ID: ${window.UTILS.escapeHtml(item.id ? item.id.substring(0, 14) : 'N/A')}</span>
                </div>
            `;
            
            card.onclick = () => {
                window.location.href = 'complaint.html#' + item.id;
            };
            
            listContainer.appendChild(card);
        });
    }

    // AI Insight Summary Alert
    const aiInsightText = document.getElementById('ai-insight-text');
    if (aiInsightText) {
        if (stats.total > 0) {
            let topDept = "General Administration";
            let topDeptCount = 0;
            for (const [dept, count] of Object.entries(stats.deptCounts)) {
                if (count > topDeptCount) {
                    topDeptCount = count;
                    topDept = dept;
                }
            }
            
            let severityRisk = "Stable";
            if (stats.criticalCount > 0) severityRisk = "Critical Intervention Required";
            else if (stats.highCount > 2) severityRisk = "Elevated Alert Levels";

            aiInsightText.innerHTML = `
                SatyaSetu AI audited <strong>${stats.total} cases</strong>. 
                Target Department with highest backlog volume is <strong>${topDept}</strong>. 
                Institutional Risk Threshold is: <span class="badge ${severityRisk.startsWith('Stable') ? 'badge-success' : 'badge-danger'}" style="display:inline-block; margin-left:4px;">${severityRisk}</span>.
            `;
        } else {
            aiInsightText.textContent = "Awaiting complaint database synchronization to run automated diagnostic sweeps.";
        }
    }
}

// Page: analytics.html
function renderAnalyticsPage() {
    const isDark = document.body.classList.contains('dark-theme');
    window.CHARTS.renderCharts(window.App.complaints, isDark);

    // AI summary analysis box details
    const stats = window.CHARTS.computeStatistics(window.App.complaints);
    const aiSummaryDetails = document.getElementById('ai-summary-details');
    if (aiSummaryDetails) {
        if (stats.total > 0) {
            let highCount = stats.criticalCount + stats.highCount;
            let percentHigh = ((highCount / stats.total) * 100).toFixed(0);
            
            aiSummaryDetails.innerHTML = `
                <p style="margin-bottom:8px;">• <strong>Audit Integrity Index</strong> is calculated at <strong>${(stats.avgConfidence * 100).toFixed(0)}%</strong> average confidence.</p>
                <p style="margin-bottom:8px;">• <strong>${percentHigh}%</strong> of complaints logged represent High/Critical severity issues requiring administrative review.</p>
                <p style="margin-bottom:8px;">• Primary classification category reported is <strong>${Object.keys(stats.catCounts)[0] || 'General Public Concern'}</strong>.</p>
                <p>• Data sync reports online caching is active under IndexedDB persistent schemas.</p>
            `;
        } else {
            aiSummaryDetails.textContent = "No data points registered. Log concerns on the registration page to compile metrics.";
        }
    }
}

// Page: complaints.html
function setupSearchFilters() {
    const controls = ['search-input', 'dept-filter', 'cat-filter', 'severity-filter', 'status-filter', 'sort-order'];
    controls.forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            window.UI.resetPagination();
            window.UI.renderComplaints(window.App.complaints, handleCardNavigation);
        });
    });

    document.getElementById('search-input')?.addEventListener('input', () => {
        window.UI.resetPagination();
        window.UI.renderComplaints(window.App.complaints, handleCardNavigation);
    });

    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
        const defaults = {
            'search-input': '',
            'dept-filter': 'all',
            'cat-filter': 'all',
            'severity-filter': 'all',
            'status-filter': 'all',
            'sort-order': 'newest'
        };

        Object.entries(defaults).forEach(([id, value]) => {
            const control = document.getElementById(id);
            if (control) control.value = value;
        });

        window.UI.resetPagination();
        window.UI.renderComplaints(window.App.complaints, handleCardNavigation);
        window.UI.showToast("Filters Cleared", "Showing the full complaints directory.", "info");
    });

    document.getElementById('sync-list-btn')?.addEventListener('click', () => {
        if (window.App.isCloudActive) {
            setupRealtimeSync();
            window.UI.showToast("Database Synchronizing", "Fetching latest records...", "info");
        } else {
            loadLocalComplaints();
            window.UI.showToast("Local Sandbox Reloaded", "Reloaded records from device local memory.", "info");
            window.UI.renderComplaints(window.App.complaints, handleCardNavigation);
        }
    });
}

function renderComplaintsDirectory() {
    window.UI.renderComplaints(window.App.complaints, handleCardNavigation);
}

function handleCardNavigation(item) {
    window.location.href = 'complaint.html#' + item.id;
}

// Page: complaint.html
function renderComplaintDetails() {
    const hash = window.location.hash.substring(1); // Get ID e.g. SS-XXXXX-XXXX
    const container = document.getElementById('complaint-detail-card');
    
    if (!hash) {
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <span style="font-size:48px;">📂</span>
                    <h3 style="margin-top:16px;">No complaint selected</h3>
                    <p style="color:var(--text-muted); margin-top:8px;">Please go to the <a href="complaints.html" style="color:var(--primary);">Reports Hub</a> page and select a complaint card to view details.</p>
                </div>
            `;
        }
        return;
    }

    // Find complaint item in array
    const item = window.App.complaints.find(c => c.id === hash);
    if (!item) {
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <span style="font-size:48px;">⚠️</span>
                    <h3 style="margin-top:16px;">Complaint not found</h3>
                    <p style="color:var(--text-muted); margin-top:8px;">The report ID "${hash}" could not be located in local or cloud database files.</p>
                    <a href="complaints.html" class="btn btn-secondary" style="width:fit-content; margin:16px auto 0 auto;">Back to Directory</a>
                </div>
            `;
        }
        return;
    }

    // Setup print button
    const printBtn = document.getElementById('detail-print-btn');
    if (printBtn) {
        printBtn.onclick = () => {
            window.UTILS.printComplaint(item);
        };
    }

    // Setup delete button
    const deleteBtn = document.getElementById('detail-delete-btn');
    const firestoreId = item._firestore_id || item.id;
    const isLocal = !window.App.isCloudActive || !item._firestore_id || String(item.id).startsWith('local_');
                    
    if (deleteBtn) {
        if (isLocal) {
            deleteBtn.style.display = 'block';
            deleteBtn.onclick = async () => {
                if (confirm("Are you sure you want to remove this complaint?")) {
                    try {
                        if (window.App.isCloudActive && item._firestore_id) {
                            await window.CLOUD.deleteComplaint(firestoreId);
                            window.UI.showToast("Record Removed", "Successfully deleted complaint record.", "success");
                        } else {
                            window.App.complaints = window.App.complaints.filter(c => c.id !== item.id);
                            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
                            window.UI.showToast("Record Removed", "Removed complaint from local backup.", "success");
                        }
                        // Redirect back to complaints directory
                        setTimeout(() => {
                            window.location.href = 'complaints.html';
                        }, 1000);
                    } catch (e) {
                        console.error(e);
                        window.UI.showToast("Deleter Fault", "Could not delete document.", "error");
                    }
                }
            };
        } else {
            deleteBtn.style.display = 'none';
        }
    }

    // Populate Details Fields
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-date').textContent = window.UTILS.formatDate(item.created_at || item.event_date);
    document.getElementById('detail-text').textContent = item.details;
    document.getElementById('detail-location').textContent = `📍 Location: ${item.area}, ${item.city}, ${item.state}`;
    document.getElementById('detail-dept').textContent = `🏛️ Department: ${item.department}`;

    const severityEl = document.getElementById('detail-severity');
    severityEl.textContent = item.severity;
    severityEl.className = `badge ${window.UI.severityBadgeClass(item.severity)}`;

    document.getElementById('detail-classification').textContent = `📂 ${item.classification}`;

    // Render Carousel for Images
    const img = document.getElementById('detail-image');
    const images = item.image_list || (item.image_data ? [item.image_data] : []);
    const carouselContainer = document.getElementById('detail-carousel-container') || img?.parentNode;

    if (images.length > 0 && carouselContainer) {
        if (img) img.style.display = 'none';
        
        let carouselDiv = document.getElementById('page-carousel-inner-box');
        if (!carouselDiv) {
            carouselDiv = document.createElement('div');
            carouselDiv.id = 'page-carousel-inner-box';
            carouselContainer.appendChild(carouselDiv);
        }
        carouselDiv.style.display = 'block';

        let activeIdx = 0;
        const renderCarousel = () => {
            carouselDiv.innerHTML = `
                <div class="carousel-wrapper" style="position:relative; width:100%; height:280px; overflow:hidden; border-radius:var(--radius-md); border:1px solid var(--glass-border); margin: 15px 0;">
                    <img src="${images[activeIdx]}" style="width:100%; height:100%; object-fit:cover; transition: opacity var(--transition-fast);" />
                    ${images.length > 1 ? `
                        <button class="carousel-btn prev" style="position:absolute; left:15px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.65); color:#fff; border:none; border-radius:50%; width:38px; height:38px; cursor:pointer; font-size:22px; line-height:34px; text-align:center;">‹</button>
                        <button class="carousel-btn next" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.65); color:#fff; border:none; border-radius:50%; width:38px; height:38px; cursor:pointer; font-size:22px; line-height:34px; text-align:center;">›</button>
                        <div class="carousel-dots" style="position:absolute; bottom:15px; left:50%; transform:translateX(-50%); display:flex; gap:8px;">
                            ${images.map((_, idx) => `<span style="width:10px; height:10px; border-radius:50%; background:${idx === activeIdx ? 'var(--primary)' : 'rgba(255,255,255,0.5)'};"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            
            const prevBtn = carouselDiv.querySelector('.carousel-btn.prev');
            const nextBtn = carouselDiv.querySelector('.carousel-btn.next');
            if (prevBtn) {
                prevBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    activeIdx = (activeIdx - 1 + images.length) % images.length;
                    renderCarousel();
                };
            }
            if (nextBtn) {
                nextBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    activeIdx = (activeIdx + 1) % images.length;
                    renderCarousel();
                };
            }
        };
        renderCarousel();
    } else {
        if (img) {
            img.style.display = 'none';
            img.src = '';
        }
        const carouselDiv = document.getElementById('page-carousel-inner-box');
        if (carouselDiv) carouselDiv.style.display = 'none';
    }

    const vid = document.getElementById('detail-video');
    if (item.video_data) {
        vid.src = item.video_data;
        vid.style.display = 'block';
    } else {
        vid.style.display = 'none';
    }

    // Display Cryptographic Hash
    const hashEl = document.getElementById('detail-crypt-hash');
    if (hashEl) {
        hashEl.innerHTML = `
            <div style="background:rgba(99, 102, 241, 0.05); border:1px solid var(--glass-border); padding:12px 16px; border-radius:var(--radius-sm); margin-top:16px; font-family:monospace; font-size:11px; word-break:break-all; display:flex; flex-direction:column; gap:4px;">
                <span style="font-weight:800; color:var(--primary); font-family:'Outfit';">🛡️ SECURE CRYPTOGRAPHIC INTEGRITY HASH (SHA-256):</span>
                <span>${item.hash || 'N/A (Historical Seed Data)'}</span>
            </div>
        `;
    }

    // Admin Interactive Chat/Updates board
    const board = document.getElementById('detail-admin-board');
    if (board) {
        if (!item.comments) {
            item.comments = [
                { sender: "System", text: "Report digitally locked and registered in the SDG-16 Sandbox.", date: item.created_at || new Date().toISOString() }
            ];
        }
        
        const renderComments = () => {
            const listHtml = item.comments.map(c => `
                <div style="background:${c.sender === 'You' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.03)'}; border:1px solid var(--glass-border); padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:8px; font-size:12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:800; color:${c.sender === 'You' ? 'var(--neon-cyan)' : 'var(--neon-purple)'};">
                        <span>👤 ${c.sender}</span>
                        <span style="font-size:10px; color:var(--text-muted); font-weight:400;">${new Date(c.date).toLocaleTimeString()}</span>
                    </div>
                    <p style="color:var(--text-main);">${window.UTILS.escapeHtml(c.text)}</p>
                </div>
            `).join('');

            board.innerHTML = `
                <h3 style="font-size:15px; font-weight:800; margin-bottom:12px; display:flex; align-items:center; gap:8px;">💬 Administrative Audit Thread</h3>
                <div id="comments-list-box" style="max-height:220px; overflow-y:auto; margin-bottom:12px; padding-right:4px;">
                    ${listHtml}
                </div>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="comment-input-field" placeholder="Ask administrative auditor or post audit update..." style="flex-grow:1; background:var(--input-bg); border:1px solid var(--input-border); border-radius:var(--radius-sm); padding:10px; color:#fff; font-size:12px; outline:none;" />
                    <button id="comment-send-btn" class="btn btn-primary" style="padding:10px 16px; font-size:12px; border-radius:var(--radius-sm);">Send</button>
                </div>
            `;
            
            const box = document.getElementById('comments-list-box');
            if (box) box.scrollTop = box.scrollHeight;

            const sendBtn = document.getElementById('comment-send-btn');
            const inputField = document.getElementById('comment-input-field');

            const handleSend = () => {
                const text = inputField.value.trim();
                if (!text) return;
                
                item.comments.push({
                    sender: "You",
                    text: text,
                    date: new Date().toISOString()
                });
                inputField.value = '';
                renderComments();
                
                setTimeout(() => {
                    let replyText = "Understood. The administrative review team has logged this comment. We are continuing the verification of evidence.";
                    if (text.toLowerCase().includes("status") || text.toLowerCase().includes("track")) {
                        replyText = `Audit reference ID is ${item.id}. Status is currently set to ${item.status}.`;
                    } else if (text.toLowerCase().includes("bribe") || text.toLowerCase().includes("money")) {
                        replyText = "Alert: Allegations regarding monetary transactions are routed to the central anti-corruption division.";
                    } else if (text.toLowerCase().includes("proof") || text.toLowerCase().includes("image")) {
                        replyText = "Proof attachments have been cached and verified with cryptographic checksums.";
                    }
                    
                    item.comments.push({
                        sender: "SDG Audit Officer",
                        text: replyText,
                        date: new Date().toISOString()
                    });
                    renderComments();
                    window.UI.showToast("Audit Feed Updated", "Received administrative response.", "info");
                }, 2000);
            };

            if (sendBtn && inputField) {
                sendBtn.onclick = (e) => {
                    e.preventDefault();
                    handleSend();
                };
                inputField.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                    }
                };
            }
        };
        renderComments();
    }

    // Generate QR tracking code
    const qrContainer = document.getElementById('detail-qr-container');
    if (qrContainer) {
        const trackingUrl = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(item.id)}`;
        qrContainer.innerHTML = `
            <div class="qr-container">
                ${window.UTILS.generateQRCodeSVG(trackingUrl)}
                <p style="margin-top:6px; font-weight:700;">TRACK REPORT</p>
                <p style="font-size:11px; color:var(--text-muted); margin-top:4px;">${window.UTILS.escapeHtml(item.id)}</p>
            </div>
        `;
    }

    const copyBtn = document.getElementById('detail-copy-link-btn');
    if (copyBtn) {
        copyBtn.onclick = async () => {
            const trackingUrl = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(item.id)}`;
            try {
                await navigator.clipboard.writeText(trackingUrl);
                window.UI.showToast("Tracking Link Copied", "The report link is ready to share.", "success");
            } catch (err) {
                window.prompt("Copy this tracking link:", trackingUrl);
            }
        };
    }

    // AI Diagnostics metrics card
    const aiMetrics = document.getElementById('detail-ai-metrics');
    if (aiMetrics && item.ai_analysis) {
        const ai = item.ai_analysis;
        let reasonsText = ai.reasons && ai.reasons.length > 0
            ? `<ul style="font-size:11px; color:var(--text-muted); margin-top:8px; padding-left:16px;">
                 ${ai.reasons.map(r => `<li>${window.UTILS.escapeHtml(r)}</li>`).join('')}
               </ul>`
            : `<p style="font-size:11px; color:var(--accent-green); margin-top:8px;">✓ System passed all automated policy parameters.</p>`;

        aiMetrics.innerHTML = `
            <div class="ai-diagnosis-card">
                <div class="ai-diagnosis-title">🤖 SatyaSetu AI Safety Audit</div>
                <div class="ai-metrics-grid">
                    <div class="ai-metric-item">
                        <span class="ai-metric-val">${(ai.confidenceScore * 100).toFixed(0)}%</span>
                        <span class="ai-metric-label">Confidence</span>
                    </div>
                    <div class="ai-metric-item">
                        <span class="ai-metric-val" style="color:${ai.spamScore > 0.4 ? 'var(--accent-red)' : 'inherit'}">${(ai.spamScore * 100).toFixed(0)}%</span>
                        <span class="ai-metric-label">Spam Index</span>
                    </div>
                    <div class="ai-metric-item">
                        <span class="ai-metric-val">${(ai.qualityScore * 100).toFixed(0)}%</span>
                        <span class="ai-metric-label">Completeness</span>
                    </div>
                    <div class="ai-metric-item">
                        <span class="ai-metric-val" style="color:${ai.trustScore < 0.6 ? 'var(--accent-red)' : 'var(--accent-green)'}">${(ai.trustScore * 100).toFixed(0)}%</span>
                        <span class="ai-metric-label">Trust Index</span>
                    </div>
                </div>
                <div class="ai-flags-row" style="margin-top:12px;">
                    <span class="badge ${ai.isFake ? 'badge-danger' : 'badge-success'}">Gibberish/Fake: ${ai.isFake ? 'YES' : 'NO'}</span>
                    <span class="badge ${ai.isAbusive ? 'badge-danger' : 'badge-success'}">Profanity: ${ai.isAbusive ? 'YES' : 'NO'}</span>
                    <span class="badge ${ai.flaggedForManualReview ? 'badge-warning' : 'badge-success'}">Review Queue: ${ai.flaggedForManualReview ? 'PENDING MANUAL' : 'AUTO-PASSED'}</span>
                </div>
                ${reasonsText}
            </div>
        `;
    }

    // Render Timeline Status Checkpoints
    const timeline = document.getElementById('detail-timeline');
    if (timeline) {
        const isSpam = item.status === 'Flagged' || item.ai_analysis?.flaggedForManualReview;
        const isResolved = item.status === 'Resolved';
        
        timeline.innerHTML = `
            <div class="timeline">
                <div class="timeline-item success">
                    <span class="timeline-meta">${window.UTILS.formatDate(item.created_at)}</span>
                    <div class="timeline-desc">Report Logged Securely</div>
                </div>
                <div class="timeline-item success">
                    <span class="timeline-meta">Instant Real-time Scan</span>
                    <div class="timeline-desc">AI Risk Evaluation Auditing Completed</div>
                </div>
                <div class="timeline-item ${isSpam ? 'active' : 'success'}">
                    <span class="timeline-meta">Verification</span>
                    <div class="timeline-desc">${isSpam ? 'Flagged for Moderation Review' : 'Auto-Approved in SDG-16 Sandbox'}</div>
                </div>
                <div class="timeline-item ${isResolved ? 'success' : 'active'}">
                    <span class="timeline-meta">Resolution Queue</span>
                    <div class="timeline-desc">${isResolved ? 'Case Solved & Verified' : 'Awaiting Administrative Action'}</div>
                </div>
            </div>
        `;
    }

    // Related complaints grid search logic (same city or same category)
    const relatedContainer = document.getElementById('related-complaints-list');
    if (relatedContainer) {
        relatedContainer.innerHTML = '';
        const related = window.App.complaints.filter(c => c.id !== item.id && (c.city === item.city || c.classification === item.classification)).slice(0, 2);
        
        if (related.length === 0) {
            relatedContainer.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">No nearby or structurally matching complaints found.</p>`;
            return;
        }

        related.forEach(r => {
            const card = document.createElement('div');
            card.className = 'glass-card submission-card fade-in-el';
            card.style.padding = '16px';
            card.innerHTML = `
                <div class="card-top" style="margin-bottom:8px;">
                    <span class="card-date">${window.UTILS.formatDate(r.created_at || r.event_date)}</span>
                    <span class="badge ${window.UI.severityBadgeClass(r.severity)}">${window.UTILS.escapeHtml(r.severity || 'Medium')}</span>
                </div>
                <h5 style="font-size:13px; font-weight:800; line-clamp:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">${window.UTILS.escapeHtml(r.title)}</h5>
            `;
            
            card.onclick = () => {
                window.location.hash = r.id;
                window.location.reload();
            };
            relatedContainer.appendChild(card);
        });
    }
}

// Page: settings.html
function setupSettingsControls() {
    const themeToggle = document.getElementById('settings-theme-toggle');
    if (themeToggle) {
        // Init theme switch value
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.checked = isDark;
        themeToggle.onchange = () => {
            const willBeDark = themeToggle.checked;
            document.body.classList.toggle('dark-theme', willBeDark);
            saveThemePreference(willBeDark);
            window.UI.showToast("Settings Updated", `Theme switched to ${willBeDark ? 'Dark' : 'Light'} Mode.`, "success");
        };
    }

    const langSelect = document.getElementById('settings-lang-select');
    if (langSelect) {
        langSelect.value = window.App.currentLanguage;
        langSelect.onchange = () => {
            const lang = langSelect.value;
            window.App.currentLanguage = lang;
            const langBtn = document.getElementById('lang-toggle-btn');
            if (langBtn) langBtn.textContent = lang === 'en' ? 'हिन्दी' : 'English';
            applyTranslations(lang);
        };
    }

    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.onclick = () => {
            window.UI.showToast("Success", "Notification preferences saved locally.", "success");
        };
    }
}

// Global Language selectors
function setupLanguageSelector() {
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.onclick = () => {
            const nextLang = window.App.currentLanguage === 'en' ? 'hi' : 'en';
            window.App.currentLanguage = nextLang;
            langBtn.textContent = nextLang === 'en' ? 'हिन्दी' : 'English';
            
            // Sync settings select if exists on page
            const settingsSelect = document.getElementById('settings-lang-select');
            if (settingsSelect) settingsSelect.value = nextLang;
            
            applyTranslations(nextLang);
        };
    }
}

function applyTranslations(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    const elems = document.querySelectorAll('[data-translate]');
    elems.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (dict[key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', dict[key]);
            } else {
                if (key === 'tagline') {
                    el.innerHTML = dict[key];
                    if (window.UI.applyTextReveal) {
                        window.UI.applyTextReveal(el);
                    }
                } else {
                    el.textContent = dict[key];
                }
            }
        }
    });

    window.UI.showToast(lang === 'hi' ? 'भाषा बदली गई' : 'Language Changed', lang === 'hi' ? 'सत्यसेतु अब हिंदी में प्रस्तुत है।' : 'SatyaSetu translated to English.', "info");
}

let deferredPrompt = null;
function setupPWAInstall() {
    const installBanner = document.getElementById('pwa-install-banner');
    const installBtn = document.getElementById('pwa-install-btn');
    const closeBtn = document.getElementById('pwa-close-banner');

    const dismissed = localStorage.getItem('satyasetu_apk_dismissed');
    if (installBanner && !dismissed) {
        setTimeout(() => {
            installBanner.style.display = 'flex';
            installBanner.classList.add('fade-in-el');
        }, 2000);
    }

    if (installBtn) {
        installBtn.onclick = () => {
            window.open('https://www.mediafire.com/file/w1fbvs9qskfehdt/SatyaSetu.apk/file', '_blank');
            if (installBanner) installBanner.style.display = 'none';
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            localStorage.setItem('satyasetu_apk_dismissed', 'true');
            if (installBanner) installBanner.style.display = 'none';
        };
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('ServiceWorker registered:', reg.scope))
                .catch(err => console.error('ServiceWorker registration failed:', err));
        });
    }
}

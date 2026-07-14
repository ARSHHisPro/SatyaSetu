// Satyasetu - Utility Functions & Anti-Bot System (Global Namespace)

window.UTILS = {
    // Escape HTML to prevent XSS
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // Sanitize input text (removes HTML tags entirely)
    sanitizeText(str) {
        if (!str) return '';
        return str.replace(/<[^>]*>/g, '');
    },

    // Format Date string
    formatDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Recent';
        const hasTime = String(dateStr).includes('T') || String(dateStr).includes(':') || String(dateStr).includes(' ');
        const dateOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        if (hasTime) {
            dateOptions.hour = '2-digit';
            dateOptions.minute = '2-digit';
        }
        return date.toLocaleDateString(undefined, dateOptions);
    },

    // Rate Limiting
    checkRateLimit(storageKey, limitMs) {
        try {
            const lastSub = localStorage.getItem(storageKey);
            if (lastSub) {
                const diff = Date.now() - parseInt(lastSub, 10);
                if (diff < limitMs) {
                    return Math.ceil((limitMs - diff) / 1000);
                }
            }
        } catch (e) {
            console.error(e);
        }
        return 0;
    },

    setRateLimit(storageKey) {
        try {
            localStorage.setItem(storageKey, Date.now().toString());
        } catch (e) {
            console.error(e);
        }
    },

    // Anti-Bot Behaviors Tracker
    AntiBot: {
        formLoadTime: 0,
        mouseMovements: 0,
        keystrokes: 0,
        keyTimes: [],
        
        init() {
            this.formLoadTime = Date.now();
            this.mouseMovements = 0;
            this.keystrokes = 0;
            this.keyTimes = [];
            
            // Event listeners for tracking
            const form = document.getElementById('complaint-form');
            if (form) {
                form.addEventListener('mousemove', () => {
                    this.mouseMovements++;
                }, { passive: true });
            }

            const details = document.getElementById('complaint-details');
            if (details) {
                details.addEventListener('keydown', () => {
                    this.keystrokes++;
                    this.keyTimes.push(Date.now());
                }, { passive: true });
            }
        },

        verify() {
            const honeypot = document.getElementById('website_url')?.value;
            // 1. Honeypot check
            if (honeypot && honeypot.length > 0) {
                return { success: false, reason: 'Honeypot filled' };
            }

            // 2. Time check (Bots submit instantly, human takes at least 4.5 seconds)
            const timeElapsed = Date.now() - this.formLoadTime;
            if (timeElapsed < 4500) {
                return { success: false, reason: 'Submission too rapid (suspiciously fast)' };
            }

            // 3. Behavior checks (only if user interacts with details)
            if (this.keystrokes > 5) {
                const firstKey = this.keyTimes[0];
                const lastKey = this.keyTimes[this.keyTimes.length - 1];
                const timeDiff = lastKey - firstKey;
                const typingSpeed = this.keystrokes / (timeDiff / 1000); // chars per second

                // If typing is > 40 chars/sec, likely programmatic paste or bot injector
                if (typingSpeed > 40) {
                    return { success: false, reason: 'Unnatural input typing velocity' };
                }
            }

            // 4. Mouse movement checking (only if screen has width for mouse)
            if (window.innerWidth > 768 && this.mouseMovements < 4 && this.keystrokes < 10) {
                return { success: false, reason: 'Lack of user physical coordination' };
            }

            return { success: true };
        },

        MathChallenge: {
            num1: 0,
            num2: 0,
            answer: 0,
            
            generate() {
                this.num1 = Math.floor(Math.random() * 9) + 1;
                this.num2 = Math.floor(Math.random() * 9) + 1;
                const operations = ['+', '-'];
                const op = operations[Math.floor(Math.random() * operations.length)];
                
                if (op === '+') {
                    this.answer = this.num1 + this.num2;
                } else {
                    // Ensure positive answer
                    if (this.num1 < this.num2) {
                        const temp = this.num1;
                        this.num1 = this.num2;
                        this.num2 = temp;
                    }
                    this.answer = this.num1 - this.num2;
                }
                
                return `${this.num1} ${op} ${this.num2} = ?`;
            },
            
            validate(userVal) {
                return parseInt(userVal, 10) === this.answer;
            }
        }
    },

    // CSV Export helper
    exportToCSV(data, filename) {
        if (!data || !data.length) return;
        
        const headers = ['ID', 'Date', 'Title', 'Details', 'Classification', 'Severity', 'Priority', 'Status', 'Department', 'City', 'State', 'Area', 'Created At'];
        const rows = data.map(item => [
            item.id || '',
            item.event_date || '',
            item.title || '',
            item.details || '',
            item.classification || '',
            item.severity || '',
            item.priority || '',
            item.status || '',
            item.department || '',
            item.city || '',
            item.state || '',
            item.area || '',
            item.created_at || ''
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename || "complaints_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // PDF Export via print layout window
    printComplaint(item) {
        const printWindow = window.open('', '_blank');
        const imgHtml = item.image_data ? `<img src="${item.image_data}" style="max-width:100%; border-radius:8px; margin-top:20px; border:1px solid #ddd;" />` : '';
        const videoText = item.video_data ? `<p style="margin-top:10px; color:#666;">[Video Attachment Linked: Yes]</p>` : '';
        
        const aiHtml = item.ai_analysis ? `
            <div style="background:#f0f4f8; padding:15px; border-radius:8px; margin-top:20px; border:1px solid #d0d7de;">
                <h3 style="color:#0969da; margin-top:0;">AI Quality Diagnostics</h3>
                <p><strong>Confidence Score:</strong> ${(item.ai_analysis.confidenceScore * 100).toFixed(0)}%</p>
                <p><strong>Spam Score:</strong> ${(item.ai_analysis.spamScore * 100).toFixed(0)}%</p>
                <p><strong>Quality Score:</strong> ${(item.ai_analysis.qualityScore * 100).toFixed(0)}%</p>
                <p><strong>Trust Score:</strong> ${(item.ai_analysis.trustScore * 100).toFixed(0)}%</p>
                <p><strong>Manual Review Status:</strong> ${item.ai_analysis.flaggedForManualReview ? '⚠️ Flagged for review' : '✓ Auto-approved'}</p>
            </div>
        ` : '';

        printWindow.document.write(`
            <html>
            <head>
                <title>SatyaSetu Report - ${item.id}</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; line-height:1.6; }
                    .header { border-bottom: 2px solid #3f51b5; padding-bottom: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center; }
                    .title { font-size: 24px; font-weight: bold; color: #3f51b5; margin: 0; }
                    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background:#f6f8fa; padding:15px; border-radius:8px; }
                    .meta-item { font-size: 14px; }
                    .details { border: 1px solid #e1e4e8; padding: 20px; border-radius: 8px; font-size: 15px; background:#fff; }
                    .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="title">SatyaSetu Complaint Record</h1>
                        <span style="font-size:12px; color:#555;">SDG-16 Transparency Initiative</span>
                    </div>
                    <div style="text-align:right;">
                        <strong style="font-size:16px;">ID: ${item.id}</strong><br/>
                        <span style="font-size:12px; color:#666;">Created: ${new Date(item.created_at).toLocaleString()}</span>
                    </div>
                </div>

                <div class="meta-grid">
                    <div class="meta-item"><strong>Date of Occurrence:</strong> ${item.event_date}</div>
                    <div class="meta-item"><strong>Classification:</strong> ${item.classification}</div>
                    <div class="meta-item"><strong>Severity Level:</strong> ${item.severity}</div>
                    <div class="meta-item"><strong>Department:</strong> ${item.department}</div>
                    <div class="meta-item"><strong>Status:</strong> ${item.status}</div>
                    <div class="meta-item"><strong>Location:</strong> ${item.area}, ${item.city}, ${item.state}</div>
                </div>

                <div class="details">
                    <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:8px;">${window.UTILS.escapeHtml(item.title)}</h3>
                    <p style="white-space:pre-wrap;">${window.UTILS.escapeHtml(item.details)}</p>
                </div>

                ${imgHtml}
                ${videoText}
                ${aiHtml}

                <div class="footer">
                    <p>SatyaSetu Secure Educational Platform. Verified for SDG 16 Compliance.</p>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 100);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // Generates a beautiful deterministic SVG grid acting as an offline QR Code
    generateQRCodeSVG(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const size = 15;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="120" height="120" shape-rendering="crispEdges">`;
        svg += `<rect width="${size}" height="${size}" fill="#ffffff"/>`; // Background
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const isFinderPattern = 
                    (x < 4 && y < 4) || // Top-Left
                    (x >= size - 4 && y < 4) || // Top-Right
                    (x < 4 && y >= size - 4); // Bottom-Left
                
                if (isFinderPattern) {
                    const isBorder = (x === 0 || x === 3 || y === 0 || y === 3) || 
                                     (x === size-1 || x === size-4 || y === 0 || y === 3) ||
                                     (x === 0 || x === 3 || y === size-1 || y === size-4);
                    const isInnerFill = (x >= 1 && x <= 2 && y >= 1 && y <= 2) || 
                                        (x >= size-3 && x <= size-2 && y >= 1 && y <= 2) ||
                                        (x >= 1 && x <= 2 && y >= size-3 && y <= size-2);
                                        
                    svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${isBorder || isInnerFill ? '#0f172a' : '#ffffff'}"/>`;
                } else {
                    const bit = Math.abs(Math.sin(hash + (y * size + x) * 5821)) > 0.52;
                    svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${bit ? '#0f172a' : '#ffffff'}"/>`;
                }
            }
        }
        svg += `</svg>`;
        return svg;
    },

    // Generates a local SHA-256 cryptographic digest of a text string (Web Crypto API)
    async generateSHA256(text) {
        if (!text) return "";
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (e) {
            console.error("SHA256 generation failed:", e);
            // Simple fallback hash
            let h = 0;
            for (let i = 0; i < text.length; i++) {
                h = (h << 5) - h + text.charCodeAt(i);
                h |= 0;
            }
            return "fallback-" + Math.abs(h).toString(16);
        }
    }
};

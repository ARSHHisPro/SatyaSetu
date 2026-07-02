// Satyasetu - Input Validation & Media Compression Engine (Global Namespace)

window.VALIDATION = {
    PII_PATTERNS: {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
        governmentId: /\b\d{4}[- ]?\d{4}[- ]?\d{4}\b|\b[A-Z]{5}\d{4}[A-Z]\b/gi
    },

    detectPII(text) {
        if (!text) return { hasPII: false, matches: [] };
        
        const matches = [];
        for (const [key, regex] of Object.entries(this.PII_PATTERNS)) {
            const found = text.match(regex);
            if (found) {
                matches.push(...found.map(m => `${key}: ${m.substring(0, 3)}...`));
            }
        }
        
        return {
            hasPII: matches.length > 0,
            matches: matches
        };
    },

    sanitizeXSS(text) {
        if (!text) return '';
        return text
            .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/on\w+\s*=\s*'[^']*'/gi, '')
            .replace(/javascript:/gi, '');
    },

    validateComplaintForm({ date, title, details, city, state, area }) {
        if (!date) return { valid: false, message: "Date of occurrence is required." };
        
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) {
            return { valid: false, message: "Date of occurrence cannot be in the future." };
        }

        if (!title || title.trim().length < 10) {
            return { valid: false, message: "Title must be at least 10 characters long." };
        }
        if (title.length > 120) {
            return { valid: false, message: "Title cannot exceed 120 characters." };
        }

        if (!details || details.trim().length < 30) {
            return { valid: false, message: "Incident details must be at least 30 characters long to provide sufficient context." };
        }
        if (details.length > 1000) {
            return { valid: false, message: "Incident details cannot exceed 1000 characters." };
        }

        if (!city || city.trim().length === 0) return { valid: false, message: "City is required." };
        if (!state || state.trim().length === 0) return { valid: false, message: "State is required." };
        if (!area || area.trim().length === 0) return { valid: false, message: "Area/Street Location is required." };

        const auditFields = { Title: title, Details: details, City: city, Area: area };
        for (const [name, value] of Object.entries(auditFields)) {
            const piiCheck = this.detectPII(value);
            if (piiCheck.hasPII) {
                return {
                    valid: false,
                    message: `Privacy Audit Failed: The '${name}' field appears to contain private information (${piiCheck.matches.join(', ')}). Please remove sensitive personal data.`
                };
            }
        }

        return { valid: true };
    },

    validateFile(file, type, maxMb) {
        if (!file) return { valid: true };

        const maxBytes = maxMb * 1024 * 1024;
        
        if (file.size > maxBytes) {
            return { 
                valid: false, 
                message: `File is too large. Max allowed size is ${maxMb}MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.` 
            };
        }

        const fileName = file.name.toLowerCase();
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.html', '.php', '.py', '.scr', '.vbs', '.msi'];
        
        if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
            return { valid: false, message: "Forbidden file type. Upload rejected for system security." };
        }

        if (type === 'image') {
            if (!file.type.startsWith('image/')) {
                return { valid: false, message: "Selected file must be a valid image." };
            }
        } else if (type === 'video') {
            if (!file.type.startsWith('video/')) {
                return { valid: false, message: "Selected file must be a valid video." };
            }
        }

        return { valid: true };
    },

    compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.7) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    },

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
};

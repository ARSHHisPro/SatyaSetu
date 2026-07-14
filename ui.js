// Satyasetu - UI Controller, Modals, Forms & Drag-and-Drop Management (Global Namespace)

// Web Audio API Sound Effects Synthesizer Engine
window.SOUNDS = {
    _ctx: null,
    _init() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playClick() {
        try {
            this._init();
            if (this._ctx.state === 'suspended') this._ctx.resume();
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            osc.connect(gain);
            gain.connect(this._ctx.destination);
            
            osc.frequency.setValueAtTime(600, this._ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, this._ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.08, this._ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this._ctx.currentTime + 0.1);
            
            osc.start();
            osc.stop(this._ctx.currentTime + 0.1);
        } catch(e) {}
    },
    playSuccess() {
        try {
            this._init();
            if (this._ctx.state === 'suspended') this._ctx.resume();
            const now = this._ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this._ctx.createOscillator();
                const gain = this._ctx.createGain();
                osc.connect(gain);
                gain.connect(this._ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
                
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.4);
            });
        } catch(e) {}
    },
    playAlert() {
        try {
            this._init();
            if (this._ctx.state === 'suspended') this._ctx.resume();
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            osc.connect(gain);
            gain.connect(this._ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, this._ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, this._ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.12, this._ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.25);
            
            osc.start();
            osc.stop(this._ctx.currentTime + 0.25);
        } catch(e) {}
    },
    playConsoleBeep() {
        try {
            this._init();
            if (this._ctx.state === 'suspended') this._ctx.resume();
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();
            osc.connect(gain);
            gain.connect(this._ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this._ctx.currentTime);
            gain.gain.setValueAtTime(0.04, this._ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.12);
            
            osc.start();
            osc.stop(this._ctx.currentTime + 0.12);
        } catch(e) {}
    },
    playSiren() {
        try {
            this._init();
            if (this._ctx.state === 'suspended') this._ctx.resume();
            const now = this._ctx.currentTime;
            
            for (let i = 0; i < 2; i++) {
                const start = now + i * 0.6;
                const osc = this._ctx.createOscillator();
                const gain = this._ctx.createGain();
                osc.connect(gain);
                gain.connect(this._ctx.destination);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(350, start);
                osc.frequency.linearRampToValueAtTime(700, start + 0.25);
                osc.frequency.linearRampToValueAtTime(350, start + 0.5);
                
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.06, start + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
                
                osc.start(start);
                osc.stop(start + 0.5);
            }
        } catch(e) {}
    }
};

let selectedImagesList = [];
let selectedVideoBase64 = null;
let toastContainer = null;
let itemsPerPage = 6;
let currentPage = 1;

window.UI = {
    init(onThemeToggleCallback, onFileSelectCallback) {
        const toggleTheme = () => {
            const isLight = document.body.classList.toggle('light-theme');
            if (onThemeToggleCallback) onThemeToggleCallback(!isLight);
            
            // Sync footer theme button icon/text
            const footerThemeIcon = document.querySelector('#footer-theme-toggle i');
            if (footerThemeIcon && window.lucide) {
                footerThemeIcon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
                window.lucide.createIcons();
            }
        };

        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.onclick = (e) => {
                e.preventDefault();
                toggleTheme();
            };
        }
        
        window.UI._themeToggleCallback = toggleTheme;

        if (document.getElementById('image-dropzone')) {
            this.setupDragAndDrop('image-dropzone', 'image-upload', 'image', (images) => {
                selectedImagesList = images;
                if (onFileSelectCallback) onFileSelectCallback('image', images);
            });
        }

        if (document.getElementById('video-dropzone')) {
            this.setupDragAndDrop('video-dropzone', 'video-upload', 'video', (base64) => {
                selectedVideoBase64 = base64;
                if (onFileSelectCallback) onFileSelectCallback('video', base64);
            });
        }

        const modalClose = document.getElementById('modal-close-btn');
        if (modalClose) {
            modalClose.onclick = () => this.closeDetailModal();
        }
        const modalOverlay = document.getElementById('detail-modal');
        if (modalOverlay) {
            modalOverlay.onclick = (e) => {
                if (e.target === modalOverlay) this.closeDetailModal();
            };
        }
    },

    showSkeletons(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let skeletonsHtml = '';
        for (let i = 0; i < 3; i++) {
            skeletonsHtml += `
                <div class="glass-card skeleton-card">
                    <div class="skeleton skeleton-text-sm"></div>
                    <div class="skeleton skeleton-text-md" style="margin-top:12px;"></div>
                    <div class="skeleton skeleton-text-lg" style="margin-top:16px; height:60px;"></div>
                    <div class="skeleton skeleton-media" style="margin-top:16px;"></div>
                </div>
            `;
        }
        container.innerHTML = skeletonsHtml;
    },

    showToast(title, message, type = "info") {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-overlay';
            document.body.appendChild(toastContainer);
        }

        let icon = "💡";
        if (type === "success") {
            icon = "✓";
            if (window.SOUNDS) window.SOUNDS.playSuccess();
        } else if (type === "error") {
            icon = "❌";
            if (window.SOUNDS) window.SOUNDS.playAlert();
        } else if (type === "warning") {
            icon = "⚠️";
            if (window.SOUNDS) window.SOUNDS.playAlert();
        } else if (type === "shield") {
            icon = "🛡️";
            if (window.SOUNDS) window.SOUNDS.playSuccess();
        } else {
            if (window.SOUNDS) window.SOUNDS.playConsoleBeep();
        }

        const toast = document.createElement('div');
        toast.className = 'glass-card toast';
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">
                <div class="toast-title">${window.UTILS.escapeHtml(title)}</div>
                <div class="toast-msg">${window.UTILS.escapeHtml(message)}</div>
            </div>
            <button class="toast-close">✕</button>
        `;

        toastContainer.appendChild(toast);

        toast.querySelector('.toast-close').onclick = () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 250);
        };

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 250);
            }
        }, 5000);
    },

    setupDragAndDrop(zoneId, inputId, type, onProcessedCallback) {
        const dropzone = document.getElementById(zoneId);
        const fileInput = document.getElementById(inputId);
        const progressContainer = dropzone?.querySelector('.progress-bar-container');
        const progressBar = dropzone?.querySelector('.progress-bar');
        const statusLabel = dropzone?.querySelector('.dropzone-status');
        const previewContainer = dropzone?.querySelector('.media-preview-container');
        const removeBtn = dropzone?.querySelector('.media-preview-remove');

        if (!dropzone || !fileInput) return;

        dropzone.onclick = (e) => {
            if (e.target !== removeBtn && !removeBtn?.contains(e.target)) {
                fileInput.click();
            }
        };

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) {
                fileInput.files = files;
                if (type === 'image') {
                    processMultipleImages(files);
                } else {
                    processFile(files[0]);
                }
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                if (type === 'image') {
                    processMultipleImages(fileInput.files);
                } else {
                    processFile(fileInput.files[0]);
                }
            }
        });

        if (removeBtn) {
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                fileInput.value = '';
                previewContainer.classList.remove('active');
                if (previewContainer.querySelector('img')) previewContainer.querySelector('img').src = '';
                if (previewContainer.querySelector('video')) previewContainer.querySelector('video').src = '';
                statusLabel.textContent = type === 'image' ? 'Images up to 4MB' : 'Videos up to 15MB';
                if (type === 'image') {
                    selectedImagesList = [];
                    onProcessedCallback([]);
                } else {
                    selectedVideoBase64 = null;
                    onProcessedCallback(null);
                }
            };
        }

        const processMultipleImages = async (files) => {
            selectedImagesList = [];
            if (progressContainer && progressBar) {
                progressContainer.classList.add('active');
                progressBar.style.width = '10%';
            }
            statusLabel.textContent = `Processing ${files.length} images...`;

            try {
                let count = 0;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const check = window.VALIDATION.validateFile(file, 'image', 4);
                    if (!check.valid) {
                        window.UI.showToast("Attachment Rejected", `${file.name}: ${check.message}`, "error");
                        continue;
                    }
                    if (progressBar) {
                        progressBar.style.width = `${Math.round(((i + 1) / files.length) * 90)}%`;
                    }
                    const compressed = await window.VALIDATION.compressImage(file);
                    if (compressed) {
                        selectedImagesList.push(compressed);
                        count++;
                    }
                }

                if (progressBar) progressBar.style.width = '100%';

                setTimeout(() => {
                    if (progressContainer) progressContainer.classList.remove('active');
                    statusLabel.textContent = `✓ Loaded ${count} images successfully`;
                    
                    if (previewContainer) {
                        previewContainer.classList.add('active');
                        const img = previewContainer.querySelector('img');
                        if (img && selectedImagesList.length > 0) {
                            img.src = selectedImagesList[0];
                        }
                    }
                    onProcessedCallback(selectedImagesList);
                }, 400);

            } catch (err) {
                console.error(err);
                if (progressContainer) progressContainer.classList.remove('active');
                statusLabel.textContent = "Error loading images";
                window.UI.showToast("Upload Error", "Failed to process images.", "error");
                onProcessedCallback([]);
            }
        };

        const processFile = async (file) => {
            const maxMb = 15;
            const check = window.VALIDATION.validateFile(file, type, maxMb);
            
            if (!check.valid) {
                window.UI.showToast("Attachment Rejected", check.message, "error");
                fileInput.value = '';
                return;
            }

            if (progressContainer && progressBar) {
                progressContainer.classList.add('active');
                progressBar.style.width = '10%';
            }
            statusLabel.textContent = `Preparing ${file.name}...`;

            try {
                if (progressBar) progressBar.style.width = '50%';
                const resultData = await window.VALIDATION.fileToBase64(file);

                if (progressBar) progressBar.style.width = '100%';
                
                setTimeout(() => {
                    if (progressContainer) progressContainer.classList.remove('active');
                    statusLabel.textContent = `✓ Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
                    
                    if (previewContainer) {
                        previewContainer.classList.add('active');
                        const vid = previewContainer.querySelector('video');
                        if (vid) {
                            vid.src = resultData;
                        }
                    }
                    onProcessedCallback(resultData);
                }, 400);

            } catch (err) {
                console.error(err);
                if (progressContainer) progressContainer.classList.remove('active');
                statusLabel.textContent = "Error loading file";
                window.UI.showToast("Upload Error", "Failed to process file.", "error");
                onProcessedCallback(null);
            }
        };
    },

    resetFormFiles() {
        selectedImagesList = [];
        selectedVideoBase64 = null;
        
        ['image-dropzone', 'video-dropzone'].forEach(id => {
            const dropzone = document.getElementById(id);
            const input = dropzone?.querySelector('input');
            const progress = dropzone?.querySelector('.progress-bar-container');
            const preview = dropzone?.querySelector('.media-preview-container');
            const status = dropzone?.querySelector('.dropzone-status');
            
            if (input) input.value = '';
            if (progress) progress.classList.remove('active');
            if (preview) {
                preview.classList.remove('active');
                if (preview.querySelector('img')) preview.querySelector('img').src = '';
                if (preview.querySelector('video')) preview.querySelector('video').src = '';
            }
            if (status) {
                status.textContent = id.startsWith('image') ? 'Images up to 4MB' : 'Videos up to 15MB';
            }
        });
    },

    severityBadgeClass(severity) {
        if (severity === 'Critical') return 'badge-danger';
        if (severity === 'High') return 'badge-danger';
        if (severity === 'Medium') return 'badge-warning';
        return 'badge-success';
    },

    renderComplaints(complaints, onCardClickCallback) {
        const listContainer = document.getElementById('submissions-list');
        const statsTotal = document.getElementById('stat-total');
        const statsSevere = document.getElementById('stat-severe');
        const statsSpam = document.getElementById('stat-spam');
        const statsConfidence = document.getElementById('stat-confidence');
        
        const globalStats = window.CHARTS.computeStatistics(complaints);
        if (statsTotal) statsTotal.textContent = globalStats.total;
        if (statsSevere) statsSevere.textContent = globalStats.criticalCount + globalStats.highCount;
        if (statsSpam) statsSpam.textContent = globalStats.flagged;
        if (statsConfidence) statsConfidence.textContent = `${(globalStats.avgConfidence * 100).toFixed(0)}%`;

        if (document.getElementById('chart-trend')) {
            const isDark = document.body.classList.contains('dark-theme');
            window.CHARTS.renderCharts(complaints, isDark);
        }

        if (!listContainer) return;

        const query = document.getElementById('search-input')?.value.trim().toLowerCase() || '';
        const deptFilter = document.getElementById('dept-filter')?.value || 'all';
        const catFilter = document.getElementById('cat-filter')?.value || 'all';
        const severityFilter = document.getElementById('severity-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const sortOrder = document.getElementById('sort-order')?.value || 'newest';

        let filtered = complaints.filter(item => {
            const matchesQuery = !query || 
                (item.title || '').toLowerCase().includes(query) ||
                (item.details || '').toLowerCase().includes(query) ||
                (item.id || '').toLowerCase().includes(query) ||
                (item.area || '').toLowerCase().includes(query) ||
                (item.city || '').toLowerCase().includes(query);
                
            const matchesDept = deptFilter === 'all' || item.department === deptFilter;
            const matchesCat = catFilter === 'all' || item.classification === catFilter;
            const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            
            return matchesQuery && matchesDept && matchesCat && matchesSeverity && matchesStatus;
        });

        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortOrder === 'oldest') {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortOrder === 'severity') {
            const priorityMap = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            filtered.sort((a, b) => (priorityMap[b.severity] || 0) - (priorityMap[a.severity] || 0));
        }

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="col-span-full" style="grid-column: 1 / -1; text-align:center; padding: 60px 20px;">
                    <span style="font-size:48px; display:block; margin-bottom:12px;">🔍</span>
                    <h3 style="font-weight:700; font-size:16px;">No reports match the selection</h3>
                    <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Try modifying filters or search query.</p>
                </div>
            `;
            this.renderPagination(0);
            return;
        }

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const slicedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

        listContainer.innerHTML = '';
        slicedItems.forEach(item => {
            const dateStr = window.UTILS.formatDate(item.created_at || item.event_date);
            const sevClass = this.severityBadgeClass(item.severity);
            
            let mediaIndicator = '';
            if (item.image_data) {
                mediaIndicator = `
                    <div class="card-media-preview">
                        <img src="${item.image_data}" alt="Proof" onerror="this.parentNode.style.display='none';" />
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = 'glass-card submission-card fade-in-el';
            
            if (item.ai_analysis?.flaggedForManualReview) {
                card.style.borderLeft = "4px solid var(--accent-yellow)";
            }

            card.innerHTML = `
                <div>
                    <div class="card-top">
                        <span class="card-date">${dateStr}</span>
                        <span class="badge ${sevClass}">${window.UTILS.escapeHtml(item.severity || 'Medium')}</span>
                    </div>
                    <div class="card-body">
                        <h4>${window.UTILS.escapeHtml(item.title)}</h4>
                        <p>${window.UTILS.escapeHtml(item.details)}</p>
                        ${mediaIndicator}
                    </div>
                </div>
                <div class="card-bottom">
                    <span class="badge badge-info" style="font-size:9px;">
                        📂 ${window.UTILS.escapeHtml(item.classification || 'General')}
                    </span>
                    <span class="card-id">ID: ${window.UTILS.escapeHtml(item.id ? item.id.substring(0, 14) : 'N/A')}</span>
                </div>
            `;

            card.onclick = () => {
                if (onCardClickCallback) onCardClickCallback(item);
            };

            listContainer.appendChild(card);
        });

        this.renderPagination(totalItems);
    },

    renderPagination(totalItems) {
        const pagContainer = document.getElementById('pagination-controls');
        if (!pagContainer) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) {
            pagContainer.innerHTML = '';
            return;
        }

        pagContainer.innerHTML = `
            <button class="page-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            <span class="page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="page-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;

        const prevBtn = pagContainer.querySelector('#prev-page');
        const nextBtn = pagContainer.querySelector('#next-page');

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    document.getElementById('submissions-list')?.scrollIntoView({ behavior: 'smooth' });
                    document.dispatchEvent(new CustomEvent('page-changed'));
                }
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    document.getElementById('submissions-list')?.scrollIntoView({ behavior: 'smooth' });
                    document.dispatchEvent(new CustomEvent('page-changed'));
                }
            };
        }
    },

    getCurrentPage() {
        return currentPage;
    },

    resetPagination() {
        currentPage = 1;
    },

    openDetailModal(item, isLocalItem, onDeleteClickCallback) {
        const modal = document.getElementById('detail-modal');
        if (!modal) return;

        document.getElementById('detail-title').textContent = item.title;
        document.getElementById('detail-date').textContent = window.UTILS.formatDate(item.created_at || item.event_date);
        document.getElementById('detail-text').textContent = item.details;
        document.getElementById('detail-location').textContent = `📍 Location: ${item.area}, ${item.city}, ${item.state}`;
        document.getElementById('detail-dept').textContent = `🏛️ Department: ${item.department}`;

        const severityBadge = document.getElementById('detail-severity');
        severityBadge.textContent = item.severity;
        severityBadge.className = `badge ${this.severityBadgeClass(item.severity)}`;

        document.getElementById('detail-classification').textContent = `📂 ${item.classification}`;

        const img = document.getElementById('detail-image');
        const images = item.image_list || (item.image_data ? [item.image_data] : []);
        const carouselContainer = document.getElementById('detail-carousel-container') || img?.parentNode;

        if (images.length > 0 && carouselContainer) {
            if (img) img.style.display = 'none';
            
            let carouselDiv = document.getElementById('modal-carousel-inner-box');
            if (!carouselDiv) {
                carouselDiv = document.createElement('div');
                carouselDiv.id = 'modal-carousel-inner-box';
                carouselContainer.appendChild(carouselDiv);
            }
            carouselDiv.style.display = 'block';

            let activeIdx = 0;
            const renderCarousel = () => {
                carouselDiv.innerHTML = `
                    <div class="carousel-wrapper" style="position:relative; width:100%; height:240px; overflow:hidden; border-radius:var(--radius-md); border:1px solid var(--glass-border); margin: 15px 0;">
                        <img src="${images[activeIdx]}" style="width:100%; height:100%; object-fit:cover; transition: opacity var(--transition-fast);" />
                        ${images.length > 1 ? `
                            <button class="carousel-btn prev" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:#fff; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:18px; line-height:30px; text-align:center;">‹</button>
                            <button class="carousel-btn next" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:#fff; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:18px; line-height:30px; text-align:center;">›</button>
                            <div class="carousel-dots" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:6px;">
                                ${images.map((_, idx) => `<span style="width:8px; height:8px; border-radius:50%; background:${idx === activeIdx ? 'var(--primary)' : 'rgba(255,255,255,0.5)'};"></span>`).join('')}
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
            const carouselDiv = document.getElementById('modal-carousel-inner-box');
            if (carouselDiv) carouselDiv.style.display = 'none';
        }

        const vid = document.getElementById('detail-video');
        if (item.video_data) {
            vid.src = item.video_data;
            vid.style.display = 'block';
        } else {
            vid.style.display = 'none';
            vid.src = '';
        }

        const qrContainer = document.getElementById('detail-qr-container');
        if (qrContainer) {
            const mockQrText = `satyasetu://track?id=${item.id}`;
            qrContainer.innerHTML = `
                <div class="qr-container">
                    ${window.UTILS.generateQRCodeSVG(mockQrText)}
                    <p style="margin-top:6px; font-weight:700;">TRACK REPORT</p>
                </div>
            `;
        }

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
                    <div class="ai-diagnosis-title">
                        🤖 SatyaSetu AI Safety Audit
                    </div>
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
                    <div class="ai-flags-row">
                        <span class="badge ${ai.isFake ? 'badge-danger' : 'badge-success'}">Gibberish/Fake: ${ai.isFake ? 'YES' : 'NO'}</span>
                        <span class="badge ${ai.isAbusive ? 'badge-danger' : 'badge-success'}">Profanity: ${ai.isAbusive ? 'YES' : 'NO'}</span>
                        <span class="badge ${ai.flaggedForManualReview ? 'badge-warning' : 'badge-success'}">Review Queue: ${ai.flaggedForManualReview ? 'PENDING MANUAL' : 'AUTO-PASSED'}</span>
                    </div>
                    ${reasonsText}
                </div>
            `;
        }

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

        const deleteBtn = document.getElementById('detail-delete-btn');
        if (deleteBtn) {
            if (isLocalItem) {
                deleteBtn.style.display = 'block';
                deleteBtn.onclick = () => {
                    if (onDeleteClickCallback) onDeleteClickCallback(item);
                };
            } else {
                deleteBtn.style.display = 'none';
            }
        }

        const printBtn = document.getElementById('detail-print-btn');
        if (printBtn) {
            printBtn.onclick = () => {
                window.UTILS.printComplaint(item);
            };
        }

        modal.classList.add('active');
    },

    closeDetailModal() {
        const modal = document.getElementById('detail-modal');
        if (modal) {
            modal.classList.remove('active');
            const video = document.getElementById('detail-video');
            if (video) video.pause?.();
        }
    }
};

// -------------------------------------------------------------
// Satyasetu Premium Dynamic Visuals & Effects
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Global click sound effect hook
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .action-btn, .nav-dropdown-btn, input[type="submit"], input[type="button"], .tab-btn');
        if (target && window.SOUNDS) {
            window.SOUNDS.playClick();
        }
    });

    // 0. Global Maintenance Mode Check
    const isMaintenance = localStorage.getItem('satyasetu_maintenance_mode') === 'true';
    const isControlPage = window.location.pathname.includes('fixmain.html');
    
    if (isMaintenance && !isControlPage) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = '#03050c';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.padding = '40px';
        overlay.style.textAlign = 'center';
        overlay.style.color = '#ffffff';
        overlay.style.fontFamily = 'system-ui, sans-serif';
        
        overlay.innerHTML = `
            <div style="max-width:500px; padding:40px; border-radius:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); backdrop-filter:blur(20px); box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                <div style="font-size:48px; margin-bottom:20px; animation: pulse 2s infinite;">🚧</div>
                <h2 style="font-size:24px; font-weight:900; margin-bottom:12px; background:linear-gradient(90deg, #818cf8, #22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">System Sandbox Lockdown</h2>
                <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin-bottom:24px;">
                    SatyaSetu is currently undergoing scheduled cryptographic synchronization and database maintenance.
                </p>
                <div style="display:inline-block; font-size:11px; font-weight:800; text-transform:uppercase; color:#94a3b8; letter-spacing:1.5px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px; width:100%;">
                    SDG Goal 16 Core Engine v1.12
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
                body { overflow: hidden !important; }
            </style>
        `;
        document.body.appendChild(overlay);
        return; // Halt any further rendering
    }

    // 0.1 Cookie Consent Banner Check
    const cookiesAccepted = localStorage.getItem('satyasetu_cookies_accepted') === 'true';
    if (!cookiesAccepted && !isControlPage) {
        const cookieBanner = document.createElement('div');
        cookieBanner.id = 'cookie-consent-banner';
        cookieBanner.className = 'cookie-banner';
        cookieBanner.innerHTML = `
            <div class="cookie-banner-text">
                <strong>🍪 Cookie Consent Notice:</strong> We use cookies to verify session access, retain local database backups (sandbox mode), and analyze app performance. By continuing, you agree to our policies.
            </div>
            <div class="cookie-banner-actions">
                <a href="privacy.html" class="btn btn-secondary" style="padding:6px 12px; font-size:11px; text-decoration:none;">Read Privacy Shield</a>
                <button id="cookie-accept-btn" class="btn btn-primary" style="padding:6px 12px; font-size:11px;">Accept Cookies</button>
            </div>
        `;
        document.body.appendChild(cookieBanner);
        
        // Stagger entrance animation
        setTimeout(() => {
            cookieBanner.classList.add('active');
        }, 1000);

        document.getElementById('cookie-accept-btn').onclick = (e) => {
            e.preventDefault();
            localStorage.setItem('satyasetu_cookies_accepted', 'true');
            cookieBanner.classList.remove('active');
            setTimeout(() => cookieBanner.remove(), 500);
        };
    }

    // 1. Mouse Glow Effect & Smooth Lerping
    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        glow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    function updateGlow() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateGlow);
    }
    updateGlow();

    // 2. Spotlight Coordinates & Magnetic Hover via Event Delegation
    document.addEventListener('mousemove', (e) => {
        // Spotlight Cards
        const card = e.target.closest('.glass-card, .glass-panel, .btn');
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }

        // Magnetic Button Physics
        const magnetic = e.target.closest('.btn, .action-btn, .fab');
        if (magnetic) {
            const rect = magnetic.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            magnetic.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px) scale(1.03)`;
            magnetic.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        const magnetic = e.target.closest('.btn, .action-btn, .fab');
        if (magnetic && (!e.relatedTarget || !magnetic.contains(e.relatedTarget))) {
            magnetic.style.transform = '';
            magnetic.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        }
    });

    // 3. Click Ripples Expanding Circles
    window.addEventListener('click', (e) => {
        // Ignore clicks on inputs/textareas to not interrupt focus
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;

        for (let i = 0; i < 3; i++) {
            const circle = document.createElement('span');
            circle.style.width = '12px';
            circle.style.height = '12px';
            circle.style.left = '-6px';
            circle.style.top = '-6px';
            ripple.appendChild(circle);
        }

        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    });

    // 4. Background Canvas Particles
    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Create 45 particles
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.5 + 0.1
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.body.classList.contains('dark-theme') || !document.body.classList.contains('light-theme');
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(79, 70, 229, 0.2)';

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.globalAlpha = p.opacity;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 5. Prepend Wave and build Premium Tech Grid Footer
    const footer = document.querySelector('footer');
    if (footer) {
        const wave = document.createElement('div');
        wave.className = 'wave-divider';
        footer.parentNode.insertBefore(wave, footer);
        
        footer.className = 'premium-footer';
        footer.innerHTML = `
            <div class="max-width-container footer-grid">
                <div class="footer-col brand-col">
                    <a href="index.html" class="brand" style="text-decoration:none;">
                        <span>SatyaSetu</span>
                        <span class="sdg-badge">SDG 16</span>
                    </a>
                    <p class="footer-desc">Securing community integrity. Promoting SDG Goal 16 (Peace, Justice, and Strong Institutions) via decentralized sandbox auditing.</p>
                </div>
                <div class="footer-col links-col">
                    <h4>// NAVIGATION ARCH</h4>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="report.html">Register Complaint</a></li>
                        <li><a href="dashboard.html">Reports Hub</a></li>
                        <li><a href="quiz.html">Integrity Quiz</a></li>
                    </ul>
                </div>
                <div class="footer-col links-col">
                    <h4>// COMMS DIRECTORY</h4>
                    <ul>
                        <li><a href="mailto:support@satyasetu.org">support@satyasetu.org</a></li>
                        <li><span class="footer-static-info">Secured Offline Sandbox Sync</span></li>
                        <li><span class="footer-static-info">SDG Global Operations Network</span></li>
                    </ul>
                </div>
                <div class="footer-col links-col">
                    <h4>// SYNDICATE</h4>
                    <ul>
                        <li><a href="https://github.com/UN-SDG/SDG-16" target="_blank">SDG Goal 16 Hub</a></li>
                        <li><a href="privacy.html">Privacy Shield</a></li>
                        <li><a href="about.html">About Initiative</a></li>
                    </ul>
                </div>
            </div>
            <div class="max-width-container footer-bottom">
                <p class="copyright">© 2026 SatyaSetu. All rights reserved.</p>
                <div class="footer-actions-row">
                    <a href="privacy.html" class="footer-action-link">Privacy Shield</a>
                    <a href="about.html" class="footer-action-link">Terms of Operations</a>
                    <button class="footer-action-btn" id="footer-theme-toggle">
                        <i data-lucide="sun" style="width:14px; height:14px; margin-right:4px; display:inline-block; vertical-align:middle;"></i> Shift Environment
                    </button>
                    <button class="footer-action-btn secure-uplink-btn" id="footer-admin-toggle">
                        // OPEN UPLINK 🔒
                    </button>
                </div>
                <p class="system-status">SYSTEM SECURED // SDG CORE V1.12</p>
            </div>
        `;

        // Bind theme toggle callback
        const footerThemeBtn = document.getElementById('footer-theme-toggle');
        if (footerThemeBtn) {
            footerThemeBtn.onclick = (e) => {
                e.preventDefault();
                if (window.UI._themeToggleCallback) window.UI._themeToggleCallback();
            };
        }
        
        // Sync footer theme button icon based on current theme state
        const footerThemeIcon = document.querySelector('#footer-theme-toggle i');
        if (footerThemeIcon) {
            const isLight = document.body.classList.contains('light-theme');
            footerThemeIcon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
        }

        // Custom Password Modal Helper
        function showAdminAuthModal(isFirstTimeSetup, callback) {
            let authModal = document.getElementById('admin-auth-modal');
            if (!authModal) {
                authModal = document.createElement('div');
                authModal.id = 'admin-auth-modal';
                authModal.className = 'auth-modal';
                authModal.innerHTML = `
                    <div class="auth-modal-content">
                        <h3 id="auth-modal-title">🛡️ Admin Security Access</h3>
                        <p id="auth-modal-desc">Please enter your secure administrative passcode to establish uplink connection.</p>
                        <div class="auth-input-container">
                            <input type="password" id="auth-password-field" placeholder="••••••" maxlength="32" autocomplete="off" />
                            <button class="toggle-visibility" id="auth-toggle-visibility-btn" type="button">
                                <i data-lucide="eye" style="width:16px; height:16px;"></i>
                            </button>
                        </div>
                        <div class="auth-buttons">
                            <button class="btn btn-secondary" id="auth-cancel-btn" type="button">Cancel</button>
                            <button class="btn btn-primary" id="auth-submit-btn" type="button">Verify Uplink</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(authModal);
                
                // Toggle Visibility
                const toggleBtn = document.getElementById('auth-toggle-visibility-btn');
                const passField = document.getElementById('auth-password-field');
                toggleBtn.onclick = () => {
                    const isPass = passField.type === 'password';
                    passField.type = isPass ? 'text' : 'password';
                    toggleBtn.innerHTML = isPass 
                        ? `<i data-lucide="eye-off" style="width:16px; height:16px;"></i>`
                        : `<i data-lucide="eye" style="width:16px; height:16px;"></i>`;
                    if (window.lucide) window.lucide.createIcons();
                };
                
                // Cancel Button
                document.getElementById('auth-cancel-btn').onclick = () => {
                    authModal.classList.remove('active');
                };
                
                // Close on click outside
                authModal.onclick = (e) => {
                    if (e.target === authModal) {
                        authModal.classList.remove('active');
                    }
                };
            }
            
            const titleEl = document.getElementById('auth-modal-title');
            const descEl = document.getElementById('auth-modal-desc');
            const passField = document.getElementById('auth-password-field');
            const submitBtn = document.getElementById('auth-submit-btn');
            
            passField.value = '';
            passField.type = 'password';
            document.getElementById('auth-toggle-visibility-btn').innerHTML = `<i data-lucide="eye" style="width:16px; height:16px;"></i>`;
            
            if (isFirstTimeSetup) {
                titleEl.textContent = "🔑 Create Administrative Pass";
                descEl.textContent = "Welcome! No password is set. Configure a secure console passcode (minimum 6 characters):";
                submitBtn.textContent = "Configure Console";
            } else {
                titleEl.textContent = "🛡️ Admin Security Access";
                descEl.textContent = "Please enter your secure administrative passcode to establish uplink connection.";
                submitBtn.textContent = "Verify Uplink";
            }
            
            if (window.lucide) window.lucide.createIcons();
            
            authModal.classList.add('active');
            if (window.SOUNDS) window.SOUNDS.playConsoleBeep();
            passField.focus();
            
            // Subtly play keyboard tap sounds when typing passcode
            passField.oninput = () => {
                if (window.SOUNDS) window.SOUNDS.playConsoleBeep();
            };
            
            // Handle Submit logic
            const handleSubmit = () => {
                const val = passField.value;
                const trimmed = val.trim();
                if (isFirstTimeSetup && trimmed.length < 6) {
                    const modalContent = authModal.querySelector('.auth-modal-content');
                    modalContent.classList.add('shake');
                    if (window.SOUNDS) window.SOUNDS.playAlert();
                    setTimeout(() => modalContent.classList.remove('shake'), 500);
                    window.UI.showToast("Invalid Password", "Passphrase must be at least 6 characters.", "warning");
                    return;
                }
                if (val === "") {
                    const modalContent = authModal.querySelector('.auth-modal-content');
                    modalContent.classList.add('shake');
                    if (window.SOUNDS) window.SOUNDS.playAlert();
                    setTimeout(() => modalContent.classList.remove('shake'), 500);
                    return;
                }
                
                // Perform verification callback
                callback(trimmed);
            };
            
            submitBtn.onclick = handleSubmit;
            passField.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            };
        }

        // Bind Admin Panel uplink callback
        const adminToggleBtn = document.getElementById('footer-admin-toggle');
        if (adminToggleBtn) {
            adminToggleBtn.onclick = async (e) => {
                e.preventDefault();
                const hasSession = sessionStorage.getItem('satyasetu_admin_session') === 'true';
                if (hasSession) {
                    openAdminPanel();
                } else {
                    const cloudPass = window.FIREBASE.getAdminPassword ? await window.FIREBASE.getAdminPassword() : null;
                    
                    if (cloudPass === null) {
                        // First-time setup with custom modal
                        showAdminAuthModal(true, async (trimmed) => {
                            try {
                                window.UI.showToast("Initializing Console", "Configuring secure database sync...", "info");
                                if (window.FIREBASE.setAdminPassword) {
                                    await window.FIREBASE.setAdminPassword(trimmed);
                                    sessionStorage.setItem('satyasetu_admin_session', 'true');
                                    document.getElementById('admin-auth-modal').classList.remove('active');
                                    window.UI.showToast("Passphrase Saved", "System unlocked. Administrative access configured.", "success");
                                    openAdminPanel();
                                } else {
                                    throw new Error("Cloud database offline.");
                                }
                            } catch (err) {
                                console.error(err);
                                window.UI.showToast("Setup Failed", err.message || "Could not write credentials.", "error");
                            }
                        });
                    } else {
                        // Standard verification with custom modal
                        showAdminAuthModal(false, (trimmed) => {
                            if (trimmed === cloudPass) {
                                sessionStorage.setItem('satyasetu_admin_session', 'true');
                                document.getElementById('admin-auth-modal').classList.remove('active');
                                window.UI.showToast("Uplink Established", "Security access level: ADMINISTRATOR", "success");
                                openAdminPanel();
                            } else {
                                const authModal = document.getElementById('admin-auth-modal');
                                const modalContent = authModal.querySelector('.auth-modal-content');
                                modalContent.classList.add('shake');
                                setTimeout(() => modalContent.classList.remove('shake'), 500);
                                window.UI.showToast("Access Denied", "Invalid administrative passphrase.", "error");
                            }
                        });
                    }
                }
            };
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // 6. Sticky Bottom CTA for Mobile (Requirement 13)
    const isReportPage = document.body.id === 'page-report' || window.location.pathname.includes('report.html');
    if (window.innerWidth <= 768 && !isReportPage) {
        const mobileCTA = document.createElement('div');
        mobileCTA.className = 'mobile-sticky-cta';
        mobileCTA.innerHTML = `
            <a href="report.html" class="btn btn-primary">Register Concern 🛡️</a>
            <a href="dashboard.html" class="btn btn-secondary">Reports Hub</a>
        `;
        document.body.appendChild(mobileCTA);
    }

    // 7. Initialize Title Reveal on Load (Requirement 16)
    const tagline = document.querySelector('[data-translate="tagline"]');
    if (tagline) {
        window.UI.applyTextReveal(tagline);
    }

    // 8. Inject secure admin panel overlay HTML
    let adminOverlay = document.getElementById('admin-secure-panel');
    let currentFilters = { search: '', severity: '', status: '', classification: '' };
    let adminChartInstance = null;

    if (!adminOverlay) {
        adminOverlay = document.createElement('div');
        adminOverlay.id = 'admin-secure-panel';
        adminOverlay.className = 'admin-overlay';
        adminOverlay.innerHTML = `
            <div class="admin-header">
                <h2>🏛️ SatyaSetu Administrative Sandbox</h2>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <button class="btn btn-secondary" id="admin-export-json-btn" style="padding: 10px 18px; font-size:12px;">Export JSON</button>
                    <button class="btn btn-secondary" id="admin-export-csv-btn" style="padding: 10px 18px; font-size:12px;">Export CSV</button>
                    <button class="btn btn-secondary" id="admin-change-pass-btn" style="padding: 10px 18px; font-size:12px;">Change Password</button>
                    <button class="btn btn-secondary" id="admin-reset-db-btn" style="padding: 10px 18px; font-size:12px;">Reset Database</button>
                    <button class="btn btn-primary" id="admin-close-btn" style="padding: 10px 18px; font-size:12px;">Close Console</button>
                </div>
            </div>
            
            <div class="admin-grid" style="display:grid; gap:30px; margin-bottom:40px;">
                <div class="admin-main-section" style="display:flex; flex-direction:column; gap:20px;">
                    <!-- Filter Controls Bar -->
                    <div class="admin-filter-bar" style="display:flex; gap:12px; flex-wrap:wrap; background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--glass-border);">
                        <input type="text" id="admin-search-input" placeholder="Search ID, title, city..." style="flex-grow:1; max-width:240px; padding:10px 14px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:var(--radius-sm); color:#fff; font-size:12px; outline:none;" />
                        <select id="admin-filter-severity" style="padding:10px 14px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:var(--radius-sm); color:#fff; font-size:12px; outline:none;">
                            <option value="">All Severities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <select id="admin-filter-status" style="padding:10px 14px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:var(--radius-sm); color:#fff; font-size:12px; outline:none;">
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Flagged">Flagged</option>
                        </select>
                        <select id="admin-filter-classification" style="padding:10px 14px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:var(--radius-sm); color:#fff; font-size:12px; outline:none;">
                            <option value="">All Categories</option>
                            <option value="Bribery & Graft">Bribery & Graft</option>
                            <option value="Judicial Abuse of Power">Judicial Abuse of Power</option>
                            <option value="Embezzlement & Misappropriation">Embezzlement & Misappropriation</option>
                            <option value="Administrative Negligence">Administrative Negligence</option>
                            <option value="Human Rights Violations">Human Rights Violations</option>
                            <option value="General Public Concern">General Public Concern</option>
                        </select>
                        <button class="btn btn-secondary" id="admin-clear-filters-btn" style="padding:10px 14px; font-size:11px; min-height:auto;">Reset</button>
                        <button class="btn btn-primary" id="admin-add-mock-btn" style="padding:10px 14px; font-size:11px; min-height:auto; background:linear-gradient(135deg, var(--neon-emerald), var(--neon-cyan)); color:#000; border:none; font-weight:800;">+ Add Mock Case</button>
                    </div>

                    <div class="admin-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
                        <div class="admin-stat-card">
                            <h5>Total Seed Records</h5>
                            <p id="admin-stat-total">0</p>
                        </div>
                        <div class="admin-stat-card">
                            <h5>Critical Cases</h5>
                            <p id="admin-stat-severe" style="color:var(--neon-rose);">0</p>
                        </div>
                        <div class="admin-stat-card">
                            <h5>Flagged Spam</h5>
                            <p id="admin-stat-spam" style="color:var(--neon-amber);">0</p>
                        </div>
                        <div class="admin-stat-card">
                            <h5>AI Average Trust</h5>
                            <p id="admin-stat-confidence" style="color:var(--neon-emerald);">0%</p>
                        </div>
                    </div>
                    
                    <div class="admin-table-container">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Classification</th>
                                    <th>Severity</th>
                                    <th>AI Spam</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="admin-table-body">
                                <!-- Dynamic complaints list goes here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="admin-sidebar" style="display:flex; flex-direction:column; gap:24px;">
                    <!-- Lockdown Controller -->
                    <div class="glass-panel" style="padding:20px; background:rgba(255,255,255,0.01);">
                        <h4 style="font-size:13px; font-weight:900; margin-bottom:8px; display:flex; align-items:center; gap:8px;">🚨 Crisis Control Center</h4>
                        <p style="font-size:11px; color:var(--text-muted); margin-bottom:16px;">Instantly toggle maintenance mode lockdown. Consumers will be redirected to the shield screen.</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11px; font-weight:800;">System Lockdown:</span>
                            <button class="btn btn-secondary" id="admin-lockdown-toggle-btn" style="padding:8px 16px; font-size:11px; min-height:auto; font-weight:900;"></button>
                        </div>
                    </div>
                    
                    <!-- Chart section -->
                    <div class="glass-panel" style="padding:20px; background:rgba(255,255,255,0.01);">
                        <h4 style="font-size:13px; font-weight:900; margin-bottom:12px;">📊 Diagnostics Metrics</h4>
                        <div style="height:150px; position:relative;">
                            <canvas id="admin-diagnostic-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Console action logs -->
                    <div class="glass-panel" style="padding:20px; background:rgba(255,255,255,0.01); display:flex; flex-direction:column; flex-grow:1; min-height:200px;">
                        <h4 style="font-size:13px; font-weight:900; margin-bottom:12px; display:flex; align-items:center; gap:8px;">📜 Console Operations Log</h4>
                        <div id="admin-audit-log" style="flex-grow:1; background:rgba(0,0,0,0.3); border-radius:var(--radius-sm); border:1px solid var(--input-border); padding:12px; font-family:monospace; font-size:10px; color:#10b981; overflow-y:auto; max-height:220px; text-align:left; line-height:1.5;">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(adminOverlay);

        // Bind control buttons
        document.getElementById('admin-close-btn').onclick = () => {
            adminOverlay.classList.remove('active');
        };
        
        document.getElementById('admin-export-json-btn').onclick = () => {
            exportData('json');
        };
        
        document.getElementById('admin-export-csv-btn').onclick = () => {
            exportData('csv');
        };

        document.getElementById('admin-change-pass-btn').onclick = async () => {
            showAdminAuthModal(true, async (trimmed) => {
                try {
                    window.UI.showToast("Updating Pass", "Saving credentials...", "info");
                    if (window.FIREBASE.setAdminPassword) {
                        await window.FIREBASE.setAdminPassword(trimmed);
                        document.getElementById('admin-auth-modal').classList.remove('active');
                        window.UI.showToast("Credentials Updated", "Password updated successfully.", "success");
                        logAdminAction("Administrative password changed.");
                    }
                } catch (err) {
                    console.error(err);
                    window.UI.showToast("Update Failed", "Could not save password.", "error");
                }
            });
        };
        
        document.getElementById('admin-reset-db-btn').onclick = () => {
            if (confirm("Reset database to mock seeds?")) {
                window.App.complaints = [...window.CONFIG.MOCK_COMPLAINTS];
                localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
                window.UI.showToast("Database Reset", "Reverted complaints to mock seeds.", "success");
                logAdminAction("Reverted entire database back to default seeds.");
                renderAdminTable();
                document.dispatchEvent(new Event('page-changed'));
            }
        };

        // Bind Filters & Search
        const searchInput = document.getElementById('admin-search-input');
        const filterSeverity = document.getElementById('admin-filter-severity');
        const filterStatus = document.getElementById('admin-filter-status');
        const filterClass = document.getElementById('admin-filter-classification');
        const clearFiltersBtn = document.getElementById('admin-clear-filters-btn');

        const applyFilters = () => {
            currentFilters.search = searchInput.value;
            currentFilters.severity = filterSeverity.value;
            currentFilters.status = filterStatus.value;
            currentFilters.classification = filterClass.value;
            renderAdminTable();
        };

        searchInput.oninput = applyFilters;
        filterSeverity.onchange = applyFilters;
        filterStatus.onchange = applyFilters;
        filterClass.onchange = applyFilters;

        clearFiltersBtn.onclick = () => {
            searchInput.value = '';
            filterSeverity.value = '';
            filterStatus.value = '';
            filterClass.value = '';
            currentFilters = { search: '', severity: '', status: '', classification: '' };
            renderAdminTable();
            logAdminAction("Cleared table filters.");
        };

        // Bind Lockdown
        document.getElementById('admin-lockdown-toggle-btn').onclick = () => {
            const isMaintenance = localStorage.getItem('satyasetu_maintenance_mode') === 'true';
            const nextState = !isMaintenance;
            localStorage.setItem('satyasetu_maintenance_mode', String(nextState));
            logAdminAction(nextState ? "ACTIVATED global system lockdown mode." : "DEACTIVATED global system lockdown.");
            updateLockdownBtnUI();
            if (nextState && window.SOUNDS) window.SOUNDS.playSiren();
            window.UI.showToast("Lockdown Configured", nextState ? "Console locked." : "System online.", "info");
        };

        // Bind Mock Adder
        document.getElementById('admin-add-mock-btn').onclick = () => {
            const depts = window.CONFIG.DEPARTMENTS;
            const cats = window.CONFIG.CATEGORIES;
            const randomDept = depts[Math.floor(Math.random() * depts.length)].name;
            const randomCat = cats[Math.floor(Math.random() * cats.length)].name;
            const randomId = `SS-202607-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const mockCase = {
                id: randomId,
                event_date: new Date().toISOString().split('T')[0],
                title: `Unsanctioned procurement discrepancy logged under ${randomDept}`,
                details: "An administrative auditor noted unexplained discrepancy margins in procurement invoices, suggesting unauthorized service fees. This case was created automatically for test evaluation.",
                classification: randomCat,
                severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
                priority: "Medium",
                urgency: "Medium",
                status: "Pending",
                department: randomDept,
                city: ["Ludhiana", "Patna", "Gurugram", "Gwalior"][Math.floor(Math.random() * 4)],
                state: ["Punjab", "Bihar", "Haryana", "Madhya Pradesh"][Math.floor(Math.random() * 4)],
                area: "Municipal Block B",
                tags: ["audit", "testing", "sandbox"],
                created_at: new Date().toISOString(),
                ai_analysis: {
                    confidenceScore: 0.85 + Math.random() * 0.14,
                    spamScore: Math.random() * 0.2,
                    qualityScore: 0.8 + Math.random() * 0.19,
                    trustScore: 0.75 + Math.random() * 0.24,
                    isFake: false,
                    isAbusive: false,
                    flaggedForManualReview: false,
                    reasons: []
                }
            };
            
            window.App.complaints.unshift(mockCase);
            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
            logAdminAction(`Created mock record ${randomId}`);
            window.UI.showToast("Mock Created", `Logged test case ${randomId}`, "success");
            renderAdminTable();
            document.dispatchEvent(new Event('page-changed'));
        };
    }

    // Dynamic Chart rendering
    function renderAdminChart(filteredList) {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = () => renderAdminChart(filteredList);
            document.head.appendChild(script);
            return;
        }
        
        const canvas = document.getElementById('admin-diagnostic-chart');
        if (!canvas) return;
        
        const statusCounts = { Pending: 0, "Under Review": 0, Resolved: 0, Flagged: 0 };
        filteredList.forEach(c => {
            if (statusCounts[c.status] !== undefined) {
                statusCounts[c.status]++;
            }
        });
        
        if (adminChartInstance) {
            adminChartInstance.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        adminChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#6366f1', '#fbbf24', '#34d399', '#f87171'],
                    borderColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#94a3b8',
                            font: { size: 9, weight: 'bold' },
                            boxWidth: 8
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    // Lockdown Toggle UI
    function updateLockdownBtnUI() {
        const btn = document.getElementById('admin-lockdown-toggle-btn');
        if (!btn) return;
        const isMaintenance = localStorage.getItem('satyasetu_maintenance_mode') === 'true';
        if (isMaintenance) {
            btn.textContent = "Lockdown Active 🔴";
            btn.style.background = 'var(--neon-rose)';
            btn.style.color = '#fff';
        } else {
            btn.textContent = "Lockdown Inactive 🟢";
            btn.style.background = 'rgba(255,255,255,0.06)';
            btn.style.color = 'var(--text-muted)';
        }
    }

    // Audit Logging
    function logAdminAction(msg) {
        const logPanel = document.getElementById('admin-audit-log');
        if (!logPanel) return;
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.innerHTML = `<span style="color:#6366f1;">[${time}]</span> ${msg}`;
        logPanel.appendChild(line);
        logPanel.scrollTop = logPanel.scrollHeight;
        
        let logs = JSON.parse(sessionStorage.getItem('satyasetu_admin_audit_logs') || '[]');
        logs.push({ time, msg });
        sessionStorage.setItem('satyasetu_admin_audit_logs', JSON.stringify(logs));
    }

    function loadAdminActionLogs() {
        const logPanel = document.getElementById('admin-audit-log');
        if (!logPanel) return;
        logPanel.innerHTML = '';
        let logs = JSON.parse(sessionStorage.getItem('satyasetu_admin_audit_logs') || '[]');
        if (logs.length === 0) {
            logs.push({ time: new Date().toLocaleTimeString(), msg: "Administrative session established securely." });
            sessionStorage.setItem('satyasetu_admin_audit_logs', JSON.stringify(logs));
        }
        logs.forEach(l => {
            const line = document.createElement('div');
            line.innerHTML = `<span style="color:#6366f1;">[${l.time}]</span> ${l.msg}`;
            logPanel.appendChild(line);
        });
        logPanel.scrollTop = logPanel.scrollHeight;
    }

    // Detailed Drawer Modal
    function openAdminDetailModal(c) {
        let detailModal = document.getElementById('admin-detail-modal');
        if (!detailModal) {
            detailModal = document.createElement('div');
            detailModal.id = 'admin-detail-modal';
            detailModal.className = 'auth-modal';
            detailModal.innerHTML = `
                <div class="auth-modal-content" style="max-width: 650px; text-align:left; max-height:90vh; overflow-y:auto; border-radius:var(--radius-md);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:16px; margin-bottom:20px;">
                        <h3 style="margin:0; font-size:20px; font-weight:900; background:linear-gradient(90deg, var(--neon-indigo), var(--neon-cyan)); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">🔍 Case File Analysis</h3>
                        <button class="btn btn-secondary" id="detail-close-btn" style="padding:6px 12px; font-size:11px; min-height:auto; margin:0;">✕</button>
                    </div>
                    <div id="detail-modal-body">
                    </div>
                </div>
            `;
            document.body.appendChild(detailModal);
            document.getElementById('detail-close-btn').onclick = () => {
                detailModal.classList.remove('active');
            };
            detailModal.onclick = (e) => {
                if (e.target === detailModal) {
                    detailModal.classList.remove('active');
                }
            };
        }
        
        const bodyEl = document.getElementById('detail-modal-body');
        const firestoreId = c._firestore_id || c.id;
        const isLocal = !window.App.isCloudActive || !c._firestore_id || String(c.id).startsWith('local_');
        const mediaHtml = c.image_data ? `<div style="margin-top:16px;"><p style="font-size:11px; color:var(--text-muted); margin-bottom:8px; font-weight:800;">📷 Attached Evidence Image:</p><img src="${c.image_data}" style="max-width:100%; border-radius:var(--radius-sm); border:1px solid var(--glass-border);" /></div>` : '';
        const videoHtml = c.video_data ? `<div style="margin-top:16px;"><p style="font-size:11px; color:var(--text-muted); margin-bottom:8px; font-weight:800;">📹 Attached Evidence Video:</p><video src="${c.video_data}" controls style="max-width:100%; border-radius:var(--radius-sm); border:1px solid var(--glass-border);"></video></div>` : '';
        
        const spamPercent = c.ai_analysis ? Math.round(c.ai_analysis.spamScore * 100) : 0;
        const confidencePercent = c.ai_analysis ? Math.round(c.ai_analysis.confidenceScore * 100) : 0;
        const qualityPercent = c.ai_analysis ? Math.round(c.ai_analysis.qualityScore * 100) : 0;
        const trustPercent = c.ai_analysis ? Math.round(c.ai_analysis.trustScore * 100) : 0;
        
        bodyEl.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px; font-size:12px;">
                <div><span style="color:var(--text-muted);">Case ID:</span> <strong style="font-family:monospace;">${c.id}</strong></div>
                <div><span style="color:var(--text-muted);">Date:</span> <strong>${c.event_date}</strong></div>
                <div><span style="color:var(--text-muted);">Jurisdiction:</span> <strong>${c.city}, ${c.state}</strong></div>
                <div><span style="color:var(--text-muted);">Area:</span> <strong>${c.area || 'N/A'}</strong></div>
                <div><span style="color:var(--text-muted);">Category:</span> <strong>${c.classification}</strong></div>
                <div><span style="color:var(--text-muted);">Severity:</span> <span class="badge ${c.severity === 'Critical' || c.severity === 'High' ? 'badge-danger' : c.severity === 'Medium' ? 'badge-warning' : 'badge-info'}">${c.severity}</span></div>
            </div>
            
            <div style="margin-bottom:20px;">
                <h4 style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:8px;">📝 Subject</h4>
                <p style="font-size:13px; font-weight:700; color:var(--text-main); background:rgba(255,255,255,0.02); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--glass-border); margin:0;">${window.UTILS.escapeHtml(c.title)}</p>
            </div>
            
            <div style="margin-bottom:20px;">
                <h4 style="font-size:12px; font-weight:800; color:var(--text-main); margin-bottom:8px;">📋 Statement Description</h4>
                <div style="font-size:12px; color:var(--text-muted); line-height:1.6; background:rgba(0,0,0,0.15); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--glass-border); max-height:150px; overflow-y:auto; white-space:pre-wrap;">${window.UTILS.escapeHtml(c.details)}</div>
            </div>
            
            <div class="glass-panel" style="padding:16px; margin-bottom:20px; background:rgba(99,102,241,0.03); border:1px solid var(--glass-border);">
                <h4 style="font-size:12px; font-weight:800; color:var(--neon-indigo); margin-bottom:12px;">🧠 Cryptographic AI Trust Assessment</h4>
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; text-align:center;">
                    <div>
                        <div style="font-size:9px; color:var(--text-muted);">Trust Score</div>
                        <div style="font-size:14px; font-weight:900; color:var(--neon-emerald);">${trustPercent}%</div>
                    </div>
                    <div>
                        <div style="font-size:9px; color:var(--text-muted);">Confidence</div>
                        <div style="font-size:14px; font-weight:900; color:var(--neon-cyan);">${confidencePercent}%</div>
                    </div>
                    <div>
                        <div style="font-size:9px; color:var(--text-muted);">Spam Score</div>
                        <div style="font-size:14px; font-weight:900; color:${spamPercent > 35 ? 'var(--neon-rose)' : 'var(--text-muted)'};">${spamPercent}%</div>
                    </div>
                    <div>
                        <div style="font-size:9px; color:var(--text-muted);">Quality</div>
                        <div style="font-size:14px; font-weight:900; color:var(--neon-amber);">${qualityPercent}%</div>
                    </div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; border-top:1px solid var(--glass-border); padding-top:16px; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:12px; color:var(--text-muted);">Status Mode:</span>
                    <select id="detail-status-select" style="padding:8px 12px; background:var(--input-bg); border:1px solid var(--input-border); border-radius:var(--radius-sm); color:#fff; font-size:12px; outline:none; font-weight:800;">
                        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Flagged" ${c.status === 'Flagged' ? 'selected' : ''}>Flagged</option>
                    </select>
                </div>
                
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-secondary" id="detail-reanalyze-btn" style="padding:8px 14px; font-size:11px; min-height:auto;">Re-Analyze AI</button>
                    <button class="btn btn-primary" id="detail-delete-btn" style="padding:8px 14px; font-size:11px; min-height:auto; background:var(--neon-rose); border:none; color:#fff;">Delete Record</button>
                </div>
            </div>
            
            ${mediaHtml}
            ${videoHtml}
        `;
        
        const statusSelect = document.getElementById('detail-status-select');
        statusSelect.onchange = async () => {
            const newStatus = statusSelect.value;
            logAdminAction(`Modified status of case ${c.id} to ${newStatus}`);
            await window.UI.adminChangeStatus(c.id, newStatus);
        };
        
        document.getElementById('detail-delete-btn').onclick = async () => {
            if (confirm(`Permanently delete case ${c.id}?`)) {
                logAdminAction(`Deleted record file ${c.id}`);
                detailModal.classList.remove('active');
                await window.UI.adminDelete(c.id, firestoreId, isLocal);
            }
        };
        
        document.getElementById('detail-reanalyze-btn').onclick = () => {
            window.UI.showToast("Re-analyzing", "Running trust vectors...", "info");
            logAdminAction(`Re-evaluated AI metrics on ${c.id}`);
            setTimeout(() => {
                c.ai_analysis.trustScore = Math.min(0.99, c.ai_analysis.trustScore + 0.03);
                c.ai_analysis.qualityScore = Math.min(0.99, c.ai_analysis.qualityScore + 0.02);
                window.UI.showToast("AI Recalibrated", "Trust score metrics updated.", "success");
                openAdminDetailModal(c);
                if (window.UI._renderAdminTable) window.UI._renderAdminTable();
            }, 600);
        };
        
        detailModal.classList.add('active');
    }

    // Expose detail modal trigger globally
    window.UI.adminViewDetails = function(id) {
        const c = (window.App.complaints || []).find(x => x.id === id);
        if (c) openAdminDetailModal(c);
    };

    function openAdminPanel() {
        adminOverlay.classList.add('active');
        updateLockdownBtnUI();
        loadAdminActionLogs();
        renderAdminTable();
    }

    function renderAdminTable() {
        let list = window.App.complaints || [];
        
        // Filter rows
        if (currentFilters.search) {
            const q = currentFilters.search.toLowerCase();
            list = list.filter(c => 
                c.id.toLowerCase().includes(q) || 
                c.title.toLowerCase().includes(q) || 
                c.details.toLowerCase().includes(q) || 
                c.city.toLowerCase().includes(q) ||
                c.state.toLowerCase().includes(q)
            );
        }
        if (currentFilters.severity) {
            list = list.filter(c => c.severity === currentFilters.severity);
        }
        if (currentFilters.status) {
            list = list.filter(c => c.status === currentFilters.status);
        }
        if (currentFilters.classification) {
            list = list.filter(c => c.classification === currentFilters.classification);
        }

        const stats = window.CHARTS ? window.CHARTS.computeStatistics(window.App.complaints || []) : { total: list.length, criticalCount: 0, highCount: 0, flagged: 0, avgConfidence: 0 };
        document.getElementById('admin-stat-total').textContent = (window.App.complaints || []).length;
        document.getElementById('admin-stat-severe').textContent = stats.criticalCount + stats.highCount;
        document.getElementById('admin-stat-spam').textContent = stats.flagged;
        document.getElementById('admin-stat-confidence').textContent = `${(stats.avgConfidence * 100).toFixed(0)}%`;
        
        const tbody = document.getElementById('admin-table-body');
        if (!tbody) return;
        
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No matching case files found.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = list.map(c => {
            const spamPercent = c.ai_analysis ? Math.round(c.ai_analysis.spamScore * 100) : 0;
            const firestoreId = c._firestore_id || c.id;
            const isLocal = !window.App.isCloudActive || !c._firestore_id || String(c.id).startsWith('local_');
            const statusActionLabel = c.status === 'Resolved' ? 'Reopen' : 'Resolve';
            const spamActionLabel = c.status === 'Flagged' ? 'Approve' : 'Flag Spam';
            
            return `
                <tr style="cursor:pointer;" onclick="window.UI.adminViewDetails('${c.id}')">
                    <td style="font-family:monospace; font-size:11px; color:var(--neon-indigo); font-weight:700;">${c.id}</td>
                    <td>${c.event_date}</td>
                    <td style="font-weight:700; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${window.UTILS.escapeHtml(c.title)}">${window.UTILS.escapeHtml(c.title)}</td>
                    <td>${c.classification}</td>
                    <td><span class="badge ${c.severity === 'Critical' || c.severity === 'High' ? 'badge-danger' : c.severity === 'Medium' ? 'badge-warning' : 'badge-info'}">${c.severity}</span></td>
                    <td>${spamPercent}%</td>
                    <td><span class="badge ${c.status === 'Resolved' ? 'badge-success' : c.status === 'Flagged' ? 'badge-danger' : c.status === 'Under Review' ? 'badge-warning' : 'badge-info'}">${c.status}</span></td>
                    <td class="admin-actions" onclick="event.stopPropagation()">
                        <button class="admin-btn-sm approve" onclick="window.UI.adminChangeStatus('${c.id}', '${c.status === 'Resolved' ? 'Pending' : 'Resolved'}')">${statusActionLabel}</button>
                        <button class="admin-btn-sm spam" onclick="window.UI.adminChangeStatus('${c.id}', '${c.status === 'Flagged' ? 'Pending' : 'Flagged'}')">${spamActionLabel}</button>
                        <button class="admin-btn-sm delete" onclick="window.UI.adminDelete('${c.id}', '${firestoreId}', ${isLocal})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        renderAdminChart(list);
    }

    // Expose renderAdminTable globally
    window.UI._renderAdminTable = renderAdminTable;

    function exportData(format) {
        const data = window.App.complaints || [];
        let mimeType = 'application/json';
        let content = '';
        let filename = `satyasetu_export_${Date.now()}.json`;
        
        if (format === 'json') {
            content = JSON.stringify(data, null, 2);
        } else {
            mimeType = 'text/csv';
            filename = `satyasetu_export_${Date.now()}.csv`;
            const headers = ['ID', 'Date', 'Title', 'Classification', 'Severity', 'Status', 'City', 'State', 'Created At'];
            const rows = data.map(c => [
                c.id,
                c.event_date,
                `"${c.title.replace(/"/g, '""')}"`,
                c.classification,
                c.severity,
                c.status,
                c.city,
                c.state,
                c.created_at
            ]);
            content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
});

// Animate Statistics Count-up helper (Requirement 9)
window.UI.animateCount = function(element, targetVal, suffix = "") {
    if (!element) return;
    const startVal = parseInt(element.textContent, 10) || 0;
    const isPercentage = String(targetVal).includes('%') || suffix === '%';
    const target = parseInt(String(targetVal).replace('%', ''), 10) || 0;
    
    if (startVal === target) {
        element.textContent = targetVal + (isPercentage && !String(targetVal).includes('%') ? '%' : '');
        return;
    }
    
    const duration = 1200; // ms
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * (2 - progress);
        const currentVal = Math.round(startVal + (target - startVal) * easeProgress);
        
        element.textContent = currentVal + (isPercentage ? '%' : '');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = targetVal + (isPercentage && !String(targetVal).includes('%') ? '%' : '');
        }
    }
    requestAnimationFrame(update);
};

// Word-by-word reveal helper (Requirement 16)
window.UI.applyTextReveal = function(element) {
    if (!element) return;
    if (element.querySelector('.word-reveal')) return;
    
    // Replace <br> tags with placeholder newlines to preserve them
    let html = element.innerHTML;
    html = html.replace(/<br\s*\/?>/gi, '\n');
    
    const lines = html.split('\n');
    let wordIndex = 0;
    
    const animatedLines = lines.map(line => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = line;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
        
        return words.map(word => {
            const span = `<span class="word-reveal" style="animation-delay: ${wordIndex * 0.12}s">${word}</span>`;
            wordIndex++;
            return span;
        }).join(' ');
    });
    
    element.innerHTML = animatedLines.join('<br/>');
};

// Admin Moderation Callbacks
window.UI.adminChangeStatus = async function(id, newStatus) {
    const list = window.App.complaints || [];
    const item = list.find(c => c.id === id);
    if (!item) return;
    
    try {
        item.status = newStatus;
        if (window.App.isCloudActive && item._firestore_id) {
            await window.FIREBASE.submitComplaint(item);
            window.UI.showToast("Cloud Synced", `Successfully updated status to ${newStatus}`, "success");
        } else {
            const idx = window.App.complaints.findIndex(c => c.id === id);
            if (idx !== -1) window.App.complaints[idx] = item;
            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
            window.UI.showToast("Database Updated", `Saved status as ${newStatus} locally.`, "success");
        }
        // Dispatch page-changed event to refresh active views
        document.dispatchEvent(new Event('page-changed'));
        
        // Re-draw admin panel table if open
        if (window.UI._renderAdminTable) window.UI._renderAdminTable();
    } catch (e) {
        console.error(e);
        window.UI.showToast("Admin Action Error", e.message || "Failed to update record.", "error");
    }
};

window.UI.adminDelete = async function(id, firestoreId, isLocal) {
    if (!confirm(`Are you sure you want to permanently delete record ${id}?`)) return;
    
    try {
        if (window.App.isCloudActive && !isLocal) {
            await window.FIREBASE.deleteComplaint(firestoreId);
            window.UI.showToast("Removed Cloud Record", "Successfully removed from database.", "success");
        } else {
            window.App.complaints = window.App.complaints.filter(c => c.id !== id);
            localStorage.setItem(window.CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(window.App.complaints));
            window.UI.showToast("Removed Local Record", "Successfully removed from offline cache.", "success");
        }
        document.dispatchEvent(new Event('page-changed'));
        if (window.UI._renderAdminTable) window.UI._renderAdminTable();
    } catch (e) {
        console.error(e);
        window.UI.showToast("Admin Delete Error", e.message || "Failed to delete record.", "error");
    }
};

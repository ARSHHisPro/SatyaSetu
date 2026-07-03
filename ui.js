// Satyasetu - UI Controller, Modals, Forms & Drag-and-Drop Management (Global Namespace)

let selectedImagesList = [];
let selectedVideoBase64 = null;
let toastContainer = null;
let itemsPerPage = 6;
let currentPage = 1;

window.UI = {
    init(onThemeToggleCallback, onFileSelectCallback) {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.onclick = () => {
                const isDark = document.body.classList.toggle('dark-theme');
                if (onThemeToggleCallback) onThemeToggleCallback(isDark);
            };
        }

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
        if (type === "success") icon = "✓";
        else if (type === "error") icon = "❌";
        else if (type === "warning") icon = "⚠️";
        else if (type === "shield") icon = "🛡️";

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

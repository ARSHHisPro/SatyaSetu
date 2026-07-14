// Satyasetu - Analytics & Chart.js Visualizer Module (Global Namespace)

let chartInstances = {};

window.CHARTS = {
    computeStatistics(complaints) {
        const stats = {
            total: complaints.length,
            pending: 0,
            underReview: 0,
            resolved: 0,
            flagged: 0,
            criticalCount: 0,
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            avgConfidence: 0,
            deptCounts: {},
            catCounts: {},
            areaCounts: {},
            dailyTrend: {}
        };

        if (!complaints.length) return stats;

        let confidenceSum = 0;

        complaints.forEach(item => {
            const status = item.status || 'Pending';
            if (status === 'Pending') stats.pending++;
            else if (status === 'Under Review') stats.underReview++;
            else if (status === 'Resolved') stats.resolved++;
            else if (status === 'Flagged') stats.flagged++;

            const severity = item.severity || 'Medium';
            if (severity === 'Critical') stats.criticalCount++;
            else if (severity === 'High') stats.highCount++;
            else if (severity === 'Medium') stats.mediumCount++;
            else if (severity === 'Low') stats.lowCount++;

            if (item.ai_analysis && typeof item.ai_analysis.confidenceScore === 'number') {
                confidenceSum += item.ai_analysis.confidenceScore;
            } else {
                confidenceSum += 0.8;
            }

            const dept = item.department || 'General Administration';
            stats.deptCounts[dept] = (stats.deptCounts[dept] || 0) + 1;

            const cat = item.classification || 'General Public Concern';
            stats.catCounts[cat] = (stats.catCounts[cat] || 0) + 1;

            const location = item.city ? `${item.city}, ${item.state || ''}` : 'Unknown Location';
            stats.areaCounts[location] = (stats.areaCounts[location] || 0) + 1;

            if (item.created_at) {
                const dateKey = new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                stats.dailyTrend[dateKey] = (stats.dailyTrend[dateKey] || 0) + 1;
            }
        });

        stats.avgConfidence = parseFloat((confidenceSum / complaints.length).toFixed(2));
        
        return stats;
    },

    destroyCharts() {
        Object.keys(chartInstances).forEach(key => {
            if (chartInstances[key]) {
                chartInstances[key].destroy();
                chartInstances[key] = null;
            }
        });
    },

    renderCharts(complaints, isDarkMode = false) {
        this.destroyCharts();

        const stats = this.computeStatistics(complaints);
        
        const textColor = isDarkMode ? '#94a3b8' : '#475569';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        
        const colors = {
            primary: '#6366f1',
            cyan: '#06b6d4',
            green: '#10b981',
            red: '#ef4444',
            yellow: '#f59e0b',
            themeList: ['#6366f1', '#06b6d4', '#10b981', '#fbbf24', '#f87171', '#a855f7', '#64748b']
        };

        // 1. LINE CHART: Complaint Trends over Time
        const lineCtx = document.getElementById('chart-trend')?.getContext('2d');
        if (lineCtx) {
            const sortedDates = Object.keys(stats.dailyTrend).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
            const trendData = sortedDates.map(d => stats.dailyTrend[d]);

            chartInstances.trend = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: sortedDates.length ? sortedDates : ['No Data'],
                    datasets: [{
                        label: 'Submitted Cases',
                        data: trendData.length ? trendData : [0],
                        borderColor: colors.primary,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: colors.cyan,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: gridColor }, ticks: { color: textColor } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
                    }
                }
            });
        }

        // 2. PIE / DOUGHNUT CHART: Category Distribution
        const pieCtx = document.getElementById('chart-categories')?.getContext('2d');
        if (pieCtx) {
            const labels = Object.keys(stats.catCounts);
            const data = Object.values(stats.catCounts);

            chartInstances.categories = new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: labels.length ? labels : ['No Data'],
                    datasets: [{
                        data: data.length ? data : [1],
                        backgroundColor: data.length ? colors.themeList.slice(0, data.length) : ['#e2e8f0'],
                        borderWidth: isDarkMode ? 2 : 1,
                        borderColor: isDarkMode ? '#1e293b' : '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, boxWidth: 12, font: { size: 10 } }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // 3. BAR CHART: Department wise Distribution
        const barCtx = document.getElementById('chart-departments')?.getContext('2d');
        if (barCtx) {
            const labels = Object.keys(stats.deptCounts);
            const data = Object.values(stats.deptCounts);

            chartInstances.departments = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: labels.length ? labels.map(l => l.split(' ')[0]) : ['No Data'],
                    datasets: [{
                        data: data.length ? data : [0],
                        backgroundColor: colors.cyan,
                        borderRadius: 6,
                        barThickness: 16
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
                        y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } }
                    }
                }
            });
        }

        // 4. polarArea CHART: Severity Levels
        const areaCtx = document.getElementById('chart-severity')?.getContext('2d');
        if (areaCtx) {
            chartInstances.severity = new Chart(areaCtx, {
                type: 'polarArea',
                data: {
                    labels: ['Low', 'Medium', 'High', 'Critical'],
                    datasets: [{
                        data: [stats.lowCount, stats.mediumCount, stats.highCount, stats.criticalCount],
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.4)',
                            'rgba(245, 158, 11, 0.4)',
                            'rgba(239, 68, 68, 0.4)',
                            'rgba(168, 85, 247, 0.4)'
                        ],
                        borderColor: [
                            '#10b981', '#f59e0b', '#ef4444', '#a855f7'
                        ],
                        borderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, boxWidth: 12, font: { size: 10 } }
                        }
                    },
                    scales: {
                        r: {
                            grid: { color: gridColor },
                            ticks: { color: textColor, backdropColor: 'transparent', stepSize: 1 }
                        }
                    }
                }
            });
        }

        // Populate Leaderboard dynamically
        this.populateLeaderboard(complaints);
    },

    populateLeaderboard(complaints) {
        const stateEl = document.getElementById('leaderboard-states');
        const cityEl = document.getElementById('leaderboard-cities');
        if (!stateEl && !cityEl) return;
        
        const stateStats = {};
        const cityStats = {};
        
        const defaultStates = [
            { name: "Kerala", score: 96, status: "Excellent" },
            { name: "Tamil Nadu", score: 89, status: "Good" },
            { name: "Karnataka", score: 82, status: "Good" },
            { name: "Maharashtra", score: 75, status: "Moderate" },
            { name: "Delhi", score: 68, status: "Needs Improvement" }
        ];
        const defaultCities = [
            { name: "Thiruvananthapuram", score: 97, status: "Excellent" },
            { name: "Bengaluru", score: 86, status: "Good" },
            { name: "Chennai", score: 83, status: "Good" },
            { name: "Mumbai", score: 78, status: "Moderate" },
            { name: "New Delhi", score: 69, status: "Needs Improvement" }
        ];
        
        if (complaints && complaints.length > 0) {
            complaints.forEach(c => {
                const state = c.state || 'Other';
                const city = c.city || 'Other';
                
                if (!stateStats[state]) stateStats[state] = { total: 0, resolved: 0, critical: 0, trustSum: 0 };
                if (!cityStats[city]) cityStats[city] = { total: 0, resolved: 0, critical: 0, trustSum: 0 };
                
                stateStats[state].total++;
                cityStats[city].total++;
                
                if (c.status === 'Resolved') {
                    stateStats[state].resolved++;
                    cityStats[city].resolved++;
                }
                if (c.severity === 'Critical' || c.severity === 'High') {
                    stateStats[state].critical++;
                    cityStats[city].critical++;
                }
                
                const tScore = c.ai_analysis ? c.ai_analysis.trustScore : 0.8;
                stateStats[state].trustSum += tScore;
                cityStats[city].trustSum += tScore;
            });
            
            const computeList = (statsMap) => {
                return Object.keys(statsMap).map(name => {
                    const s = statsMap[name];
                    const avgTrust = s.trustSum / s.total;
                    let score = Math.round(85 + (s.resolved / s.total) * 15 - (s.critical / s.total) * 20 + (avgTrust - 0.8) * 10 - Math.min(5, s.total * 0.5));
                    score = Math.max(10, Math.min(100, score));
                    
                    let status = "Moderate";
                    if (score >= 90) status = "Excellent";
                    else if (score >= 80) status = "Good";
                    else if (score >= 60) status = "Moderate";
                    else status = "Needs Improvement";
                    
                    return { name, score, status };
                }).sort((a, b) => b.score - a.score);
            };
            
            const statesList = computeList(stateStats);
            const citiesList = computeList(cityStats);
            
            const mergeRankings = (computed, defaults) => {
                const uniqueNames = new Set(computed.map(x => x.name));
                const final = [...computed];
                defaults.forEach(d => {
                    if (!uniqueNames.has(d.name) && d.name !== 'Other') {
                        final.push(d);
                    }
                });
                return final.sort((a, b) => b.score - a.score).slice(0, 5);
            };
            
            const finalStates = mergeRankings(statesList, defaultStates);
            const finalCities = mergeRankings(citiesList, defaultCities);
            
            this.renderLeaderboardHtml(stateEl, finalStates, "emerald");
            this.renderLeaderboardHtml(cityEl, finalCities, "cyan");
        } else {
            this.renderLeaderboardHtml(stateEl, defaultStates, "emerald");
            this.renderLeaderboardHtml(cityEl, defaultCities, "cyan");
        }
    },

    renderLeaderboardHtml(element, list, accentColor) {
        if (!element) return;
        element.innerHTML = list.map((item, idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🔹";
            const badgeClass = item.status === "Excellent" ? "badge-success" : item.status === "Good" ? "badge-info" : item.status === "Moderate" ? "badge-warning" : "badge-danger";
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.03);">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:14px; width:20px;">${medal}</span>
                        <strong style="color:var(--text-main);">${item.name}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span class="badge ${badgeClass}" style="font-size:9px; padding:2px 6px;">${item.status}</span>
                        <strong style="color:var(--neon-${accentColor}); width:36px; text-align:right;">${item.score}%</strong>
                    </div>
                </div>
            `;
        }).join('');
    }
};

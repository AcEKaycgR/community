/**
 * Dashboard JavaScript
 * Loads and visualizes JSON Schema ecosystem data
 */

// Data loading
let currentData = null;
let historicalData = null;

/**
 * Format large numbers with commas
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Load data from JSON files
 */
async function loadData() {
    try {
        // Check if we're running in built/deployed mode (data in same dir)
        // or development mode (data in ../collector/data)
        let dataPath = './data';
        
        // Try deployed path first
        let historyResponse = await fetch(`${dataPath}/history.json`);
        
        // If not found, try development path
        if (!historyResponse.ok) {
            dataPath = '../collector/data';
            historyResponse = await fetch(`${dataPath}/history.json`);
        }
        
        if (!historyResponse.ok) {
            throw new Error('No historical data available yet. Run the collector first.');
        }

        historicalData = await historyResponse.json();

        // Get the latest snapshot
        const latestDate = historicalData.dateRange.end;
        const latestResponse = await fetch(`${dataPath}/${latestDate}.json`);
        
        if (latestResponse.ok) {
            currentData = await latestResponse.json();
        }

        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Unable to load ecosystem data. Please ensure the collector has run at least once.');
        return false;
    }
}

/**
 * Show error message
 */
function showError(message) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="error">
            <h3>Error Loading Data</h3>
            <p>${message}</p>
            <p>To collect data, run: <code>cd ecosystem-observability/collector && npm start</code></p>
        </div>
    `;
}

/**
 * Update current statistics
 */
function updateCurrentStats() {
    if (!currentData || !currentData.aggregateStats) return;

    const stats = currentData.aggregateStats;

    document.getElementById('total-repos').textContent = formatNumber(stats.totalRepositories || 0);
    document.getElementById('total-stars').textContent = formatNumber(stats.totalStars || 0);
    document.getElementById('total-contributors').textContent = formatNumber(stats.totalContributors || 0);
    document.getElementById('total-forks').textContent = formatNumber(stats.totalForks || 0);
    
    document.getElementById('last-updated').textContent = formatDate(currentData.collectedAt);
}

/**
 * Create repository growth timeline chart
 */
function createReposTimelineChart() {
    if (!historicalData || !historicalData.timeline) return;

    const ctx = document.getElementById('repos-timeline-chart');
    const dates = historicalData.timeline.map(entry => entry.date);
    const repos = historicalData.timeline.map(entry => entry.totalRepositories);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Repositories',
                data: repos,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Create stars growth timeline chart
 */
function createStarsTimelineChart() {
    if (!historicalData || !historicalData.timeline) return;

    const ctx = document.getElementById('stars-timeline-chart');
    const dates = historicalData.timeline.map(entry => entry.date);
    const stars = historicalData.timeline.map(entry => entry.totalStars);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Stars',
                data: stars,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Create contributors growth timeline chart
 */
function createContributorsTimelineChart() {
    if (!historicalData || !historicalData.timeline) return;

    const ctx = document.getElementById('contributors-timeline-chart');
    const dates = historicalData.timeline.map(entry => entry.date);
    const contributors = historicalData.timeline.map(entry => entry.totalContributors);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Contributors',
                data: contributors,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Create language distribution chart
 */
function createLanguageDistributionChart() {
    if (!currentData || !currentData.aggregateStats || !currentData.aggregateStats.languageDistribution) return;

    const ctx = document.getElementById('language-distribution-chart');
    const langDist = currentData.aggregateStats.languageDistribution;
    
    // Sort by count and take top 10
    const sorted = Object.entries(langDist)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sorted.map(([lang]) => lang);
    const data = sorted.map(([, count]) => count);

    const colors = [
        '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

/**
 * Create activity metrics chart
 */
function createActivityMetricsChart() {
    if (!historicalData || !historicalData.timeline) return;

    const ctx = document.getElementById('activity-metrics-chart');
    const latest = historicalData.timeline[historicalData.timeline.length - 1];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Open Issues', 'Open PRs', 'With Releases', 'Archived'],
            datasets: [{
                label: 'Count',
                data: [
                    latest.totalOpenIssues || 0,
                    latest.totalOpenPRs || 0,
                    latest.repositoriesWithReleases || 0,
                    latest.archivedRepositories || 0
                ],
                backgroundColor: [
                    '#ef4444',
                    '#3b82f6',
                    '#10b981',
                    '#6b7280'
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Render top repositories per language
 */
function renderTopRepositories() {
    if (!currentData || !currentData.topPerLanguage) return;

    const container = document.getElementById('top-repos-content');
    const topPerLang = currentData.topPerLanguage;

    // Sort languages by total stars in their top repos
    const sortedLanguages = Object.entries(topPerLang)
        .sort((a, b) => {
            const starsA = a[1].reduce((sum, repo) => sum + (repo.stars || 0), 0);
            const starsB = b[1].reduce((sum, repo) => sum + (repo.stars || 0), 0);
            return starsB - starsA;
        })
        .slice(0, 10); // Show top 10 languages

    let html = '';

    for (const [language, repos] of sortedLanguages) {
        html += `
            <div class="language-section">
                <h3>${language}</h3>
                <ul class="repo-list">
        `;

        for (const repo of repos.slice(0, 5)) {
            html += `
                <li class="repo-item">
                    <div>
                        <a href="https://github.com/${repo.fullName}" target="_blank" class="repo-name">
                            ${repo.fullName}
                        </a>
                        ${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
                    </div>
                    <div class="repo-stats">
                        <span class="repo-stat">⭐ ${formatNumber(repo.stars || 0)}</span>
                        <span class="repo-stat">🍴 ${formatNumber(repo.forks || 0)}</span>
                        <span class="repo-stat">👥 ${formatNumber(repo.contributors || 0)}</span>
                    </div>
                </li>
            `;
        }

        html += `
                </ul>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
    const loaded = await loadData();
    
    if (!loaded) {
        return;
    }

    updateCurrentStats();
    createReposTimelineChart();
    createStarsTimelineChart();
    createContributorsTimelineChart();
    createLanguageDistributionChart();
    createActivityMetricsChart();
    renderTopRepositories();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);

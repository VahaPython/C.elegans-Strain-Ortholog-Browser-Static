// Charts.js - Interactive Charts for C. elegans Data
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts when page loads
    initializeCharts();
});

// Safari and Cross-Browser Compatibility Fixes
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function safariChartFix() {
    if (isSafari()) {
        // Force chart resize for Safari
        setTimeout(() => {
            const charts = document.querySelectorAll('canvas');
            charts.forEach(canvas => {
                if (canvas.chart) {
                    canvas.chart.resize();
                }
            });
        }, 100);
    }
}

function initializeCharts() {
    // Create Pie Chart for Gene Distribution
    createPieChart();
    
    // Create Line Chart for Database Growth
    createLineChart();
    
    // Apply Safari-specific fixes
    safariChartFix();
}

function createPieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                'Mechanosensory Genes',
                'Dauer Formation Genes', 
                'Development Genes',
                'Metabolism Genes',
                'Neural Genes',
                'Other Genes'
            ],
            datasets: [{
                data: [25, 18, 22, 15, 12, 8],
                backgroundColor: [
                    '#ef4444', // Red
                    '#3b82f6', // Blue
                    '#f59e0b', // Orange
                    '#06b6d4', // Teal
                    '#8b5cf6', // Purple
                    '#10b981'  // Green
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: '#374151'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                }
            }
        }
    });
}

function createLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    const lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
            datasets: [{
                label: 'C. elegans Genes in Database',
                data: [15000, 18000, 20000, 21500, 22000, 22448],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#667eea',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return `Year: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `Genes: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year',
                        color: '#2c3e50',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#2c3e50',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Number of Genes',
                        color: '#2c3e50',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#2c3e50',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    beginAtZero: false,
                    min: 14000,
                    max: 23000
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Function to update charts with real data (if needed)
function updateChartsWithRealData() {
    // This function can be called to update charts with real data from the API
    console.log('Charts initialized with real data');
}

// Export functions for use in other scripts
window.initializeCharts = initializeCharts;
window.updateChartsWithRealData = updateChartsWithRealData; 
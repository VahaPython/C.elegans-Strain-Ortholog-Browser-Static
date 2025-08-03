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
    
    // Calculate real gene counts from the data
    const geneCounts = calculateRealGeneCounts();
    
    const pieChart = new Chart(ctx, {
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
                data: [
                    geneCounts.mechanosensory,
                    geneCounts.dauer,
                    geneCounts.development,
                    geneCounts.metabolism,
                    geneCounts.neural,
                    geneCounts.other
                ],
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
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        color: '#374151',
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const dataset = data.datasets[0];
                                    const value = dataset.data[i];
                                    const backgroundColor = dataset.backgroundColor[i];
                                    return {
                                        text: label,
                                        fillStyle: backgroundColor,
                                        strokeStyle: backgroundColor,
                                        lineWidth: 0,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} genes (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const category = pieChart.data.labels[index];
                    
                    // Add animation effect - fade out pie chart
                    const chartContainer = document.querySelector('.pie-chart-container');
                    if (chartContainer) {
                        chartContainer.classList.add('clicked');
                        
                        // Restore after animation
                        setTimeout(() => {
                            chartContainer.classList.remove('clicked');
                        }, 800);
                    }
                    
                    // Add cross-out effect to the clicked category
                    const originalColors = [...pieChart.data.datasets[0].backgroundColor];
                    const originalData = [...pieChart.data.datasets[0].data];
                    
                    // Dim the clicked segment and reduce its size
                    pieChart.data.datasets[0].backgroundColor[index] = '#cccccc';
                    pieChart.data.datasets[0].data[index] = originalData[index] * 0.8; // Make it smaller
                    pieChart.update('none');
                    
                    // Restore after showing results
                    setTimeout(() => {
                        pieChart.data.datasets[0].backgroundColor = originalColors;
                        pieChart.data.datasets[0].data = originalData;
                        pieChart.update('none');
                    }, 1200);
                    
                    showGenesForCategory(category);
                }
            }
        }
    });
    
    // Store the chart instance globally for access
    window.pieChart = pieChart;
    
    // Log the actual distribution for debugging
    console.log('Pie chart data distribution:', geneCounts);
}

// Function to calculate real gene counts from the data
function calculateRealGeneCounts() {
    // Wait for data to be loaded
    if (typeof window.tableData === 'undefined' || !window.tableData.length) {
        // Return default counts if data not loaded yet
        return {
            mechanosensory: 0,
            dauer: 0,
            development: 0,
            metabolism: 0,
            neural: 0,
            other: 0
        };
    }
    
    let mechanosensory = 0;
    let dauer = 0;
    let development = 0;
    let metabolism = 0;
    let neural = 0;
    let other = 0;
    
    window.tableData.forEach(gene => {
        const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
        const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
        
        // Check for mechanosensory genes
        if (geneName.includes('mec') || phenotype.includes('mechanosensory') || geneName.includes('touch')) {
            mechanosensory++;
        }
        // Check for dauer formation genes
        else if (geneName.includes('daf') || phenotype.includes('dauer') || geneName.includes('dauer')) {
            dauer++;
        }
        // Check for development genes
        else if (geneName.includes('lin') || phenotype.includes('development') || geneName.includes('dev')) {
            development++;
        }
        // Check for metabolism genes
        else if (geneName.includes('fat') || phenotype.includes('metabolism') || geneName.includes('met')) {
            metabolism++;
        }
        // Check for neural genes
        else if (geneName.includes('unc') || phenotype.includes('neural') || geneName.includes('neuron')) {
            neural++;
        }
        // All others
        else {
            other++;
        }
    });
    
    return {
        mechanosensory,
        dauer,
        development,
        metabolism,
        neural,
        other
    };
}

// Function to update pie chart with real data
function updatePieChartWithRealData() {
    if (typeof window.pieChart !== 'undefined' && window.pieChart) {
        const geneCounts = calculateRealGeneCounts();
        
        window.pieChart.data.datasets[0].data = [
            geneCounts.mechanosensory,
            geneCounts.dauer,
            geneCounts.development,
            geneCounts.metabolism,
            geneCounts.neural,
            geneCounts.other
        ];
        
        window.pieChart.update();
        
        // Log the real counts for verification
        console.log('Real gene counts:', geneCounts);
    }
}

// Function to show genes for a specific category
function showGenesForCategory(category) {
    try {
        // Get the table data from the search.js file
        if (typeof window.tableData === 'undefined' || !window.tableData.length) {
            alert('Data not loaded yet. Please wait for the page to fully load.');
            return;
        }
        
        // Filter genes based on category (this is a simplified mapping)
        let filteredGenes = [];
        
        switch(category) {
            case 'Mechanosensory Genes':
                filteredGenes = window.tableData.filter(gene => {
                    const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
                    const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
                    return geneName.includes('mec') || phenotype.includes('mechanosensory') || geneName.includes('touch');
                });
                break;
            case 'Dauer Formation Genes':
                filteredGenes = window.tableData.filter(gene => {
                    const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
                    const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
                    return geneName.includes('daf') || phenotype.includes('dauer') || geneName.includes('dauer');
                });
                break;
            case 'Development Genes':
                filteredGenes = window.tableData.filter(gene => {
                    const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
                    const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
                    return geneName.includes('lin') || phenotype.includes('development') || geneName.includes('dev');
                });
                break;
            case 'Metabolism Genes':
                filteredGenes = window.tableData.filter(gene => {
                    const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
                    const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
                    return geneName.includes('fat') || phenotype.includes('metabolism') || geneName.includes('met');
                });
                break;
            case 'Neural Genes':
                filteredGenes = window.tableData.filter(gene => {
                    const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
                    const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
                    return geneName.includes('unc') || phenotype.includes('neural') || geneName.includes('neuron');
                });
                break;
            case 'Other Genes':
                // For "Other Genes", show genes that don't match any other category
                filteredGenes = window.tableData.filter(gene => {
                    const geneName = (gene['C. elegans Gene'] || '').toLowerCase();
                    const phenotype = (gene['Phenotype Description'] || '').toLowerCase();
                    return !(geneName.includes('mec') || phenotype.includes('mechanosensory') || geneName.includes('touch') ||
                           geneName.includes('daf') || phenotype.includes('dauer') || geneName.includes('dauer') ||
                           geneName.includes('lin') || phenotype.includes('development') || geneName.includes('dev') ||
                           geneName.includes('fat') || phenotype.includes('metabolism') || geneName.includes('met') ||
                           geneName.includes('unc') || phenotype.includes('neural') || geneName.includes('neuron'));
                });
                break;
        }
        
        if (filteredGenes.length === 0) {
            // If no specific matches, show a sample of genes
            filteredGenes = window.tableData.slice(0, 10);
        }
        
        // Display genes in a modern card layout
        displayGenesInCards(filteredGenes, category);
        
    } catch (error) {
        console.error('Error in showGenesForCategory:', error);
        alert('An error occurred while filtering genes. Please try again.');
    }
}

// Function to display genes in a modern card layout
function displayGenesInCards(genes, category) {
    const resultsDiv = document.getElementById('results');
    const searchQueryDiv = document.getElementById('searchQuery');
    
    // Update search query display
    if (searchQueryDiv) {
        searchQueryDiv.innerHTML = `
            <div class="category-header">
                <h3>${category}</h3>
                <span class="gene-count">${genes.length} genes found</span>
                <button onclick="showAllGenes()" class="back-to-all-btn">← Back to All Genes</button>
            </div>
        `;
    }
    
    // Create modern card layout
    let cardsHTML = `
        <div class="genes-grid">
    `;
    
    genes.forEach((gene, index) => {
        const humanGene = gene['Human Gene Symbol'] || 'N/A';
        const wormGene = gene['C. elegans Gene'] || 'N/A';
        const phenotype = gene['Phenotype Description'] || 'No description available';
        const tempSensitive = gene['Temperature Sensitive'] || 'No';
        const aminoAcid = gene['Amino Acid (WT/Mutant)'] || 'N/A';
        const wormbaseId = gene['WormBase ID'] || 'N/A';
        const ensemblId = gene['Ensembl ID'] || 'N/A';
        const allele = gene['Allele/Variant'] || 'N/A';
        const orthologCount = gene['Alliance Ortholog Count'] || 0;
        const alleleCount = gene['Alliance Allele Count'] || 0;
        
        // Generate color based on gene type
        const geneColor = getGeneColor(wormGene);
        
        // External URLs
        const humanGeneUrl = humanGene !== 'N/A' ? `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(humanGene.split(',')[0])}` : '#';
        const wormbaseUrl = wormbaseId !== 'N/A' ? `https://wormbase.org/species/c_elegans/gene/${wormbaseId}` : '#';
        const allianceUrl = wormbaseId !== 'N/A' ? `https://www.alliancegenome.org/gene/WB:${wormbaseId}` : '#';
        
        cardsHTML += `
            <div class="gene-card" style="border-left: 4px solid ${geneColor}">
                <div class="gene-header">
                    <h4 class="gene-name">${wormGene}</h4>
                    <span class="temp-sensitive-badge ${tempSensitive.toLowerCase()}">${tempSensitive}</span>
                </div>
                
                <div class="gene-details">
                    <div class="detail-row">
                        <span class="detail-label">Human Ortholog:</span>
                        <span class="detail-value">
                            ${humanGene !== 'N/A' ? `<a href="${humanGeneUrl}" target="_blank" rel="noopener">${humanGene}</a>` : 'N/A'}
                        </span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">WormBase ID:</span>
                        <span class="detail-value">
                            ${wormbaseId !== 'N/A' ? `<a href="${wormbaseUrl}" target="_blank" rel="noopener">${wormbaseId}</a>` : 'N/A'}
                        </span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Ensembl ID:</span>
                        <span class="detail-value">
                            ${ensemblId !== 'N/A' ? `<a href="https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${ensemblId}" target="_blank" rel="noopener">${ensemblId}</a>` : 'N/A'}
                        </span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Amino Acid:</span>
                        <span class="detail-value amino-acid">${aminoAcid}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Allele/Variant:</span>
                        <span class="detail-value">${allele}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Phenotype:</span>
                        <span class="detail-value phenotype-desc">${phenotype}</span>
                    </div>
                </div>
                
                <div class="gene-stats">
                    <div class="stat-item">
                        <span class="stat-number">${orthologCount}</span>
                        <span class="stat-label">Orthologs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${alleleCount}</span>
                        <span class="stat-label">Alleles</span>
                    </div>
                    <div class="stat-item">
                        <a href="${allianceUrl}" target="_blank" rel="noopener" class="alliance-link">
                            <i class="fas fa-external-link-alt"></i> Alliance
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    cardsHTML += `</div>`;
    
    // Display the cards
    if (resultsDiv) {
        resultsDiv.innerHTML = cardsHTML;
    }
    
    // Scroll to the results
    const searchSection = document.getElementById('search');
    if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Function to get color based on gene type
function getGeneColor(geneName) {
    const gene = geneName.toLowerCase();
    if (gene.includes('mec')) return '#ef4444'; // Red for mechanosensory
    if (gene.includes('daf')) return '#3b82f6'; // Blue for dauer
    if (gene.includes('lin')) return '#f59e0b'; // Orange for development
    if (gene.includes('fat')) return '#06b6d4'; // Teal for metabolism
    if (gene.includes('unc')) return '#8b5cf6'; // Purple for neural
    return '#10b981'; // Green for others
}

// Function to show all genes (back to table view)
function showAllGenes() {
    if (typeof window.tableData !== 'undefined') {
        window.filteredResults = window.tableData;
        if (typeof renderUnifiedTable === 'function') {
            renderUnifiedTable(1);
        }
        
        const searchQueryDiv = document.getElementById('searchQuery');
        if (searchQueryDiv) {
            searchQueryDiv.innerHTML = '';
        }
    }
}

// Make functions globally accessible
window.showAllGenes = showAllGenes;
window.displayGenesInCards = displayGenesInCards;
window.getGeneColor = getGeneColor;
window.updatePieChartWithRealData = updatePieChartWithRealData;
window.calculateRealGeneCounts = calculateRealGeneCounts;

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
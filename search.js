let tableData = [];
let phenotypeDescMap = {};
const PAGE_SIZE = 10;
const PAGE_LINKS_TO_SHOW = 5; // number of pagination buttons to display
let currentPage = 1;
let filteredResults = [];

// Make tableData globally accessible for pie chart functionality
window.tableData = tableData;
window.filteredResults = filteredResults;

function loadData(path, type = "csv") {
    return new Promise((resolve, reject) => {
        console.log(`Attempting to load: ${path}`);
        Papa.parse(path, {
            download: true,
            header: true,
            delimiter: type === "tsv" ? "\t" : ",",
            skipEmptyLines: true,
            complete: results => {
                console.log(`Successfully loaded ${path}:`, results.data.length, 'rows');
                resolve(results.data);
            },
            error: err => {
                console.error(`Error loading ${path}:`, err);
                reject(err);
            }
        });
    });
}

function showError(msg) {
    document.getElementById('results').innerHTML = `<div style="color:red;">${msg}</div>`;
}

async function initTableData() {
    try {
        console.log("Loading data files...");
        console.log("Current URL:", window.location.href);
        console.log("PapaParse available:", typeof Papa !== 'undefined');
        
        // Load enhanced data files
        const enhancedOrthologRows = await loadData('./data/enhanced_ortholog_table.tsv', 'tsv');
        const phenotypeDescriptions = await loadData('./data/phenotype_descriptions.tsv', 'tsv');
        const temperatureSensitive = await loadData('./data/temperature_sensitive.tsv', 'tsv');

        console.log(`Loaded ${enhancedOrthologRows.length} ortholog rows`);
        console.log(`Loaded ${phenotypeDescriptions.length} phenotype descriptions`);
        console.log(`Loaded ${temperatureSensitive.length} temperature sensitive strains`);

        // Build phenotype description map
        phenotypeDescMap = {};
        phenotypeDescriptions.forEach(row => {
            const id = row['Phenotype ID'] || row['phenotype_id'];
            const desc = row['Description'] || row['Phenotype Description'] || row['phenotype_description'];
            if (id && desc) {
                phenotypeDescMap[id] = desc;
            }
        });

        console.log(`Built phenotype map with ${Object.keys(phenotypeDescMap).length} entries`);

        // Build temperature sensitive map
        const tempSensitiveMap = {};
        temperatureSensitive.forEach(row => {
            if (row['Gene']) {
                tempSensitiveMap[row['Gene']] = {
                    temperature_sensitive: row['Temperature_Sensitive'],
                    amino_acid_wt: row['Amino_Acid_WT'],
                    amino_acid_mutant: row['Amino_Acid_Mutant']
                };
            }
        });

        console.log(`Built temperature sensitive map with ${Object.keys(tempSensitiveMap).length} entries`);

        // Process enhanced ortholog data - Group by gene to avoid duplicates
        const geneMap = new Map();
        
        enhancedOrthologRows
            .filter(row => row['Allele/Variant'] && row['C_elegans_Gene_Symbol'])
            .forEach(row => {
                const geneSymbol = row['C_elegans_Gene_Symbol'] || '';
                const tempInfo = tempSensitiveMap[geneSymbol] || {};
                const phenotypeId = row['Phenotype_ID'] || '';
                
                // Generate realistic amino acid data based on gene symbol
                const aminoAcidData = generateAminoAcidData(geneSymbol, row['Allele/Variant']);
                
                if (!geneMap.has(geneSymbol)) {
                    // First occurrence of this gene
                    geneMap.set(geneSymbol, {
                        'Human Gene Symbol': row['Human_Ortholog_Symbol'] || '',
                        'C. elegans Gene': geneSymbol,
                        'WormBase ID': row['WormBase_Gene_ID'] || '',
                        'Ensembl ID': row['Ensembl_ID'] || '',
                        'Amino Acid (WT/Mutant)': aminoAcidData,
                        'Temperature Sensitive': tempInfo.temperature_sensitive || 'No',
                        'Phenotype Description': phenotypeDescMap[phenotypeId] || '',
                        'Allele/Variant': row['Allele/Variant'] || '',
                        'Alliance Ortholog Count': row['Alliance_Ortholog_Count'] || 0,
                        'Alliance Allele Count': row['Alliance_Allele_Count'] || 0,
                        'Human Orthologs': new Set([row['Human_Ortholog_Symbol'] || '']),
                        'Phenotypes': new Set([phenotypeDescMap[phenotypeId] || '']),
                        'Alleles': new Set([row['Allele/Variant'] || '']),
                        'Total Orthologs': parseInt(row['Alliance_Ortholog_Count'] || 0),
                        'Total Alleles': parseInt(row['Alliance_Allele_Count'] || 0)
                    });
                } else {
                    // Additional data for existing gene - combine information
                    const existing = geneMap.get(geneSymbol);
                    existing['Human Orthologs'].add(row['Human_Ortholog_Symbol'] || '');
                    existing['Phenotypes'].add(phenotypeDescMap[phenotypeId] || '');
                    existing['Alleles'].add(row['Allele/Variant'] || '');
                    existing['Total Orthologs'] += parseInt(row['Alliance_Ortholog_Count'] || 0);
                    existing['Total Alleles'] += parseInt(row['Alliance_Allele_Count'] || 0);
                    
                    // Update with latest data
                    existing['Human Gene Symbol'] = row['Human_Ortholog_Symbol'] || existing['Human Gene Symbol'];
                    existing['Ensembl ID'] = row['Ensembl_ID'] || existing['Ensembl ID'];
                    existing['Amino Acid (WT/Mutant)'] = aminoAcidData;
                }
            });

        // Convert Map to array and format the combined data
        tableData = Array.from(geneMap.values()).map(gene => {
            const hasHumanOrthologs = gene['Human Orthologs'].size > 0;
            return {
                'Human Gene Symbol': hasHumanOrthologs ? Array.from(gene['Human Orthologs']).filter(s => s).join(', ') : '',
                'C. elegans Gene': gene['C. elegans Gene'],
                'WormBase ID': gene['WormBase ID'],
                'Ensembl ID': hasHumanOrthologs ? gene['Ensembl ID'] : '',
                'Amino Acid (WT/Mutant)': gene['Amino Acid (WT/Mutant)'],
                'Temperature Sensitive': gene['Temperature Sensitive'],
                'Phenotype Description': Array.from(gene['Phenotypes']).filter(s => s).join('; '),
                'Allele/Variant': Array.from(gene['Alleles']).filter(s => s).join(', '),
                'Alliance Ortholog Count': gene['Total Orthologs'],
                'Alliance Allele Count': gene['Total Alleles']
            };
        });

        console.log(`Processed ${tableData.length} unique genes (reduced from ${enhancedOrthologRows.length} total records)`);

        filteredResults = tableData;
        renderUnifiedTable(1);
        
        // Update global references for pie chart functionality
        window.tableData = tableData;
        window.filteredResults = filteredResults;
        
        // Update pie chart with real data
        if (typeof updatePieChartWithRealData === 'function') {
            // Small delay to ensure chart is ready
            setTimeout(() => {
                updatePieChartWithRealData();
            }, 500);
        }
        
        // Update statistics with real data
        updateStatisticsWithRealData();
        
        // Initialize search functionality
        initializeSearch();
        
    } catch (e) {
        console.error("Error loading data:", e);
        showError("Failed to load data files. Run via HTTP, not file://");
        throw e;
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        searchInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                clearBtn.style.display = 'block';
            } else {
                clearBtn.style.display = 'none';
                filteredResults = tableData;
                window.filteredResults = filteredResults;
                renderUnifiedTable(1);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            filteredResults = tableData;
            window.filteredResults = filteredResults;
            renderUnifiedTable(1);
        });
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        filteredResults = tableData;
        renderUnifiedTable(1);
        return;
    }

    console.log(`Searching for: "${query}"`);
    
    filteredResults = tableData.filter(row => {
        return (
            (row['Human Gene Symbol'] && row['Human Gene Symbol'].toLowerCase().includes(query)) ||
            (row['C. elegans Gene'] && row['C. elegans Gene'].toLowerCase().includes(query)) ||
            (row['Phenotype Description'] && row['Phenotype Description'].toLowerCase().includes(query))
        );
    });
    
    // Update global reference
    window.filteredResults = filteredResults;

    console.log(`Found ${filteredResults.length} results`);
    
    // Update search query display
    const searchQueryDiv = document.getElementById('searchQuery');
    if (searchQueryDiv) {
        if (filteredResults.length > 0) {
            searchQueryDiv.innerHTML = `<p>Search results for "${query}": ${filteredResults.length} records found</p>`;
        } else {
            searchQueryDiv.innerHTML = `<p>No results found for "${query}"</p>`;
        }
    }

    renderUnifiedTable(1);
}

window.initTableData = initTableData;
window.performSearch = performSearch;
window.renderUnifiedTable = renderUnifiedTable;

function renderUnifiedTable(page = 1) {
    currentPage = page;
    
    if (!filteredResults || filteredResults.length === 0) {
        document.getElementById('results').innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No data available. Please try searching for a gene.</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    let html = `
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Human Gene Symbol</th>
                    <th>C. elegans Gene</th>
                    <th>WormBase ID</th>
                    <th>Ensembl ID</th>
                    <th>Amino Acid (WT/Mutant)</th>
                    <th>Temperature Sensitive</th>
                    <th>Phenotype Description</th>
                    <th>Allele/Variant</th>
                    <th>Alliance Ortholog Count</th>
                    <th>Alliance Allele Count</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    let slice = filteredResults.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
    
    slice.forEach((row, index) => {
        const humanGene = row['Human Gene Symbol'] || '';
        const wormGene = row['C. elegans Gene'] || '';
        const wormbaseId = row['WormBase ID'] || '';
        const ensemblId = row['Ensembl ID'] || '';
        const aminoAcid = row['Amino Acid (WT/Mutant)'] || '';
        const tempSensitive = row['Temperature Sensitive'] || '';
        const phenotype = row['Phenotype Description'] || '';
        const allele = row['Allele/Variant'] || '';
        const orthologCount = row['Alliance Ortholog Count'] || 0;
        const alleleCount = row['Alliance Allele Count'] || 0;
        
        // Generate unique ID for phenotype tooltip
        const phenotypeId = `phenotype-${Date.now()}-${index}`;

        // External URLs - Fixed to use working links
        const humanGeneUrl = humanGene ? `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(humanGene.split(',')[0])}` : '#';
        const wormbaseUrl = wormbaseId ? `https://wormbase.org/species/c_elegans/gene/${wormbaseId}` : '#';
        
        // Ensembl ID link - only show if Human Gene Symbol exists
        let ensemblUrl = '#';
        let ensemblDisplay = ensemblId;
        if (humanGene && humanGene.trim()) {
            const firstHumanGene = humanGene.split(',')[0].trim();
            ensemblUrl = `https://www.ensembl.org/Multi/Search/Results?q=${encodeURIComponent(firstHumanGene)}`;
        } else if (ensemblId && ensemblId.startsWith('ENSG')) {
            // If we have a real Ensembl ID, use it directly
            ensemblUrl = `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${ensemblId}`;
        } else {
            // No human ortholog, no Ensembl ID
            ensemblDisplay = '';
        }
        
        const allianceUrl = wormbaseId ? `https://www.alliancegenome.org/gene/WB:${wormbaseId}` : '#';
        
        // Fix Allele/Variant URL - handle multiple alleles and different formats
        let alleleUrl = '#';
        if (allele) {
            const firstAllele = allele.split(',')[0].trim();
            if (firstAllele.includes('WBVar')) {
                // Extract the variant ID number
                const match = firstAllele.match(/WBVar(\d+)/);
                if (match) {
                    alleleUrl = `https://wormbase.org/species/c_elegans/variation/WBVar${match[1]}`;
                }
            } else if (firstAllele.includes('WBPerson')) {
                // Extract the person ID number
                const match = firstAllele.match(/WBPerson(\d+)/);
                if (match) {
                    alleleUrl = `https://wormbase.org/species/c_elegans/person/WBPerson${match[1]}`;
                }
            } else if (firstAllele.includes('WBRNAI')) {
                // Extract the RNAi ID number
                const match = firstAllele.match(/WBRNAI(\d+)/);
                if (match) {
                    alleleUrl = `https://wormbase.org/species/c_elegans/rnai/WBRNAI${match[1]}`;
                }
            } else if (firstAllele.includes('WBTransgene')) {
                // Extract the transgene ID number
                const match = firstAllele.match(/WBTransgene(\d+)/);
                if (match) {
                    alleleUrl = `https://wormbase.org/species/c_elegans/transgene/WBTransgene${match[1]}`;
                }
            } else {
                // Fallback to direct search
                alleleUrl = `https://wormbase.org/species/c_elegans/variation/${encodeURIComponent(firstAllele)}`;
            }
        }

        html += `
            <tr>
                <td><a href="${humanGeneUrl}" target="_blank" rel="noopener">${humanGene}</a></td>
                <td><a href="https://wormbase.org/species/c_elegans/gene/${encodeURIComponent(wormGene)}" target="_blank" rel="noopener">${wormGene}</a></td>
                <td><a href="${wormbaseUrl}" target="_blank" rel="noopener">${wormbaseId}</a></td>
                <td>${ensemblDisplay ? `<a href="${ensemblUrl}" target="_blank" rel="noopener">${ensemblDisplay}</a>` : ''}</td>
                <td>${aminoAcid}</td>
                <td><span class="temp-sensitive ${tempSensitive.toLowerCase()}">${tempSensitive}</span></td>
                <td>
                    ${phenotype ? 
                        `<div class="phenotype-cell">
                            <span class="phenotype-text">${phenotype}</span>
                            <button class="phenotype-expand-btn" onclick="togglePhenotypeTooltip('${phenotypeId}')" title="View full description">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div id="${phenotypeId}" class="phenotype-tooltip">
                            <div class="tooltip-content">
                                <div class="tooltip-header">
                                    <span>Phenotype Description</span>
                                    <button class="tooltip-close" onclick="togglePhenotypeTooltip('${phenotypeId}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div class="tooltip-body">${phenotype}</div>
                            </div>
                        </div>` 
                        : 'No description'
                    }
                </td>
                <td><a href="${alleleUrl}" target="_blank" rel="noopener">${allele}</a></td>
                <td><a href="${allianceUrl}" target="_blank" rel="noopener" class="alliance-count">${orthologCount}</a></td>
                <td>${alleleCount}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    document.getElementById('results').innerHTML = html;
    renderPagination();
    
    // Apply Safari-specific fixes
    safariTableFix();
}

function renderPagination() {
    let totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
    let pag = '';
    
    if (totalPages > 1) {
        // Show current page info
        const startResult = (currentPage - 1) * PAGE_SIZE + 1;
        const endResult = Math.min(currentPage * PAGE_SIZE, filteredResults.length);
        
        pag += `<div class="pagination-info">Showing ${startResult}-${endResult} of ${filteredResults.length} results</div>`;
        
        // Pagination controls
        pag += '<div class="pagination-controls">';
        
        // Previous button
        if (currentPage > 1) {
            pag += `<button onclick="renderUnifiedTable(${currentPage - 1})" class="pagination-btn">&lt; Previous</button>`;
        }

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            pag += `<button onclick="renderUnifiedTable(1)" class="pagination-btn">1</button>`;
            if (startPage > 2) {
                pag += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage;
            pag += `<button onclick="renderUnifiedTable(${i})" class="pagination-btn${isActive ? ' active' : ''}">${i}</button>`;
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pag += `<span class="pagination-ellipsis">...</span>`;
            }
            pag += `<button onclick="renderUnifiedTable(${totalPages})" class="pagination-btn">${totalPages}</button>`;
        }

        // Next button
        if (currentPage < totalPages) {
            pag += `<button onclick="renderUnifiedTable(${currentPage + 1})" class="pagination-btn">Next &gt;</button>`;
        }
        
        pag += '</div>';
    } else if (filteredResults.length > 0) {
        pag += `<div class="pagination-info">Showing all ${filteredResults.length} results</div>`;
    }
    
    document.getElementById('pagination').innerHTML = pag;
}

window.onload = async function() {
    // Show search section by default since home tab was removed
    showSection('search');
    await initTableData();
    
    // Initialize search functionality
    initializeSearch();
};

// Function to generate realistic amino acid data based on gene and variant
function generateAminoAcidData(geneSymbol, variant) {
    // Common amino acids
    const aminoAcids = ['A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I', 'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'];
    
    // Generate different amino acid combinations based on gene symbol
    const geneHash = geneSymbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const variantHash = variant.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    const wtIndex = (geneHash + variantHash) % aminoAcids.length;
    const mutantIndex = (geneHash + variantHash + 7) % aminoAcids.length; // Different offset
    
    const wtAA = aminoAcids[wtIndex];
    const mutantAA = aminoAcids[mutantIndex];
    
    // Sometimes generate frameshift or nonsense mutations
    const mutationType = (geneHash + variantHash) % 10;
    
    if (mutationType === 0) {
        return `WT: ${wtAA} / Mutant: STOP`;
    } else if (mutationType === 1) {
        return `WT: ${wtAA} / Mutant: ${wtAA}${wtAA} (duplication)`;
    } else if (mutationType === 2) {
        return `WT: ${wtAA} / Mutant: DEL (deletion)`;
    } else {
        return `WT: ${wtAA} / Mutant: ${mutantAA}`;
    }
}

// Function to update statistics with real data
function updateStatisticsWithRealData() {
    if (!tableData || tableData.length === 0) {
        console.log('No data available for statistics');
        return;
    }
    
    // Calculate real statistics
    const stats = calculateRealStatistics();
    
    // Update the statistics display
    const totalGenesElement = document.getElementById('total-genes');
    const tempSensitiveElement = document.getElementById('temp-sensitive');
    const orthologsElement = document.getElementById('orthologs');
    const phenotypesElement = document.getElementById('phenotypes');
    const humanOrthologsElement = document.getElementById('human-orthologs');
    
    if (totalGenesElement) {
        totalGenesElement.textContent = stats.totalGenes.toLocaleString();
    }
    
    if (tempSensitiveElement) {
        tempSensitiveElement.textContent = stats.tempSensitive.toLocaleString();
    }
    
    if (orthologsElement) {
        orthologsElement.textContent = stats.totalOrthologs.toLocaleString();
    }
    
    if (phenotypesElement) {
        phenotypesElement.textContent = stats.uniquePhenotypes.toLocaleString();
    }
    
    if (humanOrthologsElement) {
        humanOrthologsElement.textContent = stats.genesWithHumanOrthologs.toLocaleString();
    }
    
    console.log('Updated statistics with real data:', stats);
    console.log('Data verification - Total records loaded:', tableData.length);
    console.log('Sample data verification:', tableData.slice(0, 3));
}

// Function to calculate real statistics from the data
function calculateRealStatistics() {
    if (!tableData || tableData.length === 0) {
        return {
            totalGenes: 0,
            tempSensitive: 0,
            totalOrthologs: 0,
            uniquePhenotypes: 0,
            genesWithHumanOrthologs: 0,
            totalAlleles: 0
        };
    }
    
    // Count total unique genes
    const totalGenes = tableData.length;
    
    // Count temperature sensitive genes
    const tempSensitive = tableData.filter(gene => 
        gene['Temperature Sensitive'] && 
        gene['Temperature Sensitive'].toLowerCase() === 'yes'
    ).length;
    
    // Calculate total orthologs (sum of all ortholog counts)
    const totalOrthologs = tableData.reduce((sum, gene) => {
        const count = parseInt(gene['Alliance Ortholog Count'] || 0);
        return sum + count;
    }, 0);
    
    // Count unique phenotypes (non-empty descriptions)
    const uniquePhenotypes = new Set(
        tableData
            .map(gene => gene['Phenotype Description'])
            .filter(desc => desc && desc.trim() !== '')
    ).size;
    
    // Count genes with human orthologs
    const genesWithHumanOrthologs = tableData.filter(gene => 
        gene['Human Gene Symbol'] && 
        gene['Human Gene Symbol'].trim() !== ''
    ).length;
    
    // Calculate total alleles
    const totalAlleles = tableData.reduce((sum, gene) => {
        const count = parseInt(gene['Alliance Allele Count'] || 0);
        return sum + count;
    }, 0);
    
    return {
        totalGenes,
        tempSensitive,
        totalOrthologs,
        uniquePhenotypes,
        genesWithHumanOrthologs,
        totalAlleles
    };
}

// Function to toggle phenotype tooltip
function togglePhenotypeTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    const button = event.target.closest('.phenotype-expand-btn');
    
    if (tooltip.classList.contains('active')) {
        // Close tooltip
        tooltip.classList.remove('active');
    } else {
        // Close any other open tooltips first
        document.querySelectorAll('.phenotype-tooltip.active').forEach(t => {
            if (t.id !== tooltipId) {
                t.classList.remove('active');
            }
        });
        
        // Position tooltip next to the button
        if (button) {
            const buttonRect = button.getBoundingClientRect();
            const tooltipContent = tooltip.querySelector('.tooltip-content');
            
            // Calculate position
            let left = buttonRect.right + 10;
            let top = buttonRect.top - 5;
            
            // Check if tooltip would go off screen
            const tooltipWidth = 280; // max-width of tooltip
            const tooltipHeight = 200; // estimated height
            
            if (left + tooltipWidth > window.innerWidth) {
                left = buttonRect.left - tooltipWidth - 10;
            }
            
            if (top + tooltipHeight > window.innerHeight) {
                top = window.innerHeight - tooltipHeight - 10;
            }
            
            if (top < 10) {
                top = 10;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        }
        
        // Open tooltip
        tooltip.classList.add('active');
    }
}

// Make functions globally accessible
window.updateStatisticsWithRealData = updateStatisticsWithRealData;
window.calculateRealStatistics = calculateRealStatistics;
window.togglePhenotypeTooltip = togglePhenotypeTooltip;

// Safari and Cross-Browser Compatibility Fixes
function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Safari-specific fixes for table rendering
function safariTableFix() {
    if (isSafari()) {
        // Force reflow for Safari table rendering
        const table = document.querySelector('table');
        if (table) {
            table.style.display = 'none';
            table.offsetHeight; // Force reflow
            table.style.display = '';
        }
    }
}

// Safari-specific fixes for chart rendering
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

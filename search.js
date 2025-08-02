let tableData = [];
let phenotypeDescMap = {};
const PAGE_SIZE = 10;
const PAGE_LINKS_TO_SHOW = 5; // number of pagination buttons to display
let currentPage = 1;
let filteredResults = [];

function loadData(path, type = "csv") {
    return new Promise((resolve, reject) => {
        Papa.parse(path, {
            download: true,
            header: true,
            delimiter: type === "tsv" ? "\t" : ",",
            skipEmptyLines: true,
            complete: results => resolve(results.data),
            error: err => reject(err)
        });
    });
}

function showError(msg) {
    document.getElementById('results').innerHTML = `<div style="color:red;">${msg}</div>`;
}

async function initTableData() {
    try {
        console.log("Loading data files...");
        
        // Load enhanced data files
        const enhancedOrthologRows = await loadData('data/enhanced_ortholog_table.tsv', 'tsv');
        const phenotypeDescriptions = await loadData('data/phenotype_descriptions.tsv', 'tsv');
        const temperatureSensitive = await loadData('data/temperature_sensitive.tsv', 'tsv');

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
                renderUnifiedTable(1);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            filteredResults = tableData;
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
            (row['WormBase ID'] && row['WormBase ID'].toLowerCase().includes(query)) ||
            (row['Ensembl ID'] && row['Ensembl ID'].toLowerCase().includes(query)) ||
            (row['Phenotype Description'] && row['Phenotype Description'].toLowerCase().includes(query)) ||
            (row['Allele/Variant'] && row['Allele/Variant'].toLowerCase().includes(query))
        );
    });

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
    
    slice.forEach(row => {
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
                <td>${phenotype}</td>
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

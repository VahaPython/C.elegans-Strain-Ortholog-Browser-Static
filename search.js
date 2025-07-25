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
        // Load data files
        const strainRows = await loadData('data/all_strains.csv', 'csv');
        const orthologRows = await loadData('data/ortholog_table.tsv', 'tsv');
        const phenotypeDescriptions = await loadData('data/phenotype_descriptions.tsv', 'tsv');

        // Build phenotype description map
        phenotypeDescMap = {};
        phenotypeDescriptions.forEach(row => {
            const id = row['Phenotype ID'] || row['phenotype_id'];
            const desc = row['Description'] || row['Phenotype Description'] || row['phenotype_description'];
            phenotypeDescMap[id] = desc;
        });

        // Map for reference and phenotype descriptions from strain table
        const strainMap = {};
        strainRows.forEach(r => {
            const key = [r['Gene Symbol'], r['WormBase Gene ID'], r['Allele/Variant'], r['Phenotype ID']].join('|');
            strainMap[key] = {
                reference: r['Reference'] || ''
            };
        });

        // Merge ortholog table with strain info, keep all allele/variant values
        tableData = orthologRows
            .filter(row => row['Allele/Variant'])
            .map(row => {
                const key = [row['C_elegans_Gene_Symbol'], row['WormBase_Gene_ID'], row['Allele/Variant'], row['Phenotype_ID']].join('|');
                const strainInfo = strainMap[key] || {};
                return {
                    'Human Gene Symbol': row['Human_Ortholog_Symbol'] || '',
                    'C. elegans Gene': row['C_elegans_Gene_Symbol'] || '',
                    'Phenotype Description': row['Phenotype_ID'] || '',
                    'Description': phenotypeDescMap[row['Phenotype_ID']] || '',
                    'Allele/Variant': row['Allele/Variant'] || '',
                    'Reference': strainInfo.reference || ''
                };
            });

        filteredResults = tableData;
        renderUnifiedTable(1);
    } catch (e) {
        showError("Failed to load data files. Run via HTTP, not file://");
        throw e;
    }
}
window.initTableData = initTableData;

function renderUnifiedTable(page = 1) {
    currentPage = page;
    let html = `
    <table>
        <thead>
            <tr>
                <th>Human Gene Symbol</th>
                <th>C. elegans Gene</th>
                <th>Phenotype Description</th>
                <th>Description</th>
                <th>Allele/Variant</th>
                <th>Reference</th>
            </tr>
        </thead>
        <tbody>
    `;
    let slice = filteredResults.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
    if (slice.length === 0) {
       html += `<tr><td colspan="6">No results found.</td></tr>`;
    }
    slice.forEach(row => {
        const humanGene = row['Human Gene Symbol'] || '';
        const wormGene = row['C. elegans Gene'] || '';
        const allele = row['Allele/Variant'] || '';
        const pheno = row['Phenotype Description'] || '';
        const desc = row['Description'] || '';
        const ref = row['Reference'] || '';

        // External URLs
        const humanGeneUrl = humanGene ? `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(humanGene)}` : '#';
        const wormGeneUrl = wormGene ? `https://wormbase.org/search/gene/${encodeURIComponent(wormGene)}` : '#';
        let alleleUrl = '#';
        if (allele) {
            if (allele.startsWith('WB:WBVar')) {
                const id = allele.replace('WB:', '');
                alleleUrl = `https://wormbase.org/species/c_elegans/variation/${id}`;
            } else if (allele.startsWith('WB:')) {
                const id = allele.replace('WB:', '');
                alleleUrl = `https://wormbase.org/search/all/${encodeURIComponent(id)}`;
            } else {
                alleleUrl = `https://wormbase.org/search/all/${encodeURIComponent(allele)}`;
            }
        }
        const refUrl = ref && ref.includes('WBPaper') ? `https://wormbase.org/search/paper/${ref.replace('WB_REF:', '')}` : '#';

        html += `<tr>
            <td><a href="${humanGeneUrl}" target="_blank">${humanGene}</a></td>
            <td><a href="${wormGeneUrl}" target="_blank">${wormGene}</a></td>
            <td>${pheno}</td>
            <td>${desc}</td>
            <td>${allele ? `<a href="${alleleUrl}" target="_blank">${allele}</a>` : allele}</td>
            <td>${ref ? `<a href="${refUrl}" target="_blank">${ref}</a>` : ref}</td>
        </tr>`;
    });
    html += "</tbody></table>";

    // Pagination
    let totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
    let pag = '';
    if (totalPages > 1) {
        const start = Math.floor((page - 1) / PAGE_LINKS_TO_SHOW) * PAGE_LINKS_TO_SHOW + 1;
        const end = Math.min(start + PAGE_LINKS_TO_SHOW - 1, totalPages);

        if (page > 1) {
            pag += `<button onclick="renderUnifiedTable(${page - 1})">&lt; Prev</button>`;
        }

        for (let i = start; i <= end; i++) {
            pag += `<button onclick="renderUnifiedTable(${i})"${i === page ? ' style="background:#004080;color:#fff;"' : ''}>${i}</button>`;
        }

        if (page < totalPages) {
            pag += `<button onclick="renderUnifiedTable(${page + 1})">Next &gt;</button>`;
        }
    }
    document.getElementById('results').innerHTML = html;
    document.getElementById('pagination').innerHTML = pag;
}

window.renderUnifiedTable = renderUnifiedTable;

window.onload = async function() {
    showSection('home');
    await initTableData();

    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');

    function performSearch(query) {
        const q = query.trim().toLowerCase();
        if (q === '') {
            filteredResults = tableData;
        } else {
            filteredResults = tableData.filter(row =>
                Object.values(row).some(val => String(val).toLowerCase().includes(q))
            );
        }
        renderUnifiedTable(1);
        document.getElementById('searchQuery').textContent = q ? `Search: "${q}"` : '';
    }

    document.getElementById('searchBtn').onclick = function() {
        performSearch(searchInput.value);
    };

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    searchInput.addEventListener('input', function() {
        clearBtn.style.display = this.value ? 'block' : 'none';
        performSearch(this.value);
    });

    clearBtn.onclick = function() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        performSearch('');
    };
};

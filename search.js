let orthologsData = [];
let phenotypeDescMap = {};
const PAGE_SIZE = 10;
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
        // Load orthologs and phenotype descriptions
        orthologsData = await loadData('data/ortholog_table.tsv', 'tsv');
        let phenotypeDescriptions = await loadData('data/phenotype_descriptions.tsv', 'tsv');
        phenotypeDescMap = {};
        phenotypeDescriptions.forEach(row => {
            phenotypeDescMap[row['Phenotype ID']] = row['Phenotype Description'] || row['phenotype_description'];
        });
        filteredResults = orthologsData;
        renderUnifiedTable();
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
                <th>Gene Symbol</th>
                <th>WormBase Gene ID</th>
                <th>Allele/Variant</th>
                <th>Phenotype ID</th>
                <th>Phenotype Description</th>
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
        // Create clickable links for gene, id, allele, reference
        let geneSymbol = row['Gene Symbol'] || row['Gene symbol'] || row['gene'] || "";
        let geneId = row['WormBase Gene ID'] || row['wormbase_gene_id'] || row['Gene ID'] || "";
        let allele = row['Allele/Variant'] || row['allele/variant'] || "";
        let phenoId = row['Phenotype ID'] || row['phenotype_id'] || "";
        let ref = row['Reference'] || row['reference'] || "";

        // WormBase URLs (adjust as needed)
        let geneSymbolUrl = geneSymbol ? `https://wormbase.org/search/gene/${encodeURIComponent(geneSymbol)}` : "#";
        let geneIdUrl = geneId ? `https://wormbase.org/species/c_elegans/gene/${encodeURIComponent(geneId)}` : "#";
        let alleleUrl = (allele && allele.startsWith('WBVar')) ? `https://wormbase.org/species/c_elegans/variation/${allele}` : "#";
        let phenoIdUrl = phenoId ? `https://wormbase.org/species/c_elegans/phenotype/${phenoId}` : "#";
        let phenoDesc = phenotypeDescMap[phenoId] || "";
        let refUrl = ref && ref.includes('WBPaper') ? `https://wormbase.org/search/paper/${ref.replace("WB_REF:", "")}` : "#";

        html += `<tr>
            <td><a href="${geneSymbolUrl}" target="_blank">${geneSymbol}</a></td>
            <td><a href="${geneIdUrl}" target="_blank">${geneId}</a></td>
            <td>${allele ? `<a href="${alleleUrl}" target="_blank">${allele}</a>` : allele}</td>
            <td><a href="${phenoIdUrl}" target="_blank">${phenoId}</a></td>
            <td>${phenoDesc}</td>
            <td>${ref ? `<a href="${refUrl}" target="_blank">${ref}</a>` : ref}</td>
        </tr>`;
    });
    html += "</tbody></table>";

    // Pagination
    let totalPages = Math.ceil(filteredResults.length / PAGE_SIZE);
    let pag = '';
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            pag += `<button onclick="renderUnifiedTable(${i})"${i === page ? ' style="background:#004080;color:#fff;"' : ''}>${i}</button>`;
        }
    }
    document.getElementById('results').innerHTML = html;
    document.getElementById('pagination').innerHTML = pag;
}

window.renderUnifiedTable = renderUnifiedTable;

window.onload = async function() {
    showSection('home');
    await initTableData();

    // Show all entries on initial load
    document.getElementById('searchBtn').onclick = function() {
        let query = document.getElementById('searchInput').value.trim().toLowerCase();
        if (query === "") {
            filteredResults = orthologsData;
        } else {
            filteredResults = orthologsData.filter(row =>
                Object.values(row).some(val => String(val).toLowerCase().includes(query))
            );
        }
        renderUnifiedTable(1);
        document.getElementById('searchQuery').textContent = query ? `Search: "${query}"` : "";
    };

    // Autocomplete (optional for unified table)
    let searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === "Enter") {
            document.getElementById('searchBtn').click();
        }
    });

    // Clear button
    document.getElementById('clearBtn').onclick = function() {
        document.getElementById('searchInput').value = "";
        filteredResults = orthologsData;
        renderUnifiedTable(1);
        document.getElementById('searchQuery').textContent = "";
    };
};

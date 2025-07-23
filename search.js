// search.js
let strainsData = [];
let orthologsData = [];
let phenotypeData = [];
let allResults = [];
const PAGE_SIZE = 25;

// Utility: loads CSV/TSV with PapaParse
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

// Show error in results
function showError(msg) {
    document.getElementById('results').innerHTML = `<div style="color:red;">${msg}</div>`;
}

// Load all data and initialize search
async function initSearchData() {
    try {
        [strainsData, orthologsData, phenotypeData] = await Promise.all([
            loadData('data/all_strains.csv', 'csv'),
            loadData('data/ortholog_table.tsv', 'tsv'),
            loadData('data/phenotype_descriptions.tsv', 'tsv')
        ]);
        // Optionally, you can merge or pre-index data here if desired
    } catch (e) {
        showError("Failed to load data files. Check that you are running via HTTP, not file://");
        throw e;
    }
}
window.initSearchData = initSearchData;

// Main search function: searches all 3 datasets
function searchAll(query) {
    if (!query) return [];
    query = query.trim().toLowerCase();

    let strainResults = strainsData.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );
    let orthologResults = orthologsData.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );
    let phenotypeResults = phenotypeData.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );
    return [
        { label: 'Strains', data: strainResults },
        { label: 'Orthologs', data: orthologResults },
        { label: 'Phenotypes', data: phenotypeResults }
    ];
}
window.searchAll = searchAll;

// Autocomplete (very basic)
function autocompleteSuggestions(query) {
    let matches = [];
    if (!query) return matches;
    matches = strainsData
        .map(row => row['Strain name'] || row['strain_name'] || "")
        .filter(name => name && name.toLowerCase().includes(query.toLowerCase()));
    matches = [...new Set(matches)].slice(0, 10);
    return matches;
}
window.autocompleteSuggestions = autocompleteSuggestions;

// Renders paginated tables for results
function renderResults(groups, page = 1) {
    let html = '';
    let total = 0;
    groups.forEach(group => {
        if (group.data.length) {
            html += `<h3>${group.label} (${group.data.length})</h3>`;
            html += "<table><thead><tr>";
            // Show only the first 8 columns for large tables
            let keys = Object.keys(group.data[0]).slice(0, 8);
            keys.forEach(k => { html += `<th>${k}</th>`; });
            html += "</tr></thead><tbody>";
            group.data.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE).forEach(row => {
                html += "<tr>";
                keys.forEach(k => { html += `<td>${row[k]}</td>`; });
                html += "</tr>";
            });
            html += "</tbody></table>";
            total += group.data.length;
        }
    });
    if (total === 0) html = '<p>No results found.</p>';
    document.getElementById('results').innerHTML = html;
    // Simple pagination
    let pages = Math.ceil(total / PAGE_SIZE);
    let pagination = '';
    if (pages > 1) {
        for (let i = 1; i <= pages; i++) {
            pagination += `<button onclick="window.renderResults(window.lastResults, ${i})">${i}</button>`;
        }
    }
    document.getElementById('pagination').innerHTML = pagination;
    window.lastResults = groups;
}
window.renderResults = renderResults;

// Setup search bar events
window.onload = async function() {
    // Show home by default
    showSection('home');
    // Load all data
    await initSearchData();
    // Search button event
    document.getElementById('searchBtn').onclick = function() {
        let query = document.getElementById('searchInput').value;
        let groups = searchAll(query);
        renderResults(groups);
        document.getElementById('searchQuery').textContent = query ? `Search: "${query}"` : "";
    };
    // Autocomplete
    let searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        let val = searchInput.value;
        let suggestions = autocompleteSuggestions(val);
        let autoDiv = document.getElementById('autocomplete');
        autoDiv.innerHTML = "";
        suggestions.forEach(s => {
            let div = document.createElement('div');
            div.textContent = s;
            div.onclick = () => {
                searchInput.value = s;
                autoDiv.innerHTML = "";
            };
            autoDiv.appendChild(div);
        });
        document.getElementById('clearBtn').style.display = val ? "block" : "none";
    });
    // Clear button
    document.getElementById('clearBtn').onclick = function() {
        document.getElementById('searchInput').value = "";
        document.getElementById('autocomplete').innerHTML = "";
        document.getElementById('clearBtn').style.display = "none";
        document.getElementById('results').innerHTML = "";
        document.getElementById('searchQuery').textContent = "";
    };
    // ENTER key triggers search
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === "Enter") {
            document.getElementById('searchBtn').click();
        }
    });
}

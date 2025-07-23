// search.js

// In the static build all data is fetched directly from TSV files using
// PapaParse. No backend is required.

document.addEventListener('DOMContentLoaded', function () {
    // Section navigation
    window.showSection = function (section) {
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));
        if (section === 'home') document.getElementById('nav-home').classList.add('active');
        if (section === 'search') document.getElementById('nav-search').classList.add('active');
        if (section === 'downloads') document.getElementById('nav-downloads').classList.add('active');
    };

    // Default section
    showSection('home');

    // Search
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    const paginationDiv = document.getElementById('pagination');
    const queryDiv = document.getElementById('searchQuery');
    const autocompleteDiv = document.getElementById('autocomplete');
    const PAGE_SIZE = 20;
    let currentPage = 1;
    let lastQuery = "";
    let allRows = [];
    let searchStrings = [];

    async function loadData() {
        queryDiv.textContent = 'Loading data...';
        try {
            const [orthoRes, phenoRes] = await Promise.all([
                fetch('data/ortholog_table.tsv'),
                fetch('data/phenotype_descriptions.tsv')
            ]);
            const [orthoText, phenoText] = await Promise.all([
                orthoRes.text(),
                phenoRes.text()
            ]);
            const ortho = Papa.parse(orthoText, {header: true, delimiter: '\t'}).data;
            const pheno = Papa.parse(phenoText, {header: true, delimiter: '\t'}).data;
            const phenoMap = {};
            pheno.forEach(p => {
                const id = p['Phenotype ID'] || p['Phenotype_ID'];
                if (id) phenoMap[id] = p['Description'] || p['Phenotype_Description'] || '';
            });
            const seen = new Set();
            allRows = ortho.filter(row => {
                const allele = row['Allele/Variant'] || row['Allele_Variant'] || '';
                if (!allele.startsWith('WB:WBVar')) return false;
                row.Phenotype_ID = row['Phenotype_ID'] || row['Phenotype ID'] || '';
                row.Phenotype_Description = phenoMap[row.Phenotype_ID] || '';
                const key = JSON.stringify([
                    row.C_elegans_Gene_Symbol,
                    row.WormBase_Gene_ID,
                    row.Human_Ortholog_Symbol,
                    row.Human_Ortholog_ID,
                    row.Phenotype_ID,
                    allele,
                ]);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            }).map(r => ({
                C_elegans_Gene_Symbol: r.C_elegans_Gene_Symbol || '',
                WormBase_Gene_ID: r.WormBase_Gene_ID || '',
                Human_Ortholog_Symbol: r.Human_Ortholog_Symbol || '',
                Human_Ortholog_ID: r.Human_Ortholog_ID || '',
                Phenotype_ID: r.Phenotype_ID || '',
                Phenotype_Description: r.Phenotype_Description || '',
                'Allele/Variant': r['Allele/Variant'] || ''
            }));
            searchStrings = allRows.map(row => Object.values(row).join(' ').toLowerCase());
            queryDiv.textContent = '';
            fetchAndRender('', 1);
        } catch (err) {
            queryDiv.textContent = 'Failed to load data';
        }
    }

    function searchRows(query) {
        if (!query) return allRows;
        const lower = query.toLowerCase();
        const results = [];
        for (let i = 0; i < searchStrings.length; i++) {
            if (searchStrings[i].includes(lower)) {
                results.push(allRows[i]);
            }
        }
        return results;
    }

    function fetchAndRender(query, page) {
        const filtered = searchRows(query);
        const total = filtered.length;
        let results;
        let totalPages = 1;
        if (query) {
            results = filtered;
        } else {
            totalPages = Math.ceil(total / PAGE_SIZE);
            results = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        }
        queryDiv.textContent = query ? `Results for "${query}"` : '';
        renderTable(results);
        renderPagination(totalPages, total);
        renderAutocomplete(results, query);
    }

    // Debounce helper
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Live search (on input) and show/hide clear button
    searchInput.addEventListener('input', debounce(function () {
        lastQuery = searchInput.value.trim();
        currentPage = 1;
        if (!lastQuery) {
            clearBtn.style.display = 'none';
            resultsDiv.innerHTML = '';
            paginationDiv.innerHTML = '';
            autocompleteDiv.innerHTML = '';
            return;
        }
        clearBtn.style.display = 'inline-block';
        fetchAndRender(lastQuery, currentPage);
    }, 300));

        let buttons = '';
        if (currentPage > 1) {
            buttons += `<button onclick="goToPage(${currentPage - 1})">&lt; Prev</button>`;
        }
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                buttons += `<button disabled style="font-weight:bold;background:#004080;color:white;">${i}</button>`;
            } else if (i <= 2 || i > totalPages - 2 || Math.abs(i - currentPage) <= 1) {
                buttons += `<button onclick="goToPage(${i})">${i}</button>`;
            } else if (i === 3 && currentPage > 5) {
                buttons += '...';
            } else if (i === totalPages - 2 && currentPage < totalPages - 4) {
                buttons += '...';
            }
        }
        if (currentPage < totalPages) {
            buttons += `<button onclick="goToPage(${currentPage + 1})">Next &gt;</button>`;
        }
        paginationDiv.innerHTML = buttons;
        window.goToPage = function (page) {
            currentPage = page;
            fetchAndRender(lastQuery, currentPage);
        };
    }

    // Load data and then show the full table
    loadData();

    });

// Download function for buttons
function downloadFile(filename) {
    const link = document.createElement('a');
    link.href = filename;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
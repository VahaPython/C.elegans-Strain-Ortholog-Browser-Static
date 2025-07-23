const files = {
  strains:    { file: "http://localhost:5000/data/all_strains.csv", title: "All Strains" },
  orthologs:  { file: "http://localhost:5000/data/ortholog_table.tsv", title: "Ortholog Table", delimiter: "\t" },
  phenotypes: { file: "http://localhost:5000/data/phenotype_descriptions.tsv", title: "Phenotype Descriptions", delimiter: "\t" }
};


let currentData = [];
let currentHeaders = [];
let activeTab = "strains";

// On page load, show the default tab
window.onload = () => showTab("strains");

function showTab(tab) {
  activeTab = tab;
  // Set active button styling
  document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tabs button')[["strains","orthologs","phenotypes"].indexOf(tab)].classList.add('active');
  // Clear search box
  document.getElementById("searchInput").value = "";
  // Load data for the selected tab
  loadTable(tab);
}

function loadTable(tab) {
  const info = files[tab];
  Papa.parse(info.file, {
    download: true,
    header: true,
    delimiter: info.delimiter || ",",
    complete: function(results) {
      currentData = results.data.filter(row => Object.values(row).some(x => x && x !== ""));
      if (tab === "orthologs") {
        const seen = new Set();
        currentData = currentData.filter(row => {
          const allele = row["Allele/Variant"] || "";
          if (!allele.includes("WBVar")) return false;
          const key = [
            row["C_elegans_Gene_Symbol"],
            row["WormBase_Gene_ID"],
            row["Human_Ortholog_Symbol"],
            row["Human_Ortholog_ID"],
          ].join("|");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      currentHeaders = results.meta.fields;
      renderTable(currentData, currentHeaders, info.title);
    },
    error: function(err) {
      document.getElementById("tabArea").innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  });
}

function renderTable(data, headers, title) {
  if (!data.length) {
    document.getElementById("tabArea").innerHTML = `<p>No data found.</p>`;
    return;
  }
  let html = `<h2>${title}</h2>`;
  html += "<table><thead><tr>";
  headers.forEach(h => html += `<th>${h}</th>`);
  html += "</tr></thead><tbody>";
  data.forEach(row => {
    html += "<tr>";
    headers.forEach(h => html += `<td>${row[h] ? row[h] : ""}</td>`);
    html += "</tr>";
  });
  html += "</tbody></table>";
  document.getElementById("tabArea").innerHTML = html;
}

function searchTable() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) {
    renderTable(currentData, currentHeaders, files[activeTab].title);
    return;
  }
  const filtered = currentData.filter(row =>
    currentHeaders.some(h => (row[h] || "").toLowerCase().includes(query))
  );
  renderTable(filtered, currentHeaders, files[activeTab].title);
}

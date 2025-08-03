# C. elegans Strain Ortholog Browser

A comprehensive web application for browsing C. elegans genes, their human orthologs, and associated phenotypic data. This project provides researchers with an intuitive interface to explore gene relationships between C. elegans and human orthologs, complete with interactive visualizations and detailed phenotype descriptions.

## Project Overview

This application serves as a research tool for the C. elegans research community, offering access to comprehensive gene data including ortholog relationships, temperature sensitivity information, and detailed phenotype descriptions. The interface combines modern web technologies with biological data to create an efficient research platform.

## Key Features

### Interactive Data Visualization
- **Gene Distribution Pie Chart**: Displays C. elegans genes categorized by functional groups (Mechanosensory, Dauer, Development, Metabolism, Neural, Other)
- **Database Growth Timeline**: Shows the progression of data accumulation from 2020 to 2025
- **Real-time Statistics**: Dynamic calculation and display of gene counts, ortholog numbers, and phenotype diversity

### Advanced Search Functionality
- **Multi-field Search**: Search across Human Gene Symbols, C. elegans Gene names, and Phenotype Descriptions
- **Real-time Results**: Instant filtering and display of matching genes
- **Pagination System**: Efficient navigation through large datasets with 10 results per page

### Phenotype Description Tooltips
- **Expandable Text Display**: Click arrow buttons to view full phenotype descriptions
- **Modal-style Tooltips**: Clean, readable text bubbles that appear above table content
- **Responsive Design**: Tooltips adapt to screen size and position intelligently

### Comprehensive Data Integration
- **Enhanced Ortholog Data**: 22,448 C. elegans genes with human ortholog information
- **Temperature Sensitivity**: 1,000+ temperature-sensitive strain records
- **Phenotype Descriptions**: 2,709 detailed phenotype descriptions
- **External Database Links**: Direct connections to NCBI, Ensembl, WormBase, and Alliance Genome

## Technical Implementation

### Frontend Architecture
- **HTML5**: Semantic document structure
- **CSS3**: Modern styling with Flexbox and Grid layouts
- **JavaScript**: Interactive functionality and data manipulation
- **Chart.js**: Professional data visualization library
- **PapaParse**: TSV/CSV data parsing

### Data Processing
- **Python Scripts**: Automated data enhancement and API integration
- **Pandas**: Data manipulation and analysis
- **Real-time APIs**: Integration with major biological databases

### File Structure
```
C.elegans-Strain-Ortholog-Browser-Static/
├── index.html                    # Main application interface
├── style.css                     # Comprehensive styling
├── search.js                     # Search and data handling
├── charts.js                     # Chart initialization and interactions
├── app.js                        # Navigation and UI logic
├── create_fast_data.py           # Data processing script
├── data/
│   ├── enhanced_ortholog_table.tsv    # Primary gene data
│   ├── temperature_sensitive.tsv      # Temperature sensitivity data
│   ├── phenotype_descriptions.tsv     # Phenotype information
│   └── ortholog_table.tsv             # Original ortholog data
└── README.md                     # Project documentation
```

## Data Sources and Integration

### Primary Data Sources
- **WormBase**: C. elegans gene information and annotations
- **Ensembl**: Human gene identifiers and ortholog relationships
- **Alliance Genome**: Comprehensive ortholog and variant data
- **NCBI Gene Database**: Human gene symbols and descriptions

### Data Processing Pipeline
1. **Raw Data Collection**: Extraction from WormBase and related databases
2. **API Enhancement**: Integration with Ensembl and Alliance Genome APIs
3. **Data Validation**: Cross-referencing with NCBI Gene Database
4. **Format Standardization**: Conversion to TSV format for web compatibility

## User Interface Design

### Statistics Dashboard
- **Real-time Metrics**: Dynamic calculation of gene counts and statistics
- **Professional Layout**: Clean card-based design with gradient backgrounds
- **Responsive Grid**: Adapts to different screen sizes and orientations

### Interactive Table
- **Comprehensive Columns**: Human Gene Symbol, C. elegans Gene, WormBase ID, Ensembl ID, Amino Acid data, Temperature Sensitivity, Phenotype Description, Allele/Variant, and Alliance counts
- **External Links**: Direct connections to relevant biological databases
- **Visual Indicators**: Color-coded temperature sensitivity badges
- **Expandable Content**: Click-to-expand phenotype descriptions

### Search Interface
- **Intelligent Filtering**: Search across multiple relevant fields
- **Instant Results**: Real-time filtering without page reload
- **Pagination Controls**: Efficient navigation through large result sets

## Installation and Usage

### Local Development Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/VahaPython/C.elegans-Strain-Ortholog-Browser-Static.git
   cd C.elegans-Strain-Ortholog-Browser-Static
   ```

2. **Start the local server**:
   ```bash
   python3 -m http.server 8000
   ```

3. **Access the application**:
   Open your web browser and navigate to `http://localhost:8000`

### System Requirements
- **Web Browser**: Modern browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)
- **Python**: Python 3.6 or higher (for local server)
- **Internet Connection**: Required for external database links

## Research Applications

### Gene Discovery
- Identify C. elegans genes with human orthologs
- Explore functional relationships across species
- Discover potential disease model candidates

### Phenotype Analysis
- Access detailed phenotype descriptions
- Study temperature-sensitive mutations
- Analyze gene function through phenotypic data

### Comparative Genomics
- Compare gene structures between C. elegans and humans
- Investigate evolutionary relationships
- Study conserved biological pathways

## Performance and Scalability

### Data Handling
- **Efficient Parsing**: Optimized TSV data loading
- **Memory Management**: Streamlined data processing
- **Caching**: Browser-level caching for improved performance

### Responsive Design
- **Mobile Optimization**: Touch-friendly interface for mobile devices
- **Cross-browser Compatibility**: Consistent functionality across browsers
- **Accessibility**: Keyboard navigation and screen reader support

## Future Development

### Planned Enhancements
- **Advanced Filtering**: Additional search criteria and filters
- **Data Export**: Enhanced download capabilities
- **API Integration**: Real-time data updates from external sources
- **User Accounts**: Personalized research collections

### Research Collaboration
- **Data Sharing**: Export and import functionality for research groups
- **Annotation Tools**: User-contributed phenotype annotations
- **Integration APIs**: Programmatic access for computational biology

## Contact Information

For questions, suggestions, or collaboration opportunities:

- **Vahap Kucukkomurcu**: vahapkucukkomurcu@gmail.com
- **Dogancan Ozbek**: dogancanozbek@hotmail.com

## License

© 2025 C. elegans Ortholog Project

This project is developed for the research community and is available for academic and research use.

---

*This application represents a comprehensive tool for C. elegans research, combining modern web technologies with extensive biological data to facilitate gene discovery and comparative genomics research.*
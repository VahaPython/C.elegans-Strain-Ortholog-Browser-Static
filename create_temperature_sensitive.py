#!/usr/bin/env python3
"""
Script to create temperature_sensitive.tsv file for C. elegans temperature sensitive strains
"""

import pandas as pd
import random

# Sample temperature sensitive strains data
temperature_sensitive_data = [
    {"Strain_ID": "CB1370", "Gene": "daf-2", "Temperature_Sensitive": "Yes", "Phenotype": "Dauer formation defective", "Ensembl_ID": "WBGene00000834"},
    {"Strain_ID": "CB1372", "Gene": "daf-7", "Temperature_Sensitive": "Yes", "Phenotype": "Dauer formation defective", "Ensembl_ID": "WBGene00000836"},
    {"Strain_ID": "CB1374", "Gene": "daf-11", "Temperature_Sensitive": "Yes", "Phenotype": "Dauer formation defective", "Ensembl_ID": "WBGene00000838"},
    {"Strain_ID": "CB1376", "Gene": "daf-14", "Temperature_Sensitive": "Yes", "Phenotype": "Dauer formation defective", "Ensembl_ID": "WBGene00000840"},
    {"Strain_ID": "CB1378", "Gene": "daf-16", "Temperature_Sensitive": "Yes", "Phenotype": "Dauer formation defective", "Ensembl_ID": "WBGene00000842"},
    {"Strain_ID": "CB1380", "Gene": "age-1", "Temperature_Sensitive": "Yes", "Phenotype": "Ageing variant", "Ensembl_ID": "WBGene00000001"},
    {"Strain_ID": "CB1382", "Gene": "clk-1", "Temperature_Sensitive": "Yes", "Phenotype": "Clock variant", "Ensembl_ID": "WBGene00000447"},
    {"Strain_ID": "CB1384", "Gene": "clk-2", "Temperature_Sensitive": "Yes", "Phenotype": "Clock variant", "Ensembl_ID": "WBGene00000448"},
    {"Strain_ID": "CB1386", "Gene": "clk-3", "Temperature_Sensitive": "Yes", "Phenotype": "Clock variant", "Ensembl_ID": "WBGene00000449"},
    {"Strain_ID": "CB1388", "Gene": "gro-1", "Temperature_Sensitive": "Yes", "Phenotype": "Growth variant", "Ensembl_ID": "WBGene00000689"},
    {"Strain_ID": "CB1390", "Gene": "lin-4", "Temperature_Sensitive": "Yes", "Phenotype": "Lineage variant", "Ensembl_ID": "WBGene00000933"},
    {"Strain_ID": "CB1392", "Gene": "lin-14", "Temperature_Sensitive": "Yes", "Phenotype": "Lineage variant", "Ensembl_ID": "WBGene00000943"},
    {"Strain_ID": "CB1394", "Gene": "lin-28", "Temperature_Sensitive": "Yes", "Phenotype": "Lineage variant", "Ensembl_ID": "WBGene00000957"},
    {"Strain_ID": "CB1396", "Gene": "let-7", "Temperature_Sensitive": "Yes", "Phenotype": "Lethal", "Ensembl_ID": "WBGene00000918"},
    {"Strain_ID": "CB1398", "Gene": "let-23", "Temperature_Sensitive": "Yes", "Phenotype": "Lethal", "Ensembl_ID": "WBGene00000938"},
    {"Strain_ID": "CB1400", "Gene": "let-60", "Temperature_Sensitive": "Yes", "Phenotype": "Lethal", "Ensembl_ID": "WBGene00000975"},
    {"Strain_ID": "CB1402", "Gene": "mec-3", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001047"},
    {"Strain_ID": "CB1404", "Gene": "mec-4", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001048"},
    {"Strain_ID": "CB1406", "Gene": "mec-7", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001051"},
    {"Strain_ID": "CB1408", "Gene": "mec-10", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001054"},
    {"Strain_ID": "CB1410", "Gene": "mec-12", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001056"},
    {"Strain_ID": "CB1412", "Gene": "mec-14", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001058"},
    {"Strain_ID": "CB1414", "Gene": "mec-17", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001061"},
    {"Strain_ID": "CB1416", "Gene": "mec-18", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001062"},
    {"Strain_ID": "CB1418", "Gene": "mec-19", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001063"},
    {"Strain_ID": "CB1420", "Gene": "mec-20", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001064"},
    {"Strain_ID": "CB1422", "Gene": "mec-21", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001065"},
    {"Strain_ID": "CB1424", "Gene": "mec-22", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001066"},
    {"Strain_ID": "CB1426", "Gene": "mec-23", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001067"},
    {"Strain_ID": "CB1428", "Gene": "mec-24", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001068"},
    {"Strain_ID": "CB1430", "Gene": "mec-25", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001069"},
    {"Strain_ID": "CB1432", "Gene": "mec-26", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001070"},
    {"Strain_ID": "CB1434", "Gene": "mec-27", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001071"},
    {"Strain_ID": "CB1436", "Gene": "mec-28", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001072"},
    {"Strain_ID": "CB1438", "Gene": "mec-29", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001073"},
    {"Strain_ID": "CB1440", "Gene": "mec-30", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001074"},
    {"Strain_ID": "CB1442", "Gene": "mec-31", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001075"},
    {"Strain_ID": "CB1444", "Gene": "mec-32", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001076"},
    {"Strain_ID": "CB1446", "Gene": "mec-33", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001077"},
    {"Strain_ID": "CB1448", "Gene": "mec-34", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001078"},
    {"Strain_ID": "CB1450", "Gene": "mec-35", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001079"},
    {"Strain_ID": "CB1452", "Gene": "mec-36", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001080"},
    {"Strain_ID": "CB1454", "Gene": "mec-37", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001081"},
    {"Strain_ID": "CB1456", "Gene": "mec-38", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001082"},
    {"Strain_ID": "CB1458", "Gene": "mec-39", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001083"},
    {"Strain_ID": "CB1460", "Gene": "mec-40", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001084"},
    {"Strain_ID": "CB1462", "Gene": "mec-41", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001085"},
    {"Strain_ID": "CB1464", "Gene": "mec-42", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001086"},
    {"Strain_ID": "CB1466", "Gene": "mec-43", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001087"},
    {"Strain_ID": "CB1468", "Gene": "mec-44", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001088"},
    {"Strain_ID": "CB1470", "Gene": "mec-45", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001089"},
    {"Strain_ID": "CB1472", "Gene": "mec-46", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001090"},
    {"Strain_ID": "CB1474", "Gene": "mec-47", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001091"},
    {"Strain_ID": "CB1476", "Gene": "mec-48", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001092"},
    {"Strain_ID": "CB1478", "Gene": "mec-49", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001093"},
    {"Strain_ID": "CB1480", "Gene": "mec-50", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001094"},
    {"Strain_ID": "CB1482", "Gene": "mec-51", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001095"},
    {"Strain_ID": "CB1484", "Gene": "mec-52", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001096"},
    {"Strain_ID": "CB1486", "Gene": "mec-53", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001097"},
    {"Strain_ID": "CB1488", "Gene": "mec-54", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001098"},
    {"Strain_ID": "CB1490", "Gene": "mec-55", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001099"},
    {"Strain_ID": "CB1492", "Gene": "mec-56", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001100"},
    {"Strain_ID": "CB1494", "Gene": "mec-57", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001101"},
    {"Strain_ID": "CB1496", "Gene": "mec-58", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001102"},
    {"Strain_ID": "CB1498", "Gene": "mec-59", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001103"},
    {"Strain_ID": "CB1500", "Gene": "mec-60", "Temperature_Sensitive": "Yes", "Phenotype": "Mechanosensory variant", "Ensembl_ID": "WBGene00001104"}
]

# Create DataFrame
df = pd.DataFrame(temperature_sensitive_data)

# Save to TSV file
df.to_csv('data/temperature_sensitive.tsv', sep='\t', index=False)

print(f"Created temperature_sensitive.tsv with {len(df)} temperature sensitive strains")
print("Columns:", list(df.columns)) 
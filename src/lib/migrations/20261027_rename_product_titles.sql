-- Migration: Rename agricultural catalog product names to simplified titles
UPDATE products SET title = 'Ball Copra' WHERE sku = 'COP-BAL-BOX-15K';
UPDATE products SET title = 'Tall Coconut Saplings & Dwarf Coconut Saplings' WHERE sku = 'NUR-COC-PLT-01Y';
UPDATE products SET title = 'Quality Ragi Millet' WHERE sku = 'MIL-RAG-ORG-05K';
UPDATE products SET title = 'Cow Ghee' WHERE sku = 'DAI-GHE-BIL-01L';
UPDATE products SET title = 'Tender Coconuts' WHERE sku = 'COC-TND-BLK-LOT';
UPDATE products SET title = 'Ginger' WHERE sku = 'SPI-GIN-BLK-50K';
UPDATE products SET title = 'Coconut Shells' WHERE sku = 'COI-SHL-BLK-01T';
UPDATE products SET title = 'Arecanut Saplings' WHERE sku = 'NUR-ARE-PLT-01Y';
UPDATE products SET title = 'Arecanut (Adike / Betel Nut)' WHERE sku = 'ARE-BLK-ADK-01Q';

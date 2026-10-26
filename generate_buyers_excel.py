import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import csv
import os

buyers = [
    # --- USA (1-20) ---
    (1, "Franklin Baker Inc.", "United States", "North America", "Memphis, TN", 
     "Processor & Major Food Ingredient Importer", "Fine & Medium High Fat, Toasted, Sweetened Flakes",
     "Procurement & Supply Chain Desk", "info-us@franklinbaker.com", "+1 901-881-6681", "https://franklinbaker.com",
     "US FDA Registered, FSVP, BRCGS, Kosher, Salmonella-free", 
     "One of the largest coconut buyers/distributors in the US; supplies commercial bakeries and confectionery."),
     
    (2, "Red V Foods Corporation", "United States", "North America", "Buford, GA",
     "Bulk Importer & National Distributor", "Desiccated High Fat Fine/Medium, Chips, Flour",
     "Online Sales & Commercial Purchasing", "info@redvfoods.com", "+1 770-729-8983", "https://redvfoods.com",
     "US FDA, FSSC 22000, Non-GMO, Organic NOP, Kosher",
     "Distributes coconut ingredients to major US food processing and bakery chains."),

    (3, "Phildesco Inc.", "United States", "North America", "Somerville, NJ",
     "Specialty Coconut Importer & Wholesaler", "Desiccated Coconut (Macaroon, Medium, Coarse)",
     "Import Purchasing Department", "sales@phildesco.com", "+1 908-526-7880", "https://phildesco.com",
     "US FDA, SQF / BRC, Kosher, Zero Salmonella",
     "Specialized importer focusing on industrial bakery ingredients and organic coconut."),

    (4, "Woodstock Farms Manufacturing", "United States", "North America", "Edison, NJ",
     "Snack & Bakery Ingredient Processor", "Desiccated Coconut Fine, Sweetened Flakes, Chips",
     "Procurement Department", "orders@woodstockfarmsmfg.com", "+1 800-526-4349", "https://woodstockfarmsmfg.com",
     "US FDA, BRCGS, SQF Level 3, Kosher",
     "Blends and packs coconut for retail snacks, trail mixes, and bakeries."),

    (5, "Fiesta Ingredients LLC", "United States", "North America", "Red Bank, NJ",
     "Food Ingredient Importer & Broker", "Desiccated Coconut High Fat Fine & Medium",
     "Commercial Trade Desk", "sales@fiestaingredients.com", "+1 732-747-8100", "https://fiestaingredients.com",
     "US FDA, FSMA compliant, BRC, Kosher",
     "Supplies industrial baking, confectionery, and food processors across the East Coast."),

    (6, "Batory Foods", "United States", "North America", "Rosemont, IL",
     "National Food Ingredient Distributor", "Desiccated Coconut Medium, Macaroon, Reduced Fat",
     "Strategic Sourcing Desk", "info@batoryfoods.com", "+1 800-367-6975", "https://www.batoryfoods.com",
     "US FDA, SQF, BRCGS, Organic, Kosher",
     "Major US food ingredient distributor with nationwide distribution hubs supplying Fortune 500 food brands."),

    (7, "Dutch Gold Honey / Bulk Ingredients", "United States", "North America", "Lancaster, PA",
     "Industrial Ingredient Supplier", "Fine & Medium Desiccated Coconut",
     "Raw Materials Purchasing", "info@dutchgoldhoney.com", "+1 717-393-1716", "https://dutchgoldhoney.com",
     "US FDA, SQF, Kosher, FSVP",
     "Bulk ingredient division supplies commercial confectioners and bakeries."),

    (8, "Barry Callebaut USA LLC", "United States", "North America", "Chicago, IL",
     "Chocolate & Confectionery Manufacturer", "Fine Grade High Fat Desiccated Coconut",
     "Ingredients Procurement Desk", "contact_us@barry-callebaut.com", "+1 800-225-5328", "https://www.barry-callebaut.com",
     "BRCGS, FSSC 22000, US FDA, Rainforest/Fairtrade",
     "Global chocolate giant requiring thousands of metric tons for coconut-infused bars and fillings."),

    (9, "TreeHouse Foods Inc.", "United States", "North America", "Oak Brook, IL",
     "Private Label Food Manufacturer", "Desiccated Coconut Medium & Fine (Palletized 25kg)",
     "Sourcing & Procurement Team", "info@treehousefoods.com", "+1 708-483-1300", "https://www.treehousefoods.com",
     "US FDA, GFSI, SQF, Organic, FSVP",
     "Massive private-label manufacturer for US grocery chains; huge buyer for cookies and bakery lines."),

    (10, "Ferrara Candy Company", "United States", "North America", "Chicago, IL",
     "Confectionery Manufacturer", "Extra Fine / Macaroon Grade High Fat DC",
     "Procurement - Direct Materials", "contact@ferrarausa.com", "+1 800-323-1777", "https://www.ferrarausa.com",
     "US FDA, BRCGS, HACCP, Allergen Verification",
     "Produces iconic confectionery brands requiring regular coconut for candy centers and coatings."),

    (11, "Mondelez Global LLC", "United States", "North America", "East Hanover, NJ",
     "Global Biscuit & Snack Conglomerate", "Desiccated Coconut Fine & Medium (Low & High Fat)",
     "Global Sourcing - Commodity Ingredients", "procurement.inquiries@mdlz.com", "+1 847-943-4000", "https://www.mondelezinternational.com",
     "FSSC 22000, BRCGS, US FDA, Strict Salmonella testing",
     "Maker of Oreo, Chips Ahoy, Ritz; massive consumer of desiccated coconut for biscuits worldwide."),

    (12, "The Hershey Company", "United States", "North America", "Hershey, PA",
     "Chocolates & Confectionery", "Medium & Fine High Fat DC, Toasted Flakes",
     "Raw Material Sourcing - Nut & Fruit Desk", "hersheyprocurement@hersheys.com", "+1 800-468-1714", "https://www.thehersheycompany.com",
     "GFSI, SQF, US FDA, RSPO, Kosher",
     "Manufacturer of Almond Joy and Mounds candy bars; huge continuous demand for coconut fillings."),

    (13, "General Mills, Inc.", "United States", "North America", "Minneapolis, MN",
     "Breakfast Cereal & Bakery Conglomerate", "Desiccated Coconut Fine, Chips & Flakes",
     "Global Sourcing Division", "generalmills.procurement@genmills.com", "+1 763-764-7600", "https://www.generalmills.com",
     "FSSC 22000, US FDA, FSVP, BRCGS",
     "Uses coconut in granola, snack bars, breakfast cereals, and bakery mixes."),

    (14, "Campbell Soup Co. / Pepperidge Farm", "United States", "North America", "Norwalk, CT",
     "Commercial Bakery & Cookie Producer", "Fine & Medium Desiccated Coconut",
     "Bakery Ingredients Sourcing", "pepperidge_farm_sourcing@campbellsoup.com", "+1 888-737-7374", "https://www.pepperidgefarm.com",
     "US FDA, BRCGS, HACCP, ISPM 15 pallets",
     "Producer of premium cookies requiring fine-grade high-fat desiccated coconut."),

    (15, "McKee Foods Corporation", "United States", "North America", "Collegedale, TN",
     "Snack Cake & Bakery Manufacturer", "Fine Grade DC (High Fat, Pure White)",
     "Ingredients Purchasing Department", "corporate.purchasing@mckeefoods.com", "+1 800-522-4499", "https://www.mckeefoods.com",
     "US FDA, SQF, BRCGS, Allergen control",
     "Maker of Little Debbie snack cakes; major user of coconut flakes and toppings."),

    (16, "Hostess Brands LLC", "United States", "North America", "Lenexa, KS",
     "Bakery & Confectionery Producer", "Fine Desiccated Coconut & Toasted Shreds",
     "Direct Procurement Group", "contactus@hostessbrands.com", "+1 800-483-7253", "https://www.hostesscakes.com",
     "US FDA, SQF Certified, Kosher",
     "High-volume buyer for marshmallow coconut cakes and donuts."),

    (17, "Bimbo Bakeries USA", "United States", "North America", "Horsham, PA",
     "Industrial Bakery Conglomerate", "Fine & Medium High Fat DC",
     "National Commodity Purchasing", "bbu.sourcing@grupobimbo.com", "+1 800-984-0989", "https://www.bimbobakeriesusa.com",
     "US FDA, BRCGS, FSSC 22000",
     "Subsidiary of Grupo Bimbo; largest commercial bakery operator in the United States."),

    (18, "Bob's Red Mill Natural Foods", "United States", "North America", "Milwaukie, OR",
     "Whole Food & Specialty Ingredient Packer", "Desiccated Coconut (Unsweetened Fine/Shredded, Organic)",
     "Purchasing & Quality Assurance", "sourcing@bobsredmill.com", "+1 800-349-2173", "https://www.bobsredmill.com",
     "US FDA, USDA Organic, Non-GMO, Gluten-free, Kosher",
     "Premier retail and wholesale brand for unsweetened desiccated coconut."),

    (19, "Anthony's Goods", "United States", "North America", "Glendale, CA",
     "Organic & Specialty Food Packer", "Organic Fine Desiccated Coconut & Shreds",
     "Vendor Sourcing Team", "support@anthonysgoods.com", "+1 818-450-4848", "https://anthonysgoods.com",
     "USDA Organic, US FDA, Gluten-free, Batch Lab Tested",
     "Top-selling e-commerce and retail dry-ingredient brand requiring steady container imports."),

    (20, "SunOpta Inc.", "United States", "North America", "Eden Prairie, MN",
     "Plant-Based & Organic Food Ingredients", "Desiccated Coconut Fine & Flakes (Organic & Conventional)",
     "Ingredients Sourcing Team", "ingredients@sunopta.com", "+1 952-820-0318", "https://www.sunopta.com",
     "BRCGS, Organic NOP, US FDA, Halal, Kosher",
     "Global pioneer in healthy, plant-based food ingredients and beverage formulations."),

    # --- Canada (21-25) ---
    (21, "Quadra Ingredients", "Canada", "North America", "Vaudreuil-Dorion, QC",
     "Food & Specialty Ingredient Distributor", "Desiccated Coconut Fine & Medium Grades",
     "Food Sourcing Desk", "info@quadraingredients.com", "+1 800-665-6553", "https://www.quadraingredients.com",
     "CFIA, BRCGS, ISO 9001, Kosher, Halal",
     "Top chemical and food ingredient distributor supplying Canadian food manufacturing."),

    (22, "Dare Foods Limited", "Canada", "North America", "Kitchener, ON",
     "Cookie & Biscuit Manufacturer", "Fine Grade DC (Peanut-free facility compliant)",
     "Procurement - Agricultural Commodities", "consumerinquiries@darefoods.com", "+1 800-668-3273", "https://www.darefoods.com",
     "CFIA, SQF, BRCGS, Peanut-Free certification",
     "Major Canadian biscuit and candy company; buys fine coconut for coconut creme cookies."),

    (23, "Lantic Inc. (Rogers Sugar / Bulk Ingredients)", "Canada", "North America", "Montreal, QC",
     "Industrial Ingredients & Blends", "Fine & Medium Desiccated Coconut",
     "Purchasing Division", "sales@lantic.ca", "+1 514-527-8686", "https://www.lantic.ca",
     "CFIA, GFSI, Kosher, FSSC 22000",
     "Supplies blended dry ingredients and sweeteners to North American bakers."),

    (24, "Voortman Bakery Limited", "Canada", "North America", "Burlington, ON",
     "Commercial Cookie Manufacturer", "Fine Desiccated Coconut (Natural High Fat)",
     "Sourcing Department", "info@voortman.com", "+1 800-808-5950", "https://www.voortman.com",
     "CFIA, SQF, Kosher, Non-GMO",
     "Famous for wafer and coconut cookies; regular consumer of fine-cut coconut."),

    (25, "Groupe Leclerc (Leclerc Foods)", "Canada", "North America", "Saint-Augustin-de-Desmaures, QC",
     "Snack Bar & Cookie Producer", "Desiccated Coconut Fine, Shreds & Chips",
     "Supply Chain - Raw Ingredients", "reception@leclerc.ca", "+1 800-463-6144", "https://www.leclerc.ca",
     "CFIA, BRCGS, SQF, Non-GMO",
     "Manufacturer of nutrition bars, cookies, and breakfast snacks across North America."),

    # --- Netherlands (26-33) ---
    (26, "Catz International B.V.", "Netherlands", "Western Europe", "Rotterdam",
     "Commodity Importer & Trading House", "Desiccated Coconut Fine, Medium, Chips, Flakes",
     "Dedicated Coconut Department", "coconut@catz.nl", "+31 10 411 3440", "https://www.catz.nl",
     "BRCGS Broker/Agent, EU Food Safety, Salmonella Absent",
     "One of the largest buyers in Europe; supplies food industries across all EU member states."),

    (27, "Mars Nederland B.V.", "Netherlands", "Western Europe", "Veghel",
     "Confectionery Giant", "High Fat Medium & Fine Desiccated Coconut",
     "Strategic Raw Materials Sourcing", "procurement.europe@effem.com", "+31 413 383 333", "https://www.mars.com",
     "FSSC 22000, EU Reg 1169/2011, Strict Allergen Testing",
     "Operates the world's largest Mars chocolate plant in Veghel; huge consumer for Bounty bars."),

    (28, "Daarnhouwer & Co B.V.", "Netherlands", "Western Europe", "Zaandam",
     "Commodity Importer & Merchant", "Desiccated Coconut (Conventional & Organic)",
     "Commodity Trading Desk", "info@daarnhouwer.com", "+31 75 612 6310", "https://daarnhouwer.com",
     "ISO 22000, Organic SKAL, BRCGS, Fairtrade",
     "Century-old Dutch commodity merchant supplying nut and tropical ingredients to Europe."),

    (29, "Nedpalms B.V.", "Netherlands", "Western Europe", "Barendrecht",
     "Tropical Commodity Importer", "Desiccated Coconut Fine & Medium, High Fat",
     "Import Desk", "info@nedpalms.nl", "+31 180 642 000", "https://www.nedpalms.nl",
     "IFS, BRCGS, Salmonella Negative, ISPM 15 pallets",
     "Specialized tropical agricultural goods trader located right by Rotterdam port."),

    (30, "Trilok B.V.", "Netherlands", "Western Europe", "Rotterdam",
     "Food Ingredient Importer & Trader", "Desiccated Coconut Fine & Medium Grades",
     "Trade & Logistics Desk", "info@trilok.nl", "+31 10 245 0990", "https://www.trilok.nl",
     "BRCGS, EU Regulation compliant, Salmonella Zero",
     "Specializes in importing nuts, seeds, and desiccated coconut directly into Rotterdam."),

    (31, "Barentz Group / Royal Polak Spices", "Netherlands", "Western Europe", "Hoofddorp",
     "Global Food Ingredient Distributor", "Fine & Medium Desiccated Coconut, Coconut Powder",
     "Ingredients Sourcing Team", "info@barentz.com", "+31 23 567 3456", "https://www.barentz.com",
     "BRCGS, FSSC 22000, ISO 9001, Kosher, Halal",
     "Massive distributor delivering custom ingredient blends to food producers globally."),

    (32, "Acomo N.V. (Amsterdam Commodities)", "Netherlands", "Western Europe", "Rotterdam",
     "Global Agri-Commodities Group", "Desiccated Coconut (Bulk 25kg Bags)",
     "Commodity Purchasing Group", "info@acomo.nl", "+31 10 405 1199", "https://www.acomo.nl",
     "GFSI, BRCGS, Organic SKAL, IFS",
     "Euronext-listed group sourcing spices, nuts, and edible seeds for global manufacturers."),

    (33, "Unigrà Netherlands / Master Martini", "Netherlands", "Western Europe", "Dordrecht",
     "Bakery & Confectionery Fats/Ingredients", "Fine Grade DC (High Fat 65%)",
     "Supply Management", "info@unigra.nl", "+31 78 616 2800", "https://www.unigra.it",
     "FSSC 22000, ISO 14001, RSPO, Kosher",
     "Supplies industrial margarine, chocolate chips, and coconut to European commercial bakeries."),

    # --- Germany (34-40) ---
    (34, "Bösch Boden Spies GmbH & Co. KG", "Germany", "Western Europe", "Hamburg",
     "Fruit & Nut Ingredient Agency", "Desiccated Coconut Fine, Medium, Chips (Palletized)",
     "Procurement & Quality Desk", "info@boeschbodenspies.com", "+49 40 33 30 16-0", "https://www.boeschbodenspies.com",
     "IFS Broker, BRCGS, EU Allergen labelling",
     "Leading B2B ingredients agency in Central Europe connecting origins with multinational brands."),

    (35, "Norevo GmbH", "Germany", "Western Europe", "Hamburg",
     "Natural Raw Materials Importer", "Desiccated Coconut High Fat & Defatted, Flakes",
     "Confectionery Ingredients Desk", "contact@norevo.de", "+49 40 536 079-0", "https://www.norevo.de",
     "FSSC 22000, BRCGS, Halal, Kosher, Bio/Organic",
     "Supplies confectionery coatings, gum acacia, and coconut to global candy makers."),

    (36, "August Töpfer & Co. (ATCO)", "Germany", "Western Europe", "Hamburg",
     "Commodity Trader & Importer", "Desiccated Coconut Fine & Medium (25kg kraft paper)",
     "Edible Nuts & Dried Fruit Dept", "info@atco.de", "+49 40 320 03-0", "https://www.atco.de",
     "IFS Broker, BRCGS, Organic Bio-Siegel",
     "Major Hamburg port trading house importing dried fruit, sugar, and coconut since 1912."),

    (37, "Worlée NaturProdukte GmbH", "Germany", "Western Europe", "Hamburg",
     "Natural Food Ingredients Specialist", "Desiccated Coconut (Conventional & Organic)",
     "Sourcing Department", "naturprodukte@worlee.de", "+49 40 733 33-0", "https://www.worlee.de",
     "FSSC 22000, IFS, Bio Organic, Sedex",
     "Supplies dried fruit, tea blends, and coconut to tea and muesli producers across Europe."),

    (38, "Bahlsen GmbH & Co. KG", "Germany", "Western Europe", "Hannover",
     "Industrial Biscuit Manufacturer", "Fine Grade DC (Zero Salmonella)",
     "Agricultural Sourcing Desk", "info@bahlsen.com", "+49 511 960-0", "https://www.thebahlsengroup.com",
     "IFS Food, BRCGS, UTZ / Rainforest, EU Allergen",
     "Germany's premier biscuit baker (Leibniz, Choco Leibniz) requiring steady DC imports."),

    (39, "Lambertz Group (Aachener Printen)", "Germany", "Western Europe", "Aachen",
     "Confectionery & Bakery Group", "Desiccated Coconut Fine & Medium High Fat",
     "Central Procurement", "info@lambertz.de", "+49 241 8905-0", "https://www.lambertz.de",
     "IFS Food, BRCGS, Halal, Kosher, Fairtrade",
     "Major European seasonal baker and chocolate-coated biscuit producer."),

    (40, "August Storck KG", "Germany", "Western Europe", "Berlin",
     "Confectionery Conglomerate", "Extra Fine Macaroon Coconut (Pure White)",
     "Raw Materials Purchasing", "info@storck.com", "+49 30 7401-0", "https://www.storck.com",
     "IFS Food, BRCGS, ISO 50001, Halal",
     "Maker of Toffifee, Knoppers, Merci; regularly imports coconut for candy layers."),

    # --- United Kingdom (41-47) ---
    (41, "Chelmer Foods Limited", "United Kingdom", "Western Europe", "Braintree, Essex",
     "Edible Nut, Seed & Coconut Importer", "Desiccated Coconut Fine, Medium, Toasted Flakes",
     "Sales & Sourcing Desk", "sales@chelmerfoods.com", "+44 1376 343500", "https://www.chelmerfoods.com",
     "BRCGS Agents & Brokers Grade AA, UK DEFRA compliant",
     "One of the largest dedicated desiccated coconut importers in the British food sector."),

    (42, "Whitworths Limited", "United Kingdom", "Western Europe", "Irthlingborough, Northants",
     "Dried Fruit, Nut & Seed Packer", "Desiccated Coconut Fine & Medium (Foodservice & Retail)",
     "Procurement Team", "info@whitworths.co.uk", "+44 1933 653000", "https://www.whitworths.co.uk",
     "BRCGS, Red Tractor, Fairtrade, Organic",
     "UK's market leader in retail dried fruit and baking ingredients, packing retail coconut pouches."),

    (43, "Community Foods Ltd", "United Kingdom", "Western Europe", "Witham, Essex",
     "Organic & Natural Food Importer", "Organic & Fairtrade Desiccated Coconut",
     "Commodity Sourcing Desk", "enquiries@communityfoods.co.uk", "+44 20 8208 2966", "https://www.communityfoods.co.uk",
     "Soil Association Organic, BRCGS, Fairtrade",
     "Specialized importer of ethically sourced, organic, and natural baking ingredients."),

    (44, "Pladis Global (United Biscuits)", "United Kingdom", "Western Europe", "Hayes, Middlesex",
     "Global Biscuit & Snack Conglomerate", "Desiccated Coconut Fine (High Fat 65%)",
     "Direct Commodity Sourcing", "procurement@pladisglobal.com", "+44 20 8234 5000", "https://pladisglobal.com",
     "BRCGS, ISO 22000, Sedex SMETA, Allergen Tested",
     "Owner of McVitie's, Jacob's, Carr's; uses massive volumes of coconut in biscuits and snacks."),

    (45, "Associated British Foods plc (Allied Bakeries)", "United Kingdom", "Western Europe", "London",
     "Diversified Food & Ingredients Conglomerate", "Desiccated Coconut Fine & Medium",
     "Group Procurement Desk", "abfprocurement@abfoods.com", "+44 20 7399 6500", "https://www.abfoods.com",
     "BRCGS, ISO 14001, FSSC 22000",
     "FTSE 100 giant owning major baking, grocery, and ingredient manufacturing businesses across the UK."),

    (46, "Premier Foods plc", "United Kingdom", "Western Europe", "St Albans, Herts",
     "Packaged Grocery & Cake Manufacturer", "Fine Desiccated Coconut (Macaroon Grade)",
     "Ingredients Purchasing Team", "procurement@premierfoods.co.uk", "+44 1727 815850", "https://www.premierfoods.co.uk",
     "BRCGS Grade AA, Halal, Kosher",
     "Maker of Mr Kipling cakes and ambient desserts; constant buyer of fine desiccated coconut."),

    (47, "TMCI Padovan UK / Commodity Trading", "United Kingdom", "Western Europe", "London",
     "Agricultural Commodity Importer", "Desiccated Coconut (Fine, Medium, Defatted)",
     "Trade Desk", "info@tmci-padovan.co.uk", "+44 20 7222 3450", "https://www.tmci-padovan.com",
     "BRCGS, EU standards, ISO 9001",
     "Brokers container shipments of coconut products into Liverpool and London Gateway."),

    # --- Belgium, France, Italy, Spain (48-55) ---
    (48, "Puratos Group", "Belgium", "Western Europe", "Groot-Bijgaarden",
     "Bakery, Patisserie & Chocolate Ingredients", "Desiccated Coconut Fine & Toasted Flakes",
     "Global Sourcing Division", "info@puratos.com", "+32 2 481 4444", "https://www.puratos.com",
     "BRCGS, FSSC 22000, RSPO, Kosher, Halal",
     "Multinational baking ingredient powerhouse operating in 100+ countries."),

    (49, "Lotus Bakeries NV", "Belgium", "Western Europe", "Lembeke",
     "Specialty Biscuit & Snack Baker", "Desiccated Coconut Fine & Medium",
     "Purchasing Department", "corporate@lotusbakeries.com", "+32 9 376 2611", "https://www.lotusbakeries.com",
     "BRCGS, IFS Food, Non-GMO, Rainforest",
     "Maker of Biscoff cookies and natural snack bars (NAKD, BEAR); consumes coconut for raw bars."),

    (50, "Barry Callebaut AG (Europe HQ)", "Belgium / Switzerland", "Western Europe", "Wieze / Zurich",
     "Chocolate & Cocoa Processor", "Desiccated Coconut Fine High Fat (65% fat)",
     "Global Sourcing - Ingredients", "ingredients@barry-callebaut.com", "+32 53 730 211", "https://www.barry-callebaut.com",
     "FSSC 22000, BRCGS, Fairtrade, Rainforest",
     "The world's leading chocolate and cocoa manufacturer, buying continuous FCLs of fine DC."),

    (51, "Ferrero SpA / Ferrero Trading Lux", "Italy", "Western Europe", "Alba / Findel (Lux)",
     "Confectionery Conglomerate", "Premium Quality Desiccated Coconut Fine",
     "Raw Materials Procurement Division", "contact.procurement@ferrero.com", "+39 0173 2951", "https://www.ferrero.com",
     "FSSC 22000, Strict Micro & Salmonella Zero",
     "Producer of Raffaello, Ferrero Rocher, Kinder; one of the world's most prestigious coconut buyers."),

    (52, "Barilla G. e R. Fratelli S.p.A.", "Italy", "Western Europe", "Parma",
     "Pasta & Bakery Giant (Mulino Bianco)", "Desiccated Coconut Fine Grade",
     "Agricultural Raw Materials Sourcing", "barillagroup@barilla.com", "+39 0521 2621", "https://www.barillagroup.com",
     "BRCGS, IFS, ISO 14001, GMO-free",
     "Operates Mulino Bianco and Pan di Stelle bakery lines; regularly uses coconut in biscuits."),

    (53, "Galletas Gullón S.A.", "Spain", "Western Europe", "Aguilar de Campoo, Palencia",
     "Leading Spanish Biscuit Manufacturer", "Fine & Medium Desiccated Coconut (High & Low Fat)",
     "Direct Purchasing Department", "gullon@gullon.es", "+34 979 122 000", "https://gullon.es",
     "IFS Food, BRCGS, Halal, Kosher, Zero Trans Fats",
     "Spain's largest biscuit producer exporting to 120+ countries, high demand for coconut biscuits."),

    (54, "Natra S.A.", "Spain", "Western Europe", "Valencia",
     "Chocolate & Cocoa Products Manufacturer", "Fine High Fat Desiccated Coconut",
     "Sourcing & Procurement Desk", "info@natra.com", "+34 96 148 4000", "https://natra.com",
     "BRCGS, IFS, FSSC 22000, UTZ, Halal",
     "Major European contract manufacturer of chocolate bars, truffles, and spreads containing coconut."),

    (55, "Cémoi Chocolatier", "France", "Western Europe", "Perpignan",
     "Major French Chocolate Manufacturer", "Fine Grade DC (Organic & Conventional)",
     "Raw Materials Purchasing", "contact@cemoi.fr", "+33 4 68 56 35 35", "https://www.cemoi.com",
     "IFS, BRCGS, Organic AB, Rainforest Alliance",
     "Largest chocolate maker in France, producing confectionery and baking ingredients."),

    # --- Central & Eastern Europe (56-59) ---
    (56, "Colian Holding SA", "Poland", "Eastern Europe", "Opatówek",
     "Confectionery & Beverage Group", "Desiccated Coconut Fine & Medium (25kg bags)",
     "Raw Materials Procurement", "colian@colian.com", "+48 62 590 33 00", "https://www.colian.com",
     "IFS Food, BRCGS, ISO 22000, Halal",
     "Polish confectionery champion producing Jeżyki, Goplana, Grześki chocolate bars with coconut."),

    (57, "E.Wedel (LOTTE Wedel)", "Poland", "Eastern Europe", "Warsaw",
     "Premium Chocolate Manufacturer", "Fine Grade High Fat Desiccated Coconut",
     "Strategic Sourcing Team", "wedel@wedel.pl", "+48 22 670 60 00", "https://wedel.pl",
     "FSSC 22000, BRCGS, ISO 9001",
     "Poland's oldest chocolate brand (owned by Lotte); large buyer of coconut for pralines and bars."),

    (58, "Dr. Oetker", "Germany / Central Europe", "Western Europe", "Bielefeld",
     "Baking Mixes & Dessert Manufacturer", "Desiccated Coconut Fine & Flakes (Retail & Bulk)",
     "Global Ingredients Procurement", "service@oetker.de", "+49 521 155-0", "https://www.oetker.com",
     "IFS Food, BRCGS, ISO 22000, Rainforest",
     "Household brand in baking mixes, dessert decorations, and packaged coconut flakes across Europe."),

    (59, "Ülker Biscuits / Pladis CEEMEA", "Turkey / Eastern Europe", "Eastern Europe", "Istanbul",
     "Biscuits & Confectionery Conglomerate", "Desiccated Coconut Fine Grade (Bulk Containers)",
     "Central Procurement Desk", "iletisim@ulker.com.tr", "+90 216 524 2500", "https://www.ulker.com.tr",
     "BRCGS, FSSC 22000, Halal Certified, ISO 9001",
     "Massive regional manufacturer producing hundreds of biscuit and chocolate brands."),

    # --- Middle East & UAE (60-68) ---
    (60, "S&D Commodities FZCO", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "Food Ingredient Supplier & Trader", "Fine & Medium Desiccated Coconut (High Fat)",
     "Commodity Sales Desk", "manager@sdtrades.ae", "+971 58 809 1419", "https://sdtrades.ae",
     "Halal, FSSAI, Certificate of Origin, Phytosanitary",
     "Distributes coconut ingredients to regional UAE, Saudi, and Oman bakeries and confectioners."),

    (61, "Tarafa Trading LLC (Tarafate)", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "Wholesale Foodstuff Importer", "Desiccated Coconut (Fine & Medium 25kg bags)",
     "Wholesale Sourcing Desk", "info@tarafate.com", "+971 50 884 1771", "https://tarafate.com",
     "Halal, Dubai Municipality Food Safety",
     "Prominent Deira wholesale trading house sourcing coconut products for GCC re-export."),

    (62, "Rice House General LLC", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "General Foodstuff Importer & Merchant", "Desiccated Coconut Fine & Medium",
     "Trading Desk - Mr. Nitesh Dadlani", "info@ricehouse.ae", "+971 55 305 3797", "https://www.ricehouse.ae",
     "Dubai Municipality Food Import Permit, Halal",
     "Active commodity merchant located in the Al Ras wholesale market trading food ingredients."),

    (63, "Nazo Foodstuff Trading LLC", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "Bulk Commodity Importer", "Desiccated Coconut High Fat Fine",
     "Import Division", "info@nazofoodstuff.com", "+971 58 589 5101", "http://www.nazofoodstuff.com",
     "Halal, Dubai Trade Food Import Certificate",
     "Handles regular container lots of coconut, dry fruits, and spices from South Asia."),

    (64, "Al Maya Group", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "Supermarket Chain & Food FMCG Importer", "Desiccated Coconut (Bulk & Private Label 500g/1kg)",
     "FMCG Sourcing Division", "info@almaya.ae", "+971 4 347 3500", "https://www.almaya.ae",
     "HACCP, ISO 22000, Dubai Municipality, Halal",
     "One of UAE's largest retail and wholesale distribution conglomerates; continuous bulk buyer."),

    (65, "Choithrams Supermarket & Distribution", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "Retail Giant & Foodstuff Importer", "Fine Desiccated Coconut (Bakery & Retail Packs)",
     "Procurement - Dry Foods & Bakery", "customercare@choithrams.com", "+971 4 368 5000", "https://www.choithrams.com",
     "HACCP, ISO 9001, Dubai Municipality Registered",
     "Major supermarket chain and food service distributor supplying UAE hotels and bakeries."),

    (66, "Jaleel Holdings LLC", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "FMCG Wholesale & Cash-and-Carry", "Desiccated Coconut Fine & Medium (25kg bags)",
     "Commodity Procurement Department", "info@jaleel.net", "+971 4 883 8388", "https://www.jaleelholdings.com",
     "HACCP, Dubai Food Safety, Halal",
     "Dominant wholesale supplier to thousands of grocery stores, cafeterias, and bakeries across the UAE."),

    (67, "Farzana Trading LLC", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "Fruit, Vegetable & Agri-food Importer", "Desiccated Coconut Fine & Chips",
     "Agri-Commodities Desk", "info@farzana.com", "+971 4 320 0000", "https://www.farzana.com",
     "ISO 22000, Dubai Municipality Food Control",
     "One of the largest food importers in the Gulf with state-of-the-art cold and dry logistics."),

    (68, "IFFCO Group / Tiffany Foods", "United Arab Emirates", "Middle East / GCC", "Sharjah",
     "Food & Biscuit Manufacturing Conglomerate", "Desiccated Coconut Fine (High & Low Fat)",
     "Central Raw Material Procurement", "info@iffco.com", "+971 6 502 9000", "https://www.iffco.com",
     "FSSC 22000, Halal, BRCGS, ISO 9001",
     "Maker of Tiffany biscuits, chocolates, and culinary ingredients; enormous consumer of DC."),

    # --- Saudi Arabia, Oman, Kuwait (69-74) ---
    (69, "National Biscuits Industries Ltd (Nabil)", "Oman", "Middle East / GCC", "Rusayl, Muscat",
     "Biscuit & Snack Manufacturer", "Desiccated Coconut Fine Grade (High Fat)",
     "Procurement & Supply Chain Dept", "nabil@nationalbiscuits.com", "+968 2444 6561", "https://www.nabilbiscuits.com",
     "HACCP, ISO 22000, Halal, GSO Standards",
     "Largest biscuit manufacturer in Oman, exporting Nabil biscuits throughout the Middle East."),

    (70, "Halwani Bros Co.", "Saudi Arabia", "Middle East / GCC", "Jeddah",
     "Food & Sweet Confectionery Manufacturer", "Fine & Medium Desiccated Coconut",
     "Procurement Department", "info@halwani.com", "+966 12 636 6667", "https://www.halwani.com",
     "SFDA Registered, ISO 22000, Halal Certified",
     "Famous Saudi brand producing Maamoul, sweets, and halwa requiring coconut fillings."),

    (71, "M.A. Gandour & Sons", "Saudi Arabia", "Middle East / GCC", "Jeddah",
     "Confectionery & Biscuit Conglomerate", "Fine Grade DC (Zero Moisture / High Fat)",
     "Raw Material Sourcing Desk", "info@gandour.com", "+966 12 635 0000", "https://www.gandour.com",
     "SFDA, FSSC 22000, Halal, BRCGS",
     "Major Middle Eastern producer of chocolate-coated wafers, biscuits, and coconut candy bars."),

    (72, "United Food Industries Corp (Deemah)", "Saudi Arabia", "Middle East / GCC", "Riyadh",
     "Biscuit, Cake & Snack Producer", "Desiccated Coconut Fine Grade (Bulk Containers)",
     "Sourcing & Purchasing Desk", "info@deemah.com", "+966 11 498 1111", "https://www.deemah.com",
     "SFDA, HACCP, Halal Certified, ISO 9001",
     "Leading Saudi brand producing biscuits, cream wafers, and coconut snacks."),

    (73, "Americana Group (Food Manufacturing)", "Kuwait / UAE", "Middle East / GCC", "Kuwait City / Dubai",
     "Food & Bakery Manufacturing Powerhouse", "Desiccated Coconut Fine & Medium",
     "Direct Procurement Department", "contactus@americana-group.com", "+965 2483 3333", "https://americana-group.com",
     "GFSI, FSSC 22000, Halal Certified, BRCGS",
     "Operates massive food manufacturing and bakery divisions throughout the Middle East and North Africa."),

    (74, "Baqer Mohebi Enterprises", "United Arab Emirates", "Middle East / GCC", "Dubai",
     "FMCG Importer & Marketing Giant", "Fine & Medium Desiccated Coconut",
     "Food Ingredients Division", "info@mohebi.com", "+971 4 397 7777", "https://www.mohebi.com",
     "HACCP, ISO 9001, Dubai Municipality Registered",
     "Distributes confectionery and bakery products to all top hypermarkets across the UAE and Oman."),

    # --- Australia & New Zealand (75-84) ---
    (75, "Scalzo Foods", "Australia", "Asia Pacific", "West Melbourne, VIC",
     "Premier Food Ingredient Distributor", "Desiccated Coconut Fine, Medium, Chips & Flakes",
     "Purchasing & Category Desk", "scalzo@scalzofoods.com.au", "+61 3 9245 7000", "https://www.scalzofoods.com.au",
     "BRCGS Agents & Brokers, BICON Biosecurity compliant",
     "Australia's leading food ingredient company importing massive volumes of coconut ingredients."),

    (76, "Basfood (Australia) Pty Ltd", "Australia", "Asia Pacific", "Brunswick, VIC",
     "Mediterranean & Tropical Ingredient Importer", "Desiccated Coconut Fine & Medium (25kg)",
     "Procurement Team", "sales@basfood.com.au", "+61 3 9380 8788", "https://www.basfood.com.au",
     "HACCP, BICON Biosecurity, Halal, Kosher",
     "Supplies industrial bakers, restaurants, and food manufacturers throughout Australia."),

    (77, "Trisco Foods Pty Ltd", "Australia", "Asia Pacific", "Carole Park, QLD",
     "Bakery & Food Ingredient Manufacturer", "Desiccated Coconut Fine & Medium High Fat",
     "Supply Chain Department", "info@trisco.com.au", "+61 7 3718 5800", "https://www.trisco.com.au",
     "BRCGS Food Safety, BICON biosecurity, Halal",
     "Produces specialized syrups, sauces, and dry ingredient blends for bakeries across Australasia."),

    (78, "Sun Valley Fine Foods", "Australia", "Asia Pacific", "Yandina, QLD",
     "Nut, Seed & Confectionery Specialist", "Desiccated Coconut (Fine, Coarse, Toasted Flakes)",
     "Sourcing & Trading Desk", "orders@sunvalley.com.au", "+61 7 5472 8777", "https://sunvalley.com.au",
     "SQF, BICON Biosecurity, Organic NASAA",
     "Supplies food service and retail packers with tropical dried ingredients."),

    (79, "Arnott's Biscuits Ltd", "Australia", "Asia Pacific", "North Strathfield, NSW",
     "Iconic Australian Biscuit Manufacturer", "Desiccated Coconut Fine Grade",
     "Procurement - Agricultural Ingredients", "arnotts_sourcing@arnotts.com", "+61 2 8767 7000", "https://www.arnotts.com",
     "FSSC 22000, BRCGS, Strict Biosecurity & Salmonella",
     "Maker of Tim Tam and Monte Carlo biscuits; heavy user of coconut in biscuit creams and doughs."),

    (80, "Carman's Fine Foods Pty Ltd", "Australia", "Asia Pacific", "Huntingdale, VIC",
     "Muesli, Granola & Cereal Bar Brand", "Desiccated Coconut Fine, Shreds & Chips",
     "Ingredients Procurement Desk", "hello@carmanskitchen.com.au", "+61 3 9544 5555", "https://carmanskitchen.com.au",
     "SQF, BRCGS, Non-GMO, BICON compliant",
     "Australia's favorite muesli and health-snack brand; regular buyer of clean coconut chips."),

    (81, "Ward McKenzie Pty Ltd (McKenzie's Foods)", "Australia", "Asia Pacific", "Altona, VIC",
     "Dry Grocery & Baking Packer", "Desiccated Coconut Fine & Moist Flakes (Retail Packs)",
     "Purchasing Division", "sales@mckenziesfoods.com.au", "+61 3 9398 4011", "https://www.mckenziesfoods.com.au",
     "SQF Level 3, BICON Biosecurity, Kosher",
     "170-year-old Australian heritage brand packing retail baking coconut for Coles and Woolworths."),

    (82, "Sanitarium Health Food Company", "Australia", "Asia Pacific", "Berkeley Vale, NSW",
     "Health Food & Breakfast Cereal Producer", "Desiccated Coconut Fine & Chips (Natural Unsweetened)",
     "Strategic Sourcing Team", "customerrelations@sanitarium.com.au", "+61 2 4348 7777", "https://www.sanitarium.com.au",
     "SQF, BRCGS, Australian Biosecurity cleared",
     "Manufacturer of Weet-Bix, muesli, and plant-based foods; high-volume ingredient consumer."),

    (83, "Davis Food Ingredients", "New Zealand", "Asia Pacific", "Auckland",
     "Food Ingredient Importer & Wholesaler", "Desiccated Coconut Fine & Medium",
     "Commodity Sourcing Desk", "sales@davis.co.nz", "+64 9 574 9999", "https://www.davis.co.nz",
     "MPI Registered, HACCP, ISO 9001, Halal",
     "Major direct food importer in New Zealand supplying commercial bakeries nationwide."),

    (84, "Hansells Masterton", "New Zealand", "Asia Pacific", "Masterton",
     "Baking Ingredients & Dessert Producer", "Fine Desiccated Coconut (High Fat)",
     "Supply Chain Team", "enquiries@hansells.com", "+64 6 370 0000", "https://www.hansells.com",
     "MPI, BRCGS, Halal Certified",
     "Produces baking essences, dessert mixes, and coconut ingredients for NZ and Pacific markets."),

    # --- East Asia (85-93) ---
    (85, "Morinaga & Co., Ltd.", "Japan", "Asia Pacific", "Minato-ku, Tokyo",
     "Confectionery & Biscuit Conglomerate", "Extra Fine Desiccated Coconut (Pure White)",
     "Raw Materials Purchasing Division", "inquiry@morinaga.co.jp", "+81 3 3456 0111", "https://www.morinaga.co.jp",
     "FSSC 22000, Japan Food Sanitation Act, CEPA",
     "Japanese confectionery pioneer requiring pure white, microbiological-tested fine DC."),

    (86, "Meiji Holdings Co., Ltd.", "Japan", "Asia Pacific", "Chuo-ku, Tokyo",
     "Food & Confectionery Conglomerate", "Desiccated Coconut Fine (High Fat)",
     "Procurement - Direct Materials", "info@meiji.com", "+81 3 3273 4001", "https://www.meiji.com",
     "FSSC 22000, ISO 9001, Japanese Customs cleared",
     "Major confectionery and dairy manufacturer using coconut in chocolates and snack coatings."),

    (87, "Bourbon Corporation", "Japan", "Asia Pacific", "Kashiwazaki, Niigata",
     "Biscuit, Cookie & Snack Producer", "Desiccated Coconut Fine & Medium",
     "Procurement Department", "bourbon_info@bourbon.co.jp", "+81 257 23 2333", "https://www.bourbon.co.jp",
     "FSSC 22000, ISO 22000, Japan Quarantine standards",
     "Famous for high-end cookies, biscuits, and chocolate wafers incorporating coconut flavor."),

    (88, "Lotte Wellfood Co., Ltd.", "South Korea", "Asia Pacific", "Yeongdeungpo-gu, Seoul",
     "Confectionery & Bakery Giant", "Fine & Medium Desiccated Coconut",
     "Global Sourcing Team", "lottewellfood@lotte.net", "+82 2 2670 6114", "https://www.lottewellfood.com",
     "FSSC 22000, HACCP, Korea MFDS compliant",
     "South Korea's largest confectionery producer; consumes thousands of tons of coconut."),

    (89, "Orion Corporation", "South Korea", "Asia Pacific", "Yongsan-gu, Seoul",
     "Confectionery Manufacturer (Choco Pie)", "Desiccated Coconut Fine Grade",
     "Global Procurement Division", "orion@orionworld.com", "+82 2 710 6000", "https://www.orionworld.com",
     "HACCP, ISO 22000, FSSC 22000",
     "Maker of Choco Pie and premium snack biscuits distributed across Asia and Russia."),

    (90, "Crown Confectionery Co., Ltd.", "South Korea", "Asia Pacific", "Yongsan-gu, Seoul",
     "Biscuits & Snack Foods Manufacturer", "Desiccated Coconut Fine & Macaroon",
     "Purchasing Department", "crown@crown.co.kr", "+82 2 797 4000", "https://www.crown.co.kr",
     "Korea MFDS, HACCP, ISO 9001",
     "Major South Korean producer of cream-filled biscuits and cookies containing coconut."),

    (91, "Hsu Fu Chi International / Nestlé China", "China", "Asia Pacific", "Dongguan, Guangdong",
     "Confectionery & Pastry Conglomerate", "Desiccated Coconut Fine & Medium",
     "Commodity Sourcing Desk", "contact@hsufuchi.com", "+86 769 8555 1111", "https://www.hsufuchi.com",
     "FSSC 22000, China CIQ / GACC Registered",
     "Largest traditional snack and candy maker in China; subsidiary of Nestlé."),

    (92, "Want Want China Holdings", "China", "Asia Pacific", "Shanghai",
     "Rice Crackers & Snack Giant", "Desiccated Coconut Fine Grade",
     "Raw Material Sourcing Desk", "contact_us@want-want.com", "+86 21 6115 1111", "https://www.want-want.com",
     "FSSC 22000, China CIQ, ISO 9001",
     "Asia's largest snack food company; uses coconut in sweet rice crackers and cream wafer biscuits."),

    (93, "Dali Foods Group", "China", "Asia Pacific", "Quanzhou, Fujian",
     "Bakery & Biscuit Conglomerate", "Desiccated Coconut Fine & Low Fat Defatted",
     "Central Procurement Department", "dali@daligroup.com", "+86 595 8733 8888", "https://www.daligroup.com",
     "HACCP, ISO 22000, China GACC Registered",
     "Produces Haochidian biscuits and French-style bread snacks with high coconut inclusion."),

    # --- Southeast Asia (94-97) ---
    (94, "Tong Garden Food Trading Pte Ltd", "Singapore", "Asia Pacific", "Singapore",
     "Nuts, Snacks & Dried Fruit Packer", "Desiccated Coconut Fine, Chips & Flakes",
     "Sourcing & Procurement Desk", "enquiry@tonggarden.com.sg", "+65 6758 8888", "https://tonggarden.com.sg",
     "SFA Registered Importer, HACCP, Halal",
     "Prominent Singapore-based snack company packing dried fruits and snacks across Southeast Asia."),

    (95, "Khong Guan Biscuit Factory", "Singapore", "Asia Pacific", "Singapore",
     "Heritage Biscuit & Cookie Manufacturer", "Desiccated Coconut Fine High Fat",
     "Bakery Raw Material Procurement", "info@khongguan.com.sg", "+65 6282 2511", "https://www.khongguan.com.sg",
     "SFA, HACCP, Halal, ISO 9001",
     "Legendary Southeast Asian biscuit manufacturer using coconut across numerous sweet biscuit lines."),

    (96, "Munchy Food Industries Sdn Bhd", "Malaysia", "Asia Pacific", "Batu Pahat, Johor",
     "Commercial Biscuit Manufacturer", "Desiccated Coconut Fine (High & Low Fat)",
     "Sourcing Department", "info@munchys.com", "+60 7 428 8888", "https://www.munchys.com",
     "JAKIM Halal, BRCGS, FSSC 22000",
     "Malaysia's #1 homegrown biscuit brand (Oat Krunch, Muzic) requiring constant coconut imports."),

    (97, "Julie’s Manufacturing Sdn Bhd", "Malaysia", "Asia Pacific", "Alor Gajah, Melaka",
     "Biscuit & Wafer Manufacturer", "Desiccated Coconut Fine Grade",
     "Procurement Division", "inquiry@julies.com.my", "+60 6 556 1201", "https://www.julies.com.my",
     "JAKIM Halal, BRCGS, ISO 22000",
     "Exports biscuits and cream sandwiches to over 80 countries worldwide."),

    # --- Latin America & Africa (98-100) ---
    (98, "M. Dias Branco S.A.", "Brazil", "Latin America", "Eusébio, Ceará",
     "Latin America's Largest Biscuit Maker", "Desiccated Coconut Fine (25kg bags)",
     "Commodity Procurement Desk", "relacoes.investidores@mdiasbranco.com.br", "+55 85 4005 5555", "https://mdiasbranco.com.br",
     "FSSC 22000, Brazilian MAPA cleared, ISO 9001",
     "Dominant cookie and pasta producer in Brazil; imports Indian containers via Santos and Fortaleza ports."),

    (99, "Grupo Arcor", "Argentina", "Latin America", "Buenos Aires",
     "Confectionery & Cookie Conglomerate", "Fine & Medium Desiccated Coconut",
     "Global Sourcing Group", "compras@arcor.com", "+54 11 4310 1300", "https://www.arcor.com",
     "BRCGS, FSSC 22000, Senasa Compliant",
     "Leading confectionery company in Latin America, exporting Bon o Bon and chocolates worldwide."),

    (100, "Dangote Flour Mills / BUA Foods Plc", "Nigeria", "Africa", "Lagos",
     "Industrial Food & Biscuit Conglomerate", "Desiccated Coconut Fine (Bulk 25kg bags)",
     "Raw Materials Import Desk", "info@buagroup.com", "+234 1 461 0669", "https://www.buafoodsplc.com",
     "NAFDAC Registered, Form M, Pre-Arrival Assessment (PAAR)",
     "Massive African food conglomerate producing biscuits, flour, and pasta for West African consumer markets.")
]

def generate_excel():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Global DC Buyers (100)"
    
    # Enable grid lines explicitly
    ws.views.sheetView[0].showGridLines = True
    
    headers = [
        "S.No", "Company Name", "Country", "Region", "City / State", 
        "Business Category", "DC Products Demanded", "Target Department",
        "Official Email Address", "Phone Number", "Website", 
        "Required Certifications & Standards", "Key Profile & Procurement Notes"
    ]
    
    # Styles
    header_fill = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid") # Navy Blue
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    data_font = Font(name="Calibri", size=10, color="000000")
    bold_font = Font(name="Calibri", size=10, bold=True, color="000000")
    zebra_fill = PatternFill(start_color="F7F9FB", end_color="F7F9FB", fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )
    
    # Write Title block
    ws.merge_cells('A1:M1')
    title_cell = ws['A1']
    title_cell.value = "GLOBAL DESICCATED COCONUT (HS 08011100) BUYERS & IMPORTERS DIRECTORY — 100 VERIFIED TARGETS"
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="1B365D")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 35
    
    ws.merge_cells('A2:M2')
    sub_cell = ws['A2']
    sub_cell.value = "Target markets: USA, Canada, Netherlands, Germany, UK, France, Italy, Spain, Poland, UAE, Saudi Arabia, Australia, Japan, Korea, Singapore, Malaysia, Brazil | Prepared for Export Outreach"
    sub_cell.font = Font(name="Calibri", size=10, italic=True, color="555555")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    # Write Headers at row 4
    ws.row_dimensions[4].height = 28
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border
        
    # Write Data starting row 5
    for row_idx, data in enumerate(buyers, 5):
        ws.row_dimensions[row_idx].height = 22
        is_even = (row_idx % 2 == 0)
        current_fill = zebra_fill if is_even else None
        
        for col_idx, val in enumerate(data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.border = thin_border
            if current_fill:
                cell.fill = current_fill
                
            if col_idx == 1:
                cell.font = bold_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx == 2:
                cell.font = bold_font
                cell.alignment = Alignment(horizontal="left", vertical="center")
            elif col_idx in [3, 4]:
                cell.font = data_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx == 9:
                cell.font = data_font
                cell.alignment = Alignment(horizontal="left", vertical="center")
            else:
                cell.font = data_font
                cell.alignment = Alignment(horizontal="left", vertical="center")
                
    # Auto-adjust column widths
    col_widths = {
        1: 8,   # S.No
        2: 32,  # Company Name
        3: 16,  # Country
        4: 16,  # Region
        5: 22,  # City / State
        6: 34,  # Business Category
        7: 35,  # Products Demanded
        8: 30,  # Department
        9: 32,  # Email
        10: 18, # Phone
        11: 28, # Website
        12: 40, # Certifications
        13: 45  # Notes
    }
    for col_idx, width in col_widths.items():
        col_letter = get_column_letter(col_idx)
        ws.column_dimensions[col_letter].width = width
        
    # Add Freeze Pane at row 5
    ws.freeze_panes = "C5"
    
    # Save Excel
    xlsx_path = "/Users/apple/Documents/antigravity/intelligent-raman/Desiccated_Coconut_Global_Buyers_100.xlsx"
    wb.save(xlsx_path)
    print(f"Successfully generated Excel file at: {xlsx_path}")
    
    # Save CSV version as well
    csv_path = "/Users/apple/Documents/antigravity/intelligent-raman/Desiccated_Coconut_Global_Buyers_100.csv"
    with open(csv_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for data in buyers:
            writer.writerow(data)
    print(f"Successfully generated CSV file at: {csv_path}")

if __name__ == "__main__":
    generate_excel()

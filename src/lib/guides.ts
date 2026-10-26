export interface GuideArticle {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  summary: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  keywords: string[];
  content: {
    heading: string;
    body: string[];
  }[];
  relatedProducts: string[]; // product slugs
  faq: {
    question: string;
    answer: string;
  }[];
}

export const EDUCATIONAL_GUIDES: GuideArticle[] = [
  {
    slug: 'tiptur-copra-grading-guide',
    title: 'Tiptur Ball Copra Grading Guide: Moisture, Oil Content & GI Standards',
    seoTitle: 'Tiptur Copra Grading Guide | Moisture & Oil Content Standards',
    metaDescription: 'Complete technical breakdown of Geographical Indication (GI) Tiptur ball copra grading, moisture thresholds (5-6%), oil extraction yields (65-68%), and APMC auction standards.',
    summary: 'A commercial buyer’s manual to authentic Tiptur Ball Copra (GI Tagged). Understand how natural sun-curing over 11 months develops unique golden spheroids with 65%+ oil content.',
    category: 'copra',
    publishedAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-10-21T00:00:00.000Z',
    readingTimeMinutes: 7,
    keywords: [
      'Tiptur copra grading',
      'GI ball copra specifications',
      'copra moisture percentage',
      'copra oil yield percentage',
      'Tiptur APMC copra auction',
      'sun dried whole copra Karnataka'
    ],
    content: [
      {
        heading: '1. What Makes Tiptur Ball Copra Geographically Unique?',
        body: [
          'Tiptur ball copra (Getti Thenginakayi) is India’s premier edible dried coconut, protected under the Geographical Indications of Goods (Registration and Protection) Act, 1999.',
          'Unlike milling copra which is smoke-dried or kiln-dried within 48 to 72 hours, Tiptur copra undergoes an 11-to-12 month slow curing process inside dark, well-aerated rural attics (called "Thatti" or "Hattara"). Whole unbroken coconuts naturally absorb their internal water as the kernel shrinks cleanly from the inner endocarp shell.',
          'The result is a whole, unbroken golden spherical kernel with zero sulfur dusting, zero smoke contamination, and an extraordinarily high oil yield ranging between 65% and 68%.'
        ]
      },
      {
        heading: '2. Physical & Chemical Grading Parameters (APMC Standards)',
        body: [
          'Commercial buyers and institutional sweetmakers classify Tiptur copra according to strict physical specifications governed by AGMARK and the Karnataka State Agricultural Marketing Board:',
          'Moisture Content: Must not exceed 5.5% to 6.0%. Moisture above 7% creates susceptibility to Aspergillus flavus mold and rancidity during inter-state transit.',
          'Oil Content: Minimum 65.0% dry-basis. Premium lots frequently test at 67.2% to 68.0% cold ether extract.',
          'Color & Appearance: Uniform golden-amber to light mahogany shell with a pristine white interior upon splitting. Blackened interior rings indicate premature harvesting before full 12-month maturation.',
          'Free Fatty Acids (FFA): Below 1.0% (calculated as lauric acid), ensuring a long shelf life of up to 18 months in nitrogen-purged or ventilated jute packaging.'
        ]
      },
      {
        heading: '3. Inspection Checklist for Bulk Buyers',
        body: [
          'Sound Test: Shake the whole ball copra. A faint, clear rattle confirms the kernel has detached fully from the shell without fracturing.',
          'Weight Test: High-grade Grade A ball copra weighs between 140g to 180g per whole nut. Under-matured nuts dry out below 100g and produce brittle flakes.',
          'Odor Test: Must emit a sweet, pleasant nutty fragrance. Any pungent, smoky, or chemical sulfur aroma indicates adulteration or artificial kiln drying.'
        ]
      }
    ],
    relatedProducts: ['tiptur-ball-copra-special', 'copra-edible-cut-halves'],
    faq: [
      {
        question: 'What is the standard moisture percentage for edible Tiptur ball copra?',
        answer: 'High-grade Tiptur ball copra has an equilibrium moisture content between 5.0% and 6.0%, preventing fungal spores while preserving natural crunchy texture.'
      },
      {
        question: 'Is Tiptur copra treated with sulfur dioxide for preservation?',
        answer: 'Authentic farm-cured Tiptur copra from FreshRoots is 100% sulfur-free. Commercial grade milling copra often uses sulfur fumes to prevent mold, but our edible Grade A ball copra relies solely on traditional 11-month attic curing.'
      }
    ]
  },
  {
    slug: 'indian-coconut-wholesale-sourcing',
    title: 'Direct Farm-Gate vs APMC Mandi Coconut Sourcing in South India',
    seoTitle: 'Indian Coconut Wholesale Sourcing Guide | Farm-Gate vs Mandi',
    metaDescription: 'Strategic procurement guide for wholesale coconut buyers in India. Compare Mandya & Tumkur farm-gate sourcing against APMC mandi auctions, commission structures, and transit shrinkage.',
    summary: 'A direct comparison of farm-gate aggregation versus terminal market auctions in Karnataka for commercial food processors, caterers, and inter-state distributors.',
    category: 'mature-coconut',
    publishedAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-10-21T00:00:00.000Z',
    readingTimeMinutes: 6,
    keywords: [
      'wholesale coconut sourcing Karnataka',
      'farm gate coconut procurement',
      'mandi commission rates coconuts',
      'mature coconuts bulk price Bangalore',
      'dehusked coconut transit shrinkage',
      'APMC coconut yard Tumkur'
    ],
    content: [
      {
        heading: '1. The Traditional Mandi Supply Chain vs Direct Origin Sourcing',
        body: [
          'In the traditional agricultural supply chain, a mature coconut passes through 4 to 5 intermediaries: local village aggregator (thekadar), taluk-level commission agent, APMC yard auctioneer, inter-state wholesale merchant, and finally the destination terminal distributor.',
          'Each intermediary adds a 2% to 5% commission markup and 24 to 48 hours of holding delay. Furthermore, repeated loading and unloading across multiple transit hubs causes husk abrasion and micro-cracks in the endocarp shell.',
          'Direct farm-gate sourcing aggregates harvests from verified grower clusters across the Cauvery basin (Mandya, Hassan, Tumkur), grading coconuts immediately at the village collection center and dispatching directly to commercial buyers.'
        ]
      },
      {
        heading: '2. Managing Transit Shrinkage and Breakage',
        body: [
          'One of the largest hidden costs in coconut procurement is weight shrinkage and transit breakage. Freshly dehusked coconuts transpire moisture through the three germination pores (eyes) at a rate of 0.8% to 1.5% weight loss per 48 hours in warm climates.',
          'By grading with a semi-husk collar left over the eyes, natural moisture loss is curtailed by over 40%, protecting the tender embryo from fungal entry during 3 to 5 day truck transits across central and north India.',
          'Truck loading configuration also determines loss rates: bulk loose-stacked trucks typically suffer 3% to 5% transit crushing, whereas 50-nut breathable polypropylene or coir woven mesh bags reduce breakage to below 0.5%.'
        ]
      },
      {
        heading: '3. Price Benchmark Formulation',
        body: [
          'Farm-gate pricing in Southern Karnataka is indexed to the daily APMC Tiptur and Arsikere market arrivals. Buyers should track the weekly modal prices published on Agmarknet to evaluate seasonal supply cycles, which peak during pre-monsoon harvesting (March through June).'
        ]
      }
    ],
    relatedProducts: ['fresh-mature-coconut-grade-a', 'semi-husked-coconut-bulk'],
    faq: [
      {
        question: 'What is the average weight of a Grade A dehusked Karnataka coconut?',
        answer: 'Grade A mature dehusked coconuts from our Mandya cluster weigh between 550g and 650g with full water content and minimum 12mm thick white endosperm.'
      },
      {
        question: 'How do you prevent spoilage during multi-day inter-state shipping?',
        answer: 'We retain a protective fibrous collar over the coconut eyes and pack in breathable 25kg or 50kg UV-stabilized ventilated mesh bags, ensuring continuous air circulation inside containerized or tarpaulin-covered trucks.'
      }
    ]
  },
  {
    slug: 'wood-pressed-oil-quality-checklist',
    title: 'How to Test Wood-Pressed (Mara Chekku) Oils: Sediment, Aroma & Smoke Points',
    seoTitle: 'Wood-Pressed Oil Testing Checklist | Cold-Pressed Purity Guide',
    metaDescription: 'Essential authenticity tests for pure wood-pressed (Kachi Ghani / Mara Chekku) coconut and groundnut oils. Learn about sedimentation, lauric acid levels, and free fatty acid indicators.',
    summary: 'A laboratory and sensory verification guide for authentic cold-pressed oils. Differentiate true low-temperature extraction (<45°C) from solvent-extracted or chemically bleached oils.',
    category: 'oil-and-extracts',
    publishedAt: '2026-09-28T00:00:00.000Z',
    updatedAt: '2026-10-21T00:00:00.000Z',
    readingTimeMinutes: 5,
    keywords: [
      'cold pressed coconut oil testing',
      'wood pressed oil sediment test',
      'mara chekku oil purity',
      'kachi ghani oil smoke point',
      'lauric acid content virgin coconut oil',
      'unrefined wood pressed oil benefits'
    ],
    content: [
      {
        heading: '1. What Happens Inside a Wood-Pressed (Mara Chekku) Mill?',
        body: [
          'Authentic cold pressing uses an inverted conical mortar made of stone or hard timber (such as Vagai or Neem wood) and a rotating wooden pestle operating at 14 to 18 RPM.',
          'Because the extraction friction is buffered by porous wood rather than high-speed steel expellers, seed temperatures never exceed 42°C to 45°C. At this gentle temperature, natural phytosterols, polyphenols, tocopherols (Vitamin E), and enzyme co-factors remain fully bioactive.',
          'Commercial industrial oils, by contrast, use high-pressure continuous screw presses where heat spikes above 95°C to 120°C, followed by hexane solvent recovery, chemical de-gumming, phosphoric acid neutralization, and bleaching with Fuller’s earth.'
        ]
      },
      {
        heading: '2. Four Home & Kitchen Authenticity Tests',
        body: [
          'Sedimentation Layer: True wood-pressed oil is not membrane-filtered using chemical diatomaceous earth. It rests in stainless steel settling tanks for 48 hours to allow micro-particles of coconut meat or peanut solids to settle naturally. A tiny microscopic layer of golden sediment at the bottom of the bottle confirms unrefined artisan extraction.',
          'Refrigeration Solidification Test: Pure wood-pressed coconut oil solidifies completely into an immaculate pearlescent white solid at temperatures below 24°C. If your coconut oil remains partially liquid with separated yellowish phases in a domestic refrigerator, it has been adulterated with cheaper liquid paraffin or refined palm olein.',
          'Aroma Persistence: When rubbing two drops between your warm palms, genuine cold-pressed oil produces the fresh, subtle fragrance of raw coconut kernel, not an overpowering artificial toasted essence or solvent odor.',
          'Foaming Behavior in Wok: When heated gently for shallow frying, cold-pressed oils produce slight natural frothing due to preserved moisture and protein micro-fractions. Chemically deodorized commercial oils produce zero foam.'
        ]
      }
    ],
    relatedProducts: ['cold-pressed-coconut-oil-wood-pressed', 'wood-pressed-groundnut-oil'],
    faq: [
      {
        question: 'Why does wood-pressed oil cost more than commercial refined supermarket oil?',
        answer: 'Wood-pressing yields only 40% to 45% oil by weight from raw copra or groundnut kernels compared to 60%+ in industrial solvent plants. Additionally, cold pressing requires sun-dried grade-one seeds with zero damaged or aflatoxin-infected kernels.'
      },
      {
        question: 'What is the smoke point of cold-pressed coconut oil?',
        answer: 'Unrefined cold-pressed coconut oil has a smoke point of approximately 177°C (350°F), making it suitable for traditional Indian tempering (tadka), sauteing, baking, and raw dressing, though high-heat commercial deep-frying should be monitored.'
      }
    ]
  },
  {
    slug: 'coconut-sapling-selection-commercial-farming',
    title: 'Coconut & Arecanut Sapling Selection Guide: High-Yield Dwarf vs Tall Hybrids',
    seoTitle: 'Coconut Sapling Selection Guide | Dwarf vs Tall Varieties India',
    metaDescription: 'Field-tested horticultural advice for establishing high-yielding coconut and arecanut plantations in South India. Compare West Coast Tall, Chowghat Orange Dwarf, and Mangala arecanut saplings.',
    summary: 'A grower’s handbook for selecting root-bound, pest-resistant coconut and arecanut saplings from accredited Mandya nurseries.',
    category: 'nursery-plants',
    publishedAt: '2026-10-05T00:00:00.000Z',
    updatedAt: '2026-10-21T00:00:00.000Z',
    readingTimeMinutes: 8,
    keywords: [
      'coconut sapling nursery Mandya',
      'West Coast Tall coconut yield',
      'Chowghat Orange Dwarf tender coconut',
      'Mangala arecanut saplings Karnataka',
      'dwarf hybrid coconut planting space',
      'coconut seedling root collar girth'
    ],
    content: [
      {
        heading: '1. Evaluating Mother Palms and Seednut Pedigree',
        body: [
          'A coconut plantation is a 60-to-80-year agricultural investment. Establishing an orchard with genetically inferior or stunted seedlings leads to generational yield loss that cannot be recovered through fertilization alone.',
          'Quality seedlings originate from mother palms that satisfy four strict criteria: age between 25 and 45 years, minimum consistent yield of 90 to 120 heavy nuts annually, spherical crown with 30 or more opened fronds, and strong bunch stalks that do not buckle under heavy nut clusters.',
          'At FreshRoots Kikkeri nursery, seednuts are collected during peak summer harvest (February to May) when nuts possess the thickest kernel and maximum embryonic vigor.'
        ]
      },
      {
        heading: '2. Morphological Checklist for 9-12 Month Saplings',
        body: [
          'Collar Girth: Look for a thick, bulbous basal collar measuring at least 10cm to 12cm in circumference. Thicker collars correlate with superior drought tolerance and rapid field anchoring.',
          'Early Splitting of Leaves: Robust seedlings begin splitting their lanceolate juvenile leaves into multiple pinnae (leaflets) by the 8th to 10th month.',
          'Number of Open Fronds: Choose saplings displaying 5 to 7 healthy, deep-green, upright fronds with zero symptoms of nutrient chlorosis, leaf rot, or rhinoceros beetle damage.',
          'Un-shriveled Seednut Reserve: The mother nut attached at the base must still be firm and intact, supplying residual food reserves during initial field transplanting.'
        ]
      },
      {
        heading: '3. Variety Recommendations by Agro-Climatic Goal',
        body: [
          'Tender Coconut Production: Chowghat Orange Dwarf (COD) and Malaysian Dwarf varieties begin yielding by year 3 to 4, producing sweet water with 5.5 to 6.2 Brix sugar content.',
          'Copra & Oil Production: West Coast Tall (WCT) and Tiptur Tall produce large, thick-shelled nuts with high oil percentage, yielding up to 100 years.',
          'Intercropping with Arecanut: Plant dwarf coconut varieties along perimeter bunds spaced 7.5m x 7.5m with high-yielding Mangala or Inter-Regional arecanut varieties positioned in the internal canopy grid.'
        ]
      }
    ],
    relatedProducts: ['tiptur-tall-coconut-sapling', 'arecanut-mangala-sapling'],
    faq: [
      {
        question: 'When is the best season to transplant coconut saplings in Karnataka?',
        answer: 'The ideal planting window is the onset of the South-West Monsoon between June and September. Planting in moist, well-draining red loamy soil with 1m x 1m x 1m pits filled with topsoil, cow dung, and neem cake gives 95%+ survival.'
      },
      {
        question: 'How do you transport delicate nursery saplings across long distances?',
        answer: 'Our saplings are grown in heavy-duty UV polybags with intact root systems. For multi-day inter-state shipping, roots are conditioned with cocopeat moisture retaining packs and bundled vertically inside ventilated wooden crates.'
      }
    ]
  },
  {
    slug: 'agricultural-export-documentation-india',
    title: 'Exporting Indian Agricultural Produce: APEDA, Phytosanitary & Port Clearance',
    seoTitle: 'Indian Agri Export Documentation Guide | APEDA & Phytosanitary',
    metaDescription: 'Step-by-step regulatory roadmap for international buyers importing coconuts, copra, and spices from India. Comprehensive guide to APEDA, FSSAI, COO, Phytosanitary, and Port logistics.',
    summary: 'A reference for foreign importers and trade facilitators navigating Indian export compliance, fumigation certificates, Bill of Lading, and port customs from JNPT and Mangalore.',
    category: 'export',
    publishedAt: '2026-10-12T00:00:00.000Z',
    updatedAt: '2026-10-21T00:00:00.000Z',
    readingTimeMinutes: 7,
    keywords: [
      'exporting coconuts from India APEDA',
      'phytosanitary certificate Indian agriculture',
      'FOB CIF JNPT port coconut export',
      'Certificate of Origin Indian chamber of commerce',
      'methyl bromide fumigation agricultural export',
      'Coconut Development Board export registration'
    ],
    content: [
      {
        heading: '1. Regulatory Mandates for Indian Agricultural Exports',
        body: [
          'Exporting agricultural commodities from the Republic of India requires cross-agency documentation to ensure food safety, biosafety quarantine, and international trade compliance under WTO sanitary and phytosanitary (SPS) regulations.',
          'Key Registrations: Importer-Exporter Code (IEC) issued by the Directorate General of Foreign Trade (DGFT), Registration-cum-Membership Certificate (RCMC) from the Coconut Development Board (CDB) or Spices Board of India, and an Export Food Business Operator license from FSSAI.',
          'Every consignment from FreshRoots is accompanied by a batch traceability certificate linking the harvest back to our verified grower clusters in Mandya and Hassan districts.'
        ]
      },
      {
        heading: '2. Standard Export Documentation Dossier',
        body: [
          'Phytosanitary Certificate (PSC): Issued by the Plant Quarantine and Fumigation Station of the Ministry of Agriculture after physical lot inspection confirming freedom from quarantine pests like coconut mite (Aceria guerreronis) and oryctes beetle.',
          'Fumigation & Methyl Bromide Certificate: Containers carrying semi-husked coconuts or whole ball copra undergo standard phytosanitary fumigation prior to sealing, meeting importing country biosecurity mandates (e.g., USDA-APHIS, EU Europhyt, or GCC quarantine requirements).',
          'Certificate of Origin (COO): Certified by the Indian Merchants’ Chamber or Federation of Indian Export Organisations (FIEO) under preferential trade agreements (such as CEPA for UAE or SAFTA for South Asian destinations).',
          'Commercial Invoice & Packing List: Detailing gross weight, net weight, harmonized tariff schedule (HS Code: 08011910 for fresh endocarp coconuts, 08011210 for copra), batch numbers, container numbers, and seal IDs.'
        ]
      },
      {
        heading: '3. Port Logistics: Gateway Outlets for South Indian Cargo',
        body: [
          'Depending on the destination market, cargo is routed through one of three prime maritime gateways:',
          'New Mangalore Port (NMPT): Ideal for direct maritime transshipment to Persian Gulf ports (Jebel Ali, Dammam, Shuwaikh, Muscat) with a 4 to 6 day transit time.',
          'JNPT / Nhava Sheva (Mumbai): Prime container hub for European, North American, and East Asian liner vessels with daily feeder connections.',
          'Chennai Port / Ennore: Optimized for exports destined for Singapore, Malaysia, and Southeast Asian ports.'
        ]
      }
    ],
    relatedProducts: ['fresh-mature-coconut-grade-a', 'semi-husked-coconut-bulk', 'tiptur-ball-copra-special'],
    faq: [
      {
        question: 'What are the standard Incoterms supported for FreshRoots exports?',
        answer: 'We primarily quote FOB (Free On Board) at New Mangalore Port (NMPT) or JNPT Mumbai, and CIF (Cost, Insurance & Freight) to major international ports worldwide with SGS or Bureau Veritas pre-shipment inspection.'
      },
      {
        question: 'What is the standard container capacity for fresh dehusked coconuts?',
        answer: 'A standard 40-foot High Cube (40HC) ventilated reefer container accommodates approximately 45,000 to 52,000 semi-husked coconuts packed in 25-nut or 50-nut mesh bags (approx. 24 to 26 metric tons).'
      }
    ]
  }
];

export function getAllGuides(): GuideArticle[] {
  return EDUCATIONAL_GUIDES;
}

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return EDUCATIONAL_GUIDES.find((g) => g.slug === slug);
}

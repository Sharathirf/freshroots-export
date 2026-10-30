export interface CategoryDefinition {
  slug: string;
  id: string; // matches product.category
  title: string;
  kannadaTitle: string;
  shortDescription: string;
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  bannerEmoji: string;
  mandiBenchmarkNote: string;
  dispatchLeadTime: string;
  originRegion: string;
  originDetails: string;
  gstRateText: string;
  relatedGuideSlug?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    slug: 'mature-coconut',
    id: 'mature_coconut',
    title: 'Fresh Mature & Semi-Husked Coconuts',
    kannadaTitle: 'ತಾಜಾ ತೆಂಗಿನಕಾಯಿ',
    shortDescription: 'Canal-irrigated mature coconuts from Mandya & Maddur with 550g-650g kernel weight.',
    longDescription: 'Direct farm-gate dehusked and semi-husked mature coconuts harvested from canal-fed groves in Kikkeri, K.R. Pet, and Mandya. Features thick white kernel meat (>12mm) and naturally sweet coconut water. Graded for retail grocers, temple ceremonies, food processing mills, and institutional catering across India with 100% Free Doorstep Delivery.',
    seoTitle: 'Fresh Mature Coconuts Wholesale Supplier | Mandya Karnataka | FreshRoots Export',
    seoDescription: 'Wholesale semi-husked mature coconuts from Mandya & Tiptur farms. Hand-graded 550g-650g nut weight, dense sweet kernel meat. Zero broker commission & 100% free delivery.',
    keywords: [
      'mature coconuts wholesale India',
      'semi husked coconut supplier Karnataka',
      'fresh coconut bag price Mandya',
      'temple coconut bulk supplier',
      'buy coconuts in bulk Bangalore'
    ],
    bannerEmoji: '🥥',
    mandiBenchmarkNote: 'Mandya & Maddur APMC Benchmark: Hand-graded lot dispatch within 24 hours',
    dispatchLeadTime: '24 - 48 Hours across South & Central India',
    originRegion: 'Kikkeri, Mandya & Maddur Canal Belts',
    originDetails: 'Harvested from canal-fed groves with >12mm kernel meat. Hand-graded and loaded within 24 hours of harvest.',
    gstRateText: '0% Nil-Rated (Fresh Produce)',
    relatedGuideSlug: 'indian-coconut-wholesale-sourcing',
    faqs: [
      {
        question: 'What is the average kernel weight of Mandya semi-husked mature coconuts?',
        answer: 'Each mature coconut is hand-graded to weigh between 550g and 650g with a kernel meat thickness exceeding 12mm and a high coconut water volume.'
      },
      {
        question: 'How are retail and wholesale coconut bags packed for safe transit?',
        answer: 'Retail orders are dispatched in ventilated 25-piece woven polypropylene mesh bags (~15 kg) that prevent moisture build-up and cracking during courier linehaul.'
      },
      {
        question: 'What is the shelf life of fresh mature coconuts at ambient temperature?',
        answer: 'When stored in a well-ventilated dry room away from direct sunlight, intact semi-husked coconuts remain fresh for 35 to 45 days.'
      }
    ]
  },
  {
    slug: 'copra',
    id: 'copra',
    title: 'GI Tiptur Ball Copra (Unde Kobbari)',
    kannadaTitle: 'ತಿಪಟೂರು ಉಂಡೆ ಕೊಬ್ಬರಿ',
    shortDescription: 'Geographical Indication (GI) certified sun-cured whole ball copra with moisture <= 5.2%.',
    longDescription: 'Authentic Geographical Indication (GI) tagged Tiptur Ball Copra (Unde Kobbari) cured inside traditional wooden attics over 10-12 months without chemical smoking or sulfur bleaching. Delivers natural sweetness, crisp texture, and minimum 65% unrefined oil content. Packaged in 15 kg, 25 kg, and 30 kg moisture-barrier cartons for dry fruit traders, confectioneries, and Ayurvedic pharmacies.',
    seoTitle: 'GI Tiptur Ball Copra (Unde Kobbari) Wholesale | Karnataka | FreshRoots Export',
    seoDescription: 'Authentic GI-certified Tiptur Ball Copra (Unde Kobbari) direct from Tumakuru horticultural belts. Moisture <= 5.2%, zero sulfur treatment, premium edible grade wholesale boxes.',
    keywords: [
      'GI Tiptur ball copra wholesale',
      'Unde Kobbari price per quintal',
      'Tiptur copra wholesale suppliers',
      'dry coconut whole box online',
      'chemical free ball copra India'
    ],
    bannerEmoji: '🥥',
    mandiBenchmarkNote: 'Tiptur APMC GI Corridor: Moisture strictly tested at <= 5.2% standard',
    dispatchLeadTime: '1 - 2 Business Days via Express Road Linehaul',
    originRegion: 'Tiptur & Tumakuru GI Corridors',
    originDetails: 'Sun-cured inside traditional wooden attics over 10-12 months. Moisture strictly <= 5.2%, zero sulfur bleaching.',
    gstRateText: '5% GST (Full ITC Available)',
    relatedGuideSlug: 'tiptur-copra-grading-guide',
    faqs: [
      {
        question: 'What makes Geographical Indication (GI) Tiptur Ball Copra superior to milling copra?',
        answer: 'Tiptur Ball Copra (GI Tagged) is naturally cured inside intact coconut husks over 11-12 months without sulfur or artificial smoke. This yields an unbroken golden spherical kernel with 65-68% natural oil and moisture under 5.2%.'
      },
      {
        question: 'Is Tiptur ball copra treated with sulfur chemicals for bleaching?',
        answer: 'No. FreshRoots guarantees 100% sulfur-free, unbleached copra. The amber-golden color is the hallmark of natural slow attic curing.'
      },
      {
        question: 'How is ball copra packaged for long distance shipping?',
        answer: 'It is packed in 5-ply corrugated master cartons lined with aeration barrier film to protect whole kernels against transit compression and humidity.'
      }
    ]
  },
  {
    slug: 'oil-and-extracts',
    id: 'oil_and_extracts',
    title: 'Wood-Pressed Oils & Bilona Cow Ghee',
    kannadaTitle: 'ತುಪ್ಪ & ಗಾಣದ ಎಣ್ಣೆ',
    shortDescription: 'Traditional Vaagai wood cold-pressed groundnut oil and pure Vedic Bilona cultured cow ghee.',
    longDescription: 'Pure traditional oils extracted using low-RPM wooden churners (Mara Chekku / Vaagai Wood) without chemical refining, bleach, or external heating. Preserves native Tocopherols (Vitamin E), aroma, and authentic viscosity. Paired with grass-fed Desi cow milk ghee cultured traditionally from curd and churned via bi-directional wooden bilona.',
    seoTitle: 'Cold-Pressed Groundnut Oil & Bilona Cow Ghee Wholesale | FreshRoots Export',
    seoDescription: 'Authentic wood-pressed groundnut oil and traditional Vedic Bilona cow ghee from Karnataka farmsteads. Zero chemicals, unrefined cold-pressed oils in glass bottles & bulk cans.',
    keywords: [
      'cold pressed groundnut oil wholesale',
      'Mara Chekku oil supplier Karnataka',
      'pure Vedic Bilona ghee 1L price',
      'unrefined cooking oil farm direct',
      'wood pressed oil Bangalore'
    ],
    bannerEmoji: '🧈',
    mandiBenchmarkNote: 'Extracted at < 40°C temperature to protect essential fatty acids',
    dispatchLeadTime: '24 - 48 Hours with leak-proof protective packaging',
    originRegion: 'Mandya & Hassan Processing Units',
    originDetails: 'Vaagai wood cold ghani extraction (<40°C) and traditional Vedic Bilona curd-churned cow ghee. Unrefined & chemical-free.',
    gstRateText: '5% (Oils) / 12% (Cow Ghee)',
    relatedGuideSlug: 'wood-pressed-oil-quality-checklist',
    faqs: [
      {
        question: 'What is the extraction temperature for Mara Chekku wood-pressed oils?',
        answer: 'Our oils are crushed at low RPM using traditional Vaagai wood ghanis where the temperature never exceeds 38°C to 40°C, preserving active vitamins and antioxidants.'
      },
      {
        question: 'How is Vedic Bilona cow ghee prepared?',
        answer: 'Our cow ghee is made from whole grass-fed cow milk cultured into curd overnight, then hand-churned with wooden bilonas into butter (Makkhan), and slow-simmered over low flame.'
      },
      {
        question: 'Do these oils contain chemical preservatives or artificial flavor enhancers?',
        answer: 'Zero preservatives, zero mineral oils, zero hexane solvent residues, and zero artificial coloring agents. 100% pure single-origin extract.'
      }
    ]
  },
  {
    slug: 'spices',
    id: 'spices',
    title: 'Mandya Ragi Millet & Fresh Ginger',
    kannadaTitle: 'ರಾಗಿ & ತೋಟದ ಶುಂಠಿ',
    shortDescription: 'Machine-cleaned whole brown Ragi millet and farm-harvested bold pungent ginger rhizomes.',
    longDescription: 'Native brown finger millet (Ragi) cultivated in the dryland agricultural corridors of Mandya and Hassan. Machine cleaned to remove husk, stones, and chaff, delivering high dietary calcium and fiber. Sourced alongside thick, juicy farm-fresh ginger rhizomes packed in 50 kg gunny sacks directly from harvest fields.',
    seoTitle: 'Mandya Whole Brown Ragi & Fresh Ginger Wholesale | FreshRoots Export',
    seoDescription: 'Machine-cleaned native brown Ragi millet (5kg, 10kg, 25kg) and fresh pungent ginger rhizomes in 50kg bags. Direct farm procurement with 100% Free Doorstep Delivery.',
    keywords: [
      'buy native brown ragi wholesale',
      'Mandya ragi 5kg 10kg pack price',
      'fresh ginger 50kg bag supplier Karnataka',
      'finger millet wholesale supplier Bangalore',
      'unpolished whole ragi online'
    ],
    bannerEmoji: '🌾',
    mandiBenchmarkNote: 'Moisture controlled at <= 10.0% for extended storage life',
    dispatchLeadTime: '1 - 2 Business Days via Regional Hubs',
    originRegion: 'Mandya & Hassan Dryland Agricultural Belts',
    originDetails: 'Native destoned finger millet (Ragi) and farm-fresh ginger rhizomes. Cleaned and packed directly from harvesting farmers.',
    gstRateText: '0% Nil-Rated (Unbranded Farm Produce)',
    faqs: [
      {
        question: 'Is Mandya Ragi millet polished or chemically cleaned?',
        answer: 'No. Our native brown Ragi is 100% unpolished and mechanical destoned/aspirated to eliminate sand and husk while keeping the nutrient-dense bran intact.'
      },
      {
        question: 'What is the moisture percentage of whole Ragi millet?',
        answer: 'Our whole Ragi lots are strictly moisture-tested at <= 10.0% to ensure insect resistance and extended pantry shelf life exceeding 12 months.'
      }
    ]
  },
  {
    slug: 'nursery-plants',
    id: 'value_added',
    title: 'Certified Coconut & Arecanut Nursery Saplings',
    kannadaTitle: 'ತೋಟದ ತೆಂಗು & ಅಡಿಕೆ ಸಸಿಗಳು',
    shortDescription: '1-Year old field-ready Tiptur Tall coconut seedlings and heavy-bearing Arecanut saplings.',
    longDescription: 'Government-standard nursery saplings propagated from certified high-yielding mother palms in Mandya and Malnad. Coconut seedlings feature broad leaf collars, deep root systems in UV-stabilized polybags, and high resistance to drought stress. Shipped on dedicated moisture-retentive packing schedules to ensure 100% field arrival viability.',
    seoTitle: 'Certified Coconut & Arecanut Saplings Wholesale Nursery | FreshRoots Export',
    seoDescription: 'High-yield 1-year-old Tiptur Tall coconut seedlings (2ft) and South Indian select Arecanut plants (1-1.5ft). Raised in nutrient compost polybags with live transit guarantee.',
    keywords: [
      'coconut saplings supplier Karnataka',
      'Tiptur tall coconut seedlings price',
      'arecanut plants nursery Bangalore',
      'high yield areca seedlings wholesale',
      'buy coconut plants online India'
    ],
    bannerEmoji: '🌴',
    mandiBenchmarkNote: 'Moisture-locked polybag dispatch on Mondays & Tuesdays only',
    dispatchLeadTime: '48 - 72 Hours transit with live root-ball guarantee',
    originRegion: 'Kikkeri & Malnad Horticultural Nurseries',
    originDetails: 'Raised from certified mother palms in nutrient-sterilized polybags. Live root-ball delivery guarantee.',
    gstRateText: '0% Nil-Rated (Live Plant Material)',
    relatedGuideSlug: 'coconut-sapling-selection-commercial-farming',
    faqs: [
      {
        question: 'What is the survival guarantee for nursery saplings during courier transit?',
        answer: 'We provide a 100% live root-ball guarantee. Saplings are watered, root-balled with coco peat moisture retention, and boxed in ventilated plant sleeves.'
      },
      {
        question: 'When should nursery saplings be planted in the field after arrival?',
        answer: 'Keep the plants in partial shade and water moderately for 2-3 days before transplanting into 1m x 1m x 1m pre-manured field pits.'
      }
    ]
  },
  {
    slug: 'coir-commodities',
    id: 'coir_commodities',
    title: 'Industrial Raw Coconut Shells & Charcoal',
    kannadaTitle: 'ತೆಂಗಿನ ನೈಸರ್ಗಿಕ ಚಿಪ್ಪು & ಇದ್ದಿಲು',
    shortDescription: 'Dry broken mature coconut shells with high calorific value (>4,500 kcal/kg) and kiln-carbonized charcoal.',
    longDescription: 'Clean, dense mature coconut shells segregated from Tiptur copra cutting and dehusking hubs. Ideal raw material for activated carbon manufacturers, bio-coal briquette plants, and metallurgical fuel applications. Delivered in loose metric tonnes or jumbo bags via dedicated full truckloads (FTL).',
    seoTitle: 'Raw Coconut Shells & Charcoal Bulk Wholesale | Activated Carbon Grade | FreshRoots Export',
    seoDescription: 'Industrial-grade dry mature coconut shells and kiln-carbonized charcoal from Tiptur & Mandya clusters. High calorific value > 4,500 kcal/kg, moisture < 12%, metric tonne truckload delivery.',
    keywords: [
      'coconut shells for activated carbon wholesale',
      'buy coconut shells per ton Karnataka',
      'raw coconut shell supplier India',
      'biomass coconut shell fuel',
      'Tiptur coconut shell truckload price'
    ],
    bannerEmoji: '🥥',
    mandiBenchmarkNote: 'Industrial moisture standard strictly verified at < 12%',
    dispatchLeadTime: '3 - 5 Days for dedicated 10-tonne / 20-tonne truckloads',
    originRegion: 'Tiptur & Mandya Dehusking Clusters',
    originDetails: 'Clean, dense mature coconut shells (>4,500 kcal/kg) and kiln-carbonized charcoal (>75% fixed carbon) for industrial processors.',
    gstRateText: '5% GST (Industrial Biomass)',
    faqs: [
      {
        question: 'What is the fixed carbon and calorific value of raw coconut shells?',
        answer: 'Our mature dry shells deliver a gross calorific value exceeding 4,500 kcal/kg and moisture under 12%, making them ideal for high-surface-area activated carbon.'
      },
      {
        question: 'What is the minimum consignment volume for industrial coconut shells and charcoal?',
        answer: 'Consignments are fulfilled in 1 Metric Tonne increments up to 25-tonne full truckloads with certified electronic weighbridge receipts.'
      }
    ]
  },
  {
    slug: 'arecanut',
    id: 'arecanut',
    title: 'Commercial Shivamogga Arecanut (Adike)',
    kannadaTitle: 'ಶಿವಮೊಗ್ಗ ಅಡಿಕೆ (Adike)',
    shortDescription: 'Commercial commodity lots sourced directly from Malnad and Shimoga mandi corridors.',
    longDescription: 'High-grade commercial Arecanut (Supari / Adike) sourced from traditional Shivamogga and Channagiri markets. Optical sortation and moisture testing available across Rashi, Bette, Gorabal, and Chali grades. Handled in wholesale consignments from 100 kg bags up to 20-tonne interstate consignments.',
    seoTitle: 'Shivamogga Arecanut (Adike) Wholesale Mandi Lots | FreshRoots Export',
    seoDescription: 'Commercial-grade Arecanut (Adike) commodity lots from Shivamogga, Karnataka. Optical sortation for Rashi, Bette, Chali grades based on daily mandi benchmarks.',
    keywords: [
      'Shivamogga arecanut wholesale price',
      'buy Adike in bulk Karnataka',
      'Rashi arecanut price per quintal',
      'areca nut mandi supplier India',
      'commercial supari wholesale lot'
    ],
    bannerEmoji: '🌰',
    mandiBenchmarkNote: 'Priced strictly against Shivamogga & Sagar daily spot mandi indices',
    dispatchLeadTime: '2 - 3 Days for commercial consignments',
    originRegion: 'Shivamogga, Sagar & Channagiri APMC Markets',
    originDetails: 'Optically sorted Rashi, Bette, and Gorabal grades direct from Malnad auctions. Moisture verified per mandi rules.',
    gstRateText: '5% GST (APMC Mandi Sourced)',
    faqs: [
      {
        question: 'Which arecanut grades are available from Shivamogga auctions?',
        answer: 'We procure and grade Rashi Idi, Bette, Gorabal, and whole Chali with optical weight and discoloration sortation.'
      },
      {
        question: 'How are arecanut wholesale prices determined?',
        answer: 'Prices are directly tied to the daily afternoon trading spot index at Shivamogga, Sagar, and Sirsi APMC mandis without intermediary brokerage markup.'
      }
    ]
  }
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  const norm = (slug || '').trim().toLowerCase();
  return CATEGORIES.find((c) => c.slug === norm);
}

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

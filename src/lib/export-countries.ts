export interface ExportCountry {
  name: string;
  code: string;
  flag: string;
  region: string;
  majorPort: string;
  popularCommodities: string;
  wikiUrl: string;
}

export const EXPORT_COUNTRIES: ExportCountry[] = [
  {
    name: 'Vietnam',
    code: 'VN',
    flag: '🇻🇳',
    region: 'Southeast Asia',
    majorPort: 'Cat Lai / Hai Phong',
    popularCommodities: 'Ball Copra, Coir Pith, Desiccated Coconut',
    wikiUrl: 'https://en.wikipedia.org/wiki/Vietnam'
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    flag: '🇧🇩',
    region: 'South Asia',
    majorPort: 'Chittagong / Benapole Land Port',
    popularCommodities: 'Mature Coconuts, Ball Copra, Fresh Ginger',
    wikiUrl: 'https://en.wikipedia.org/wiki/Bangladesh'
  },
  {
    name: 'United Arab Emirates (UAE)',
    code: 'AE',
    flag: '🇦🇪',
    region: 'Middle East (GCC)',
    majorPort: 'Jebel Ali / Dubai / Sharjah',
    popularCommodities: 'Grade A Coconuts, Pure Cow Ghee, Spices',
    wikiUrl: 'https://en.wikipedia.org/wiki/United_Arab_Emirates'
  },
  {
    name: 'Nepal',
    code: 'NP',
    flag: '🇳🇵',
    region: 'South Asia',
    majorPort: 'Birgunj ICD / Raxaul Border',
    popularCommodities: 'Ball Copra, Dehusked Coconuts, Ragi',
    wikiUrl: 'https://en.wikipedia.org/wiki/Nepal'
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    flag: '🇸🇦',
    region: 'Middle East (GCC)',
    majorPort: 'Jeddah Islamic Port / Dammam',
    popularCommodities: 'GI Tiptur Ball Copra, Cold-Pressed Oils',
    wikiUrl: 'https://en.wikipedia.org/wiki/Saudi_Arabia'
  },
  {
    name: 'United States (USA)',
    code: 'US',
    flag: '🇺🇸',
    region: 'North America',
    majorPort: 'New York / Los Angeles / Savannah',
    popularCommodities: 'Virgin Coconut Oil, Organic Millets, Spices',
    wikiUrl: 'https://en.wikipedia.org/wiki/United_States'
  },
  {
    name: 'Cambodia',
    code: 'KH',
    flag: '🇰🇭',
    region: 'Southeast Asia',
    majorPort: 'Sihanoukville / Phnom Penh',
    popularCommodities: 'Horticultural Coir Pith, Copra',
    wikiUrl: 'https://en.wikipedia.org/wiki/Cambodia'
  },
  {
    name: 'Qatar',
    code: 'QA',
    flag: '🇶🇦',
    region: 'Middle East (GCC)',
    majorPort: 'Hamad Port (Doha)',
    popularCommodities: 'Dehusked Coconuts, Pure Cow Ghee',
    wikiUrl: 'https://en.wikipedia.org/wiki/Qatar'
  },
  {
    name: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
    region: 'Southeast Asia',
    majorPort: 'Port Klang / Penang',
    popularCommodities: 'Ball Copra, Coconut Shells, Spices',
    wikiUrl: 'https://en.wikipedia.org/wiki/Malaysia'
  },
  {
    name: 'Kuwait',
    code: 'KW',
    flag: '🇰🇼',
    region: 'Middle East (GCC)',
    majorPort: 'Shuwaikh / Shuaiba',
    popularCommodities: 'Grade A Coconuts, Tiptur Copra, Cow Ghee',
    wikiUrl: 'https://en.wikipedia.org/wiki/Kuwait'
  },
  {
    name: 'Iran',
    code: 'IR',
    flag: '🇮🇷',
    region: 'Middle East',
    majorPort: 'Bandar Abbas',
    popularCommodities: 'Ball Copra, Unprocessed Agricultural Produce',
    wikiUrl: 'https://en.wikipedia.org/wiki/Iran'
  },
  {
    name: 'United Kingdom (UK)',
    code: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    majorPort: 'London Gateway / Felixstowe',
    popularCommodities: 'Virgin Cold-Pressed Oils, Byadgi Chillies, Ghee',
    wikiUrl: 'https://en.wikipedia.org/wiki/United_Kingdom'
  }
];

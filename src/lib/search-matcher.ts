import { Product } from '@/types';

/**
 * Intelligent agricultural commodity search matcher supporting
 * multi-term queries, English keywords, botanical terms, and Kannada transliterations.
 */
export function searchMatchesProduct(p: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const title = (p.title || '').toLowerCase();
  const desc = (p.description || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const grade = (p.grade || '').toLowerCase();
  const origin = (p.origin || '').toLowerCase();
  const sku = (p.sku || '').toLowerCase();
  const slug = (p.slug || '').toLowerCase();

  const haystack = `${title} ${desc} ${cat} ${grade} ${origin} ${sku} ${slug}`;

  // Split multi-word query (e.g. "coconut oil", "ragi 5kg", "tiptur copra")
  const terms = q.split(/\s+/).filter(Boolean);

  return terms.every((term) => {
    // 1. Direct substring match
    if (haystack.includes(term)) return true;

    // 2. Synonyms and Kannada transliteration matches
    if (term === 'coconut' || term === 'coconuts' || term === 'tengu' || term === 'tengina' || term === 'kayi') {
      return (
        sku.includes('coc') ||
        sku.includes('cop') ||
        slug.includes('coconut') ||
        title.includes('coconut') ||
        title.includes('copra')
      );
    }
    if (term === 'oil' || term === 'oils' || term === 'enne' || term === 'taila') {
      return sku.includes('oil') || slug.includes('oil') || title.includes('oil');
    }
    if (term === 'copra' || term === 'kobbari' || term === 'copras') {
      return (
        sku.includes('cop') ||
        sku.includes('bal') ||
        sku.includes('oil-coc') ||
        slug.includes('copra') ||
        title.includes('copra') ||
        title.includes('kobbari') ||
        title.includes('coconut oil')
      );
    }
    if (term === 'ghee' || term === 'tuppa' || term === 'bilona') {
      return (
        sku.includes('ghe') ||
        sku.includes('dai') ||
        slug.includes('ghee') ||
        title.includes('ghee') ||
        title.includes('tuppa')
      );
    }
    if (term === 'ragi' || term === 'millet') {
      return (
        sku.includes('rag') ||
        sku.includes('mil') ||
        slug.includes('ragi') ||
        title.includes('ragi')
      );
    }
    if (term === 'flour' || term === 'flours' || term === 'hittu' || term === 'atta') {
      return (
        sku.includes('flr') ||
        slug.includes('flour') ||
        title.includes('flour') ||
        title.includes('hittu')
      );
    }
    if (term === 'rice' || term === 'akki') {
      return (
        sku.includes('ric') ||
        slug.includes('rice') ||
        title.includes('rice') ||
        title.includes('akki')
      );
    }
    if (term === 'arecanut' || term === 'adike' || term === 'supari' || term === 'betel') {
      return (
        sku.includes('are') ||
        slug.includes('arecanut') ||
        title.includes('arecanut') ||
        title.includes('adike')
      );
    }
    if (term === 'groundnut' || term === 'peanut' || term === 'kadlekai' || term === 'shenga') {
      return (
        sku.includes('gnd') ||
        slug.includes('groundnut') ||
        title.includes('groundnut')
      );
    }
    if (term === 'ginger' || term === 'shunti') {
      return (
        sku.includes('gin') ||
        slug.includes('ginger') ||
        title.includes('ginger') ||
        title.includes('shunti')
      );
    }
    if (term === 'shell' || term === 'shells' || term === 'chippu') {
      return (
        sku.includes('shl') ||
        slug.includes('shell') ||
        title.includes('shell') ||
        title.includes('chippu')
      );
    }
    if (
      term === 'plant' ||
      term === 'plants' ||
      term === 'sapling' ||
      term === 'saplings' ||
      term === 'sasi'
    ) {
      return (
        sku.includes('nur') ||
        sku.includes('plt') ||
        slug.includes('plant') ||
        slug.includes('sapling') ||
        title.includes('sapling')
      );
    }
    if (
      term === 'tender' ||
      term === 'elaneeru' ||
      term === 'elaneer' ||
      term === 'yelaneer'
    ) {
      return (
        sku.includes('tnd') ||
        slug.includes('tender') ||
        title.includes('tender') ||
        title.includes('elaneeru')
      );
    }

    return false;
  });
}

(() => {
  'use strict';

  const VERIFIED_AT = '2026-07-20';
  const base = Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : [];

  const overrides = {
    'shin-original': {
      name: 'Shin Ramyun · vegan German import',
      country: 'South Korea · sold in Germany',
      market: 'DE',
      gtin: '8801043150620',
      vegan: 'verified',
      verificationLevel: 'germany-retailer',
      verifiedAt: VERIFIED_AT,
      image: 'https://asia-foodstore.de/media/image/product/967/xs/shin-ramen-vegan.jpg',
      imageSource: 'https://asia-foodstore.de/shin-ramen-vegan',
      source: 'https://asia-foodstore.de/shin-ramen-vegan',
      buy: 'https://asia-foodstore.de/shin-ramen-vegan',
      evidence: {
        en: 'German retailer listing for GTIN 8801043150620 marks this version vegan and lists a plant-based seasoning recipe. Always match the GTIN and current pack.',
        de: 'Die deutsche Händlerseite führt GTIN 8801043150620 als vegan und listet eine pflanzliche Würzmischung. Immer GTIN und aktuelle Packung abgleichen.'
      },
      reason: {
        en: 'The iconic Shin experience in a Germany-available recipe that is explicitly sold as vegan.',
        de: 'Das ikonische Shin-Erlebnis in einer in Deutschland erhältlichen Rezeptur, die ausdrücklich als vegan verkauft wird.'
      }
    },
    'soon-veggie': {
      country: 'South Korea · sold in Germany',
      market: 'DE',
      vegan: 'verified',
      verificationLevel: 'germany-retailer',
      verifiedAt: VERIFIED_AT,
      source: 'https://www.rewe.de/shop/p/nongshim-veggie-ramyun-nudelsuppe-vegan-560g/3587537',
      buy: 'https://www.rewe.de/shop/p/nongshim-veggie-ramyun-nudelsuppe-vegan-560g/3587537',
      evidence: {
        en: 'REWE Germany labels the product vegan and publishes a plant-based ingredient list.',
        de: 'REWE Deutschland kennzeichnet das Produkt als vegan und veröffentlicht eine pflanzliche Zutatenliste.'
      }
    },
    'demae-miso': {
      market: 'EU / DE', verificationLevel: 'official-eu', verifiedAt: VERIFIED_AT,
      source: 'https://www.nissin-foods.eu/en/products?category=Demae+Ramen'
    },
    'demae-spicy': {
      market: 'EU / DE', verificationLevel: 'official-eu', verifiedAt: VERIFIED_AT,
      source: 'https://www.nissin-foods.eu/en/products?category=Demae+Ramen'
    },
    'soba-chili': {
      market: 'EU / DE', verificationLevel: 'official-eu', verifiedAt: VERIFIED_AT,
      source: 'https://www.nissin-foods.eu/en/products'
    },
    'soba-protein-chili': {
      market: 'EU / DE', verificationLevel: 'official-eu', verifiedAt: VERIFIED_AT,
      source: 'https://www.nissin-foods.eu/en/products'
    },
    'koka-mushroom': {
      market: 'Global · German availability to verify',
      verificationLevel: 'official-global',
      verifiedAt: VERIFIED_AT,
      source: 'https://kokanoodles.com/product/koka-original-mushroom-noodles/',
      vegan: 'vegetarian',
      evidence: {
        en: 'KOKA’s official page calls it suitable for vegetarians and publishes ingredients without an explicit vegan certification. Treat it as not vegan-verified until the German pack is checked.',
        de: 'KOKA bezeichnet das Produkt offiziell als vegetarisch und veröffentlicht Zutaten, aber keine ausdrückliche Vegan-Zertifizierung. Bis zur Prüfung der deutschen Packung nicht als vegan bestätigt behandeln.'
      }
    },
    'koka-curry': {
      market: 'Global · German availability to verify',
      verificationLevel: 'official-global',
      verifiedAt: VERIFIED_AT,
      source: 'https://kokanoodles.com/product/koka-original-curry-noodles/',
      image: 'https://kokanoodles.com/wp-content/uploads/2024/08/Curry-Original-MP-S.webp',
      imageSource: 'https://kokanoodles.com/product/koka-original-curry-noodles/',
      vegan: 'check',
      evidence: {
        en: 'The official KOKA Original Curry ingredient list shown on the source page contains no obvious animal ingredient, but the exact German retail pack is not yet verified.',
        de: 'Die offizielle Zutatenliste von KOKA Original Curry enthält auf der Quellseite keine offensichtliche tierische Zutat; die konkrete deutsche Verkaufspackung ist jedoch noch nicht geprüft.'
      }
    }
  };

  const removedIds = new Set(['nissin-cup-chicken']);
  const patched = base
    .filter(item => !removedIds.has(item.id))
    .map(item => ({
      market: 'Global · Germany review pending',
      verificationLevel: 'needs-germany-review',
      verifiedAt: null,
      buy: null,
      gtin: null,
      imageSource: item.image ? item.source : null,
      ...item,
      ...(overrides[item.id] || {})
    }));

  patched.push({
    rank: 6,
    id: 'shin-spicy-chicken-de',
    brand: 'Nongshim',
    name: 'Shin Ramyun · Spicy Chicken German import',
    country: 'South Korea · sold in Germany',
    market: 'DE',
    style: 'Spicy soup',
    spice: 4,
    gtin: '8801043069588',
    vegan: 'not',
    verificationLevel: 'germany-retailer',
    verifiedAt: VERIFIED_AT,
    image: 'https://static.y-mart.de/media/0af6bbf8a646b57379ad03e79b1fcd80/8801043069588-800.webp',
    imageSource: 'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/nongshim-shin-ramyun-wuerziger-huehnergeschmack.8801043069588-1245574622.html',
    source: 'https://www.rewe.de/shop/p/nongshim-shin-ramyun-spicy-chicken-120g/9963099',
    buy: 'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/nongshim-shin-ramyun-wuerziger-huehnergeschmack.8801043069588-1245574622.html',
    imageQuery: 'Nongshim Shin Ramyun Spicy Chicken 8801043069588',
    reason: {
      en: 'A Germany-sold Shin version that looks similar to the vegan import but uses a different recipe and GTIN.',
      de: 'Eine in Deutschland verkaufte Shin-Version, die ähnlich aussieht wie der vegane Import, aber eine andere Rezeptur und GTIN hat.'
    },
    evidence: {
      en: 'REWE and y-mart list chicken flavour in the seasoning for GTIN 8801043069588. This version is not vegan.',
      de: 'REWE und y-mart führen bei GTIN 8801043069588 Hühneraroma in der Würzmischung. Diese Version ist nicht vegan.'
    }
  });

  patched.sort((a, b) => (a.rank || 999) - (b.rank || 999));
  window.RAMEN_DATA = patched;
})();
(() => {
  'use strict';

  if (!document.querySelector('link[href="upgrades.css"]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = 'upgrades.css';
    document.head.appendChild(styles);
  }

  const VERIFIED_AT = '2026-07-20';
  const reviewed = {
    'buldak-carbonara': {
      source:'https://www.rewe.de/shop/p/samyang-buldak-hot-chicken-carbonara-flavor-ramen-130g/9968977',
      buy:'https://www.rewe.de/shop/p/samyang-buldak-hot-chicken-carbonara-flavor-ramen-130g/9968977',
      market:'DE',
      country:'South Korea · sold in Germany',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'REWE Germany lists a current 130 g recipe with chicken-style flavouring but no explicit vegan claim. Older German listings used dairy ingredients, so the exact GTIN and physical pack must be checked.',
        de:'REWE Deutschland listet eine aktuelle 130-g-Rezeptur mit Hühnerfleischgeschmacksaroma, aber ohne ausdrückliche Vegan-Kennzeichnung. Ältere deutsche Listungen enthielten Milchbestandteile; daher müssen GTIN und konkrete Packung geprüft werden.'
      }
    },
    'shin-black': {
      source:'https://www.tavato.de/p/8801043060226',
      buy:'https://www.tavato.de/p/8801043060226',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'8801043060226',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German listing for GTIN 8801043060226 includes eggshell calcium; German retailers also describe the broth as beef-based. This Shin Black pack is not vegan.',
        de:'Die deutsche Händlerseite für GTIN 8801043060226 nennt Eierschalencalcium; deutsche Händler beschreiben die Brühe außerdem als rindfleischbasiert. Diese Shin-Black-Packung ist nicht vegan.'
      }
    },
    'buldak-2x': {
      source:'https://edeka-foodservice.de/eigenmarken/produkte/5087720009/samyang-buldak-2x-spicy-hot-chicken-140g',
      buy:'https://edeka-foodservice.de/eigenmarken/produkte/5087720009/samyang-buldak-2x-spicy-hot-chicken-140g',
      market:'DE retailer · recipe verification incomplete',
      country:'South Korea · sold in Germany',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'A current German retailer lists the exact 140 g product, but the page does not provide enough ingredient evidence to verify it as vegan. Check the imported pack.',
        de:'Ein aktueller deutscher Händler führt das genaue 140-g-Produkt, liefert aber nicht genügend Zutateninformationen für eine Vegan-Bestätigung. Importpackung prüfen.'
      }
    },
    'demae-sesame': {
      source:'https://de.nissin-foods.eu/en/products/nissin-demae-ramen-sesame',
      market:'EU / DE',
      country:'Japan-inspired · official EU product',
      gtin:'8712429350407',
      vegan:'check',
      verificationLevel:'official-eu',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'Nissin Europe publishes the exact German/EU product page and lists only soy, gluten and sesame allergens, but does not explicitly label this version vegan. Treat it as unverified.',
        de:'Nissin Europe veröffentlicht die genaue deutsche/EU-Produktseite und nennt nur Soja, Gluten und Sesam als Allergene, kennzeichnet diese Version aber nicht ausdrücklich vegan. Daher bleibt sie unbestätigt.'
      }
    },
    'chapagetti': {
      source:'https://www.rewe.de/shop/p/nongshim-instantnudeln-chapagetti-140g/1917981',
      buy:'https://www.rewe.de/shop/p/nongshim-instantnudeln-chapagetti-140g/1917981',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'8801043048064',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'REWE Germany’s ingredient list for the 140 g pack explicitly includes shrimp in the seasoning. This German retail version is not vegan.',
        de:'Die Zutatenliste von REWE Deutschland für die 140-g-Packung enthält ausdrücklich Garnelen in der Würzung. Diese deutsche Verkaufsversion ist nicht vegan.'
      }
    },
    'buldak-cheese': {
      source:'https://www.rewe.de/shop/p/samyang-buldak-cheese-flavour-hot-chicken-flavor-ramen-140g/9969483',
      buy:'https://www.rewe.de/shop/p/samyang-buldak-cheese-flavour-hot-chicken-flavor-ramen-140g/9969483',
      market:'DE',
      country:'South Korea · sold in Germany',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'REWE’s current German listing contains chicken-style flavouring and no explicit vegan claim. A separate older German SKU contained milk and mozzarella, so the exact pack must be checked.',
        de:'Die aktuelle deutsche REWE-Listung enthält Hühnerfleischgeschmacksaroma und keine ausdrückliche Vegan-Kennzeichnung. Eine ältere deutsche SKU enthielt Milch und Mozzarella; deshalb muss die konkrete Packung geprüft werden.'
      }
    },
    'indomie-rendang': {
      source:'https://www.asia-in.de/Indomie-Instant-Brat-Nudeln-mit-Mi-Goreng-Rendang-Beef-Rind-Geschmack-Dry-Noodles-80-g',
      buy:'https://www.asia-in.de/Indomie-Instant-Brat-Nudeln-mit-Mi-Goreng-Rendang-Beef-Rind-Geschmack-Dry-Noodles-80-g',
      market:'DE',
      country:'Indonesia · sold in Germany',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German retailer lists beef flavour in the seasoning, but does not establish whether the flavour is animal-derived and does not label the product vegan. Check the exact pack.',
        de:'Der deutsche Händler führt Rindfleischgeschmack in der Würzung, klärt aber nicht, ob das Aroma tierischen Ursprungs ist, und kennzeichnet das Produkt nicht vegan. Genaue Packung prüfen.'
      }
    },
    'paldo-bibim': {
      source:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/paldo-bibimmyeon.8801128503037-1102280306.html',
      buy:'https://www.y-mart.de/de/kategorie/ramen-nudeln/ramen-instant-noodeln/paldo-bibimmyeon.8801128503037-1102280306.html',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'8801128503037',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German y-mart listing states that this 130 g pack contains milk and ingredients from pork, beef and chicken. It is not vegan.',
        de:'Die deutsche y-mart-Seite gibt an, dass diese 130-g-Packung Milch sowie Bestandteile von Schwein, Rind und Huhn enthält. Sie ist nicht vegan.'
      }
    },
    'soon-kimchi': {
      source:'https://www.rewe.de/shop/p/nongshim-kimchi-shin-112g/1964061',
      buy:'https://www.rewe.de/shop/p/nongshim-kimchi-shin-112g/1964061',
      market:'DE',
      country:'South Korea · sold in Germany',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'REWE Germany publishes an ingredient list without an obvious animal ingredient for this 112 g Kimchi pack, but does not explicitly label it vegan. The physical pack remains authoritative.',
        de:'REWE Deutschland veröffentlicht für diese 112-g-Kimchi-Packung eine Zutatenliste ohne offensichtliche tierische Zutat, kennzeichnet sie aber nicht ausdrücklich vegan. Maßgeblich bleibt die konkrete Packung.'
      }
    }
  };

  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({
    ...item,
    ...(reviewed[item.id] || {})
  }));
})();
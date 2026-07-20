(() => {
  'use strict';

  const VERIFIED_AT = '2026-07-20';
  const reviewed = {
    'ottogi-sesame': {
      source:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/ottogi-chamggae-ramen-bundle.8801045526201-1127294603.html',
      buy:'https://www.y-mart.de/en/category/ramen-noodles/ramen-instant-noodles/ottogi-chamggae-ramen-bundle.8801045526201-1127294603.html',
      market:'DE',
      country:'South Korea · sold in Germany',
      gtin:'8801045526201',
      vegan:'not',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German y-mart listing for GTIN 8801045526201 contains egg, milk, beef, pork and shellfish. This 115 g Chamggae/Sesame Ramen version is not vegan.',
        de:'Die deutsche y-mart-Seite für GTIN 8801045526201 nennt Ei, Milch, Rind, Schwein und Schalentiere. Diese 115-g-Chamggae-/Sesam-Ramen-Version ist nicht vegan.'
      }
    },
    'waiwai-oriental': {
      source:'https://asia-foodstore.de/wai-wai-instantnudel-nach-orientalischer-art30x-60g',
      buy:'https://asia-foodstore.de/wai-wai-instantnudel-nach-orientalischer-art30x-60g',
      market:'DE',
      country:'Thailand · sold in Germany',
      gtin:'8850100110114',
      vegan:'check',
      verificationLevel:'germany-retailer',
      verifiedAt:VERIFIED_AT,
      evidence:{
        en:'The German listing includes artificial chicken flavour but does not establish whether the flavour is animal-derived. Other German retailer ingredient lists differ, so the exact pack must be checked.',
        de:'Die deutsche Händlerseite nennt künstliches Hühneraroma, klärt aber nicht, ob das Aroma tierischen Ursprungs ist. Andere deutsche Händler führen abweichende Zutatenlisten; daher muss die genaue Packung geprüft werden.'
      }
    },
    'asha-sesame': {
      brand:'A-Sha',
      name:'Chili Crisp Squiggly Noodle',
      country:'Taiwan / USA official product',
      style:'Air-dried dry noodles',
      spice:3,
      source:'https://ashadrynoodle.com/products/a-sha-chili-crisp-squiggly-noodle',
      market:'Official US · Germany availability pending',
      gtin:'193937001964',
      vegan:'verified',
      verificationLevel:'official-global',
      verifiedAt:VERIFIED_AT,
      imageQuery:'A-Sha Chili Crisp Squiggly Noodle 193937001964',
      evidence:{
        en:'A-Sha’s official product page explicitly labels this exact Chili Crisp Squiggly Noodle vegan and publishes its ingredients. Germany availability is not verified.',
        de:'A-Shas offizielle Produktseite kennzeichnet genau diese Chili-Crisp-Squiggly-Nudel ausdrücklich als vegan und veröffentlicht die Zutaten. Die Verfügbarkeit in Deutschland ist nicht geprüft.'
      },
      reason:{
        en:'A current A-Sha flagship with air-dried noodles, sesame-soy sauce, chili crisp and a clear vegan claim.',
        de:'Ein aktuelles A-Sha-Flaggschiff mit luftgetrockneten Nudeln, Sesam-Soja-Sauce, Chili Crisp und klarer Vegan-Kennzeichnung.'
      }
    }
  };

  window.RAMEN_DATA = (Array.isArray(window.RAMEN_DATA) ? window.RAMEN_DATA : []).map(item => ({
    ...item,
    ...(reviewed[item.id] || {})
  }));
})();